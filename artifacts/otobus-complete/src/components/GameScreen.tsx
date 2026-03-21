import { useEffect, useRef, useState } from "react";
import { CATEGORIES, calculateRoundScores } from "@/lib/gameData";
import type { GameState } from "@/lib/gameStore";

interface GameScreenProps {
  state: GameState;
  onStop: (lockedBy: string) => void;
  onUpdateAnswer: (playerId: string, category: string, value: string) => void;
  onNextRound: () => void;
}

export default function GameScreen({ state, onStop, onUpdateAnswer, onNextRound }: GameScreenProps) {
  const [timeLeft, setTimeLeft] = useState(state.timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showScores, setShowScores] = useState(false);

  useEffect(() => {
    setTimeLeft(state.timeLimit);
    setShowScores(false);
  }, [state.currentRound, state.timeLimit]);

  useEffect(() => {
    if (state.isLocked || showScores) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isLocked, showScores, state.currentRound]);

  const categoryLabels: Record<string, string> = {};
  CATEGORIES.forEach(c => { categoryLabels[c.id] = c.label; });

  const handleStop = (playerId: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    onStop(playerId);
  };

  const handleShowScores = () => {
    setShowScores(true);
  };

  const timerPercent = Math.max(0, (timeLeft / state.timeLimit) * 100);
  const timerColor = timeLeft < 30 ? 'bg-destructive' : timeLeft < 60 ? 'bg-orange-500' : 'progress-bar';
  
  const roundScores = calculateRoundScores(
    state.currentAnswers,
    state.players.map(p => p.id),
    state.categories,
    state.currentLetter
  );

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚌</span>
            <div>
              <h1 className="text-xl font-black text-primary">أتوبيس كومبليت</h1>
              <p className="text-xs text-muted-foreground">جولة {state.currentRound} من {state.totalRounds}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              timeLeft < 30 ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted'
            }`}>
              <span className={`text-xl font-black ${timeLeft < 30 ? 'text-destructive' : 'text-foreground'}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
              <span className="text-lg">⏱️</span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Round info & Letter */}
        <div className="game-card rounded-2xl p-5 mb-5 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm mb-1">حرف الجولة</p>
            <div className="letter-display text-7xl font-black text-primary neon-text">
              {state.currentLetter}
            </div>
          </div>
          {!state.isLocked && !showScores && (
            <div className="text-right">
              <p className="text-muted-foreground text-sm mb-3">إملي الكلمات وبعدين</p>
              <p className="text-foreground text-sm font-bold">اضغط الزر لما تخلص!</p>
              <p className="text-xs text-muted-foreground mt-1">الكل هيتبلوك فوراً</p>
            </div>
          )}
          {state.isLocked && !showScores && (
            <div className="text-right">
              <div className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/30">
                <p className="text-destructive font-bold text-sm">🛑 اللعبة متوقفة!</p>
                <p className="text-destructive text-xs mt-1">
                  {state.lockedBy ? `ضغط عليه: ${state.players.find(p => p.id === state.lockedBy)?.name}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Players & Answers */}
        <div className="space-y-4 mb-5">
          {state.players.map((player) => (
            <div 
              key={player.id} 
              className={`player-card rounded-2xl p-4 ${state.isLocked ? 'locked' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">{player.name}</span>
                  <span className="score-badge text-xs px-2 py-0.5 rounded-full">
                    {player.totalScore} نقطة
                  </span>
                </div>
                {!state.isLocked && !showScores && (
                  <button
                    onClick={() => handleStop(player.id)}
                    className="shimmer-btn px-4 py-1.5 rounded-xl text-primary-foreground text-xs font-black hover:scale-105 active:scale-95 transition-all"
                  >
                    🚌 أتوبيس كومبليت!
                  </button>
                )}
                {state.isLocked && showScores && (
                  <div className="score-badge px-3 py-1 rounded-xl text-sm font-bold">
                    +{roundScores[player.id] || 0} نقطة
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {state.categories.map(catId => (
                  <div key={catId} className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground font-medium">
                      {categoryLabels[catId] || catId}
                    </label>
                    <input
                      type="text"
                      placeholder={`${state.currentLetter}...`}
                      value={state.currentAnswers[player.id]?.[catId] || ''}
                      onChange={e => onUpdateAnswer(player.id, catId, e.target.value)}
                      disabled={state.isLocked}
                      maxLength={30}
                      className={`input-field h-9 rounded-lg px-3 text-right text-sm w-full ${
                        state.isLocked ? 'locked' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Stopped State - Show Scores Button */}
        {state.isLocked && !showScores && (
          <button
            onClick={handleShowScores}
            className="w-full h-14 rounded-2xl shimmer-btn text-primary-foreground text-xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all mb-4"
          >
            📊 شوف النتايج
          </button>
        )}

        {/* Round Scores Display */}
        {state.isLocked && showScores && (
          <div className="game-card rounded-2xl p-5 mb-4">
            <h3 className="text-lg font-black text-primary mb-4 text-center">
              🏆 نقاط الجولة {state.currentRound}
            </h3>
            <div className="space-y-2 mb-4">
              {state.players
                .slice()
                .sort((a, b) => (roundScores[b.id] || 0) - (roundScores[a.id] || 0))
                .map((player, idx) => (
                  <div key={player.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </span>
                      <span className="font-bold text-foreground">{player.name}</span>
                    </div>
                    <span className="text-primary font-black text-lg">+{roundScores[player.id] || 0}</span>
                  </div>
                ))}
            </div>
            
            {/* Answers Review */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-muted-foreground">إجابات اللاعبين:</h4>
              {state.categories.map(catId => (
                <div key={catId} className="bg-muted/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-bold">{categoryLabels[catId]}</p>
                  <div className="flex flex-wrap gap-2">
                    {state.players.map(player => {
                      const answer = state.currentAnswers[player.id]?.[catId]?.trim() || '';
                      return (
                        <div key={player.id} className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">{player.name}:</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            answer ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                          }`}>
                            {answer || '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onNextRound}
              className="w-full h-12 rounded-xl shimmer-btn text-primary-foreground font-black mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {state.currentRound >= state.totalRounds ? '🏆 النتيجة النهائية' : `🎮 الجولة القادمة (${state.currentRound + 1}/${state.totalRounds})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
