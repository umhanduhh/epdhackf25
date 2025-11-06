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
            console.log(`[Server Client] Getting cookie: ${key}`)
            const cookie = cookieStore.get(key)
            console.log(`[Server Client] Cookie value exists: ${!!cookie?.value}`)
            if (cookie?.value) {
              console.log(`[Server Client] Cookie value length: ${cookie.value.length}`)
            }
            return cookie?.value ?? null
          },
          setItem: (key: string, value: string) => {
            console.log(`[Server Client] Setting cookie: ${key}`)
            try {
              cookieStore.set(key, value, {
                path: "/",
                sameSite: "lax",
                httpOnly: false, // MUST be false so client can also read/write
                secure: true,
              })
            } catch (e) {
              console.error(`[Server Client] Failed to set cookie:`, e)
            }
          },
          removeItem: (key: string) => {
            console.log(`[Server Client] Removing cookie: ${key}`)
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
