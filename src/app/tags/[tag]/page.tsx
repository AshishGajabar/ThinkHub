import Link from "next/link";
import { Hash, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to topics
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
          <Hash className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{tag}</h1>
          <p className="text-sm text-slate-500">
            Questions tagged with #{tag}
          </p>
        </div>
      </div>

      <GlassCard className="text-center py-16 px-6 rounded-[2rem] border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl">📭</div>
          <h3 className="text-xl font-bold text-slate-900">No questions yet</h3>
          <p className="text-slate-500 max-w-md">
            Be the first to ask a question with the <strong>#{tag}</strong> tag!
          </p>
          <Link
            href="/questions/new"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg"
          >
            Ask a Question
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
