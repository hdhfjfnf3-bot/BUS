import { useEffect, useState } from "react";
import type { RoomState } from "@/lib/gameTypes";

function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; delay: number; size: number }>>([]);
  useEffect(() => {
    const colors = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#f97316', '#ec4899', '#fbbf24'];
    setParticles(Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3,
      size: 8 + Math.random() * 12,
    })));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            backgroundColor: p.color,
            animation: `confetti-fall ${2.5 + Math.random() * 2}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '3px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
      `}</style>
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
    <div className="min-h-screen relative px-4 py-10 overflow-y-auto">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-background to-background -z-10 pointer-events-none" />
      {iWon && <Confetti />}
      
      <div className="max-w-sm mx-auto z-10 relative">
        <div className="text-center mb-10 animate-in zoom-in duration-500">
          <div className="text-7xl mb-6 relative inline-block">
            <span className="relative z-10 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]">👑</span>
            {iWon && <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full z-0 animate-pulse"></div>}
          </div>
          <h1 className="text-5xl font-black text-primary neon-text mb-2">النتيجة النهائية</h1>
          <p className="text-muted-foreground/80 font-bold">{room.totalRounds} جولات انتهت</p>
          
          {iWon ? (
            <div className="mt-6 inline-block bg-yellow-500/20 border border-yellow-500/50 rounded-2xl px-6 py-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <p className="text-yellow-400 font-black text-2xl">🎉 مبروك! أنت الفائز!</p>
            </div>
          ) : me >= 0 ? (
            <div className="mt-6 inline-block bg-white/5 border border-white/10 rounded-2xl px-6 py-2">
              <p className="text-white font-bold text-lg">المركز: <span className="text-primary font-black text-xl">{medals[me] || `#${me + 1}`}</span></p>
            </div>
          ) : null}
        </div>

        {/* Winner Card */}
        {winner && !iWon && (
          <div className="game-card rounded-[2rem] p-8 mb-8 text-center border-2 border-yellow-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] animate-in slide-in-from-bottom-8 duration-700">
            <p className="text-yellow-500/80 font-black text-sm mb-2 uppercase tracking-widest">البطل</p>
            <h2 className="text-4xl font-black text-white mb-2">{winner.name}</h2>
            <div className="text-6xl font-black text-primary neon-text mt-4">{winner.totalScore}</div>
            <p className="text-muted-foreground font-bold mt-1">نقطة</p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="game-card rounded-3xl p-6 mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-150">
          <h3 className="font-black text-white text-xl mb-5 flex items-center gap-2">
            <span>🏅</span> الترتيب النهائي
          </h3>
          <div className="space-y-4">
            {sorted.map((player, idx) => {
              const barWidth = maxScore > 0 ? (player.totalScore / maxScore) * 100 : 0;
              const isMe = player.id === myPlayerId;
              
              return (
                <div
                  key={player.id}
                  className={`rounded-2xl p-4 transition-all ${
                    idx === 0 ? 'leaderboard-item first' :
                    idx === 1 ? 'leaderboard-item second' :
                    idx === 2 ? 'leaderboard-item third' : 'leaderboard-item'
                  } ${isMe ? 'ring-2 ring-primary/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.02]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl drop-shadow-md">{medals[idx] || <span className="text-lg font-black text-muted-foreground/50 w-8 text-center inline-block">#{idx + 1}</span>}</span>
                      <span className={`font-black text-lg ${isMe ? 'text-white' : 'text-white/90'}`}>
                        {player.name} {isMe && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mr-2">أنت</span>}
                      </span>
                    </div>
                    <span className={`text-2xl font-black ${idx === 0 ? 'text-primary neon-text' : 'text-white'}`}>
                      {player.totalScore}
                    </span>
                  </div>
                  
                  <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full rounded-full transition-all duration-1000 delay-500 ${
                      idx === 0 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                      idx === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-300' :
                      idx === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-500' :
                      'bg-gradient-to-r from-primary/50 to-primary/80'
                    }`} style={{ width: `${barWidth}%` }} />
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {player.roundScores.map((s, ri) => (
                      <span key={ri} className="text-[10px] font-bold bg-white/5 border border-white/10 text-muted-foreground/80 px-2 py-1 rounded-md">
                        ج{ri + 1}: <span className={s > 0 ? 'text-green-400' : ''}>{s}</span>
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
            className="w-full h-16 rounded-2xl shimmer-btn text-primary-foreground text-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-8 animate-in zoom-in delay-300"
          >
            🚌 العب تاني!
          </button>
        ) : (
          <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl mb-8 animate-pulse">
            <div className="text-3xl mb-3">🔄</div>
            <p className="text-white font-bold">بنستنى الهوست يبدأ لعبة جديدة...</p>
          </div>
        )}
      </div>
    </div>
  );
}
