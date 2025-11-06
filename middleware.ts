// middleware.ts
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  // Always create a response object first…
  const res = NextResponse.next()

  // …then give Supabase explicit cookie read/write bridges.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read cookies from the incoming request
          return req.cookies.getAll()
        },
        setAll(cookies) {
          // Write **onto the same response** we will return
          for (const { name, value, options } of cookies) {
            res.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // This refreshes/hydrates auth cookies for RSC/SSR (no exchanging here)
  await supabase.auth.getSession()

  return res
}

// Skip static assets and images; cover everything else
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
