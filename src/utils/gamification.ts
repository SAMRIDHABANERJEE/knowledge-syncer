/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import confetti from 'canvas-confetti';
import { Badge, UserProgress } from '../types';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_synthesis',
    name: 'Genesis Scribe',
    description: 'Synthesized your first YouTube video into a structured document.',
    icon: 'Sparkles',
    category: 'synthesis',
    rarity: 'Common',
  },
  {
    id: 'five_syntheses',
    name: 'Knowledge Harvester',
    description: 'Synthesized 5 different educational videos.',
    icon: 'BookOpen',
    category: 'synthesis',
    rarity: 'Rare',
  },
  {
    id: 'first_pdf',
    name: 'PDF Artisan',
    description: 'Exported your first publication-grade PDF documentation.',
    icon: 'FileDown',
    category: 'pdf',
    rarity: 'Common',
  },
  {
    id: 'five_pdfs',
    name: 'Master Publisher',
    description: 'Compiled and exported 5 professional PDF documents.',
    icon: 'Printer',
    category: 'pdf',
    rarity: 'Rare',
  },
  {
    id: 'first_quiz',
    name: 'Scholar in Training',
    description: 'Completed your first self-assessment knowledge quiz.',
    icon: 'CheckCircle2',
    category: 'quiz',
    rarity: 'Common',
  },
  {
    id: 'perfect_quiz',
    name: 'Flawless Mind',
    description: 'Scored 100% on a video knowledge quiz.',
    icon: 'Award',
    category: 'quiz',
    rarity: 'Epic',
  },
  {
    id: 'flashcard_explorer',
    name: 'Spaced Memory Initiate',
    description: 'Flipped and studied 10 conceptual flashcards.',
    icon: 'Layers',
    category: 'mastery',
    rarity: 'Common',
  },
  {
    id: 'streak_3',
    name: 'Consistent Scholar',
    description: 'Maintained a 3-day active learning streak.',
    icon: 'Flame',
    category: 'streak',
    rarity: 'Rare',
  },
  {
    id: 'streak_7',
    name: 'Unstoppable Momentum',
    description: 'Achieved a 7-day learning streak.',
    icon: 'Zap',
    category: 'streak',
    rarity: 'Epic',
  },
  {
    id: 'level_5',
    name: 'Knowledge Architect',
    description: 'Attained Level 5 Documentarian status.',
    icon: 'Crown',
    category: 'mastery',
    rarity: 'Epic',
  },
  {
    id: 'polymath',
    name: 'Modern Polymath',
    description: 'Synthesized videos across 3 different knowledge categories.',
    icon: 'Compass',
    category: 'mastery',
    rarity: 'Legendary',
  },
  {
    id: 'grand_master',
    name: 'Grand Knowledge Master',
    description: 'Accumulated over 2,500 total XP in the learning engine.',
    icon: 'Trophy',
    category: 'mastery',
    rarity: 'Legendary',
  },
];

const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Novice Scribe', xp: 0 },
  { level: 2, title: 'Curious Apprentice', xp: 120 },
  { level: 3, title: 'Knowledge Synthesizer', xp: 280 },
  { level: 4, title: 'Insight Architect', xp: 520 },
  { level: 5, title: 'Master Documentarian', xp: 850 },
  { level: 6, title: 'Cognitive Cartographer', xp: 1250 },
  { level: 7, title: 'Chief Scholar', xp: 1750 },
  { level: 8, title: 'Domain Polymath', xp: 2400 },
  { level: 9, title: 'Grand Archivist', xp: 3200 },
  { level: 10, title: 'Grand Knowledge Master', xp: 4200 },
];

export function calculateLevel(xp: number) {
  let currentTier = LEVEL_THRESHOLDS[0];
  let nextTier = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentTier = LEVEL_THRESHOLDS[i];
      nextTier = LEVEL_THRESHOLDS[i + 1] || {
        level: currentTier.level + 1,
        title: 'Mythic Sage',
        xp: currentTier.xp + 1500,
      };
      break;
    }
  }

  return {
    level: currentTier.level,
    title: currentTier.title,
    currentLevelBaseXp: currentTier.xp,
    nextLevelXp: nextTier.xp,
  };
}

const STORAGE_KEY = 'autodoc_user_progress_v2';

export function getInitialProgress(): UserProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure fields exist
      const { level, title, currentLevelBaseXp, nextLevelXp } = calculateLevel(parsed.xp || 0);
      return {
        xp: parsed.xp || 0,
        level,
        levelTitle: title,
        currentLevelBaseXp,
        nextLevelXp,
        streakDays: parsed.streakDays || 1,
        lastActiveDate: parsed.lastActiveDate || new Date().toISOString().split('T')[0],
        totalSynthesized: parsed.totalSynthesized || 0,
        totalQuizzesTaken: parsed.totalQuizzesTaken || 0,
        perfectQuizzes: parsed.perfectQuizzes || 0,
        totalPdfsExported: parsed.totalPdfsExported || 0,
        totalFlashcardsFlipped: parsed.totalFlashcardsFlipped || 0,
        unlockedBadges: parsed.unlockedBadges || [],
        selectedTheme: parsed.selectedTheme || 'academic',
        unlockedPerks: parsed.unlockedPerks || ['theme_academic'],
      };
    }
  } catch (err) {
    console.warn('Could not read user progress:', err);
  }

  const { level, title, currentLevelBaseXp, nextLevelXp } = calculateLevel(0);
  return {
    xp: 0,
    level,
    levelTitle: title,
    currentLevelBaseXp,
    nextLevelXp,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalSynthesized: 0,
    totalQuizzesTaken: 0,
    perfectQuizzes: 0,
    totalPdfsExported: 0,
    totalFlashcardsFlipped: 0,
    unlockedBadges: [],
    selectedTheme: 'academic',
    unlockedPerks: ['theme_academic'],
  };
}

export function saveProgress(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save progress:', err);
  }
}

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
    });
  } catch {
    // Canvas confetti graceful fallback
  }
}

export function evaluateBadges(progress: UserProgress): { newBadges: Badge[]; updatedProgress: UserProgress } {
  const currentUnlocked = new Set(progress.unlockedBadges);
  const newlyUnlocked: Badge[] = [];

  const checks: [string, boolean][] = [
    ['first_synthesis', progress.totalSynthesized >= 1],
    ['five_syntheses', progress.totalSynthesized >= 5],
    ['first_pdf', progress.totalPdfsExported >= 1],
    ['five_pdfs', progress.totalPdfsExported >= 5],
    ['first_quiz', progress.totalQuizzesTaken >= 1],
    ['perfect_quiz', progress.perfectQuizzes >= 1],
    ['flashcard_explorer', progress.totalFlashcardsFlipped >= 10],
    ['streak_3', progress.streakDays >= 3],
    ['streak_7', progress.streakDays >= 7],
    ['level_5', progress.level >= 5],
    ['polymath', progress.totalSynthesized >= 3],
    ['grand_master', progress.xp >= 2500],
  ];

  for (const [badgeId, isEligible] of checks) {
    if (isEligible && !currentUnlocked.has(badgeId)) {
      currentUnlocked.add(badgeId);
      const b = ALL_BADGES.find((item) => item.id === badgeId);
      if (b) newlyUnlocked.push(b);
    }
  }

  const updatedProgress: UserProgress = {
    ...progress,
    unlockedBadges: Array.from(currentUnlocked),
  };

  return { newBadges: newlyUnlocked, updatedProgress };
}
