import type { RoomState } from "@/lib/gameTypes";
import { CATEGORY_LABELS } from "@/lib/gameTypes";

interface ScoringScreenProps {
  room: RoomState;
  myPlayerId: string;
  lastRoundScores: Record<string, number>;
  answersSnapshot: Record<string, Record<string, string>>;
  onNextRound: () => void;
  isHost: boolean;
  validityMap?: Record<string, Record<string, boolean>>;
}

export default function ScoringScreen({ room, myPlayerId, lastRoundScores, answersSnapshot, onNextRound, isHost, validityMap }: ScoringScreenProps) {
  const sortedPlayers = [...room.players].sort(
    (a, b) => (lastRoundScores[b.id] || 0) - (lastRoundScores[a.id] || 0)
  );

  const lockerName = room.players.find(p => p.id === room.lockedBy)?.name;

  return (
    <div className="min-h-screen px-4 py-6 overflow-y-auto relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background -z-10 pointer-events-none" />
      
      <div className="max-w-sm mx-auto z-10 relative">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3" style={{textShadow: '0 0 30px rgba(245,158,11,0.5)'}}>🏆</div>
          <h2 className="text-3xl font-black text-primary neon-text mb-2">نقاط الجولة {room.currentRound}</h2>
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-5 py-2 border border-white/10 mt-2">
            <p className="text-white font-bold text-sm flex items-center gap-2">
              الحرف: <span className="text-primary text-2xl font-black">{room.currentLetter}</span>
            </p>
            {lockerName && (
              <p className="text-muted-foreground/80 text-xs mt-1 border-t border-white/10 pt-1">
                ضغطها <span className="font-bold text-white">{lockerName}</span> 🛑
              </p>
            )}
          </div>
        </div>

        {/* Round Scores */}
        <div className="game-card rounded-3xl p-5 mb-6">
          <h3 className="font-black text-white text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">⭐</span> ترتيب الجولة
          </h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, idx) => {
              const roundScore = lastRoundScores[player.id] || 0;
              const isMe = player.id === myPlayerId;
              const isTop = idx === 0 && roundScore > 0;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                    isMe ? 'bg-primary/20 border border-primary/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 
                    isTop ? 'bg-white/10 border border-yellow-500/30' : 'bg-white/5 border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center text-2xl drop-shadow-md">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-lg font-bold text-muted-foreground/50">#{idx + 1}</span>}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg">
                        {player.name} {isMe && <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full mr-2">أنت</span>}
                      </p>
                      <p className="text-xs text-muted-foreground font-bold mt-0.5">الإجمالي: <span className="text-white">{player.totalScore}</span></p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-xl font-black text-xl flex items-center justify-center min-w-[3.5rem] ${
                    roundScore > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-muted-foreground/50 border border-white/10'
                  }`}>
                    +{roundScore}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answers Review */}
        {Object.keys(answersSnapshot).length > 0 && (
          <div className="game-card rounded-3xl p-5 mb-8">
            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">📝</span> مراجعة الإجابات
            </h4>
            <div className="space-y-4">
              {room.categories.map(catId => (
                <div key={catId} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <p className="text-sm text-primary font-black mb-3 border-b border-white/10 pb-2">{CATEGORY_LABELS[catId]}</p>
                  <div className="space-y-2.5">
                    {room.players.map(player => {
                      const answer = answersSnapshot[player.id]?.[catId]?.trim() || '';
                      const isMe = player.id === myPlayerId;
                      // Determine validity if map exists, else fallback to visual only based on presence
                      const isValid = validityMap ? validityMap[player.id]?.[catId] : (answer.length > 0 && answer.startsWith(room.currentLetter));
                      
                      return (
                        <div key={player.id} className="flex items-center justify-between group hover:bg-white/5 p-1.5 -mx-1.5 rounded-lg transition-colors">
                          <span className={`text-sm font-bold ${isMe ? 'text-white' : 'text-muted-foreground'}`}>
                            {player.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                              !answer ? 'bg-white/5 text-muted-foreground/50' :
                              isValid ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {answer || '—'}
                            </span>
                            {answer && (
                              <span className="text-sm">
                                {isValid ? '✅' : '❌'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isHost ? (
          <button
            onClick={onNextRound}
            className="w-full h-16 rounded-2xl shimmer-btn text-primary-foreground text-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mb-6"
          >
            {room.currentRound >= room.totalRounds
              ? '🏆 النتيجة النهائية'
              : `🎮 الجولة القادمة (${room.currentRound + 1}/${room.totalRounds})`}
          </button>
        ) : (
          <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl mb-6 animate-pulse">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-white font-bold">بنستنى الهوست يكمل...</p>
          </div>
        )}
      </div>
    </div>
  );
}
