import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // ── 1. Verificar que o chamador é admin ──────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Cliente com o JWT do usuário logado (para validar o role)
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile, error: profileError } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || (profile?.role !== 'admin' && profile?.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Acesso negado: apenas administradores e super_admins podem criar usuários.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Ler body ──────────────────────────────────────────────────────────
    const { email, senha, nome, role, telefone, especialidade } = await req.json()

    if (!email || !senha || !nome || !role) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: email, senha, nome, role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validação de hierarquia: admin não pode criar super_admin
    if (profile.role === 'admin' && role === 'super_admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado: administradores não podem criar usuários com o papel de super_admin.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (senha.length < 8) {
      return new Response(JSON.stringify({ error: 'A senha deve ter no mínimo 8 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 3. Criar usuário via Admin API (service_role) ────────────────────────
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Confirma e-mail automaticamente
      user_metadata: { nome, role },
    })

    if (createError) {
      // Traduzir erros comuns
      const msg = createError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        return new Response(JSON.stringify({ error: 'Este e-mail já está cadastrado.' }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      throw createError
    }

    const newUserId = newUser.user.id

    // ── 4. Atualizar profile com campos extras ───────────────────────────────
    // O trigger `trg_handle_new_user` já criou o profile básico.
    // Aguardamos um momento para garantir que o trigger executou.
    await new Promise((r) => setTimeout(r, 300))

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        telefone: telefone ?? null,
        especialidade: role === 'prestador' ? (especialidade ?? null) : null,
        status_aprovacao: 'aprovado',
        updated_at: new Date().toISOString(),
      })
      .eq('id', newUserId)

    if (updateError) {
      console.error('Erro ao atualizar profile:', updateError)
      // Não falha a requisição — o auth user foi criado com sucesso
    }

    return new Response(JSON.stringify({ id: newUserId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('admin-criar-usuario error:', err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
