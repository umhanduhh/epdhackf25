// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient can only be called in the browser. " +
      "If you're in a Server Component or Server Action, use getSupabaseServerClient instead."
    )
  }

  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,   // 👈 we’ll call exchangeCodeForSession ourselves
        storageKey: "gigjourneys-auth",
      },
    }
  )
  return client
}
