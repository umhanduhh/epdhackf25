import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with custom cookie storage for middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = request.cookies.get(key)
            return cookie?.value ?? null
          },
          setItem: (key: string, value: string) => {
            response.cookies.set(key, value, {
              path: "/",
              sameSite: "lax",
              httpOnly: true,
              secure: true,
            })
          },
          removeItem: (key: string) => {
            response.cookies.delete(key)
          },
        },
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
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

  // Log all cookies received by middleware
  const allCookies = request.cookies.getAll()
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}`)
  console.log(`[Middleware] Cookies received:`, allCookies.map(c => c.name))

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log(`[Middleware] User authenticated:`, !!user)

  // Redirect authenticated users away from auth page
  if (user && request.nextUrl.pathname === "/auth") {
    console.log(`[Middleware] Redirecting authenticated user from /auth to /feed`)
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  // Redirect unauthenticated users to auth page for protected routes
  if (!user && request.nextUrl.pathname !== "/auth" && request.nextUrl.pathname !== "/") {
    console.log(`[Middleware] Redirecting unauthenticated user to /auth`)
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
