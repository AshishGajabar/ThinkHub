"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setIsCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      if (!user) {
        setError("You must be logged in to answer.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("answers").insert({
        post_id: questionId,
        user_id: user.id,
        content: content.trim(),
      });

      if (error) {
        setError(error.message);
      } else {
        setContent("");
        // Reload page to show new answer
        window.location.reload();
      }
    } catch (e: any) {
      setError(e.message || "Failed to submit answer.");
    } finally {
      setLoading(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="mt-8 flex justify-center py-6">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center mt-8">
        <h3 className="font-bold text-slate-900 mb-2">Have an answer?</h3>
        <p className="text-slate-500 mb-4">Sign in to share your knowledge with the community.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all"
        >
          Sign In to Answer
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="font-bold text-lg text-slate-900 mb-4">Your Answer</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your answer here... Markdown is supported."
          className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : (
              <>Post Answer <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
