import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, Award, Target, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CommunityPage() {
  const supabase = await createClient();

  // Fetch all profiles
  const { data: profiles } = await supabase.from("profiles").select("*");
  // Fetch posts and answers to calculate dynamic stats
  const { data: posts } = await supabase.from("posts").select("user_id");
  const { data: answers } = await supabase.from("answers").select("user_id");

  // Calculate stats
  const userStats: Record<string, { questions: number; answers: number; reputation: number }> = {};
  
  (profiles || []).forEach(p => {
    userStats[p.id] = { questions: 0, answers: 0, reputation: p.reputation || 0 };
  });

  (posts || []).forEach(p => {
    if (userStats[p.user_id]) {
      userStats[p.user_id].questions++;
      userStats[p.user_id].reputation += 5;
    }
  });

  (answers || []).forEach(a => {
    if (userStats[a.user_id]) {
      userStats[a.user_id].answers++;
      userStats[a.user_id].reputation += 10;
    }
  });

  // Combine and sort by reputation
  const communityUsers = (profiles || []).map(p => ({
    ...p,
    stats: userStats[p.id]
  })).sort((a, b) => b.stats.reputation - a.stats.reputation);

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      <div className="flex-1 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Community</h1>
          </div>
          <p className="text-slate-500 text-lg ml-1">
            Meet the top contributors making ThinkHub a great place to learn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communityUsers.length > 0 ? (
            communityUsers.map((user, index) => (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <GlassCard className="p-5 hover:shadow-md transition-all group h-full flex flex-col relative overflow-hidden">
                  {/* Rank background for top 3 */}
                  {index === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200/50 to-transparent rounded-tr-2xl"></div>}
                  {index === 1 && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-200/50 to-transparent rounded-tr-2xl"></div>}
                  {index === 2 && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-200/50 to-transparent rounded-tr-2xl"></div>}
                  
                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <div className="relative">
                      {index === 0 && <div className="absolute inset-0 bg-amber-400 rounded-full blur-[6px] opacity-60 animate-pulse"></div>}
                      <img 
                        src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || user.id}&backgroundColor=1e40af&textColor=ffffff`}
                        alt={user.full_name} 
                        className={`relative w-12 h-12 rounded-full object-cover shadow-sm ${index === 0 ? "border-2 border-amber-400" : "border border-slate-200"}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        {user.full_name || "Anonymous User"}
                        {index === 0 && <span title="Rank 1">🥇</span>}
                        {index === 1 && <span title="Rank 2">🥈</span>}
                        {index === 2 && <span title="Rank 3">🥉</span>}
                      </h3>
                      <p className="text-sm text-slate-500 truncate max-w-[200px]">
                        {user.bio || "Member"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-slate-800">{user.stats.reputation}</span>
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 uppercase tracking-wider">
                        <Award className="w-3 h-3" /> Rep
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-slate-800">{user.stats.questions}</span>
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 uppercase tracking-wider">
                        <Target className="w-3 h-3" /> Asked
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-slate-800">{user.stats.answers}</span>
                      <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 uppercase tracking-wider">
                        <MessageSquare className="w-3 h-3" /> Ans
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              No users found.
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:block w-80 shrink-0">
        <Sidebar />
      </div>
    </div>
  );
}
