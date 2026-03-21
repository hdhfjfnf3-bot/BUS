export const ARABIC_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
  'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

export function getRandomLetter(): string {
  return ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export type GamePhase = 'lobby' | 'playing' | 'locked' | 'scoring' | 'final';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  totalScore: number;
  roundScores: number[];
  isHost: boolean;
  answers: Record<string, string>;
  isReady: boolean;
}

export interface RoundResult {
  letter: string;
  roundNumber: number;
  scores: Record<string, number>;
  answers: Record<string, Record<string, string>>;
}

export interface Room {
  code: string;
  phase: GamePhase;
  players: Player[];
  categories: string[];
  totalRounds: number;
  currentRound: number;
  currentLetter: string;
  lockedBy: string | null;
  roundResults: RoundResult[];
  timeLimit: number;
}

export const CATEGORIES_MAP: Record<string, string> = {
  name: 'اسم',
  country: 'بلد',
  animal: 'حيوان',
  plant: 'نبات',
  food: 'أكل',
  color: 'لون',
  sport: 'رياضة',
  car: 'عربية',
  movie: 'فيلم',
  city: 'مدينة',
};

export function startsWithLetter(word: string, letter: string): boolean {
  if (!word || word.trim() === '') return false;
  const trimmed = word.trim();
  const firstChar = trimmed[0];
  const alefVariants = ['أ', 'إ', 'ا', 'آ', 'ٱ'];
  if (alefVariants.includes(letter)) {
    return alefVariants.includes(firstChar);
  }
  return firstChar === letter;
}

export function isValidArabicWord(word: string, letter: string): boolean {
  if (!word || word.trim() === '') return false;
  const trimmed = word.trim();
  
  if (!startsWithLetter(trimmed, letter)) return false;
  if (trimmed.length < 2) return false;
  
  const arabicCharsOnly = /^[\u0600-\u06FF\s]+$/.test(trimmed);
  if (!arabicCharsOnly) return false;
  
  const letters = trimmed.replace(/\s/g, '');
  if (letters.length < 2) return false;
  
  const uniqueChars = new Set(letters).size;
  if (letters.length >= 3 && uniqueChars < 2) return false;
  
  const allSameChar = /^(.)\1+$/.test(letters);
  if (allSameChar) return false;
  
  const twoCharRepeat = /^(..)(\1)+$/.test(letters);
  if (letters.length >= 4 && twoCharRepeat) return false;
  
  return true;
}

export function calculateRoundScores(
  players: Player[],
  categories: string[],
  letter: string
): Record<string, number> {
  const scores: Record<string, number> = {};
  players.forEach(p => (scores[p.id] = 0));

  categories.forEach(cat => {
    const validAnswers: Record<string, string> = {};
    players.forEach(player => {
      const answer = player.answers[cat]?.trim() || '';
      if (isValidArabicWord(answer, letter)) {
        validAnswers[player.id] = answer;
      }
    });

    const validPlayerIds = Object.keys(validAnswers);
    validPlayerIds.forEach(playerId => {
      const myAnswer = validAnswers[playerId].toLowerCase();
      const othersHaveSame = validPlayerIds.some(
        p => p !== playerId && validAnswers[p].toLowerCase() === myAnswer
      );
      scores[playerId] = (scores[playerId] || 0) + (othersHaveSame ? 5 : 10);
    });
  });

  return scores;
}
