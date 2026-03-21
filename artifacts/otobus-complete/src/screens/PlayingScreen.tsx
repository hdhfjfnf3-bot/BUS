import { useEffect, useRef, useState } from "react";
import type { RoomState } from "@/lib/gameTypes";
import { CATEGORY_LABELS } from "@/lib/gameTypes";

interface PlayingScreenProps {
  room: RoomState;
  myPlayerId: string;
  localAnswers: Record<string, string>;
  onAnswerChange: (category: string, value: string) => void;
  onOtobusComplete: () => void;
}

export default function PlayingScreen({ room, myPlayerId, localAnswers, onAnswerChange, onOtobusComplete }: PlayingScreenProps) {
  const [timeLeft, setTimeLeft] = useState(room.timeLimit);
  const [btnPressed, setBtnPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRoundRef = useRef(room.currentRound);

  useEffect(() => {
    if (room.currentRound !== startedRoundRef.current) {
      startedRoundRef.current = room.currentRound;
      setTimeLeft(room.timeLimit);
      setBtnPressed(false);
    }
  }, [room.currentRound, room.timeLimit]);

  useEffect(() => {
    if (room.phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [room.phase, room.currentRound]);

  const isLocked = room.phase === 'locked';
  const timerPercent = Math.max(0, (timeLeft / room.timeLimit) * 100);
  const isDanger = timeLeft < 20;

  const handleStop = () => {
    if (btnPressed || isLocked) return;
    setBtnPressed(true);
    onOtobusComplete();
  };

  const locker = isLocked ? room.players.find(p => p.id === room.lockedBy) : null;

  return (
    <div className="min-h-screen relative px-4 py-5 overflow-y-auto pb-32">
      {isLocked && <div className="locked-overlay" />}
      
      <div className="max-w-sm mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-primary neon-text">أتوبيس كومبليت</h1>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white">
              جولة {room.currentRound} من {room.totalRounds}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg border ${
            isDanger ? 'bg-destructive/20 border-destructive/50 shadow-destructive/20 animate-pulse' : 'bg-white/5 border-white/10'
          }`}>
            <span className={`text-2xl font-black ${isDanger ? 'text-red-400' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
            <span className="text-xl">{isDanger ? '⚠️' : '⏱️'}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 bg-black/40 rounded-full mb-6 overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'progress-bar danger' : 'progress-bar'}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Letter */}
        <div className="mb-8 flex flex-col items-center">
          <p className="text-muted-foreground/80 text-sm font-bold mb-3 uppercase tracking-wider">حرف الجولة</p>
          <div className="letter-display-wrapper">
            <div className="letter-display">
              {room.currentLetter}
            </div>
          </div>
          
          {isLocked && (
            <div className="mt-6 px-6 py-3 rounded-2xl bg-destructive/20 border border-destructive/50 backdrop-blur-md animate-in slide-in-from-top-4">
              <p className="text-red-400 font-black text-lg text-center">
                🛑 {locker ? `${locker.name} ضغط أتوبيس كومبليت!` : 'الوقت خلص!'}
              </p>
            </div>
          )}
        </div>

        {/* Answers */}
        <div className="game-card rounded-3xl p-5 mb-6">
          <div className="space-y-4">
            {room.categories.map((catId, idx) => {
              const val = localAnswers[catId] || '';
              const isValidStart = val.trim().startsWith(room.currentLetter);
              const highlight = val.length > 0 && isValidStart && !isLocked;
              
              return (
                <div key={catId} className="relative animate-in fade-in" style={{animationDelay: `${idx * 100}ms`}}>
                  <label className="text-sm text-muted-foreground/90 font-bold block mb-1.5 px-1">
                    {CATEGORY_LABELS[catId] || catId}
                  </label>
                  <input
                    type="text"
                    placeholder={`يبدأ بحرف ${room.currentLetter}...`}
                    value={val}
                    onChange={e => {
                      if (!isLocked) onAnswerChange(catId, e.target.value);
                    }}
                    disabled={isLocked}
                    maxLength={30}
                    className={`input-field w-full h-12 rounded-xl px-4 text-right text-lg font-bold ${isLocked ? 'locked' : ''} ${highlight ? 'valid-match' : ''}`}
                  />
                  {highlight && (
                    <div className="absolute left-3 top-[34px] text-green-400">✓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Players scores mini */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {room.players.map(player => (
            <div key={player.id} className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-center snap-center ${
              player.id === myPlayerId ? 'bg-primary/20 border border-primary/50' : 'bg-white/5 border border-white/5'
            }`}>
              <p className="text-xs font-bold text-white truncate w-16">{player.name}</p>
              <p className={`text-lg font-black mt-1 ${player.id === myPlayerId ? 'text-primary neon-text' : 'text-muted-foreground'}`}>
                {player.totalScore}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40">
        <div className="max-w-sm mx-auto">
          {!isLocked ? (
            <button
              onClick={handleStop}
              disabled={btnPressed}
              className={`w-full h-20 rounded-3xl text-3xl font-black transition-all shadow-2xl flex items-center justify-center gap-3 ${
                btnPressed
                  ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                  : 'shimmer-btn text-primary-foreground hover:scale-[1.02] active:scale-[0.95]'
              }`}
            >
              {btnPressed ? '⏳ جاري الإيقاف...' : '🚌 أتوبيس كومبليت!'}
            </button>
          ) : (
            <div className="w-full h-20 rounded-3xl bg-destructive/20 border border-destructive/50 flex items-center justify-center shadow-lg backdrop-blur-md">
              <p className="text-red-400 font-black text-xl flex items-center gap-2">
                <span className="animate-spin">⏳</span> بنستنى النتايج...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
