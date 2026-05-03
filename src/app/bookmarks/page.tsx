import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bookmark, ArrowLeft } from "lucide-react";
import { BookmarksFeed } from "./BookmarksFeed";
import Link from "next/link";

export default function BookmarksPage() {
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
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Bookmarks</h1>
          </div>
          <p className="text-slate-500 text-lg ml-1">
            Questions you have saved for later.
          </p>
        </div>

        <BookmarksFeed />
      </div>
      <div className="hidden lg:block w-80 shrink-0">
        <Sidebar />
      </div>
    </div>
  );
}
