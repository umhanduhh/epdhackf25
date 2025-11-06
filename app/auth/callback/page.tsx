// app/auth/callback/page.tsx
export const dynamic = "force-dynamic"; // avoid prerendering

"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const ran = useRef(false) // guard StrictMode double-run

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    ;(async () => {
      const supabase = getSupabaseBrowserClient()

      // Read params from the browser to avoid Suspense requirements
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const err = params.get("error_description")

      if (err) {
        router.replace("/auth?error=auth_failed")
        return
      }
      if (!code) {
        router.replace("/auth?error=no_code")
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        router.replace("/auth?error=auth_failed")
        return
      }

      router.replace("/feed")
    })()
  }, [router])

  return null
}

