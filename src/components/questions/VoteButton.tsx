"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface VoteButtonProps {
  postId: string;
  initialVotes: number;
  type: "post" | "answer";
}

export function VoteButton({ postId, initialVotes, type }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<number>(0); // -1, 0, or 1
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      if (data?.user) {
        checkExistingVote(data.user.id);
      }
    });
  }, [postId]);

  async function checkExistingVote(userId: string) {
    try {
      const { data } = await supabase
        .from("votes")
        .select("value")
        .eq("target_id", postId)
        .eq("target_type", type)
        .eq("user_id", userId)
        .single();

      if (data) {
        setUserVote(data.value);
      }
    } catch {
      // No existing vote
    }
  }

  async function handleVote(e: React.MouseEvent, direction: number) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please log in to vote.");
      return;
    }

    const newVote = userVote === direction ? 0 : direction;
    const voteDiff = newVote - userVote;

    // Optimistic update
    setUserVote(newVote);
    setVotes((prev) => prev + voteDiff);

    try {
      if (newVote === 0) {
        // Remove vote
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("target_id", postId)
          .eq("target_type", type)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Upsert vote
        const { error } = await supabase
          .from("votes")
          .upsert(
            {
              target_id: postId,
              target_type: type,
              user_id: user.id,
              value: newVote,
            },
            { onConflict: "target_id,target_type,user_id" }
          );

        if (error) throw error;
      }

      // We rely on a database trigger to update the actual vote_count on the posts/answers tables.
    } catch (error: any) {
      console.error("Vote error:", error);
      // Revert on failure
      setUserVote(userVote);
      setVotes(votes);
      alert("Failed to register vote: " + (error.message || "Unknown error"));
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={(e) => handleVote(e, 1)}
        className={`transition-all rounded-full p-0.5 ${
          userVote === 1
            ? "text-blue-600 scale-110 drop-shadow-[0_0_6px_rgba(37,99,235,0.5)]"
            : "text-slate-400 hover:text-blue-600"
        }`}
        title="Upvote"
      >
        <ArrowUpCircle
          className="w-8 h-8"
          strokeWidth={1.5}
          fill={userVote === 1 ? "currentColor" : "none"}
        />
      </button>
      <span
        className={`font-bold text-lg ${
          userVote === 1
            ? "text-blue-600"
            : userVote === -1
            ? "text-red-500"
            : "text-slate-700"
        }`}
      >
        {votes}
      </span>
      <button
        onClick={(e) => handleVote(e, -1)}
        className={`transition-all rounded-full p-0.5 ${
          userVote === -1
            ? "text-red-500 scale-110 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
            : "text-slate-400 hover:text-red-500"
        }`}
        title="Downvote"
      >
        <ArrowDownCircle
          className="w-7 h-7"
          strokeWidth={1.5}
          fill={userVote === -1 ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
