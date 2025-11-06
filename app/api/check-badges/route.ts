import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkAndAwardBadges } from "@/lib/badge-checker"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await checkAndAwardBadges(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error checking badges:", error)
    return NextResponse.json({ error: "Failed to check badges" }, { status: 500 })
  }
}
