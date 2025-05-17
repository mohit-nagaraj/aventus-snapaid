import { createClient } from '@supabase/supabase-js'

// Server-side client (for webhooks, SSR, etc)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client-side client factory (needs to be per-request)
export const createClientSideSupabase = (accessToken?: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      }
    }
  )
}