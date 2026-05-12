import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// lock no-op: o navigatorLock padrão do supabase-js causa "Lock was released because
// another request stole it" em Safari iOS e em cenários multi-tab/HMR, derrubando a
// sessão no refresh. Como o app só usa um client por tab e localStorage já é
// serializado por origem, o lock não é necessário.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
})
