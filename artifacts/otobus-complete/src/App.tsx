import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@/lib/gameTypes";
import HomeScreen from "@/screens/HomeScreen";
import LobbyScreen from "@/screens/LobbyScreen";
import PlayingScreen from "@/screens/PlayingScreen";
import ScoringScreen from "@/screens/ScoringScreen";
import FinalScreen from "@/screens/FinalScreen";

interface AppState {
  myPlayerId: string | null;
  myRoomCode: string | null;
  room: RoomState | null;
  showScores: boolean;
  lastRoundScores: Record<string, number>;
  lastValidityMap: Record<string, Record<string, boolean>>;
  answersSnapshot: Record<string, Record<string, string>>;
  localAnswers: Record<string, string>;
  isConnecting: boolean;
}

const defaultState: AppState = {
  myPlayerId: null,
  myRoomCode: null,
  room: null,
  showScores: false,
  lastRoundScores: {},
  lastValidityMap: {},
  answersSnapshot: {},
  localAnswers: {},
  isConnecting: false,
};

export default function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const answerDebounce = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const roomCodeRef = useRef<string | null>(null);

  useEffect(() => {
    roomCodeRef.current = state.myRoomCode;
  }, [state.myRoomCode]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('room_updated', (room: RoomState) => {
      setState(prev => ({ ...prev, room }));
    });

    socket.on('game_started', (room: RoomState) => {
      setState(prev => ({
        ...prev,
        room,
        showScores: false,
        lastRoundScores: {},
        lastValidityMap: {},
        answersSnapshot: {},
        localAnswers: {},
      }));
    });

    socket.on('game_locked', (data: RoomState & {
      roundScores: Record<string, number>;
      answersSnapshot: Record<string, Record<string, string>>;
      validityMap: Record<string, Record<string, boolean>>;
    }) => {
      const { roundScores, answersSnapshot, validityMap, ...room } = data;
      setState(prev => ({
        ...prev,
        room: room as RoomState,
        showScores: true,
        lastRoundScores: roundScores,
        lastValidityMap: validityMap || {},
        answersSnapshot,
      }));
    });

    socket.on('round_started', (room: RoomState) => {
      setState(prev => ({
        ...prev,
        room,
        showScores: false,
        lastRoundScores: {},
        lastValidityMap: {},
        answersSnapshot: {},
        localAnswers: {},
      }));
    });

    socket.on('game_over', (room: RoomState) => {
      setState(prev => ({
        ...prev,
        room,
        showScores: false,
      }));
    });

    socket.on('game_reset', (room: RoomState) => {
      setState(prev => ({
        ...prev,
        room,
        showScores: false,
        lastRoundScores: {},
        lastValidityMap: {},
        answersSnapshot: {},
        localAnswers: {},
      }));
    });

    return () => {
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('game_locked');
      socket.off('round_started');
      socket.off('game_over');
      socket.off('game_reset');
    };
  }, []);

  const handleCreateRoom = useCallback((
    playerName: string,
    categories: string[],
    totalRounds: number,
    timeLimit: number
  ) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    const socket = getSocket();
    socket.emit('create_room', { playerName, categories, totalRounds, timeLimit }, (res: {
      success: boolean; error?: string; roomCode?: string; playerId?: string; room?: RoomState;
    }) => {
      if (!res.success || !res.room) {
        setState(prev => ({ ...prev, isConnecting: false }));
        alert(res.error || 'حصل خطأ');
        return;
      }
      setState(prev => ({
        ...prev,
        isConnecting: false,
        myPlayerId: res.playerId!,
        myRoomCode: res.roomCode!,
        room: res.room!,
        localAnswers: {},
        lastRoundScores: {},
        lastValidityMap: {},
        answersSnapshot: {},
        showScores: false,
      }));
    });
  }, []);

  const handleJoinRoom = useCallback((code: string, playerName: string) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    const socket = getSocket();
    socket.emit('join_room', { code, playerName }, (res: {
      success: boolean; error?: string; roomCode?: string; playerId?: string; room?: RoomState;
    }) => {
      if (!res.success || !res.room) {
        setState(prev => ({ ...prev, isConnecting: false }));
        alert(res.error || 'مش قادر تنضم للغرفة دي');
        return;
      }
      setState(prev => ({
        ...prev,
        isConnecting: false,
        myPlayerId: res.playerId!,
        myRoomCode: res.roomCode!,
        room: res.room!,
        localAnswers: {},
        lastRoundScores: {},
        lastValidityMap: {},
        answersSnapshot: {},
        showScores: false,
      }));
    });
  }, []);

  const handleStartGame = useCallback(() => {
    const code = roomCodeRef.current;
    if (!code) return;
    getSocket().emit('start_game', { code }, () => {});
  }, []);

  const handleOtobusComplete = useCallback(() => {
    const code = roomCodeRef.current;
    if (!code) return;
    getSocket().emit('otobus_complete', { code }, () => {});
  }, []);

  const handleAnswerChange = useCallback((category: string, value: string) => {
    setState(prev => ({
      ...prev,
      localAnswers: { ...prev.localAnswers, [category]: value },
    }));

    const code = roomCodeRef.current;
    if (!code) return;

    if (answerDebounce.current[category]) {
      clearTimeout(answerDebounce.current[category]);
    }
    answerDebounce.current[category] = setTimeout(() => {
      getSocket().emit('update_answer', { code, category, value });
    }, 200);
  }, []);

  const handleNextRound = useCallback(() => {
    const code = roomCodeRef.current;
    if (!code) return;
    getSocket().emit('next_round', { code }, () => {});
  }, []);

  const handleRestart = useCallback(() => {
    const code = roomCodeRef.current;
    if (!code) return;
    getSocket().emit('reset_game', { code }, () => {});
  }, []);

  const { room, myPlayerId, showScores, lastRoundScores, lastValidityMap, answersSnapshot, localAnswers, isConnecting } = state;

  if (!room || !myPlayerId) {
    return (
      <HomeScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isConnecting={isConnecting}
      />
    );
  }

  const me = room.players.find(p => p.id === myPlayerId);
  const isHost = me?.isHost || false;

  if (room.phase === 'lobby') {
    return <LobbyScreen room={room} myPlayerId={myPlayerId} onStartGame={handleStartGame} />;
  }

  if (room.phase === 'playing' && !showScores) {
    return (
      <PlayingScreen
        room={room}
        myPlayerId={myPlayerId}
        localAnswers={localAnswers}
        onAnswerChange={handleAnswerChange}
        onOtobusComplete={handleOtobusComplete}
      />
    );
  }

  if (room.phase === 'locked' && showScores) {
    return (
      <ScoringScreen
        room={room}
        myPlayerId={myPlayerId}
        lastRoundScores={lastRoundScores}
        validityMap={lastValidityMap}
        answersSnapshot={answersSnapshot}
        onNextRound={handleNextRound}
        isHost={isHost}
      />
    );
  }

  if (room.phase === 'final') {
    return <FinalScreen room={room} myPlayerId={myPlayerId} isHost={isHost} onRestart={handleRestart} />;
  }

  return null;
}
