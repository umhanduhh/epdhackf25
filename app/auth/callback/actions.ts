"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function handleAuthCallback(accessToken: string, refreshToken: string) {
  const cookieStore = cookies()

  // Get user info from the access token by calling Supabase auth API
  const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  })

  if (!userResponse.ok) {
    console.error("[Server Action] Failed to get user info")
    redirect("/auth?error=user_fetch_failed")
  }

  const user = await userResponse.json()
  console.log("[Server Action] User fetched:", user.id)

  // Construct the full session object that Supabase expects
  const sessionData = {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: user,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  }

  // Set the cookie with the standard Supabase cookie name
  const cookieName = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`

  console.log("[Server Action] Setting cookie:", cookieName)

  cookieStore.set(cookieName, JSON.stringify(sessionData), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: true,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  console.log("[Server Action] Cookie set, checking profile...")

  // Check if user has a profile using direct fetch (avoid Supabase client)
  const profileResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}&select=id`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
    }
  )

  const profiles = await profileResponse.json()
  const hasProfile = profiles && profiles.length > 0

  console.log("[Server Action] Has profile:", hasProfile)

  // Redirect based on profile existence
  if (!hasProfile) {
    redirect("/profile/setup")
  } else {
    redirect("/feed")
  }
}
