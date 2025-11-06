import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // Allow auth callback to proceed without checks
  if (request.nextUrl.pathname === "/auth/callback") {
    await supabase.auth.getUser()
    return response
  }

  // Allow profile setup to proceed without checks (user might be mid-setup)
  if (request.nextUrl.pathname === "/profile/setup") {
    return response
  }

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect authenticated users away from auth page
  if (user && request.nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  // Redirect unauthenticated users to auth page for protected routes
  if (!user && request.nextUrl.pathname !== "/auth" && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
