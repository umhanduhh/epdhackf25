"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseBrowserClient();

        // Get the code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          setError("No authentication code found");
          setTimeout(() => router.push("/auth?error=no_code"), 2000);
          return;
        }

        // Exchange the code for a session
        // The PKCE verifier is automatically retrieved from localStorage by Supabase
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Auth exchange error:", exchangeError);
          setError(exchangeError.message);
          setTimeout(() => router.push("/auth?error=auth_failed"), 2000);
          return;
        }

        if (!data.session) {
          setError("No session created");
          setTimeout(() => router.push("/auth?error=no_user"), 2000);
          return;
        }

        // Success! Redirect to feed
        router.push("/feed");
      } catch (err: any) {
        console.error("Callback error:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => router.push("/auth?error=auth_failed"), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#b8ddd8]">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-[#5a3c2e] mb-4">Authentication Error</h1>
            <p className="text-[#8b5b3e]">{error}</p>
            <p className="text-[#8b5b3e] mt-2">Redirecting...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#5a3c2e] mb-4">Completing sign in...</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5b3e] mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
}
