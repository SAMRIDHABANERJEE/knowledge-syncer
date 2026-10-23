/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  Copy,
  Check,
  Download,
  FileText,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const ReadmeViewer: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/readme')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent(data.content);
        }
      })
      .catch((err) => console.error('Failed to load README.md:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                README.md • Open Source Engine Spec
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Apache-2.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Autonomous multi-stage YouTube-to-PDF model documentation and developer handbook.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Raw'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download README.md</span>
          </button>
        </div>
      </div>

      {/* Interactive Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-xs font-bold text-white">Active Core Model</div>
            <div className="text-[11px] text-slate-400 font-mono">gemini-3.8-flash (Server)</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <Layers className="w-5 h-5 text-sky-400" />
          <div>
            <div className="text-xs font-bold text-white">Pipeline Stages</div>
            <div className="text-[11px] text-slate-400 font-mono">5 Autonomous Synthesis Phases</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs font-bold text-white">Gamified Engine</div>
            <div className="text-[11px] text-slate-400 font-mono">XP Levels, Streaks & 12 Badges</div>
          </div>
        </div>
      </div>

      {/* Markdown Document Content Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading repository README.md...
          </div>
        ) : (
          <div className="font-mono text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap overflow-x-auto bg-slate-950 p-6 rounded-2xl border border-slate-800/80">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};
