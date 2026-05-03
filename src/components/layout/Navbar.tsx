"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Plus, LogIn, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getAvatarUrl } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
            Think<span className="text-blue-600">Hub</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <Link
            href="/search"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            Search questions, tags, users...
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/questions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Ask Question
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 ml-1">
              <Link 
                href={`/profile/${user.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium text-sm border border-slate-200 hover:border-blue-200 transition-colors group"
                title="View Profile"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-[4px] opacity-0 group-hover:opacity-60 transition-opacity"></div>
                  <img 
                    src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.user_metadata?.full_name || user.email || user.id}&backgroundColor=1e40af&textColor=ffffff`}
                    alt="Profile"
                    className="relative w-5 h-5 rounded-full object-cover shadow-sm border border-slate-200 group-hover:border-blue-400 transition-colors"
                  />
                </div>
                <span className="max-w-[100px] truncate">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 py-4 flex flex-col gap-2 animate-in">
          <Link
            href="/search"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
          >
            <Search className="w-4 h-4" /> Search
          </Link>
          <Link
            href="/questions/new"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-blue-600 hover:bg-blue-50 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Ask Question
          </Link>
          
          <div className="border-t border-slate-100 my-2" />

          {user ? (
            <div className="px-4 flex flex-col gap-2">
              <Link 
                href={`/profile/${user.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-[4px] opacity-0 group-hover:opacity-60 transition-opacity"></div>
                  <img 
                    src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.user_metadata?.full_name || user.email || user.id}&backgroundColor=1e40af&textColor=ffffff`}
                    alt="Profile"
                    className="relative w-5 h-5 rounded-full object-cover shadow-sm border border-slate-200 group-hover:border-blue-400 transition-colors"
                  />
                </div>
                {user.user_metadata?.full_name || user.email}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 mt-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 px-4">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
