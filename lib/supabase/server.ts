// lib/supabase/server.ts
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export function getSupabaseServerClient() {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key)
            return cookie?.value ?? null
          },
          setItem: (key: string, value: string) => {
            try {
              cookieStore.set(key, value, {
                path: "/",
                sameSite: "lax",
                httpOnly: true,
                secure: true,
              })
            } catch {}
          },
          removeItem: (key: string) => {
            try {
              cookieStore.delete(key)
            } catch {}
          },
        },
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}
