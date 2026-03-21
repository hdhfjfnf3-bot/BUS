import { Room, Player, generateRoomCode, getRandomLetter, clearLetterCache, calculateRoundScores } from './gameLogic.js';

const rooms = new Map<string, Room>();

export function createRoom(
  hostSocketId: string,
  hostName: string,
  categories: string[],
  totalRounds: number,
  timeLimit: number
): { room: Room; player: Player } {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  const host: Player = {
    id: `p_${hostSocketId.slice(0, 8)}`,
    socketId: hostSocketId,
    name: hostName,
    totalScore: 0,
    roundScores: [],
    isHost: true,
    answers: {},
    isReady: false,
  };

  const room: Room = {
    code,
    phase: 'lobby',
    players: [host],
    categories,
    totalRounds,
    currentRound: 0,
    currentLetter: '',
    lockedBy: null,
    roundResults: [],
    timeLimit,
  };

  rooms.set(code, room);
  return { room, player: host };
}

export function joinRoom(
  code: string,
  socketId: string,
  playerName: string
): { room: Room; player: Player } | { error: string } {
  const room = rooms.get(code.toUpperCase());
  if (!room) return { error: 'الغرفة دي مش موجودة' };
  if (room.phase !== 'lobby') return { error: 'اللعبة ابتدت خلاص' };
  if (room.players.length >= 10) return { error: 'الغرفة ممتلية (10 لاعبين)' };
  if (room.players.some(p => p.name.trim().toLowerCase() === playerName.trim().toLowerCase())) {
    return { error: 'في حد تاني باسمك في الغرفة دي' };
  }

  const player: Player = {
    id: `p_${socketId.slice(0, 8)}`,
    socketId,
    name: playerName.trim(),
    totalScore: 0,
    roundScores: [],
    isHost: false,
    answers: {},
    isReady: false,
  };

  room.players.push(player);
  return { room, player };
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.socketId === socketId)) {
      return room;
    }
  }
  return undefined;
}

export function removePlayerFromRoom(socketId: string): { room: Room; wasHost: boolean } | null {
  const room = getRoomBySocketId(socketId);
  if (!room) return null;

  const playerIndex = room.players.findIndex(p => p.socketId === socketId);
  if (playerIndex === -1) return null;

  const wasHost = room.players[playerIndex].isHost;
  room.players.splice(playerIndex, 1);

  if (room.players.length === 0) {
    clearLetterCache(room.code);
    rooms.delete(room.code);
    return null;
  }

  if (wasHost && room.players.length > 0) {
    room.players[0].isHost = true;
  }

  return { room, wasHost };
}

export function startGame(code: string): Room | null {
  const room = rooms.get(code);
  if (!room || room.phase !== 'lobby') return null;

  room.phase = 'playing';
  room.currentRound = 1;
  room.currentLetter = getRandomLetter(code);
  room.players.forEach(p => { p.answers = {}; });
  return room;
}

export function lockRoom(code: string, lockedBySocketId: string): Room | null {
  const room = rooms.get(code);
  if (!room || room.phase !== 'playing') return null;

  const player = room.players.find(p => p.socketId === lockedBySocketId);
  if (!player) return null;

  room.phase = 'locked';
  room.lockedBy = player.id;
  return room;
}

export function updateAnswer(
  code: string,
  socketId: string,
  category: string,
  value: string
): boolean {
  const room = rooms.get(code);
  if (!room || room.phase !== 'playing') return false;

  const player = room.players.find(p => p.socketId === socketId);
  if (!player) return false;

  player.answers[category] = value;
  return true;
}

export function advanceRound(code: string): {
  room: Room;
  scores: Record<string, number>;
  validityMap: Record<string, Record<string, boolean>>;
  isFinal: boolean;
} | null {
  const room = rooms.get(code);
  if (!room || room.phase !== 'locked') return null;

  const { scores, validityMap } = calculateRoundScores(room.players, room.categories, room.currentLetter);

  const answersSnapshot: Record<string, Record<string, string>> = {};
  room.players.forEach(p => {
    answersSnapshot[p.id] = { ...p.answers };
  });

  room.roundResults.push({
    letter: room.currentLetter,
    roundNumber: room.currentRound,
    scores,
    answers: answersSnapshot,
    validityMap,
  });

  room.players.forEach(p => {
    p.totalScore += scores[p.id] || 0;
    p.roundScores.push(scores[p.id] || 0);
  });

  const isFinal = room.currentRound >= room.totalRounds;

  if (isFinal) {
    room.phase = 'final';
    clearLetterCache(room.code);
  } else {
    room.currentRound += 1;
    room.currentLetter = getRandomLetter(code);
    room.phase = 'playing';
    room.lockedBy = null;
    room.players.forEach(p => { p.answers = {}; });
  }

  return { room, scores, validityMap, isFinal };
}

export function resetRoom(code: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;

  clearLetterCache(code);
  room.phase = 'lobby';
  room.currentRound = 0;
  room.currentLetter = '';
  room.lockedBy = null;
  room.roundResults = [];
  room.players.forEach(p => {
    p.totalScore = 0;
    p.roundScores = [];
    p.answers = {};
  });

  return room;
}
