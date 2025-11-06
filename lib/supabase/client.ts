// lib/supabase/client.ts
import { createClient as createCleanClient } from "./client-clean"

export function getSupabaseBrowserClient() {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient can only be called in the browser. " +
      "If you're in a Server Component or Server Action, use getSupabaseServerClient instead."
    )
  }

  return createCleanClient()
}
