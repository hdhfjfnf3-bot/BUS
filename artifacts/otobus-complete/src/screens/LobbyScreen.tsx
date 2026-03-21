import { CATEGORY_LABELS } from "@/lib/gameTypes";
import type { RoomState } from "@/lib/gameTypes";

interface LobbyScreenProps {
  room: RoomState;
  myPlayerId: string;
  onStartGame: () => void;
}

export default function LobbyScreen({ room, myPlayerId, onStartGame }: LobbyScreenProps) {
  const me = room.players.find(p => p.id === myPlayerId);
  const isHost = me?.isHost;

  const shareUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 bus-icon-pulse">🚌</div>
          <h1 className="text-3xl font-black text-primary">أتوبيس كومبليت</h1>
        </div>

        {/* Room Code */}
        <div className="game-card rounded-2xl p-5 mb-5 text-center">
          <p className="text-muted-foreground text-sm mb-2">كود الغرفة - شاركه مع أصحابك</p>
          <div className="text-5xl font-black tracking-[0.3em] text-primary neon-text mb-3" style={{direction:'ltr'}}>
            {room.code}
          </div>
          <p className="text-xs text-muted-foreground mb-3">يدخلوا على نفس الموقع ويضغطوا "انضم لغرفة"</p>
          <div className="bg-muted/30 rounded-xl px-3 py-2 text-xs text-muted-foreground break-all" style={{direction:'ltr'}}>
            {shareUrl}
          </div>
        </div>

        {/* Players */}
        <div className="game-card rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">👥 اللاعبين</h3>
            <span className="text-muted-foreground text-sm">{room.players.length}/10</span>
          </div>
          <div className="space-y-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  player.id === myPlayerId ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                  {player.name.charAt(0)}
                </div>
                <span className="font-medium text-foreground">{player.name}</span>
                {player.id === myPlayerId && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mr-auto">أنت</span>
                )}
                {player.isHost && (
                  <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full mr-auto">🎮 هوست</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Settings */}
        <div className="game-card rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">الجولات:</span>
              <span className="font-bold text-primary">{room.totalRounds}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">الوقت:</span>
              <span className="font-bold text-primary">{room.timeLimit}ث</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">الأقسام:</span>
              <span className="font-bold text-primary">{room.categories.map(c => CATEGORY_LABELS[c]).join('، ')}</span>
            </div>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={room.players.length < 2}
            className={`w-full h-14 rounded-2xl text-xl font-black transition-all ${
              room.players.length >= 2
                ? 'shimmer-btn text-primary-foreground hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            {room.players.length < 2 ? 'انتظر لاعب تاني...' : '🚌 ابدأ اللعبة!'}
          </button>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-2xl">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">بنستنى الهوست يبدأ اللعبة...</p>
          </div>
        )}
      </div>
    </div>
  );
}
