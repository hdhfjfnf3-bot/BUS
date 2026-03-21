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
}

export interface LocalState {
  myPlayerId: string | null;
  myRoomCode: string | null;
  room: RoomState | null;
  showScores: boolean;
  lastRoundScores: Record<string, number>;
  localAnswers: Record<string, string>;
}
