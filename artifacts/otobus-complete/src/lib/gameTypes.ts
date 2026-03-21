export const CATEGORIES = [
  { id: 'name', label: 'اسم' },
  { id: 'country', label: 'بلد' },
  { id: 'animal', label: 'حيوان' },
  { id: 'plant', label: 'نبات' },
  { id: 'food', label: 'أكل' },
  { id: 'color', label: 'لون' },
  { id: 'sport', label: 'رياضة' },
  { id: 'car', label: 'عربية' },
  { id: 'movie', label: 'فيلم' },
  { id: 'city', label: 'مدينة' },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.label])
);

export type GamePhase = 'lobby' | 'playing' | 'locked' | 'scoring' | 'final';

export interface PlayerState {
  id: string;
  name: string;
  totalScore: number;
  roundScores: number[];
  isHost: boolean;
  answers: Record<string, string>;
}

export interface RoundResult {
  letter: string;
  roundNumber: number;
  scores: Record<string, number>;
  answers: Record<string, Record<string, string>>;
  validityMap?: Record<string, Record<string, boolean>>;
}

export interface RoomState {
  code: string;
  phase: GamePhase;
  players: PlayerState[];
  categories: string[];
  totalRounds: number;
  currentRound: number;
  currentLetter: string;
  lockedBy: string | null;
  roundResults: RoundResult[];
  timeLimit: number;
  roundScores?: Record<string, number>;
  answersSnapshot?: Record<string, Record<string, string>>;
  validityMap?: Record<string, Record<string, boolean>>;
}

export interface LocalState {
  myPlayerId: string | null;
  myRoomCode: string | null;
  room: RoomState | null;
  showScores: boolean;
  lastRoundScores: Record<string, number>;
  lastValidityMap: Record<string, Record<string, boolean>>;
  lastAnswersSnapshot: Record<string, Record<string, string>>;
  localAnswers: Record<string, string>;
}

// Player avatar colors (for consistent color per player)
export const PLAYER_COLORS = [
  '#f59e0b', // gold
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#ef4444', // red
  '#f97316', // orange
  '#ec4899', // pink
  '#3b82f6', // blue
  '#84cc16', // lime
  '#6366f1', // indigo
];
