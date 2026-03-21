import { CATEGORY_LABELS } from "@/lib/gameTypes";
import type { RoomState } from "@/lib/gameTypes";

interface LobbyScreenProps {
  room: RoomState;
  myPlayerId: string;
  onStartGame: () => void;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

export default function LobbyScreen({ room, myPlayerId, onStartGame }: LobbyScreenProps) {
  const me = room.players.find(p => p.id === myPlayerId);
  const isHost = me?.isHost;

  const shareUrl = window.location.origin;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background -z-10 pointer-events-none" />
      
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 bus-icon-pulse">🚌</div>
          <h1 className="text-4xl font-black text-primary neon-text">غرفة الانتظار</h1>
        </div>

        {/* Room Code */}
        <div className="game-card rounded-3xl p-6 mb-6 text-center">
          <p className="text-muted-foreground/80 font-bold text-sm mb-4">كود الغرفة - شاركه مع أصحابك</p>
          <div className="flex justify-center gap-3 mb-5" style={{direction:'ltr'}}>
            {room.code.split('').map((char, i) => (
              <div key={i} className="otp-box">
                {char}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 mb-3 font-medium">يدخلوا على نفس الموقع ويضغطوا "انضم لغرفة"</p>
          <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground break-all select-all font-mono" style={{direction:'ltr'}}>
            {shareUrl}
          </div>
        </div>

        {/* Players */}
        <div className="game-card rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-white text-lg flex items-center gap-2">
              <span className="text-xl">👥</span> اللاعبين
            </h3>
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/30">
              {room.players.length}/10
            </span>
          </div>
          <div className="space-y-3">
            {room.players.map((player, idx) => {
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                    player.id === myPlayerId ? 'bg-primary/10 border border-primary/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-white/5 border border-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-black text-white text-lg shadow-lg`}>
                    {player.name.charAt(0)}
                  </div>
                  <span className="font-bold text-white text-lg">{player.name}</span>
                  {player.id === myPlayerId && (
                    <span className="text-xs bg-primary text-primary-foreground font-black px-2.5 py-1 rounded-full mr-auto">أنت</span>
                  )}
                  {player.isHost && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold px-2.5 py-1 rounded-full mr-auto">👑 هوست</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Settings */}
        <div className="game-card rounded-3xl p-5 mb-8">
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-muted-foreground">الجولات:</span>
              <span className="text-primary">{room.totalRounds}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-muted-foreground">الوقت:</span>
              <span className="text-primary">{room.timeLimit}ث</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 w-full mt-1">
              <span className="text-muted-foreground whitespace-nowrap">الأقسام:</span>
              <span className="text-primary truncate">{room.categories.map(c => CATEGORY_LABELS[c]).join('، ')}</span>
            </div>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={room.players.length < 2}
            className={`w-full h-16 rounded-2xl text-2xl font-black transition-all shadow-xl mb-4 ${
              room.players.length >= 2
                ? 'shimmer-btn text-primary-foreground hover:scale-[1.03] active:scale-[0.98]'
                : 'bg-white/5 text-muted-foreground/50 cursor-not-allowed border border-white/5'
            }`}
          >
            {room.players.length < 2 ? 'انتظر لاعب تاني...' : '🚌 ابدأ اللعبة!'}
          </button>
        ) : (
          <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl mb-4 animate-pulse">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-white font-bold">بنستنى الهوست يبدأ اللعبة...</p>
          </div>
        )}
      </div>
    </div>
  );
}
