import React from "react";
import Link from "next/link";
import { Home, Compass, Bookmark, Users, Hash, Award, TrendingUp, Target, MessageSquare } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/lib/supabase/server";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Community", href: "/community", icon: Users },
];

export async function Sidebar() {
  const supabase = await createClient();

  // Fetch posts for trending tags and Top Questioners
  const { data: posts } = await supabase
    .from("posts")
    .select(`user_id, tags, author:profiles!user_id(id, full_name, avatar_url)`);

  // Fetch answers for Top Answerers
  const { data: answers } = await supabase
    .from("answers")
    .select(`user_id, author:profiles!user_id(id, full_name, avatar_url)`);

  // Calculate Trending Tags
  const tagCounts: Record<string, number> = {};
  (posts || []).forEach((post) => {
    (post.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const trendingTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Calculate Top Questioners
  const questionerCounts: Record<string, { profile: any; count: number }> = {};
  (posts || []).forEach((post) => {
    if (!post.author) return;
    if (!questionerCounts[post.user_id]) {
      questionerCounts[post.user_id] = { profile: post.author, count: 0 };
    }
    questionerCounts[post.user_id].count++;
  });
  const topQuestioners = Object.values(questionerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Calculate Top Answerers
  const answererCounts: Record<string, { profile: any; count: number }> = {};
  (answers || []).forEach((answer) => {
    if (!answer.author) return;
    if (!answererCounts[answer.user_id]) {
      answererCounts[answer.user_id] = { profile: answer.author, count: 0 };
    }
    answererCounts[answer.user_id].count++;
  });
  const topAnswerers = Object.values(answererCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 sticky top-24">
      {/* Navigation Menu */}
      <GlassCard className="p-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium text-sm"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </GlassCard>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-900">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm">Trending Tags</h3>
          </div>
          <div className="flex flex-col gap-3">
            {trendingTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${tag.name}`}
                className="group flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-600 transition-colors">
                  <Hash className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium">{tag.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Top Answerers */}
      {topAnswerers.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-900">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm">Top Answerers</h3>
          </div>
          <div className="flex flex-col gap-4">
            {topAnswerers.map((user, index) => (
              <Link key={user.profile.id} href={`/profile/${user.profile.id}`} className="group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {index === 0 && <div className="absolute inset-0 bg-amber-400 rounded-full blur-[6px] opacity-60 animate-pulse"></div>}
                    {index === 1 && <div className="absolute inset-0 bg-slate-400 rounded-full blur-[6px] opacity-60 animate-pulse"></div>}
                    {index === 2 && <div className="absolute inset-0 bg-orange-700 rounded-full blur-[6px] opacity-60 animate-pulse"></div>}
                    <img
                      src={user.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.profile.full_name || user.profile.id}&backgroundColor=1e40af&textColor=ffffff`}
                      alt="User"
                      className={`relative w-8 h-8 rounded-full bg-slate-100 object-cover shadow-sm ${
                        index === 0 ? "border-2 border-amber-400" : 
                        index === 1 ? "border-2 border-slate-300" : 
                        index === 2 ? "border-2 border-orange-700" : "border border-slate-200"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold group-hover:text-blue-600 transition-colors ${
                        index === 0 ? "text-amber-600" : 
                        index === 1 ? "text-slate-600" : 
                        index === 2 ? "text-orange-800" : "text-slate-800"
                      }`}>
                      {user.profile.full_name || "User"}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {user.count} answers
                    </span>
                  </div>
                </div>
                <div className="text-xl filter drop-shadow-sm">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Top Questioners */}
      {topQuestioners.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-900">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm">Top Questioners</h3>
          </div>
          <div className="flex flex-col gap-4">
            {topQuestioners.map((user, index) => (
              <Link key={user.profile.id} href={`/profile/${user.profile.id}`} className="group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {index === 0 && <div className="absolute inset-0 bg-blue-400 rounded-full blur-[6px] opacity-60 animate-pulse"></div>}
                    <img
                      src={user.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.profile.full_name || user.profile.id}&backgroundColor=1e40af&textColor=ffffff`}
                      alt="User"
                      className={`relative w-8 h-8 rounded-full bg-slate-100 object-cover shadow-sm ${
                        index === 0 ? "border-2 border-blue-400" : "border border-slate-200"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold group-hover:text-blue-600 transition-colors ${
                        index === 0 ? "text-blue-600" : "text-slate-800"
                      }`}>
                      {user.profile.full_name || "User"}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Target className="w-3 h-3" /> {user.count} asked
                    </span>
                  </div>
                </div>
                <div className="text-xl filter drop-shadow-sm">
                  {index === 0 ? '🏆' : index === 1 ? '⭐' : '⭐'}
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
