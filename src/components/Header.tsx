/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Flame,
  Award,
  BookOpen,
  Sparkles,
  GitBranch,
  LogOut,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserProgress, UserProfile } from '../types';
import { GoogleIcon } from './GoogleAuthModal';
import { formatLastAuthTime } from '../utils/auth';

interface HeaderProps {
  progress: UserProgress;
  currentUser: UserProfile | null;
  activeTab: 'synthesizer' | 'document' | 'gamification' | 'library' | 'readme';
  setActiveTab: (tab: 'synthesizer' | 'document' | 'gamification' | 'library' | 'readme') => void;
  hasActiveDocument: boolean;
  onOpenAuthModal: () => void;
  onOpenReauthModal: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  currentUser,
  activeTab,
  setActiveTab,
  hasActiveDocument,
  onOpenAuthModal,
  onOpenReauthModal,
  onSignOut,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLevelProgress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((progress.xp - progress.currentLevelBaseXp) /
          Math.max(1, progress.nextLevelXp - progress.currentLevelBaseXp)) *
          100
      )
    )
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('synthesizer')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  AutoDoc AI
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Open Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                YouTube → Publication PDFs & Mastery
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('synthesizer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'synthesizer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">Synthesizer</span>
            </button>

            {hasActiveDocument && (
              <button
                onClick={() => setActiveTab('document')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'document'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden md:inline">Active Document</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('gamification')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'gamification'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Mastery & Rewards</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Library</span>
            </button>

            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'readme'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Open-Source Autonomous Model README.md"
            >
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">README.md</span>
            </button>
          </nav>

          {/* Right Action Widgets: Gamification & Google Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gamified Stats Widget */}
            <div
              onClick={() => setActiveTab('gamification')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-slate-800/60"
            >
              {/* Streak */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{progress.streakDays}d</span>
              </div>

              {/* Level & XP Mini-Bar */}
              <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Lvl {progress.level}</span>
                  <span className="text-[11px] text-slate-400">({progress.xp} XP)</span>
                </div>
                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${currentLevelProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Google Authentication Control */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-white/20"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-800 mb-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-400">
                            Google Verified
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-400 truncate font-mono">
                        {currentUser.email}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Last authenticated: {formatLastAuthTime(currentUser.lastReauthenticatedAt)}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl mb-2 text-xs space-y-1.5 border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Progress Rank</span>
                        <span className="font-bold text-indigo-400">
                          Level {progress.level} ({progress.xp} XP)
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                        <span className="text-slate-500">Account Sync</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Restored & Protected
                        </span>
                      </div>
                    </div>

                    {/* Reauthenticate Button */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenReauthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 mb-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Reauthenticate Credentials</span>
                    </button>

                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out from Google</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-900 bg-white hover:bg-slate-100 shadow-md shadow-white/10 active:scale-95 transition-all cursor-pointer border border-slate-300"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
