"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export async function handleAuthCallback(accessToken: string, refreshToken: string) {
  const cookieStore = cookies()

  // Create server-side Supabase client with cookie storage
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            return cookieStore.get(key)?.value ?? null
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              path: "/",
              sameSite: "lax",
              httpOnly: false,
              secure: true,
              maxAge: 60 * 60 * 24 * 365, // 1 year
            })
          },
          removeItem: (key: string) => {
            cookieStore.delete(key)
          },
        },
      },
    }
  )

  // Set the session server-side
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error || !data.session) {
    console.error("[Server Action] Failed to set session:", error)
    redirect("/auth?error=session_failed")
  }

  console.log("[Server Action] Session set successfully for user:", data.session.user.id)

  // Check if user has a profile
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("id", data.session.user.id)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    console.error("[Server Action] Profile check error:", profileError)
    redirect("/auth?error=profile_check_failed")
  }

  // Redirect based on profile existence
  if (!profile) {
    redirect("/profile/setup")
  } else {
    redirect("/feed")
  }
}
