"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // supabase.auth.getSession() automatically processes the URL parameters 
        // (both PKCE codes and implicit hashes) and establishes the session.
        // Because we use @supabase/ssr in supabaseClient, it will automatically
        // save the session to cookies for Next.js SSR to read.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error.message);
          setError(error.message);
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (data?.session) {
          console.log("User successfully logged in:", data.session.user.email);
          // Force a hard refresh to ensure all server components read the new cookie
          window.location.href = "/";
        } else {
          console.error("No session found in callback");
          setError("No session found. Please try logging in again.");
          setTimeout(() => router.push("/login"), 3000);
        }
      } catch (err: any) {
        console.error("Unexpected error during callback:", err);
        setError("An unexpected error occurred.");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
              ❌
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Authentication Failed</h1>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-slate-500">Redirecting back to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Logging you in...</h1>
            <p className="text-slate-500">Please wait while we securely authenticate your account.</p>
          </>
        )}
      </div>
    </div>
  );
}
