import { createClient } from "@/lib/supabase/server-clean"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle errors from Supabase
  if (error) {
    console.error("[Auth Callback] Error from Supabase:", error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=${error}`)
  }

  // Check for authorization code
  if (!code) {
    console.error("[Auth Callback] No code in URL")
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
  }

  try {
    const supabase = createClient()

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("[Auth Callback] Error exchanging code:", exchangeError)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_failed`)
    }

    if (!data.user) {
      console.error("[Auth Callback] No user after exchange")
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_user`)
    }

    console.log("[Auth Callback] Session established for user:", data.user.id)

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("handle")
      .eq("id", data.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "not found" - that's expected for new users
      console.error("[Auth Callback] Error checking profile:", profileError)
    }

    // Redirect to profile setup if no profile, otherwise to feed
    const redirectTo = profile?.handle ? "/feed" : "/profile/setup"
    console.log("[Auth Callback] Redirecting to:", redirectTo)

    return NextResponse.redirect(requestUrl.origin + redirectTo)
  } catch (error) {
    console.error("[Auth Callback] Unexpected error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_failed`)
  }
}
