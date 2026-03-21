export const ARABIC_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
  'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

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

export type Category = typeof CATEGORIES[number];

export function getRandomLetter(): string {
  return ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
}

export function startsWithLetter(word: string, letter: string): boolean {
  if (!word || word.trim() === '') return false;
  const normalizedWord = word.trim();
  const normalizedLetter = letter;
  
  const firstChar = normalizedWord[0];
  
  const alefVariants = ['أ', 'إ', 'ا', 'آ', 'ٱ'];
  if (alefVariants.includes(normalizedLetter)) {
    return alefVariants.includes(firstChar);
  }
  
  return firstChar === normalizedLetter;
}

export function isLikelyValidWord(word: string, letter: string): boolean {
  if (!word || word.trim() === '') return false;
  
  const trimmed = word.trim();
  
  if (!startsWithLetter(trimmed, letter)) return false;
  
  if (trimmed.length < 2) return false;
  
  const arabicCharsOnly = /^[\u0600-\u06FF\s]+$/.test(trimmed);
  if (!arabicCharsOnly) return false;
  
  const uniqueChars = new Set(trimmed.replace(/\s/g, '')).size;
  const totalChars = trimmed.replace(/\s/g, '').length;
  if (totalChars >= 3 && uniqueChars < 2) return false;
  
  const repeatingPattern = /^(.)\1{2,}$/.test(trimmed.replace(/\s/g, ''));
  if (repeatingPattern) return false;
  
  return true;
}

export function calculateRoundScores(
  answers: Record<string, Record<string, string>>,
  players: string[],
  categories: string[],
  letter: string
): Record<string, number> {
  const scores: Record<string, number> = {};
  players.forEach(p => (scores[p] = 0));

  categories.forEach(cat => {
    const validAnswers: Record<string, string> = {};
    
    players.forEach(player => {
      const answer = answers[player]?.[cat]?.trim() || '';
      if (isLikelyValidWord(answer, letter)) {
        validAnswers[player] = answer.toLowerCase();
      }
    });

    const validPlayers = Object.keys(validAnswers);
    
    validPlayers.forEach(player => {
      const myAnswer = validAnswers[player];
      const othersHaveSame = validPlayers.some(
        p => p !== player && validAnswers[p].trim() === myAnswer.trim()
      );
      
      if (othersHaveSame) {
        scores[player] = (scores[player] || 0) + 5;
      } else {
        scores[player] = (scores[player] || 0) + 10;
      }
    });
  });

  return scores;
}
