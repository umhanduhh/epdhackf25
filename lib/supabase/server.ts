// lib/supabase/server.ts
import { createClient } from "./server-clean"

export function getSupabaseServerClient() {
  return createClient()
}
