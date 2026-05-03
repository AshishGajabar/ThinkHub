import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Compass, Hash, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const supabase = await createClient();

  // Fetch all posts to aggregate tags
  const { data: posts } = await supabase.from("posts").select("tags");

  const tagCounts: Record<string, number> = {};
  (posts || []).forEach((post) => {
    (post.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

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
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Compass className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Explore Topics</h1>
          </div>
          <p className="text-slate-500 text-lg ml-1">
            Browse through all topics and find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedTags.length > 0 ? (
            sortedTags.map((tag) => (
              <Link key={tag.name} href={`/tags/${tag.name}`}>
                <GlassCard className="p-5 flex items-center justify-between hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <Hash className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {tag.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {tag.count} {tag.count === 1 ? "question" : "questions"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </GlassCard>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              No topics found. Start asking questions to create some!
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
