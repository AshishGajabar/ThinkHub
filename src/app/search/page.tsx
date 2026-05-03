"use client";

import React, { useState } from "react";
import { Search as SearchIcon, Hash, TrendingUp } from "lucide-react";
import Link from "next/link";

const ALL_TAGS = [
  { name: "javascript", count: 1243, description: "For questions about JavaScript programming" },
  { name: "typescript", count: 856, description: "TypeScript language and type system" },
  { name: "react", count: 1102, description: "React.js library and ecosystem" },
  { name: "nextjs", count: 734, description: "Next.js framework for React" },
  { name: "css", count: 623, description: "Cascading Style Sheets and styling" },
  { name: "html", count: 512, description: "HTML markup and semantics" },
  { name: "node", count: 489, description: "Node.js runtime and server-side JS" },
  { name: "python", count: 921, description: "Python programming language" },
  { name: "database", count: 345, description: "SQL, NoSQL, and database design" },
  { name: "api", count: 410, description: "REST, GraphQL, and API design" },
  { name: "tailwind", count: 541, description: "Tailwind CSS utility framework" },
  { name: "supabase", count: 287, description: "Supabase backend-as-a-service" },
  { name: "git", count: 312, description: "Git version control" },
  { name: "docker", count: 198, description: "Docker containers and deployment" },
  { name: "aws", count: 256, description: "Amazon Web Services cloud platform" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered = ALL_TAGS.filter(
    (t) =>
      t.name.includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Topics</h1>
        <p className="text-slate-500">
          Find questions by topic or search for specific content
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-10">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, tags, or keywords..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base shadow-sm"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tag) => (
          <Link
            key={tag.name}
            href={`/tags/${tag.name}`}
            className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Hash className="w-4 h-4" />
                <span className="font-bold text-base">{tag.name}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                {tag.count}
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {tag.description}
            </p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">
            No topics found for &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
