"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    ;(async () => {
      const supabase = getSupabaseBrowserClient()
      const code = params.get("code")
      const err = params.get("error_description")
      if (err) return router.replace("/auth?error=auth_failed")
      if (!code) return router.replace("/auth?error=no_code")

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) return router.replace("/auth?error=auth_failed")

      router.replace("/feed")
    })()
  }, [params, router])

  return null
}
