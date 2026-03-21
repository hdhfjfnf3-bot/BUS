import { useState } from "react";
import { CATEGORIES } from "@/lib/gameData";
import type { GameState } from "@/lib/gameStore";

interface SetupScreenProps {
  state: GameState;
  onStart: (players: string[], categories: string[], rounds: number, timeLimit: number) => void;
}

export default function SetupScreen({ state, onStart }: SetupScreenProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['name', 'country', 'animal', 'plant', 'food']);
  const [rounds, setRounds] = useState(5);
  const [timeLimit, setTimeLimit] = useState(120);

  const addPlayer = () => {
    if (playerNames.length < 10) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length > 2) {
        setSelectedCategories(selectedCategories.filter(c => c !== catId));
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const canStart = () => {
    const validPlayers = playerNames.filter(p => p.trim().length >= 2);
    return validPlayers.length >= 2 && selectedCategories.length >= 2;
  };

  const handleStart = () => {
    const validPlayers = playerNames.filter(p => p.trim().length >= 2).map(p => p.trim());
    onStart(validPlayers, selectedCategories, rounds, timeLimit);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl bus-icon-pulse">🚌</span>
          </div>
          <h1 className="text-5xl font-black text-primary neon-text mb-2">أتوبيس كومبليت</h1>
          <p className="text-muted-foreground text-lg">لعبة الكلمات الممتعة للعائلة والأصحاب</p>
        </div>

        {/* Players Setup */}
        <div className="game-card rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>👥</span> اللاعبين
            </h2>
            <span className="text-muted-foreground text-sm">{playerNames.filter(p => p.trim()).length} / 10</span>
          </div>
          
          <div className="space-y-3 mb-4">
            {playerNames.map((name, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-muted-foreground font-bold">
                  {index + 1}
                </div>
                <input
                  type="text"
                  placeholder={`اسم اللاعب ${index + 1}`}
                  value={name}
                  onChange={e => updatePlayer(index, e.target.value)}
                  maxLength={20}
                  className="input-field flex-1 h-10 rounded-xl px-4 text-right text-sm"
                />
                {playerNames.length > 2 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {playerNames.length < 10 && (
            <button
              onClick={addPlayer}
              className="w-full h-10 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all text-sm font-medium"
            >
              + إضافة لاعب
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="game-card rounded-2xl p-6 mb-5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
            <span>📚</span> الأقسام
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedCategories.includes(cat.id)
                    ? 'category-badge scale-105'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {selectedCategories.length} أقسام مختارة (لازم 2 على الأقل)
          </p>
        </div>

        {/* Game Settings */}
        <div className="game-card rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
            <span>⚙️</span> إعدادات اللعبة
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">عدد الجولات</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRounds(Math.max(1, rounds - 1))}
                  className="w-10 h-10 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/70 transition-colors"
                >
                  −
                </button>
                <span className="text-2xl font-black text-primary w-10 text-center">{rounds}</span>
                <button
                  onClick={() => setRounds(Math.min(20, rounds + 1))}
                  className="w-10 h-10 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/70 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-2">وقت الجولة (ثانية)</label>
              <div className="flex items-center gap-2 flex-wrap">
                {[60, 90, 120, 180].map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeLimit(t)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      timeLimit === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!canStart()}
          className={`w-full h-16 rounded-2xl text-2xl font-black transition-all ${
            canStart()
              ? 'shimmer-btn text-primary-foreground cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          }`}
        >
          🚌 ابدأ اللعبة!
        </button>
        
        {!canStart() && (
          <p className="text-center text-muted-foreground text-sm mt-3">
            {playerNames.filter(p => p.trim().length >= 2).length < 2 
              ? 'محتاج على الأقل لاعبين اتنين بأسماء صح' 
              : 'اختار على الأقل قسمين'}
          </p>
        )}
      </div>
    </div>
  );
}
