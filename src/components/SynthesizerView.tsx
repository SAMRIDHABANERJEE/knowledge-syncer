/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Youtube,
  ArrowRight,
  BookOpen,
  Briefcase,
  Smile,
  Terminal,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Play,
  Zap,
} from 'lucide-react';
import { PRESET_VIDEOS } from '../data/presets';
import { PresetVideo } from '../types';

interface SynthesizerViewProps {
  onSynthesize: (params: {
    url: string;
    style: 'comprehensive' | 'executive' | 'feynman' | 'technical_cheat_sheet';
    customFocus: string;
    targetAudience: string;
  }) => Promise<void>;
  isLoading: boolean;
  pipelineStep: number;
}

const STYLES = [
  {
    id: 'comprehensive',
    name: 'Comprehensive Masterclass',
    description: 'In-depth breakdown of every chapter, nuance, and core takeaway.',
    icon: BookOpen,
    badge: 'Popular',
  },
  {
    id: 'executive',
    name: 'Executive 3-Min Briefing',
    description: 'High-signal C-suite summary, strategic impact, and ROI.',
    icon: Briefcase,
    badge: 'Fast',
  },
  {
    id: 'feynman',
    name: 'Feynman Technique',
    description: 'Zero jargon, first-principles metaphors, and intuitive mental models.',
    icon: Smile,
    badge: 'Intuitive',
  },
  {
    id: 'technical_cheat_sheet',
    name: 'Developer Cheat Sheet',
    description: 'Architecture patterns, commands, diagrams, and implementation steps.',
    icon: Terminal,
    badge: 'Technical',
  },
];

const PIPELINE_STEPS = [
  { label: 'Resolving YouTube Video ID & Metadata via oEmbed' },
  { label: 'Grounding Video Knowledge with Gemini 3.8 Flash' },
  { label: 'Synthesizing Detailed Chapters & Executive Summary' },
  { label: 'Compiling Gamified Quiz & Flashcard Study Decks' },
  { label: 'Structuring PDF Document Layout & Minting XP' },
];

export const SynthesizerView: React.FC<SynthesizerViewProps> = ({
  onSynthesize,
  isLoading,
  pipelineStep,
}) => {
  const [url, setUrl] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<
    'comprehensive' | 'executive' | 'feynman' | 'technical_cheat_sheet'
  >('comprehensive');
  const [customFocus, setCustomFocus] = useState('');
  const [targetAudience, setTargetAudience] = useState('all-levels');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setInputError('Please enter a YouTube link or Video ID.');
      return;
    }
    setInputError(null);
    onSynthesize({
      url: url.trim(),
      style: selectedStyle,
      customFocus,
      targetAudience,
    });
  };

  const handleSelectPreset = (preset: PresetVideo) => {
    setUrl(preset.url);
    setInputError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Hero Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>Autonomous Gemini 3.8 Flash Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Turn Any YouTube Video into <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            Publication-Grade PDFs & Mastery Decks
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
          Paste any YouTube tutorial, lecture, or podcast. Our autonomous AI engine synthesizes
          structured chapters, executive takeaways, flashcards, and downloadable PDFs with gamified rewards.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main URL Bar */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              YouTube Video URL or Video ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Youtube className="h-5 w-5 text-red-500" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (inputError) setInputError(null);
                }}
                disabled={isLoading}
                placeholder="https://www.youtube.com/watch?v=kCc8FmEb1nY (or youtu.be/...) "
                className="w-full pl-12 pr-28 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setUrl(text);
                  } catch {
                    // clipboard read fallback
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
              >
                Paste
              </button>
            </div>
            {inputError && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span>{inputError}</span>
              </div>
            )}
          </div>

          {/* Quick Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Or Test Drive with Curated Masterclasses:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESET_VIDEOS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    url.includes(preset.id)
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {preset.badgeText}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{preset.author}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 mb-1">
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{preset.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Synthesis Output Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {style.badge}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-100 mb-1">{style.name}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{style.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings (Focus & Audience)</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Focus or Key Questions
                  </label>
                  <input
                    type="text"
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                    placeholder="e.g. Focus on math derivations and practical code examples"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Complexity Level
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="all-levels">All Levels (Balanced)</option>
                    <option value="beginner">Beginner Friendly (Zero Prerequisites)</option>
                    <option value="intermediate">Intermediate Practitioner</option>
                    <option value="advanced">Advanced Researcher / Staff Engineer</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 shadow-xl shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Autonomous Pipeline Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Synthesize Video & Generate Documentation (+50 XP)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Autonomous Pipeline Progress Indicator */}
        {isLoading && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                Autonomous Model Pipeline Active
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Stage {Math.min(pipelineStep + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {PIPELINE_STEPS.map((step, idx) => {
                const isComplete = idx < pipelineStep;
                const isCurrent = idx === pipelineStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-200'
                        : isComplete
                        ? 'bg-slate-950/40 text-emerald-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span className="font-medium">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Feature Value Props Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-slate-300">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">Publication-Grade PDF</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-page, print-ready document with formatted headers, chapter notes, callout takeaways, and custom themes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">Gamified Mastery System</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Earn XP, maintain daily study streaks, test retention with auto-generated quizzes, and unlock 12 collectible badges.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">Open Source & Extensible</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fully documented Apache-2.0 autonomous agent architecture with complete README.md, schema contracts, and CLI support.
          </p>
        </div>
      </div>
    </div>
  );
};
