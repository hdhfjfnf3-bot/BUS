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

  const handleStop = () => {
    if (btnPressed || isLocked) return;
    setBtnPressed(true);
    onOtobusComplete();
  };

  const locker = isLocked ? room.players.find(p => p.id === room.lockedBy) : null;

  return (
    <div className="min-h-screen bg-background px-4 py-5 overflow-y-auto">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-black text-primary">أتوبيس كومبليت</h1>
            <p className="text-xs text-muted-foreground">جولة {room.currentRound} / {room.totalRounds}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
            timeLeft < 30 ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted'
          }`}>
            <span className={`text-lg font-black ${timeLeft < 30 ? 'text-destructive' : 'text-foreground'}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
            <span>⏱️</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-destructive' : 'progress-bar'}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Letter */}
        <div className="game-card rounded-2xl p-5 mb-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">حرف الجولة</p>
          <div className="letter-display text-8xl font-black text-primary neon-text">
            {room.currentLetter}
          </div>
          {isLocked && (
            <div className="mt-3 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/30">
              <p className="text-destructive font-bold text-sm">
                🛑 {locker ? `${locker.name} ضغط أتوبيس كومبليت!` : 'اللعبة وقفت!'}
              </p>
            </div>
          )}
        </div>

        {/* Players scores mini */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {room.players.map(player => (
            <div key={player.id} className={`flex-shrink-0 px-3 py-2 rounded-xl text-center ${
              player.id === myPlayerId ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
            }`}>
              <p className="text-xs font-bold text-foreground truncate max-w-[60px]">{player.name}</p>
              <p className={`text-sm font-black ${player.id === myPlayerId ? 'text-primary' : 'text-muted-foreground'}`}>
                {player.totalScore}
              </p>
            </div>
          ))}
        </div>

        {/* Answers */}
        <div className="game-card rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-muted-foreground mb-3">إجاباتك — الحرف: <span className="text-primary font-black">{room.currentLetter}</span></p>
          <div className="space-y-3">
            {room.categories.map(catId => (
              <div key={catId}>
                <label className="text-xs text-muted-foreground font-medium block mb-1">
                  {CATEGORY_LABELS[catId] || catId}
                </label>
                <input
                  type="text"
                  placeholder={`${room.currentLetter}...`}
                  value={localAnswers[catId] || ''}
                  onChange={e => {
                    if (!isLocked) onAnswerChange(catId, e.target.value);
                  }}
                  disabled={isLocked}
                  maxLength={30}
                  className={`input-field w-full h-10 rounded-xl px-4 text-right text-sm ${isLocked ? 'locked' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* OTOBUS COMPLETE BUTTON */}
        {!isLocked ? (
          <button
            onClick={handleStop}
            disabled={btnPressed}
            className={`w-full h-16 rounded-2xl text-xl font-black transition-all mb-4 ${
              btnPressed
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'shimmer-btn text-primary-foreground hover:scale-[1.02] active:scale-[0.95] cursor-pointer'
            }`}
          >
            {btnPressed ? '⏳ جاري الإيقاف...' : '🚌 أتوبيس كومبليت!'}
          </button>
        ) : (
          <div className="text-center p-4 bg-destructive/10 border border-destructive/30 rounded-2xl mb-4">
            <p className="text-destructive font-bold">⏳ بنستنى النتايج من الهوست...</p>
          </div>
        )}
      </div>
    </div>
  );
}
