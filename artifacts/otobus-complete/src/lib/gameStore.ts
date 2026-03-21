export type GamePhase = 'setup' | 'playing' | 'stopped' | 'scoring' | 'results' | 'final';

export interface Player {
  id: string;
  name: string;
  totalScore: number;
  roundScores: number[];
}

export interface RoundResult {
  letter: string;
  roundNumber: number;
  answers: Record<string, Record<string, string>>;
  scores: Record<string, number>;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  categories: string[];
  totalRounds: number;
  currentRound: number;
  currentLetter: string;
  isLocked: boolean;
  lockedBy: string | null;
  currentAnswers: Record<string, Record<string, string>>;
  roundResults: RoundResult[];
  roundScores: Record<string, number>;
  timeLimit: number;
  timeLeft: number;
}

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    players: [],
    categories: ['name', 'country', 'animal', 'plant', 'food'],
    totalRounds: 5,
    currentRound: 0,
    currentLetter: '',
    isLocked: false,
    lockedBy: null,
    currentAnswers: {},
    roundResults: [],
    roundScores: {},
    timeLimit: 120,
    timeLeft: 120,
  };
}
