"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, X, Plus, Info, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const SUGGESTED_TAGS = [
  "javascript", "typescript", "react", "nextjs", "css",
  "html", "node", "python", "database", "api",
];

export default function AskQuestionPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!user) {
      setError("You must be logged in to ask a question.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error: dbError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          tags: tags,
        });

      if (dbError) throw dbError;
      
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error posting question:", err);
      setError(err.message || "Failed to post question.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
          🎉
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Question Posted!</h1>
        <p className="text-slate-500 text-lg max-w-md">
          Your question has been submitted. The community will start helping you
          shortly.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ask a Question</h1>
          <p className="text-sm text-slate-500 mt-1">
            Get help from the community
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-8">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Tips for a great question:</p>
          <ul className="list-disc list-inside text-blue-700 space-y-0.5">
            <li>Be specific and clear about the problem</li>
            <li>Include code snippets or error messages if applicable</li>
            <li>Add relevant tags so experts can find your question</li>
          </ul>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., How to implement authentication in Next.js?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
            required
          />
          <p className="text-xs text-slate-400 mt-1.5">
            {title.length}/150 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your question in detail. What have you tried so far?"
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base resize-none"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tags <span className="font-normal text-slate-400">(up to 5)</span>
          </label>
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white min-h-[48px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Add tags..." : ""}
                className="flex-1 min-w-[120px] border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent"
              />
            )}
          </div>
          {/* Suggested Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
              >
                <Plus className="w-3 h-3" /> {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg mt-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Post Question
            </>
          )}
        </button>
      </form>
    </div>
  );
}
