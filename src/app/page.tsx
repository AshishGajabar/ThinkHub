import { Sidebar } from "@/components/layout/Sidebar";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { getAvatarUrl } from "@/lib/utils";
import { Zap, Clock, HelpCircle, MessageSquare, ArrowRight, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Filter = "trending" | "latest" | "unanswered";

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  views: number;
  isSolved: boolean;
  createdAt: string;
  author: { name: string; avatarUrl: string | null };
  stats: { votes: number; answers: number };
}

async function getQuestions(filter: Filter): Promise<Question[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("posts")
      .select(`*, author:profiles!user_id(full_name, avatar_url), answers(count)`);

    if (filter === "trending") {
      query = query.order("views", { ascending: false }).limit(20);
    } else if (filter === "latest") {
      query = query.order("created_at", { ascending: false }).limit(20);
    } else if (filter === "unanswered") {
      // Fetch more to ensure we have enough after filtering
      query = query.order("created_at", { ascending: false }).limit(100);
    }

    const { data: posts, error } = await query;

    if (error || !posts) return [];

    let filteredPosts = posts;
    if (filter === "unanswered") {
      // Filter strictly for 0 answers
      filteredPosts = posts.filter((post: any) => post.answers?.[0]?.count === 0).slice(0, 20);
    }

    return filteredPosts.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags || [],
      views: post.views || 0,
      isSolved: post.is_solved,
      createdAt: post.created_at,
      author: {
        name: post.author?.full_name || "Anonymous User",
        avatarUrl: post.author?.avatar_url || null,
      },
      stats: {
        votes: post.vote_count || 0,
        answers: post.answers?.[0]?.count || 0,
      },
    }));
  } catch {
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter: Filter = (params.filter as Filter) || "trending";
  const questions = await getQuestions(filter);

  // Fetch top creators for the floating cards
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: posts } = await supabase.from("posts").select("user_id, author:profiles!user_id(id, full_name, avatar_url)");
  const { data: answers } = await supabase.from("answers").select("user_id, author:profiles!user_id(id, full_name, avatar_url)");

  const questionerCounts: Record<string, { profile: any; count: number }> = {};
  (posts || []).forEach((post) => {
    if (!post.author) return;
    if (!questionerCounts[post.user_id]) questionerCounts[post.user_id] = { profile: post.author, count: 0 };
    questionerCounts[post.user_id].count++;
  });
  const topQuestioner = Object.values(questionerCounts).sort((a, b) => b.count - a.count)[0];

  const answererCounts: Record<string, { profile: any; count: number }> = {};
  (answers || []).forEach((answer) => {
    if (!answer.author) return;
    if (!answererCounts[answer.user_id]) answererCounts[answer.user_id] = { profile: answer.author, count: 0 };
    answererCounts[answer.user_id].count++;
  });
  const topAnswerer = Object.values(answererCounts).sort((a, b) => b.count - a.count)[0];

  const filters: { key: Filter; label: string; icon: React.ReactNode }[] = [
    { key: "trending", label: "Popular", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "latest", label: "Newest", icon: <Clock className="w-4 h-4" /> },
    { key: "unanswered", label: "Unanswered", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col w-full gap-8 lg:gap-16 pb-20">
      {/* Hero Section */}
      <section className="hidden lg:flex relative w-full flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 pt-8 lg:pt-16 px-2 lg:px-4">
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start gap-8 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-slate-600 mb-2 stagger-item">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Real-time Knowledge Sharing
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] stagger-item"
            style={{ animationDelay: "100ms" }}
          >
            Where <br />
            <span className="text-blue-600">Thinkers</span> Solve <br />
            Problems Faster
          </h1>

          <p
            className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl stagger-item"
            style={{ animationDelay: "200ms" }}
          >
            ThinkHub is an interactive Q&A community. Ask questions, discover solutions,
            and collaborate with peers in real-time. Upvote the best answers and grow your
            reputation.
          </p>

          <div
            className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 stagger-item"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/questions/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(37,99,235,0.35)]"
            >
              Ask a Question <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-slate-700 bg-white border border-gray-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-0.5"
            >
              Browse Topics
            </Link>
          </div>

          <div
            className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 w-full stagger-item"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex -space-x-3">
              {["Alex", "Sarah", "John", "Emily"].map((name, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm"
                >
                  <img src={getAvatarUrl(name)} alt="User" />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Trusted by 10k+ learners
              </span>
            </div>
          </div>
        </div>

        {/* Right Decorative Widgets */}
        <div
          className="hidden lg:flex flex-1 w-full relative min-h-[400px] lg:min-h-[500px] items-center justify-center z-10 stagger-item"
          style={{ animationDelay: "300ms" }}
        >
          {topQuestioner && (
            <GlassCard className="absolute top-[15%] right-[5%] p-4 rounded-3xl w-64 shadow-xl border-white bg-white/90 backdrop-blur-md animate-float">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Top Questioner 🏆</h4>
              <Link href={`/profile/${topQuestioner.profile.id}`} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-[4px] opacity-60 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={topQuestioner.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${topQuestioner.profile.full_name || topQuestioner.profile.id}&backgroundColor=1e40af&textColor=ffffff`}
                      alt={topQuestioner.profile.full_name}
                      className="relative w-10 h-10 rounded-full border-2 border-blue-400 object-cover shadow-sm bg-white"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{topQuestioner.profile.full_name || "User"}</p>
                    <p className="text-xs text-slate-500">Asked {topQuestioner.count} questions</p>
                  </div>
                </div>
              </Link>
            </GlassCard>
          )}

          {topAnswerer && (
            <GlassCard className="absolute bottom-[20%] left-[5%] p-4 rounded-3xl w-64 shadow-2xl border-white bg-white/90 backdrop-blur-md animate-[float_8s_ease-in-out_infinite_reverse]">
              <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Top Answerer 🥇</h4>
              <Link href={`/profile/${topAnswerer.profile.id}`} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400 rounded-full blur-[4px] opacity-60 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={topAnswerer.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${topAnswerer.profile.full_name || topAnswerer.profile.id}&backgroundColor=1e40af&textColor=ffffff`}
                      alt={topAnswerer.profile.full_name}
                      className="relative w-10 h-10 rounded-full border-2 border-amber-400 object-cover shadow-sm bg-white"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{topAnswerer.profile.full_name || "User"}</p>
                    <p className="text-xs text-slate-500">Answered {topAnswerer.count} times</p>
                  </div>
                </div>
              </Link>
            </GlassCard>
          )}
        </div>
      </section>

      {/* Main Dashboard / Feed Section */}
      <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
        {/* Left Column: Feed */}
        <div className="flex-1 max-w-4xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b sm:border-b-0 border-slate-200">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Explore Topics
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Discover, learn, and grow together
              </p>
            </div>

            <div className="flex p-1.5 bg-white rounded-2xl w-fit shadow-sm border border-slate-200">
              {filters.map((f) => (
                <Link
                  key={f.key}
                  href={f.key === "trending" ? "/" : `/?filter=${f.key}`}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    filter === f.key
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Feed */}
          {questions.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:gap-6">
              {questions.map((q: Question) => (
                <div key={q.id} className="stagger-item h-full">
                  <QuestionCard
                    id={q.id}
                    title={q.title}
                    content={q.content}
                    tags={q.tags}
                    views={q.views}
                    isSolved={q.isSolved}
                    createdAt={q.createdAt}
                    author={q.author}
                    stats={q.stats}
                  />
                </div>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-20 px-6 rounded-[2rem] border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
              <div className="flex flex-col items-center gap-5">
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-base text-slate-500 max-w-md mx-auto">
                    {filter === "unanswered"
                      ? "Looks like our community has answered everything! 🎉"
                      : "Be the first to ask a question and start the conversation."}
                  </p>
                </div>
                <Link href="/questions/new">
                  <button className="mt-4 inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-slate-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Ask a Question
                  </button>
                </Link>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-[340px] flex-shrink-0 pt-4 lg:pt-[72px]">
          <Sidebar />
        </div>
      </section>
    </div>
  );
}
