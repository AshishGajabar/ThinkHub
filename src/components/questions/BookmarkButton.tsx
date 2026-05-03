"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface BookmarkButtonProps {
  postId: string;
}

export function BookmarkButton({ postId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function checkBookmark() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;
      
      setUser(user);
      
      if (user) {
        try {
          const { data } = await supabase
            .from("bookmarks")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .single();
            
          if (data && isMounted) {
            setIsBookmarked(true);
          }
        } catch (e) {
          // No row found or error
        }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    }
    
    checkBookmark();
    
    return () => { isMounted = false; };
  }, [postId]);

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please log in to bookmark questions.");
      return;
    }
    
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked); // Optimistic UI update
    
    try {
      if (previousState) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
          
        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert({
            post_id: postId,
            user_id: user.id
          });
          
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setIsBookmarked(previousState); // Revert on failure
      alert("Failed to save bookmark. The bookmarks table might not exist yet!");
    }
  }

  if (isLoading) {
    return (
      <button disabled className="p-2 text-slate-300">
        <Bookmark className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleBookmark}
      className={`p-2 rounded-xl transition-all ${
        isBookmarked 
          ? "text-amber-500 bg-amber-50 hover:bg-amber-100" 
          : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
      }`}
      title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
    >
      <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
    </button>
  );
}
