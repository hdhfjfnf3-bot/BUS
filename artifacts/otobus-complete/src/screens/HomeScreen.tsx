import { useState } from "react";
import { CATEGORIES } from "@/lib/gameTypes";

interface HomeScreenProps {
  onCreateRoom: (playerName: string, categories: string[], rounds: number, timeLimit: number) => void;
  onJoinRoom: (code: string, playerName: string) => void;
  isConnecting: boolean;
}

export default function HomeScreen({ onCreateRoom, onJoinRoom, isConnecting }: HomeScreenProps) {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['name', 'country', 'animal', 'plant', 'food']);
  const [rounds, setRounds] = useState(5);
  const [timeLimit, setTimeLimit] = useState(120);
  const [error, setError] = useState('');

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      if (selectedCategories.length > 2) setSelectedCategories(selectedCategories.filter(c => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleCreate = () => {
    const name = playerName.trim();
    if (name.length < 2) { setError('اسمك لازم يكون حرفين على الأقل'); return; }
    setError('');
    onCreateRoom(name, selectedCategories, rounds, timeLimit);
  };

  const handleJoin = () => {
    const name = playerName.trim();
    const code = joinCode.trim().toUpperCase();
    if (name.length < 2) { setError('اسمك لازم يكون حرفين على الأقل'); return; }
    if (code.length !== 4) { setError('كود الغرفة 4 حروف'); return; }
    setError('');
    onJoinRoom(code, name);
  };

  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 bus-icon-pulse">🚌</div>
          <h1 className="text-5xl font-black text-primary neon-text mb-3">أتوبيس كومبليت</h1>
          <p className="text-muted-foreground text-lg">العب مع أصحابك من تلفوناتهم!</p>
        </div>
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => setMode('create')}
            className="w-full h-16 rounded-2xl shimmer-btn text-primary-foreground text-xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            🎮 إنشاء غرفة جديدة
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full h-16 rounded-2xl bg-secondary text-secondary-foreground text-xl font-bold hover:bg-secondary/70 transition-all border border-border"
          >
            🚪 انضم لغرفة
          </button>
        </div>
        <p className="text-muted-foreground text-xs mt-10 text-center">
          كل لاعب يفتح اللعبة من تليفونه الخاص
        </p>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setMode('home'); setError(''); }}
            className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 transition-colors"
          >
            ← رجوع
          </button>
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🚪</div>
            <h2 className="text-3xl font-black text-foreground">انضم لغرفة</h2>
          </div>
          <div className="game-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">اسمك</label>
              <input
                type="text"
                placeholder="اكتب اسمك"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                className="input-field w-full h-12 rounded-xl px-4 text-right"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">كود الغرفة</label>
              <input
                type="text"
                placeholder="XXXX"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="input-field w-full h-12 rounded-xl px-4 text-center text-2xl font-black tracking-widest"
                style={{ direction: 'ltr' }}
              />
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-destructive text-sm text-center">
                {error}
              </div>
            )}
            <button
              onClick={handleJoin}
              disabled={isConnecting}
              className="w-full h-12 rounded-xl shimmer-btn text-primary-foreground font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isConnecting ? 'جاري الانضمام...' : 'انضم الآن!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 overflow-y-auto">
      <div className="max-w-sm mx-auto">
        <button
          onClick={() => { setMode('home'); setError(''); }}
          className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 transition-colors"
        >
          ← رجوع
        </button>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎮</div>
          <h2 className="text-3xl font-black text-foreground">إنشاء غرفة</h2>
        </div>

        <div className="game-card rounded-2xl p-5 mb-4">
          <label className="text-sm text-muted-foreground block mb-2">اسمك</label>
          <input
            type="text"
            placeholder="اكتب اسمك"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={20}
            className="input-field w-full h-12 rounded-xl px-4 text-right"
          />
        </div>

        <div className="game-card rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-bold text-muted-foreground mb-3">📚 الأقسام</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  selectedCategories.includes(cat.id)
                    ? 'category-badge'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="game-card rounded-2xl p-5 mb-4">
          <div className="mb-4">
            <label className="text-sm text-muted-foreground block mb-2">عدد الجولات</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setRounds(Math.max(1, rounds - 1))} className="w-10 h-10 rounded-xl bg-secondary font-bold text-lg">−</button>
              <span className="text-3xl font-black text-primary w-10 text-center">{rounds}</span>
              <button onClick={() => setRounds(Math.min(20, rounds + 1))} className="w-10 h-10 rounded-xl bg-secondary font-bold text-lg">+</button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">وقت الجولة</label>
            <div className="flex gap-2 flex-wrap">
              {[60, 90, 120, 180].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeLimit(t)}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    timeLimit === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {t}ث
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-destructive text-sm text-center mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={isConnecting}
          className="w-full h-14 rounded-2xl shimmer-btn text-primary-foreground text-xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isConnecting ? 'جاري الإنشاء...' : '🚌 إنشاء الغرفة!'}
        </button>
      </div>
    </div>
  );
}
