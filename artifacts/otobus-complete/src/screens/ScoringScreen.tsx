import type { RoomState } from "@/lib/gameTypes";
import { CATEGORY_LABELS } from "@/lib/gameTypes";

interface ScoringScreenProps {
  room: RoomState;
  myPlayerId: string;
  lastRoundScores: Record<string, number>;
  answersSnapshot: Record<string, Record<string, string>>;
  onNextRound: () => void;
  isHost: boolean;
}

export default function ScoringScreen({ room, myPlayerId, lastRoundScores, answersSnapshot, onNextRound, isHost }: ScoringScreenProps) {
  const sortedPlayers = [...room.players].sort(
    (a, b) => (lastRoundScores[b.id] || 0) - (lastRoundScores[a.id] || 0)
  );

  const lockerName = room.players.find(p => p.id === room.lockedBy)?.name;

  return (
    <div className="min-h-screen bg-background px-4 py-6 overflow-y-auto">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-black text-primary">نقاط الجولة {room.currentRound}</h2>
          <p className="text-muted-foreground text-sm">
            الحرف: <span className="text-primary font-bold">{room.currentLetter}</span>
            {lockerName && <> · ضغطها <span className="font-bold">{lockerName}</span></>}
          </p>
        </div>

        {/* Round Scores */}
        <div className="game-card rounded-2xl p-4 mb-4">
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => {
              const roundScore = lastRoundScores[player.id] || 0;
              const isMe = player.id === myPlayerId;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    isMe ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <div>
                      <p className="font-bold text-foreground">
                        {player.name} {isMe ? <span className="text-xs text-primary">(أنت)</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">الإجمالي: {player.totalScore} نقطة</p>
                    </div>
                  </div>
                  <span className={`text-xl font-black ${roundScore > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{roundScore}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answers Review */}
        {Object.keys(answersSnapshot).length > 0 && (
          <div className="game-card rounded-2xl p-4 mb-4">
            <h4 className="text-sm font-bold text-muted-foreground mb-3">إجابات اللاعبين:</h4>
            <div className="space-y-3">
              {room.categories.map(catId => (
                <div key={catId} className="bg-muted/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-bold">{CATEGORY_LABELS[catId]}</p>
                  <div className="space-y-1">
                    {room.players.map(player => {
                      const answer = answersSnapshot[player.id]?.[catId]?.trim() || '';
                      const score = lastRoundScores[player.id] || 0;
                      const isMe = player.id === myPlayerId;
                      return (
                        <div key={player.id} className="flex items-center justify-between">
                          <span className={`text-xs ${isMe ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                            {player.name}:
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            answer ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
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
          </div>
        )}

        {isHost ? (
          <button
            onClick={onNextRound}
            className="w-full h-14 rounded-2xl shimmer-btn text-primary-foreground text-lg font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {room.currentRound >= room.totalRounds
              ? '🏆 النتيجة النهائية'
              : `🎮 الجولة القادمة (${room.currentRound + 1}/${room.totalRounds})`}
          </button>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-2xl">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground text-sm">بنستنى الهوست يكمل...</p>
          </div>
        )}
      </div>
    </div>
  );
}
