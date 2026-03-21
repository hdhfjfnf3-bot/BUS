import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { logger } from '../lib/logger.js';
import { calculateRoundScores } from './gameLogic.js';
import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomBySocketId,
  removePlayerFromRoom,
  startGame,
  lockRoom,
  updateAnswer,
  advanceRound,
  resetRoom,
} from './roomManager.js';

function getRoomState(code: string) {
  const room = getRoom(code);
  if (!room) return null;
  return {
    code: room.code,
    phase: room.phase,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      totalScore: p.totalScore,
      roundScores: p.roundScores,
      isHost: p.isHost,
      answers: p.answers,
    })),
    categories: room.categories,
    totalRounds: room.totalRounds,
    currentRound: room.currentRound,
    currentLetter: room.currentLetter,
    lockedBy: room.lockedBy,
    roundResults: room.roundResults,
    timeLimit: room.timeLimit,
  };
}

export function setupSocketIO(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket.io',
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected');

    socket.on('create_room', (data: {
      playerName: string;
      categories: string[];
      totalRounds: number;
      timeLimit: number;
    }, callback) => {
      try {
        const { room, player } = createRoom(socket.id, data.playerName, data.categories, data.totalRounds, data.timeLimit);
        socket.join(room.code);
        callback({ success: true, roomCode: room.code, playerId: player.id, room: getRoomState(room.code) });
      } catch (err) {
        logger.error({ err }, 'Error creating room');
        callback({ success: false, error: 'حصل خطأ في إنشاء الغرفة' });
      }
    });

    socket.on('join_room', (data: { code: string; playerName: string }, callback) => {
      try {
        const result = joinRoom(data.code, socket.id, data.playerName);
        if ('error' in result) { callback({ success: false, error: result.error }); return; }
        const { room, player } = result;
        socket.join(room.code);
        io.to(room.code).emit('room_updated', getRoomState(room.code));
        callback({ success: true, roomCode: room.code, playerId: player.id, room: getRoomState(room.code) });
      } catch (err) {
        logger.error({ err }, 'Error joining room');
        callback({ success: false, error: 'حصل خطأ في الانضمام للغرفة' });
      }
    });

    socket.on('start_game', (data: { code: string }, callback) => {
      try {
        const room = getRoom(data.code);
        if (!room) { callback({ success: false, error: 'الغرفة مش موجودة' }); return; }
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player?.isHost) { callback({ success: false, error: 'بس الهوست يقدر يبدأ' }); return; }
        if (room.players.length < 2) { callback({ success: false, error: 'محتاج لاعبين على الأقل' }); return; }
        const updatedRoom = startGame(data.code);
        if (!updatedRoom) { callback({ success: false, error: 'مش قادر يبدأ' }); return; }
        io.to(data.code).emit('game_started', getRoomState(data.code));
        callback({ success: true });
      } catch (err) {
        logger.error({ err }, 'Error starting game');
        callback({ success: false, error: 'حصل خطأ' });
      }
    });

    socket.on('otobus_complete', (data: { code: string }, callback) => {
      try {
        const updatedRoom = lockRoom(data.code, socket.id);
        if (!updatedRoom) { callback?.({ success: false }); return; }
        
        // Calculate scores immediately and broadcast
        const room = getRoom(data.code);
        if (!room) return;
        const scores = calculateRoundScores(room.players, room.categories, room.currentLetter);
        
        // Collect answers snapshot
        const answersSnapshot: Record<string, Record<string, string>> = {};
        room.players.forEach(p => { answersSnapshot[p.id] = { ...p.answers }; });

        const state = getRoomState(data.code);
        io.to(data.code).emit('game_locked', { ...state, roundScores: scores, answersSnapshot });
        callback?.({ success: true });
      } catch (err) {
        logger.error({ err }, 'Error locking room');
      }
    });

    socket.on('update_answer', (data: { code: string; category: string; value: string }) => {
      updateAnswer(data.code, socket.id, data.category, data.value);
    });

    socket.on('next_round', (data: { code: string }, callback) => {
      try {
        const room = getRoom(data.code);
        if (!room) { callback?.({ success: false, error: 'الغرفة مش موجودة' }); return; }
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player?.isHost) { callback?.({ success: false, error: 'بس الهوست يقدر يكمل' }); return; }
        const result = advanceRound(data.code);
        if (!result) { callback?.({ success: false }); return; }
        const { isFinal } = result;
        const state = getRoomState(data.code);
        if (isFinal) {
          io.to(data.code).emit('game_over', state);
        } else {
          io.to(data.code).emit('round_started', state);
        }
        callback?.({ success: true, isFinal });
      } catch (err) {
        logger.error({ err }, 'Error advancing round');
        callback?.({ success: false });
      }
    });

    socket.on('reset_game', (data: { code: string }, callback) => {
      try {
        const room = getRoom(data.code);
        if (!room) { callback?.({ success: false }); return; }
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player?.isHost) { callback?.({ success: false }); return; }
        const updatedRoom = resetRoom(data.code);
        if (!updatedRoom) { callback?.({ success: false }); return; }
        io.to(data.code).emit('game_reset', getRoomState(data.code));
        callback?.({ success: true });
      } catch (err) {
        logger.error({ err }, 'Error resetting game');
      }
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected');
      const result = removePlayerFromRoom(socket.id);
      if (result) {
        io.to(result.room.code).emit('room_updated', getRoomState(result.room.code));
      }
    });
  });

  return io;
}
