/**
 * Shared activity entity interfaces — the contract between front-end and back-end.
 *
 * These types define _what_ is stored in the activity DynamoDB table.
 * Domain entity classes, ports, and adapters are added by individual feature tickets.
 */

// ─── Shared ──────────────────────────────────────────────────────────────────

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// ─── Word Bank ───────────────────────────────────────────────────────────────

export interface StoredWord {
  readonly greek: string;
  readonly english: string;
  readonly lessonId: string;
  readonly addedAt: string; // ISO 8601
}

// ─── Story Progress ──────────────────────────────────────────────────────────

export interface CheckpointCompletion {
  readonly checkpointId: string;
  readonly completedAt: string; // ISO 8601
}

export interface UserStoryProgress {
  readonly userId: string;
  readonly storyId: string;
  readonly currentCheckpointId: string;
  readonly checkpointsCompleted: readonly CheckpointCompletion[];
  readonly startedAt: string;
  readonly completedAt: string | null;
}

// ─── User-Created Lessons ────────────────────────────────────────────────────

export interface UserLesson {
  readonly userId: string;
  readonly lessonId: string; // UUID v4
  readonly title: string;
  readonly topic: string;
  readonly greekText: string;
  readonly englishTranslation: string;
  readonly level: DifficultyLevel;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string; // ISO 8601
}

// ─── Lesson Page State ───────────────────────────────────────────────────────

export interface SentenceNote {
  readonly sentenceIndex: number;
  readonly note: string;
  readonly updatedAt: string;
}

export interface WordNote {
  readonly word: string;
  readonly note: string;
  readonly updatedAt: string;
}

export interface ComprehensionQuizResult {
  readonly questionIndex: number;
  readonly selectedAnswer: number;
  readonly correct: boolean;
}

export interface UserLessonState {
  readonly userId: string;
  readonly lessonId: string;
  readonly revealedWords: readonly string[];
  readonly sentenceNotes: readonly SentenceNote[];
  readonly wordNotes: readonly WordNote[];
  readonly comprehensionQuizResults: readonly ComprehensionQuizResult[];
  readonly englishVisible: boolean;
  readonly sentencesBrokenUp: boolean;
  readonly followAlongEnabled: boolean;
  readonly lastAccessedAt: string;
}

// ─── Lesson Completion ───────────────────────────────────────────────────────

export interface LessonCompletion {
  readonly lessonId: string;
  readonly completedAt: string; // ISO 8601
  readonly title: string;
}

// ─── Gamification ────────────────────────────────────────────────────────────

export type BadgeCategory =
  | 'milestone'
  | 'streak'
  | 'quiz'
  | 'vocab'
  | 'reading'
  | 'audio'
  | 'translation'
  | 'story'
  | 'secret';

export type XpAction =
  | 'lesson_complete'
  | 'quiz_correct'
  | 'vocab_challenge'
  | 'word_reviewed'
  | 'story_checkpoint'
  | 'story_complete'
  | 'daily_goal'
  | 'weekly_goal';

export type LevelTier =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'upper_intermediate'
  | 'advanced'
  | 'fluent';

export interface GamificationProfile {
  readonly userId: string;
  readonly totalXp: number;
  readonly level: number;
  readonly levelName: LevelTier;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly lastActiveDate: string; // YYYY-MM-DD
  readonly weeklyXpGoal: number;
  readonly weeklyXpEarned: number;
  readonly weeklyGoalResetAt: string; // ISO 8601
}

export interface Badge {
  readonly badgeId: string;
  readonly category: BadgeCategory;
  readonly name: string;
  readonly description: string;
  readonly earnedAt: string;
  readonly iconKey: string;
}

export interface XpEvent {
  readonly eventId: string;
  readonly action: XpAction;
  readonly category: string;
  readonly xpAwarded: number;
  readonly lessonId?: string;
  readonly storyId?: string;
  readonly checkpointId?: string;
  readonly timestamp: string;
}

export interface LeaderboardEntry {
  readonly userId: string;
  readonly displayName: string;
  readonly weeklyXp: number;
  readonly weekId: string; // e.g. "2026-W10"
}
