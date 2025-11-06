// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient can only be called in the browser. " +
      "If you're in a Server Component or Server Action, use getSupabaseServerClient instead."
    )
  }

  if (client) return client

  // Use supabase-js directly instead of @supabase/ssr for browser
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )

  return client
}
