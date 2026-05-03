import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { getAvatarUrl } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MessageSquare, CheckCircle, Clock } from "lucide-react";
import AnswerForm from "@/components/questions/AnswerForm";
import { BookmarkButton } from "@/components/questions/BookmarkButton";
import { VoteButton } from "@/components/questions/VoteButton";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try fetching from Supabase, fallback gracefully
  let question: any = null;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select(`*, author:profiles!user_id(full_name, avatar_url), answers(*, author:profiles!user_id(full_name, avatar_url))`)
      .eq("id", id)
      .single();
    question = data;
    
    // Sort answers by created_at or votes if needed
    if (question && question.answers) {
      question.answers.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  } catch {}

  if (!question) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center flex flex-col items-center gap-6">
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
          <MessageSquare className="w-12 h-12 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Question Not Found</h1>
        <p className="text-slate-500 max-w-md">
          This question may have been removed or doesn&apos;t exist yet. Once you connect your Supabase database and create the posts table, questions will appear here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to questions
      </Link>

      <GlassCard className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex flex-col items-center gap-2">
            <VoteButton postId={question.id} initialVotes={question.vote_count || 0} type="post" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {question.is_solved && (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Solved
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{question.title}</h1>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{question.content}</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {(question.tags || []).map((tag: string) => (
                <Badge key={tag} className="bg-slate-100 text-slate-600 border border-slate-200">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <img
                  src={question.author?.avatar_url || getAvatarUrl(question.author?.full_name || "User")}
                  alt=""
                  className="w-8 h-8 rounded-full bg-slate-200"
                />
                <span className="font-medium text-slate-700">{question.author?.full_name || "Anonymous"}</span>
                <Clock className="w-4 h-4" />
                <span>{new Date(question.created_at).toLocaleDateString()}</span>
              </div>
              <BookmarkButton postId={question.id} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Answers Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {question.answers?.length || 0} {(question.answers?.length === 1) ? "Answer" : "Answers"}
        </h2>
        
        <div className="flex flex-col gap-6">
          {(question.answers || []).map((answer: any) => (
            <GlassCard key={answer.id} className="p-6">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <VoteButton postId={answer.id} initialVotes={answer.vote_count || 0} type="answer" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                    {answer.content}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 text-sm text-slate-500">
                    <img
                      src={answer.author?.avatar_url || getAvatarUrl(answer.author?.full_name || "User")}
                      alt=""
                      className="w-6 h-6 rounded-full bg-slate-200"
                    />
                    <span className="font-medium text-slate-700">{answer.author?.full_name || "Anonymous"}</span>
                    <Clock className="w-4 h-4" />
                    <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Answer Form */}
        <AnswerForm questionId={question.id} />
      </div>
    </div>
  );
}
