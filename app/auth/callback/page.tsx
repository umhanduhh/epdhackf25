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

        // Extract token from URL hash (magic link tokens are in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // If we have tokens in the hash, set the session
        if (accessToken && refreshToken && type === 'magiclink') {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("Session error:", sessionError)
            window.location.href = "/auth?error=auth_failed"
            return
          }
        }

        // Get the current session
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
