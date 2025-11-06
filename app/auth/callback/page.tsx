"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseBrowserClient()

        // Get the code from the URL
        const code = new URL(window.location.href).searchParams.get("code")

        if (code) {
          // Exchange the code for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error("Code exchange error:", exchangeError)
            window.location.href = "/auth?error=auth_failed"
            return
          }
        }

        // Get the session after code exchange
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.error("Session error:", sessionError)
          window.location.href = "/auth?error=auth_failed"
          return
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile check error:", profileError)
          window.location.href = "/auth?error=auth_failed"
          return
        }

        // Redirect based on profile existence
        if (!profile) {
          window.location.href = "/profile/setup"
        } else {
          window.location.href = "/feed"
        }
      } catch (error) {
        console.error("Callback error:", error)
        setStatus("error")
        setTimeout(() => {
          window.location.href = "/auth?error=auth_failed"
        }, 2000)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === "loading" ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Completing sign in...</p>
          </>
        ) : (
          <>
            <p className="text-destructive">Authentication failed</p>
            <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  )
}
