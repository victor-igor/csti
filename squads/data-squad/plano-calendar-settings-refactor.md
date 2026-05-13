# Plano de Refactor — CalendarSettingsModal: Performance + Persistência

**Elaborado por:** Aria (Architect) + Uma (UX) + investigação do fluxo  
**Data:** 2026-04-17  
**Arquivo principal:** `src/modules/agendamentos/components/CalendarSettingsModal.tsx`  
**Status:** Aguardando aprovação

---

## Diagnóstico: 3 Problemas Confirmados

### Problema 1 — Lentidão no Save (5-15s)

**O que acontece ao clicar "Salvar":**

```
1. Promise.all(updates)          → UPDATE config_agenda para TODOS os usuários
2. Promise.all(colorUpdates)     → UPDATE cor em TODOS os agendamentos de TODOS os usuários com cor definida
3. watch_events (N chamadas)     → Edge Function por cada calendário único (main + conflitos)
4. sync_incremental              → Edge Function que baixa TODOS os eventos de TODOS os calendários
```

**Problema raiz:** `sync_incremental` roda **incondicionalmente** a cada save, sem verificar se os calendários realmente mudaram. Uma simples troca de cor padrão dispara uma ressincronização completa de eventos.

**Agravantes:**
- Sem deduplicação: se 5 profissionais compartilham o mesmo calendário, `watch_events` é chamado 5 vezes para o mesmo calendário
- `colorUpdatePromises` toca centenas de linhas na tabela `agendamentos` a cada save

---

### Problema 2 — Config Não Persiste (Reabrir = "Nenhuma agenda selecionada")

**Bug confirmado + já corrigido (patch anterior):**  
`google_calendar_id` era sobrescrito com `undefined` para usuários sem mapping no estado.

**Bug residual ainda presente:**  
A inicialização do modal lê `config_agenda.google_calendar_id` da tabela `usuarios`, mas o campo pode estar `null`/vazio devido ao bug anterior que sobrescrevia dados. Profissionais que foram afetados pelo bug antigo precisam reconfigurar — o banco está corrompido para eles.

**Fluxo correto pós-fix:**
- Salva → `google_calendar_id` preservado via spread `...user.config_agenda`
- Reabre → lê `google_calendar_id` do banco → `mappings[user.id]` inicializado → "✓ Agenda configurada" aparece

---

### Problema 3 — Resync Total a Cada Save

**Linha 316 em `CalendarSettingsModal.tsx`:**
```typescript
// Roda SEMPRE, independente do que mudou
supabase.functions.invoke('google-auth?action=sync_incremental&userId=${currentUser.id}')
```

Sem parâmetro de calendário, sem verificação de mudança, sem flag de "precisa sincronizar".

---

## Plano de Refactor (3 Iniciativas)

---

### Iniciativa 1 — Sync Condicional (elimina lentidão principal)

**Princípio:** só sincronizar se os calendários vinculados realmente mudaram.

**Implementação:**

```typescript
// ANTES de salvar, capturar estado anterior
const previousMappings = users.reduce((acc, user) => {
    acc[user.id] = user.config_agenda?.google_calendar_id;
    return acc;
}, {} as Record<string, string | undefined>);

// Após salvar configs...
const calendarChanged = users.some(user =>
    mappings[user.id] !== previousMappings[user.id]
);

// Só sincronizar se algum calendário mudou
if (calendarChanged) {
    await supabase.functions.invoke(`google-auth?action=sync_incremental&userId=${currentUser.id}`);
}
```

**Impacto:** troca de cor padrão, ajuste de conflitos sem mudar calendário principal → **0 chamadas de sync**.

---

### Iniciativa 2 — watch_events com Deduplicação

**Problema:** N profissionais × M calendários = N×M chamadas, mesmo para calendários já registrados.

**Implementação:**

```typescript
// Deduplicar calendários únicos antes de chamar watch
const uniqueCalendarIds = new Set<string>();
users.forEach(user => {
    const calId = mappings[user.id];
    if (calId) uniqueCalendarIds.add(calId);
    (conflictMappings[user.id] || []).forEach(id => uniqueCalendarIds.add(id));
});

// Só registrar watch para calendários que mudaram
const previousUniqueIds = new Set(
    users.map(u => u.config_agenda?.google_calendar_id).filter(Boolean)
);
const newCalendars = [...uniqueCalendarIds].filter(id => !previousUniqueIds.has(id));

const watchPromises = newCalendars.map(calId =>
    supabase.functions.invoke(`google-auth?action=watch_events&userId=${currentUser.id}&calendarId=${encodeURIComponent(calId)}`)
);
await Promise.all(watchPromises);
```

**Impacto:** zero chamadas `watch_events` se nenhum calendário novo foi adicionado.

---

### Iniciativa 3 — Color Update Assíncrono (não bloqueia o save)

**Problema:** `Promise.all(colorUpdatePromises)` bloqueia o modal enquanto atualiza cores de centenas de eventos.

**Implementação:** disparar sem `await` — o usuário não precisa esperar isso terminar para fechar o modal.

```typescript
// Fire-and-forget: não bloqueia o save
colorUpdatePromises.length > 0 && Promise.all(colorUpdatePromises).catch(console.error);

// Fechar modal imediatamente após salvar configs
onClose();
toast.success('Configurações salvas!');
```

**Impacto:** modal fecha instantaneamente após salvar. Cores são atualizadas em background.

---

### Iniciativa 4 — Repair de Dados Corrompidos (banco)

**Profissionais afetados pelo bug anterior:** `google_calendar_id = null` no banco mas deveriam ter valor.

**Query de diagnóstico:**
```sql
SELECT nome, ativo, config_agenda->>'google_calendar_id' as cal_id,
       config_agenda->>'google_calendar_summary' as cal_name
FROM usuarios
WHERE ativo = true
  AND (config_agenda->>'google_calendar_id' IS NULL
       OR config_agenda->>'google_calendar_id' = '')
ORDER BY nome;
```

Usuários retornados precisam reconfigurar manualmente — os dados foram apagados pelo bug anterior e não há como recuperar automaticamente (precisaria rever o histórico de qual calendário estava vinculado).

---

## Resumo de Impacto Esperado

| Problema | Causa | Fix | Tempo economizado |
|----------|-------|-----|-------------------|
| Save lento (~10-15s) | `sync_incremental` sempre roda | Sync condicional | ~8-12s em 90% dos saves |
| `watch_events` N×M vezes | Sem deduplicação | Deduplicar + filtrar novos | Reduz chamadas de 10+ para 0-2 |
| Modal trava ao salvar cor | `await colorUpdates` bloqueia | Fire-and-forget | Modal fecha em <1s |
| Config some ao reabrir | Bug `google_calendar_id: undefined` | Fix já aplicado | N/A |

---

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `CalendarSettingsModal.tsx` | Sync condicional + deduplicação watch + color async |
| — | Fix `google_calendar_id: undefined` já aplicado |

---

## Próximos Passos (após aprovação)

1. [ ] Aprovar este plano
2. [ ] `@dev` implementar Iniciativa 1 (sync condicional) — maior impacto
3. [ ] `@dev` implementar Iniciativa 2 (watch deduplicação)
4. [ ] `@dev` implementar Iniciativa 3 (color fire-and-forget)
5. [ ] Rodar query de diagnóstico (Iniciativa 4) e notificar profissionais afetados
6. [ ] `@qa` testar fluxo completo: configurar → salvar → fechar → reabrir → verificar persistência

---

*— Aria (Architect) + Uma (UX) · Arquitetando o futuro 🏗️*
