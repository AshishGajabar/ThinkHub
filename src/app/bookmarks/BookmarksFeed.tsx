"use client";

import React, { useState, useEffect } from "react";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { Bookmark, Inbox } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export function BookmarksFeed() {
  const [user, setUser] = useState<any>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      if (data?.user) {
        fetchBookmarks(data.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchBookmarks(session.user.id);
      } else {
        setBookmarkedQuestions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchBookmarks(userId: string) {
    try {
      const { data: bookmarks, error } = await supabase
        .from("bookmarks")
        .select(`
          post_id,
          post:posts (
            id, title, content, tags, views, is_solved, created_at, vote_count,
            author:profiles!user_id(full_name, avatar_url),
            answers(count)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        
      if (!error && bookmarks) {
        const formatted = bookmarks.map((b: any) => {
          const post = Array.isArray(b.post) ? b.post[0] : b.post;
          if (!post) return null;
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            tags: post.tags || [],
            views: post.views || 0,
            isSolved: post.is_solved,
            createdAt: post.created_at,
            author: {
              name: post.author?.full_name || "Anonymous User",
              avatarUrl: post.author?.avatar_url || null,
            },
            stats: {
              votes: post.vote_count || 0,
              answers: post.answers?.[0]?.count || 0,
            },
          };
        }).filter(Boolean);
        setBookmarkedQuestions(formatted);
      } else if (error) {
        console.error("Supabase Error:", error);
        setErrorMsg(error.message);
      }
    } catch (e: any) {
      console.error("Bookmarks fetch exception:", e);
      setErrorMsg(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (errorMsg) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <p className="font-bold">Error loading bookmarks:</p>
        <p className="font-mono text-sm mt-1">{errorMsg}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Log in to view bookmarks</h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          Save questions to easily find them again when you need them.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (bookmarkedQuestions.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {bookmarkedQuestions.map((q) => (
          <QuestionCard key={q.id} {...q} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl">
      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">No bookmarks yet</h2>
      <p className="text-slate-500 max-w-sm mx-auto">
        When you find a helpful question, bookmark it to easily find it later!
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex text-blue-600 font-semibold hover:text-blue-700 transition-colors"
      >
        Browse Questions →
      </Link>
    </div>
  );
}
