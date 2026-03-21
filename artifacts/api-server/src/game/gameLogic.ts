import { spellCheckDocument } from 'cspell-lib';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ARABIC_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
  'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

// Track used letters per game session
const usedLettersCache = new Map<string, Set<string>>();

export function getRandomLetter(roomCode?: string): string {
  if (!roomCode) {
    return ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
  }

  let used = usedLettersCache.get(roomCode) || new Set<string>();
  const available = ARABIC_LETTERS.filter(l => !used.has(l));
  
  // If all letters used, reset
  if (available.length === 0) {
    used = new Set<string>();
    usedLettersCache.set(roomCode, used);
  }
  
  const pool = available.length > 0 ? available : ARABIC_LETTERS;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  used.add(chosen);
  usedLettersCache.set(roomCode, used);
  return chosen;
}

export function clearLetterCache(roomCode: string): void {
  usedLettersCache.delete(roomCode);
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
  validityMap: Record<string, Record<string, boolean>>;
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

// Remove Arabic diacritics (tashkeel) for normalization
export function removeDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

// Normalize alef variants to bare alef
export function normalizeAlef(text: string): string {
  return text
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

// Full normalization for comparison
export function normalizeForComparison(text: string): string {
  return normalizeAlef(removeDiacritics(text.trim().toLowerCase()));
}

export const ALEF_VARIANTS = ['أ', 'إ', 'ا', 'آ', 'ٱ'];

export function startsWithLetter(word: string, letter: string): boolean {
  if (!word || word.trim() === '') return false;
  const normalized = removeDiacritics(word.trim());
  const firstChar = normalized[0];
  
  if (ALEF_VARIANTS.includes(letter)) {
    return ALEF_VARIANTS.includes(firstChar);
  }
  return firstChar === letter;
}

// Checks for nonsense repeated patterns like "بببب" or "ببسببس"
function hasRepeatingPattern(text: string): boolean {
  if (/^(.)\1+$/.test(text)) return true;
  if (text.length >= 4 && /^(..)(\1)+$/.test(text)) return true;
  if (text.length >= 6 && /^(...)(\1)+$/.test(text)) return true;
  return false;
}

// Checks if word has enough diversity (not all same char or near-same)
function hasSufficientDiversity(text: string): boolean {
  const uniqueChars = new Set(text).size;
  if (text.length >= 4 && uniqueChars < 2) return false;
  if (text.length >= 6 && uniqueChars < 3) return false;
  return true;
}

// Keyboard-smashing detection: long runs of alphabetically adjacent characters
function isKeyboardSmash(text: string): boolean {
  if (text.length < 4) return false;
  let adjacentRun = 1;
  for (let i = 1; i < text.length; i++) {
    const diff = Math.abs(text.charCodeAt(i) - text.charCodeAt(i - 1));
    if (diff <= 2) {
      adjacentRun++;
      if (adjacentRun >= text.length * 0.7) return true;
    } else {
      adjacentRun = 1;
    }
  }
  return false;
}

export function isValidArabicWordShape(word: string, letter: string): boolean {
  if (!word || word.trim() === '') return false;
  const trimmed = removeDiacritics(word.trim());
  
  // Must start with correct letter (or alef variant)
  if (!startsWithLetter(trimmed, letter)) return false;
  
  // Arabic characters only (allowing spaces for two-word phrases)
  const arabicOnly = /^[\u0600-\u06FF\s]+$/.test(trimmed);
  if (!arabicOnly) return false;

  const letters = trimmed.replace(/\s+/g, '');
  
  // Minimum 3 characters (without spaces)
  if (letters.length < 3) return false;
  
  // No all-same-character nonsense
  if (hasRepeatingPattern(letters)) return false;
  
  // Enough character diversity
  if (!hasSufficientDiversity(letters)) return false;
  
  // No keyboard smashing
  if (isKeyboardSmash(letters)) return false;
  
  return true;
}

// Real-word check (dictionary-based) using cspell.
// This is intentionally strict to prevent random "letter smashes".
const realWordCache = new Map<string, boolean>();
let cspellArabicConfigPromise: Promise<any> | null = null;

async function getCSpellArabicConfig(): Promise<any> {
  if (cspellArabicConfigPromise) return cspellArabicConfigPromise;

  cspellArabicConfigPromise = (async () => {
    const dictExtUrl = import.meta.resolve('@cspell/dict-ar/cspell-ext.json');
    const dictExtPath = fileURLToPath(dictExtUrl);
    const extJson = JSON.parse(await readFile(dictExtPath, 'utf8')) as any;

    // cspell-ext.json uses a relative path "./ar.trie.gz".
    // We convert it to an absolute path so spellCheckDocument can load it reliably.
    extJson.dictionaryDefinitions?.forEach((def: any) => {
      if (def?.path === './ar.trie.gz') def.path = join(dirname(dictExtPath), 'ar.trie.gz');
    });

    return extJson;
  })();

  return cspellArabicConfigPromise;
}

function normalizeAlefVariantsOnly(text: string): string {
  // Match dictionary spelling better by collapsing Arabic alef variants to bare alef only.
  // Do NOT change 'ة' -> 'ه' or 'ى' -> 'ي' here; that can break dictionary matches.
  return text.replace(/[أإآٱ]/g, 'ا');
}

async function isRealArabicToken(token: string): Promise<boolean> {
  const cached = realWordCache.get(token);
  if (cached !== undefined) return cached;

  const cfg = await getCSpellArabicConfig();

  // Check ONLY this token (not the full phrase) to avoid rejecting real multi-word names.
  const result = await spellCheckDocument(
    { uri: 'text', text: token, languageId: 'ar', locale: 'ar' },
    { generateSuggestions: false, noConfigSearch: true, unknownWords: 'report-all' as any },
    cfg
  );

  const ok = (result.issues?.length ?? 0) === 0;
  realWordCache.set(token, ok);
  return ok;
}

export async function isValidArabicWord(word: string, letter: string): Promise<boolean> {
  // First, keep your existing anti-smash / format rules.
  if (!isValidArabicWordShape(word, letter)) return false;

  // Then, enforce that the first token is an actual Arabic word from the dictionary.
  // If cspell fails for any reason, fall back to shape validation so the game doesn't break.
  try {
    const trimmed = removeDiacritics(word.trim());
    const firstToken = trimmed.split(/\s+/)[0] || '';
    if (!firstToken) return false;

    const tokenNoDiacritics = removeDiacritics(firstToken);
    const tokenBareAlef = normalizeAlefVariantsOnly(tokenNoDiacritics);

    // Accept if either the original token or "bare alef" variant exists in the dictionary.
    if (await isRealArabicToken(tokenNoDiacritics)) return true;
    if (tokenBareAlef !== tokenNoDiacritics) {
      return await isRealArabicToken(tokenBareAlef);
    }
    return false;
  } catch {
    return isValidArabicWordShape(word, letter);
  }
}

// Check if two answers are considered the same (normalized comparison)
export function answersAreSame(a: string, b: string): boolean {
  return normalizeForComparison(a) === normalizeForComparison(b);
}

export async function calculateRoundScores(
  players: Player[],
  categories: string[],
  letter: string
): Promise<{ scores: Record<string, number>; validityMap: Record<string, Record<string, boolean>> }> {
  const scores: Record<string, number> = {};
  const validityMap: Record<string, Record<string, boolean>> = {};
  
  players.forEach(p => {
    scores[p.id] = 0;
    validityMap[p.id] = {};
  });

  for (const cat of categories) {
    const validAnswers: Record<string, string> = {};
    
    for (const player of players) {
      const answer = player.answers[cat]?.trim() || '';
      const isValid = await isValidArabicWord(answer, letter);
      validityMap[player.id][cat] = isValid;
      if (isValid) {
        validAnswers[player.id] = answer;
      }
    }

    const validPlayerIds = Object.keys(validAnswers);
    for (const playerId of validPlayerIds) {
      const myAnswer = validAnswers[playerId];
      const othersHaveSame = validPlayerIds.some(
        p => p !== playerId && answersAreSame(validAnswers[p], myAnswer)
      );
      scores[playerId] = (scores[playerId] || 0) + (othersHaveSame ? 5 : 10);
    }
  }

  return { scores, validityMap };
}
