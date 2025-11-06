"use client"

export const dynamic = "force-dynamic";

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    ;(async () => {
      const supabase = getSupabaseBrowserClient()

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
