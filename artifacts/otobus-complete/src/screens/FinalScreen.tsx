import { useEffect, useState } from "react";
import type { RoomState } from "@/lib/gameTypes";

function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; delay: number; size: number }>>([]);
  useEffect(() => {
    const colors = ['#fbbf24', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#f97316', '#ec4899'];
    setParticles(Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2.5,
      size: 6 + Math.random() * 10,
    })));
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
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

interface FinalScreenProps {
  room: RoomState;
  myPlayerId: string;
  isHost: boolean;
  onRestart: () => void;
}

export default function FinalScreen({ room, myPlayerId, isHost, onRestart }: FinalScreenProps) {
  const sorted = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];
  const maxScore = winner?.totalScore || 1;
  const medals = ['🥇', '🥈', '🥉'];
  const me = sorted.findIndex(p => p.id === myPlayerId);
  const iWon = sorted[0]?.id === myPlayerId;

  return (
    <div className="min-h-screen bg-background px-4 py-8 overflow-y-auto">
      {iWon && <Confetti />}
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-7">
          <div className="text-6xl mb-4 letter-display">🏆</div>
          <h1 className="text-4xl font-black text-primary neon-text mb-1">النتيجة النهائية</h1>
          <p className="text-muted-foreground">{room.totalRounds} جولات انتهت</p>
          {iWon && <p className="text-primary font-bold mt-2 text-lg">🎉 أنت الفائز!</p>}
          {!iWon && me >= 0 && (
            <p className="text-muted-foreground mt-2">جيت {medals[me] || `#${me + 1}`}</p>
          )}
        </div>

        {/* Winner Card */}
        {winner && (
          <div
            className="game-card rounded-2xl p-6 mb-5 text-center"
            style={{ border: '2px solid hsl(45, 95%, 55%)', boxShadow: '0 0 40px rgba(251,191,36,0.2)' }}
          >
            <p className="text-muted-foreground text-sm mb-1">الفائز 🏆</p>
            <h2 className="text-3xl font-black text-primary">{winner.name}</h2>
            <div className="text-5xl font-black text-primary neon-text mt-2">{winner.totalScore}</div>
            <p className="text-muted-foreground text-sm">نقطة</p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="game-card rounded-2xl p-4 mb-5">
          <h3 className="font-black text-foreground mb-3">🏅 الترتيب النهائي</h3>
          <div className="space-y-3">
            {sorted.map((player, idx) => {
              const barWidth = maxScore > 0 ? (player.totalScore / maxScore) * 100 : 0;
              const isMe = player.id === myPlayerId;
              return (
                <div
                  key={player.id}
                  className={`rounded-xl p-3 ${
                    idx === 0 ? 'leaderboard-item first' :
                    idx === 1 ? 'leaderboard-item second' :
                    idx === 2 ? 'leaderboard-item third' : 'leaderboard-item'
                  } ${isMe ? 'ring-1 ring-primary/50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{medals[idx] || `${idx + 1}`}</span>
                      <span className="font-bold text-foreground">
                        {player.name} {isMe ? '(أنت)' : ''}
                      </span>
                    </div>
                    <span className={`text-xl font-black ${idx === 0 ? 'text-primary' : 'text-foreground'}`}>
                      {player.totalScore}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full progress-bar" style={{ width: `${barWidth}%` }} />
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {player.roundScores.map((s, ri) => (
                      <span key={ri} className="text-xs bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">
                        ج{ri + 1}: {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onRestart}
            className="w-full h-14 rounded-2xl shimmer-btn text-primary-foreground text-xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            🚌 العب تاني!
          </button>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-2xl">
            <p className="text-muted-foreground text-sm">بنستنى الهوست يبدأ لعبة جديدة...</p>
          </div>
        )}
      </div>
    </div>
  );
}
