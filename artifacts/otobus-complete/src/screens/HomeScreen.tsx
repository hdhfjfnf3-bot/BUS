import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/gameTypes";

const Starfield = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2
    })));
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map(star => (
        <div 
          key={star.id} 
          className="star" 
          style={{
            left: `${star.x}%`, 
            top: `${star.y}%`, 
            width: `${star.size}px`, 
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${Math.random() * 2}s`
          }} 
        />
      ))}
    </div>
  );
}

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
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 z-10">
        <Starfield />
        <div className="z-10 text-center mb-16 relative">
          <div className="text-8xl mb-6 bus-icon-pulse">🚌</div>
          <h1 className="text-6xl font-black text-primary neon-text mb-4">أتوبيس<br/>كومبليت</h1>
          <p className="text-muted-foreground/80 text-lg font-medium">العب مع أصحابك من تليفوناتكم!</p>
        </div>
        <div className="w-full max-w-xs space-y-5 z-10">
          <button
            onClick={() => setMode('create')}
            className="w-full h-16 rounded-2xl shimmer-btn text-primary-foreground text-2xl font-black hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            🎮 إنشاء غرفة جديدة
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full h-16 rounded-2xl glass-btn text-foreground text-xl font-bold hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            🚪 انضم لغرفة
          </button>
        </div>
        <p className="text-muted-foreground/50 text-xs mt-12 text-center z-10 font-bold">
          كل لاعب يفتح اللعبة من تليفونه الخاص
        </p>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6">
        <Starfield />
        <div className="w-full max-w-sm z-10">
          <button
            onClick={() => { setMode('home'); setError(''); }}
            className="text-muted-foreground hover:text-white mb-6 flex items-center gap-2 transition-colors font-bold"
          >
            ← رجوع
          </button>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4" style={{textShadow: '0 0 20px rgba(139,92,246,0.5)'}}>🚪</div>
            <h2 className="text-4xl font-black text-white">انضم لغرفة</h2>
          </div>
          <div className="game-card rounded-3xl p-7 space-y-6">
            <div>
              <label className="text-sm text-muted-foreground font-bold block mb-2">اسمك</label>
              <input
                type="text"
                placeholder="اكتب اسمك"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                className="input-field w-full h-14 rounded-xl px-4 text-right text-lg font-bold"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-bold block mb-2">كود الغرفة</label>
              <input
                type="text"
                placeholder="XXXX"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="input-field w-full h-16 rounded-xl px-4 text-center text-3xl font-black tracking-[0.5em]"
                style={{ direction: 'ltr' }}
              />
            </div>
            {error && (
              <div className="bg-destructive/20 border border-destructive/50 rounded-xl p-3 text-red-400 font-bold text-sm text-center">
                {error}
              </div>
            )}
            <button
              onClick={handleJoin}
              disabled={isConnecting}
              className="w-full h-14 rounded-2xl shimmer-btn text-primary-foreground font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {isConnecting ? 'جاري الانضمام...' : 'انضم الآن! 🚀'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative px-4 py-8 overflow-y-auto">
      <Starfield />
      <div className="max-w-sm mx-auto z-10 relative">
        <button
          onClick={() => { setMode('home'); setError(''); }}
          className="text-muted-foreground hover:text-white mb-6 flex items-center gap-2 transition-colors font-bold"
        >
          ← رجوع
        </button>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" style={{textShadow: '0 0 20px rgba(245,158,11,0.5)'}}>🎮</div>
          <h2 className="text-4xl font-black text-white">إنشاء غرفة</h2>
        </div>

        <div className="game-card rounded-3xl p-6 mb-5">
          <label className="text-sm text-muted-foreground font-bold block mb-2">اسمك</label>
          <input
            type="text"
            placeholder="اكتب اسمك"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={20}
            className="input-field w-full h-14 rounded-xl px-4 text-right text-lg font-bold"
          />
        </div>

        <div className="game-card rounded-3xl p-6 mb-5">
          <h3 className="text-sm font-bold text-muted-foreground mb-4">📚 الأقسام</h3>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedCategories.includes(cat.id)
                    ? 'category-badge scale-105'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="game-card rounded-3xl p-6 mb-6">
          <div className="mb-6">
            <label className="text-sm text-muted-foreground font-bold block mb-3">عدد الجولات</label>
            <div className="flex items-center justify-center gap-6 bg-background/40 p-2 rounded-2xl border border-white/5">
              <button onClick={() => setRounds(Math.max(1, rounds - 1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-2xl text-white transition-colors">−</button>
              <span className="text-4xl font-black text-primary w-12 text-center">{rounds}</span>
              <button onClick={() => setRounds(Math.min(20, rounds + 1))} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-2xl text-white transition-colors">+</button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground font-bold block mb-3">وقت الجولة</label>
            <div className="grid grid-cols-4 gap-2">
              {[60, 90, 120, 180].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeLimit(t)}
                  className={`py-3 rounded-xl text-sm font-black transition-all ${
                    timeLimit === t ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {t}ث
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 rounded-xl p-3 text-red-400 font-bold text-sm text-center mb-5">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={isConnecting}
          className="w-full h-16 rounded-2xl shimmer-btn text-primary-foreground text-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl mb-8"
        >
          {isConnecting ? 'جاري الإنشاء...' : '🚌 يلا بينا!'}
        </button>
      </div>
    </div>
  );
}
