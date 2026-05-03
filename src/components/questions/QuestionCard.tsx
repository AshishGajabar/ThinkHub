import React from "react";
import Link from "next/link";
import { MessageSquare, CheckCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { getAvatarUrl } from "@/lib/utils";
import { BookmarkButton } from "./BookmarkButton";
import { VoteButton } from "./VoteButton";

interface QuestionCardProps {
  id: string;
  title: string;
  content: string;
  tags: string[];
  views: number;
  isSolved: boolean;
  createdAt: string;
  author: {
    name: string;
    avatarUrl: string | null;
  };
  stats: {
    votes: number;
    answers: number;
  };
}

export function QuestionCard({
  id,
  title,
  content,
  tags,
  views,
  isSolved,
  createdAt,
  author,
  stats,
}: QuestionCardProps) {
  return (
    <GlassCard className="p-6 transition-all hover:shadow-md hover:bg-white/60">
      <div className="flex gap-4">
        {/* Voting & Stats Column */}
        <div className="flex flex-col items-center gap-3 shrink-0 w-16">
          <VoteButton postId={id} initialVotes={stats.votes} type="post" />
          <div className={`flex flex-col items-center py-2 px-3 rounded-xl border ${stats.answers > 0 ? (isSolved ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700') : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <span className="text-sm font-bold">{stats.answers}</span>
            <span className="text-[10px] uppercase font-semibold">Answers</span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-2">
            <Link href={`/questions/${id}`} className="group">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
            {isSolved && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shrink-0 border border-emerald-200 shadow-sm flex items-center gap-1 py-1 px-3">
                <CheckCircle className="w-3.5 h-3.5" /> Solved
              </Badge>
            )}
          </div>
          
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {content}
          </p>
          
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <Badge key={tag} className="bg-slate-100 text-slate-600 border border-slate-200 font-medium hover:bg-slate-200">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <img 
                  src={author.avatarUrl || getAvatarUrl(author.name)} 
                  alt={author.name}
                  className="w-6 h-6 rounded-full bg-slate-200 border border-white shadow-sm"
                />
                <span className="text-slate-700">{author.name}</span>
                <span className="text-slate-400 mx-1">•</span>
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1" title={`${views} views`}>
                  <Eye className="w-4 h-4" />
                  <span>{views}</span>
                </div>
                <BookmarkButton postId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
