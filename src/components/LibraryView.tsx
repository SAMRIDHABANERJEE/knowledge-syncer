/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SynthesizedDocument } from '../types';
import { generatePdfDocument } from '../utils/pdfGenerator';

interface LibraryViewProps {
  documents: SynthesizedDocument[];
  onSelectDocument: (doc: SynthesizedDocument) => void;
  onDeleteDocument: (id: string) => void;
  onStartNewSynthesis: () => void;
  onPdfExported: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onStartNewSynthesis,
  onPdfExported,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(documents.map((d) => d.category)))];

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.author.toLowerCase().includes(search.toLowerCase()) ||
      doc.oneSentenceTakeaway.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Knowledge Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access, study, or re-export all your synthesized YouTube documentation.
          </p>
        </div>

        <button
          onClick={onStartNewSynthesis}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Synthesize New Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved documents by title, author, or keyword..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group shadow-lg"
            >
              {/* Thumbnail with overlay */}
              <div
                className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => onSelectDocument(doc)}
              >
                <img
                  src={doc.thumbnail}
                  alt={doc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-white/10">
                  {doc.category}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{doc.readTimeMinutes} min</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>{doc.author}</span>
                    <span className="font-mono text-[10px]">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectDocument(doc)}
                    className="text-base font-bold text-white line-clamp-2 hover:text-indigo-400 transition-colors cursor-pointer mb-2"
                  >
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    "{doc.oneSentenceTakeaway}"
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Read & Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const pdf = generatePdfDocument(doc);
                        pdf.save(`${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
                        onPdfExported();
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete from Library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {search ? 'No Matching Documents' : 'Your Library is Empty'}
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {search
              ? 'Try modifying your search query or clear the filter.'
              : 'Synthesize your first YouTube video link into a structured documentation report to begin building your knowledge vault.'}
          </p>
          <button
            onClick={onStartNewSynthesis}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Synthesize a Video Now (+50 XP)
          </button>
        </div>
      )}
    </div>
  );
};
