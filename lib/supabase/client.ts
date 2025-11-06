// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createClient> | null = null

// Cookie storage adapter for browser (compatible with server-side middleware)
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === "undefined") return null
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === key) {
        return decodeURIComponent(value)
      }
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (typeof document === "undefined") return
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax; Secure`
  },
  removeItem: (key: string) => {
    if (typeof document === "undefined") return
    document.cookie = `${key}=; path=/; max-age=0`
  },
}

export function getSupabaseBrowserClient() {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient can only be called in the browser. " +
      "If you're in a Server Component or Server Action, use getSupabaseServerClient instead."
    )
  }

  if (client) return client

  // Use cookie storage instead of localStorage so middleware can see the session
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: cookieStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )

  return client
}
