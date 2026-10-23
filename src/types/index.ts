/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChapterNote {
  timestamp: string;
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
  context?: string;
}

export interface ActionStep {
  step: number;
  title: string;
  description: string;
  deliverable?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface SynthesizedDocument {
  id: string;
  videoId: string;
  videoUrl: string;
  title: string;
  author: string;
  thumbnail: string;
  duration?: string;
  tags: string[];
  style: 'comprehensive' | 'executive' | 'feynman' | 'technical_cheat_sheet';
  createdAt: string;
  
  // Knowledge synthesis payload
  oneSentenceTakeaway: string;
  executiveSummary: string;
  keyTakeaways: string[];
  chapters: ChapterNote[];
  glossary: GlossaryItem[];
  actionPlan: ActionStep[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  mindmapAscii: string;
  mermaidDiagram?: string;

  // Study metadata
  readTimeMinutes: number;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'synthesis' | 'quiz' | 'streak' | 'pdf' | 'mastery';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  currentLevelBaseXp: number;
  streakDays: number;
  lastActiveDate: string;
  totalSynthesized: number;
  totalQuizzesTaken: number;
  perfectQuizzes: number;
  totalPdfsExported: number;
  totalFlashcardsFlipped: number;
  unlockedBadges: string[]; // badge ids
  selectedTheme: 'academic' | 'cyber' | 'notion' | 'parchment';
  unlockedPerks: string[];
}

export interface PresetVideo {
  id: string;
  title: string;
  author: string;
  url: string;
  category: string;
  badgeText: string;
  description: string;
  thumbnail: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google';
  createdAt: string;
  lastReauthenticatedAt?: string;
  tokenExpiresAt?: string;
}

