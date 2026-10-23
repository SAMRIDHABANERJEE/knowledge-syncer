/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SynthesizerView } from './components/SynthesizerView';
import { DocumentViewer } from './components/DocumentViewer';
import { GamificationHub } from './components/GamificationHub';
import { LibraryView } from './components/LibraryView';
import { ReadmeViewer } from './components/ReadmeViewer';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SynthesizedDocument, UserProgress, Badge, UserProfile } from './types';
import {
  getInitialProgress,
  saveProgress,
  calculateLevel,
  evaluateBadges,
  fireCelebrationConfetti,
} from './utils/gamification';
import { getStoredUser, saveUserSession } from './utils/auth';
import { Award, Sparkles, X } from 'lucide-react';

const LIBRARY_STORAGE_KEY = 'autodoc_documents_library_v2';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'reauth'>('signin');

  const [progress, setProgress] = useState<UserProgress>(getInitialProgress);
  const [documents, setDocuments] = useState<SynthesizedDocument[]>(() => {
    try {
      const saved = localStorage.getItem(LIBRARY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeDocument, setActiveDocument] = useState<SynthesizedDocument | null>(() => {
    try {
      const saved = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (saved) {
        const list = JSON.parse(saved);
        return list.length > 0 ? list[0] : null;
      }
    } catch {}
    return null;
  });

  const [activeTab, setActiveTab] = useState<
    'synthesizer' | 'document' | 'gamification' | 'library' | 'readme'
  >('synthesizer');

  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Floating XP Toast
  const [xpToast, setXpToast] = useState<{ amount: number; reason: string } | null>(null);

  // Unlocked Badge Modal
  const [unlockedBadgeModal, setUnlockedBadgeModal] = useState<Badge | null>(null);

  // Save documents whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to save library:', e);
    }
  }, [documents]);

  // Save progress whenever updated
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Google Login Success
  const handleLoginSuccess = (user: UserProfile, isNewUser: boolean) => {
    setCurrentUser(user);
    saveUserSession(user);
    const xpBonus = isNewUser ? 50 : 25;
    awardXp(xpBonus, isNewUser ? 'Google Account Created' : 'Signed In with Google');
    fireCelebrationConfetti();
  };

  // Reauthenticate Credentials Success
  const handleReauthenticateSuccess = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    saveUserSession(updatedUser);
    awardXp(15, 'Reauthenticated Login Credentials');
    fireCelebrationConfetti();
  };

  const handleOpenAuthModal = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenReauthModal = () => {
    setAuthModalMode('reauth');
    setIsAuthModalOpen(true);
  };

  // Google Sign Out
  const handleSignOut = () => {
    setCurrentUser(null);
    saveUserSession(null);
    setXpToast({ amount: 0, reason: 'Signed Out from Google' });
    setTimeout(() => {
      setXpToast(null);
    }, 2500);
  };

  // Central XP & Badge Award Engine
  const awardXp = (amount: number, reason: string) => {
    setProgress((prev) => {
      // Daily streak check
      const today = new Date().toISOString().split('T')[0];
      let newStreak = prev.streakDays;
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastActiveDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      // 15% streak multiplier bonus
      const multiplier = newStreak >= 3 ? 1.15 : 1.0;
      const finalAmount = Math.round(amount * multiplier);

      const newTotalXp = prev.xp + finalAmount;
      const { level, title, currentLevelBaseXp, nextLevelXp } = calculateLevel(newTotalXp);

      const leveledUp = level > prev.level;
      if (leveledUp) {
        fireCelebrationConfetti();
      }

      const updated: UserProgress = {
        ...prev,
        xp: newTotalXp,
        level,
        levelTitle: title,
        currentLevelBaseXp,
        nextLevelXp,
        streakDays: newStreak,
        lastActiveDate: today,
      };

      const { newBadges, updatedProgress } = evaluateBadges(updated);
      if (newBadges.length > 0) {
        setUnlockedBadgeModal(newBadges[0]);
        fireCelebrationConfetti();
      }

      return updatedProgress;
    });

    // Show toast
    setXpToast({ amount, reason });
    setTimeout(() => {
      setXpToast(null);
    }, 3000);
  };

  // Autonomous Synthesis Handler
  const handleSynthesize = async (params: {
    url: string;
    style: 'comprehensive' | 'executive' | 'feynman' | 'technical_cheat_sheet';
    customFocus: string;
    targetAudience: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setPipelineStep(0);

    // Realistic pipeline step interval
    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 1200);

    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize video.');
      }

      const newDoc: SynthesizedDocument = await res.json();
      setPipelineStep(4);

      // Add to documents library (prepend)
      setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
      setActiveDocument(newDoc);

      // Award synthesis XP & update counts
      setProgress((prev) => {
        const updated = {
          ...prev,
          totalSynthesized: prev.totalSynthesized + 1,
        };
        return updated;
      });

      awardXp(50, 'Synthesized YouTube Video');
      setActiveTab('document');
      fireCelebrationConfetti();
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || 'An error occurred during synthesis.');
    } finally {
      setIsLoading(false);
    }
  };

  // PDF Export callback
  const handlePdfExported = () => {
    setProgress((prev) => ({
      ...prev,
      totalPdfsExported: prev.totalPdfsExported + 1,
    }));
    awardXp(20, 'Exported Formatted PDF');
  };

  // Quiz Completed callback
  const handleQuizCompleted = (score: number, total: number) => {
    const isPerfect = score === total;
    setProgress((prev) => ({
      ...prev,
      totalQuizzesTaken: prev.totalQuizzesTaken + 1,
      perfectQuizzes: isPerfect ? prev.perfectQuizzes + 1 : prev.perfectQuizzes,
    }));

    const xpEarned = score * 10 + (isPerfect ? 50 : 0);
    awardXp(xpEarned, isPerfect ? 'Perfect Quiz Score (100%)' : `Quiz Passed (${score}/${total})`);
  };

  // Flashcard Flipped callback
  const handleFlashcardFlipped = () => {
    setProgress((prev) => ({
      ...prev,
      totalFlashcardsFlipped: prev.totalFlashcardsFlipped + 1,
    }));
    awardXp(5, 'Reviewed Flashcard Concept');
  };

  // Delete Document
  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocument?.id === id) {
      setActiveDocument(documents.find((d) => d.id !== id) || null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header with Google Auth */}
      <Header
        progress={progress}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveDocument={Boolean(activeDocument)}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenReauthModal={handleOpenReauthModal}
        onSignOut={handleSignOut}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {errorMessage && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'synthesizer' && (
          <SynthesizerView
            onSynthesize={handleSynthesize}
            isLoading={isLoading}
            pipelineStep={pipelineStep}
          />
        )}

        {activeTab === 'document' && activeDocument && (
          <DocumentViewer
            document={activeDocument}
            onAwardXp={awardXp}
            onPdfExported={handlePdfExported}
            onQuizCompleted={handleQuizCompleted}
            onFlashcardFlipped={handleFlashcardFlipped}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationHub
            progress={progress}
            onThemeSelect={(theme) => {
              setProgress((prev) => ({ ...prev, selectedTheme: theme }));
              awardXp(10, 'Switched PDF Theme');
            }}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            documents={documents}
            onSelectDocument={(doc) => {
              setActiveDocument(doc);
              setActiveTab('document');
            }}
            onDeleteDocument={handleDeleteDocument}
            onStartNewSynthesis={() => setActiveTab('synthesizer')}
            onPdfExported={handlePdfExported}
          />
        )}

        {activeTab === 'readme' && <ReadmeViewer />}
      </main>

      {/* Floating XP Toast */}
      {xpToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-4 py-2.5 rounded-2xl shadow-2xl shadow-indigo-500/40 border border-indigo-400/30 flex items-center gap-2.5 animate-bounce text-xs sm:text-sm font-bold">
          <Sparkles className="w-4 h-4 text-amber-300" />
          {xpToast.amount > 0 && <span>+{xpToast.amount} XP</span>}
          <span className="text-indigo-100 font-normal">({xpToast.reason})</span>
        </div>
      )}

      {/* Unlocked Badge Alert Modal */}
      {unlockedBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setUnlockedBadgeModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              New Badge Unlocked!
            </span>

            <h3 className="text-xl font-extrabold text-white mt-2 mb-1">
              {unlockedBadgeModal.name}
            </h3>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {unlockedBadgeModal.description}
            </p>

            <button
              onClick={() => {
                setUnlockedBadgeModal(null);
                setActiveTab('gamification');
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              View in Mastery Hub
            </button>
          </div>
        </div>
      )}

      {/* Google Sign In / Sign Up / Reauthenticate Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onReauthenticateSuccess={handleReauthenticateSuccess}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AutoDoc AI</span>
            <span>•</span>
            <span>Autonomous YouTube to PDF Knowledge Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('readme')}
              className="hover:text-slate-300 transition-colors"
            >
              README.md Spec
            </button>
            <button
              onClick={() => setActiveTab('gamification')}
              className="hover:text-slate-300 transition-colors"
            >
              Mastery & Badges
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
