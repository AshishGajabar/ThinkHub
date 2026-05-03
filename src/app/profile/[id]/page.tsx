"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { getAvatarUrl } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, Award, Edit3, Target, ArrowUpCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answersCount, setAnswersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [params.id]);

  async function fetchProfileData() {
    setLoading(true);
    try {
      // 1. Get the profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();
      
      setProfile(profileData);

      // 2. Get questions by this user
      const { data: questionsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", params.id)
        .order("created_at", { ascending: false });
      
      setQuestions(questionsData || []);

      // 3. Get answers count by this user
      const { count } = await supabase
        .from("answers")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", params.id);
      
      setAnswersCount(count || 0);

      // 4. Check if logged-in user owns this profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === params.id) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate joined time ago
  const getJoinedText = (dateString: string) => {
    if (!dateString) return "Recently joined";
    const joinedDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - joinedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Joined today";
    if (diffDays === 1) return "Joined yesterday";
    if (diffDays < 30) return `Joined ${diffDays} days ago`;
    if (diffDays < 365) return `Joined ${Math.floor(diffDays / 30)} months ago`;
    return `Joined ${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center flex flex-col items-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
          👻
        </div>
        <h1 className="text-2xl font-bold text-slate-900">User Not Found</h1>
        <p className="text-slate-500">This profile doesn&apos;t exist or has been removed.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const reputation = profile.reputation || (questions.length * 5) + (answersCount * 10);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      {/* Cover and Header */}
      <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-xl shadow-slate-200/50 mb-8 border border-slate-200">
        {/* Cover Gradient */}
        <div className="absolute inset-0 h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-80"></div>
        
        <div className="relative pt-16 px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900 flex items-center justify-center border-4 border-slate-900 text-5xl text-white font-bold">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    profile.full_name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left pt-4 sm:pt-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{profile.full_name || "Anonymous User"}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>{getJoinedText(profile.created_at)}</span>
              </div>
              
              {profile.bio && (
                <p className="mt-4 text-slate-300 max-w-lg leading-relaxed text-sm">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Actions */}
            {isOwner && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-md transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Stats Divider */}
          <div className="w-full h-px bg-white/10 my-8"></div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-8 sm:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{questions.length}</p>
                <p className="text-xs font-semibold text-slate-400 tracking-wider mt-1 uppercase">Questions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{answersCount}</p>
                <p className="text-xs font-semibold text-slate-400 tracking-wider mt-1 uppercase">Answers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{reputation}</p>
                <p className="text-xs font-semibold text-slate-400 tracking-wider mt-1 uppercase">Reputation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Questions</h2>
        
        {questions.length === 0 ? (
          <GlassCard className="text-center py-16 px-6 border-dashed border-2 border-slate-200 shadow-none">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No questions yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              This user hasn&apos;t asked any questions yet.
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {questions.map((q) => (
              <Link key={q.id} href={`/questions/${q.id}`}>
                <GlassCard className="p-5 hover:shadow-md transition-all group">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {q.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <ArrowUpCircle className="w-4 h-4" />
                      {q.vote_count || 0} votes
                    </span>
                    <div className="flex gap-2 ml-auto">
                      {(q.tags || []).slice(0, 2).map((tag: string) => (
                        <Badge key={tag} className="bg-slate-100 text-slate-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        profile={profile}
        onUpdate={fetchProfileData}
      />
    </div>
  );
}
