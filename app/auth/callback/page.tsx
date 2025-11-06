"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { handleAuthCallback } from "./actions"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading")

  useEffect(() => {
    const doCallback = async () => {
      try {
        console.log("Full URL:", window.location.href)
        console.log("Hash:", window.location.hash)

        // Extract token from URL hash (magic link tokens are in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        const errorCode = hashParams.get('error_code')

        console.log("Extracted tokens:", { accessToken: !!accessToken, refreshToken: !!refreshToken })

        // Check for errors in hash
        if (error) {
          console.error("Auth error from Supabase:", { error, errorCode })
          if (errorCode === 'otp_expired') {
            window.location.href = "/auth?error=link_expired"
            return
          }
          window.location.href = `/auth?error=${errorCode || 'auth_failed'}`
          return
        }

        // If we have tokens, handle them server-side
        if (accessToken && refreshToken) {
          console.log("Calling server action to set session...")
          // Call server action - it will set cookies via HTTP headers and redirect
          await handleAuthCallback(accessToken, refreshToken)
          // If we get here, redirect didn't work - shouldn't happen
          console.error("Server action returned without redirect")
        } else {
          console.error("No tokens found in hash")
          window.location.href = "/auth?error=no_tokens"
        }
      } catch (error) {
        console.error("Callback error:", error)
        setStatus("error")
        setTimeout(() => {
          window.location.href = "/auth?error=auth_failed"
        }, 2000)
      }
    }

    doCallback()
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
