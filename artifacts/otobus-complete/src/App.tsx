import { useState, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SetupScreen from "@/components/SetupScreen";
import GameScreen from "@/components/GameScreen";
import FinalResults from "@/components/FinalResults";
import { getRandomLetter, calculateRoundScores } from "@/lib/gameData";
import type { GameState, Player, RoundResult } from "@/lib/gameStore";
import { createInitialState } from "@/lib/gameStore";

const queryClient = new QueryClient();

function Game() {
  const [state, setState] = useState<GameState>(createInitialState());

  const handleStart = useCallback((playerNames: string[], categories: string[], rounds: number, timeLimit: number) => {
    const players: Player[] = playerNames.map((name, i) => ({
      id: `player_${i}`,
      name,
      totalScore: 0,
      roundScores: [],
    }));

    const initialAnswers: Record<string, Record<string, string>> = {};
    players.forEach(p => {
      initialAnswers[p.id] = {};
      categories.forEach(cat => { initialAnswers[p.id][cat] = ''; });
    });

    setState({
      ...createInitialState(),
      phase: 'playing',
      players,
      categories,
      totalRounds: rounds,
      currentRound: 1,
      currentLetter: getRandomLetter(),
      isLocked: false,
      lockedBy: null,
      currentAnswers: initialAnswers,
      timeLimit,
      timeLeft: timeLimit,
    });
  }, []);

  const handleStop = useCallback((lockedBy: string) => {
    setState(prev => ({
      ...prev,
      isLocked: true,
      lockedBy,
    }));
  }, []);

  const handleUpdateAnswer = useCallback((playerId: string, category: string, value: string) => {
    setState(prev => {
      if (prev.isLocked) return prev;
      return {
        ...prev,
        currentAnswers: {
          ...prev.currentAnswers,
          [playerId]: {
            ...prev.currentAnswers[playerId],
            [category]: value,
          },
        },
      };
    });
  }, []);

  const handleNextRound = useCallback(() => {
    setState(prev => {
      const roundScores = calculateRoundScores(
        prev.currentAnswers,
        prev.players.map(p => p.id),
        prev.categories,
        prev.currentLetter
      );

      const updatedPlayers = prev.players.map(p => ({
        ...p,
        totalScore: p.totalScore + (roundScores[p.id] || 0),
        roundScores: [...p.roundScores, roundScores[p.id] || 0],
      }));

      const roundResult: RoundResult = {
        letter: prev.currentLetter,
        roundNumber: prev.currentRound,
        answers: prev.currentAnswers,
        scores: roundScores,
      };

      const isLastRound = prev.currentRound >= prev.totalRounds;

      if (isLastRound) {
        return {
          ...prev,
          phase: 'final',
          players: updatedPlayers,
          roundResults: [...prev.roundResults, roundResult],
          roundScores,
        };
      }

      const newAnswers: Record<string, Record<string, string>> = {};
      updatedPlayers.forEach(p => {
        newAnswers[p.id] = {};
        prev.categories.forEach(cat => { newAnswers[p.id][cat] = ''; });
      });

      return {
        ...prev,
        phase: 'playing',
        players: updatedPlayers,
        currentRound: prev.currentRound + 1,
        currentLetter: getRandomLetter(),
        isLocked: false,
        lockedBy: null,
        currentAnswers: newAnswers,
        roundResults: [...prev.roundResults, roundResult],
        roundScores,
      };
    });
  }, []);

  const handleRestart = useCallback(() => {
    setState(createInitialState());
  }, []);

  if (state.phase === 'setup') {
    return <SetupScreen state={state} onStart={handleStart} />;
  }

  if (state.phase === 'playing') {
    return (
      <GameScreen
        state={state}
        onStop={handleStop}
        onUpdateAnswer={handleUpdateAnswer}
        onNextRound={handleNextRound}
      />
    );
  }

  if (state.phase === 'final') {
    return <FinalResults state={state} onRestart={handleRestart} />;
  }

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={Game} />
          <Route path="*" component={Game} />
        </Switch>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
