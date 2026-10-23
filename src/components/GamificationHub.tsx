/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Award,
  Flame,
  Zap,
  Sparkles,
  Trophy,
  BookOpen,
  FileDown,
  Printer,
  CheckCircle2,
  Layers,
  Crown,
  Compass,
  Lock,
  Palette,
  Check,
} from 'lucide-react';
import { UserProgress, Badge } from '../types';
import { ALL_BADGES } from '../utils/gamification';

interface GamificationHubProps {
  progress: UserProgress;
  onThemeSelect: (theme: 'academic' | 'cyber' | 'notion' | 'parchment') => void;
}

const ICON_MAP: Record<string, any> = {
  Sparkles,
  BookOpen,
  FileDown,
  Printer,
  CheckCircle2,
  Award,
  Layers,
  Flame,
  Zap,
  Crown,
  Compass,
  Trophy,
};

const RARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Common: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
  Rare: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  Epic: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Legendary: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};

const THEMES = [
  {
    id: 'academic',
    name: 'Academic Slate',
    description: 'Clean slate and indigo accents for textbook and research paper feel.',
    color: '#4f46e5',
  },
  {
    id: 'cyber',
    name: 'Midnight Cyber',
    description: 'High-contrast sky-blue and obsidian palette for engineering sheets.',
    color: '#0ea5e9',
  },
  {
    id: 'notion',
    name: 'Emerald Notion',
    description: 'Minimalist monochrome with emerald callouts for structured notes.',
    color: '#10b981',
  },
  {
    id: 'parchment',
    name: 'Warm Parchment',
    description: 'Warm stone and amber tones for relaxed reading and humanities.',
    color: '#d97706',
  },
];

export const GamificationHub: React.FC<GamificationHubProps> = ({
  progress,
  onThemeSelect,
}) => {
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

  const hoursSaved = (progress.totalSynthesized * 0.85).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Scholar Progression & Level Rewards</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Knowledge Mastery Hub
          </h1>
          <p className="text-sm text-slate-400">
            Earn experience, maintain study streaks, and unlock publication badges as you synthesize videos.
          </p>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Level & XP Card */}
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Crown className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              Level {progress.level}
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{progress.levelTitle}</h2>
          <p className="text-xs text-slate-400 mb-4">
            {progress.nextLevelXp - progress.xp} XP needed for next rank
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>{progress.xp} XP Total</span>
              <span>{currentLevelProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak & Multiplier Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <Flame className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              +15% XP Boost
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">
            {progress.streakDays} Day Learning Streak
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Active streak multiplier boosts all quiz & synthesis XP by 15%.
          </p>

          <div className="grid grid-cols-7 gap-1 pt-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i < progress.streakDays
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                D{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Impact & Time Saved Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Zap className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              Efficiency
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">~{hoursSaved} Hours Saved</h2>
          <p className="text-xs text-slate-400 mb-4">
            Time compressed from raw video watching into instant structured insights.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Synthesized</span>
              <span className="text-white font-bold text-base">{progress.totalSynthesized}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">PDFs Exported</span>
              <span className="text-white font-bold text-base">{progress.totalPdfsExported}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Collectible Achievement Badges</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Unlocked {progress.unlockedBadges.length} of {ALL_BADGES.length} milestone badges.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);
            const Icon = ICON_MAP[badge.icon] || Award;
            const rarity = RARITY_COLORS[badge.rarity];

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-slate-950/70 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-950/30 border-slate-800/40 opacity-55'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {isUnlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{badge.name}</h4>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${rarity.bg} ${rarity.text} ${rarity.border}`}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDF Theme Customizer Vault */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <span>PDF Export Color Themes</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Choose the visual palette applied when compiling your downloadable PDFs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEMES.map((theme) => {
            const isSelected = progress.selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onThemeSelect(theme.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.color }}
                  />
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 font-bold" />}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{theme.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{theme.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
