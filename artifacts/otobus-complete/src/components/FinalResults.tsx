import { useEffect, useState } from "react";
import type { GameState } from "@/lib/gameStore";

interface FinalResultsProps {
  state: GameState;
  onRestart: () => void;
}

function Confetti() {
  const [particles, setParticles] = useState<Array<{id: number; x: number; color: string; delay: number}>>([]);
  
  useEffect(() => {
    const colors = ['#fbbf24', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#f97316'];
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${2.5 + Math.random() * 2}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

export default function FinalResults({ state, onRestart }: FinalResultsProps) {
  const sorted = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];
  const maxScore = winner?.totalScore || 1;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-8">
      <Confetti />
      
      <div className="w-full max-w-2xl">
        {/* Winner Celebration */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 letter-display">🏆</div>
          <h1 className="text-4xl font-black text-primary neon-text mb-2">النتيجة النهائية</h1>
          <p className="text-muted-foreground">انتهت {state.totalRounds} جولات</p>
        </div>

        {/* Winner Card */}
        {winner && (
          <div className="game-card rounded-2xl p-6 mb-5 text-center border-2 border-primary/50" 
               style={{boxShadow: '0 0 40px rgba(251, 191, 36, 0.2)'}}>
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-muted-foreground mb-1">الفائز</p>
            <h2 className="text-4xl font-black text-primary mb-2">{winner.name}</h2>
            <div className="text-6xl font-black text-primary neon-text">{winner.totalScore}</div>
            <p className="text-muted-foreground">نقطة إجمالية</p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="game-card rounded-2xl p-5 mb-5">
          <h3 className="text-lg font-black text-foreground mb-4">🏅 ترتيب اللاعبين</h3>
          <div className="space-y-3">
            {sorted.map((player, idx) => {
              const barWidth = maxScore > 0 ? (player.totalScore / maxScore) * 100 : 0;
              return (
                <div 
                  key={player.id}
                  className={`leaderboard-item rounded-xl p-4 ${
                    idx === 0 ? 'first' : idx === 1 ? 'second' : idx === 2 ? 'third' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medals[idx] || `${idx + 1}`}</span>
                      <span className="font-bold text-foreground">{player.name}</span>
                    </div>
                    <span className={`text-xl font-black ${idx === 0 ? 'text-primary' : 'text-foreground'}`}>
                      {player.totalScore}
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full progress-bar transition-all duration-1000"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {/* Round breakdown */}
                  <div className="flex gap-1 mt-2">
                    {player.roundScores.map((score, ri) => (
                      <span key={ri} className="text-xs bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">
                        ج{ri + 1}: {score}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Round History */}
        {state.roundResults.length > 0 && (
          <div className="game-card rounded-2xl p-5 mb-6">
            <h3 className="text-lg font-black text-foreground mb-4">📜 ملخص الجولات</h3>
            <div className="space-y-3">
              {state.roundResults.map((round) => (
                <div key={round.roundNumber} className="bg-muted/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-black text-lg">{round.letter}</span>
                    <span className="text-muted-foreground text-sm">— جولة {round.roundNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.players.map(p => (
                      <div key={p.id} className="flex items-center gap-1 bg-muted/30 rounded-lg px-2 py-1">
                        <span className="text-xs text-muted-foreground">{p.name}:</span>
                        <span className="text-xs font-bold text-primary">+{round.scores[p.id] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restart */}
        <button
          onClick={onRestart}
          className="w-full h-16 rounded-2xl shimmer-btn text-primary-foreground text-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          🚌 العب تاني!
        </button>
      </div>
    </div>
  );
}
