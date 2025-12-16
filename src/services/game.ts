import { apiRequest } from './api';

export interface GameResult {
  attempts: number;
  won: boolean;
  score: number;
  word: string;
}

export interface GameProgress {
  userId: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  averageAttempts: number;
  distribution: Record<number, number>;
}

export interface LeaderboardEntry {
  username: string;
  totalScore: number;
  gamesWon: number;
  winRate: number;
  rank: number;
}

class GameService {
  async saveGameResult(result: GameResult): Promise<void> {
    const response = await apiRequest<{ success: boolean }>('/games', {
      method: 'POST',
      body: JSON.stringify(result),
    });
    if (!response.success) {
      throw new Error('Failed to save game result');
    }
  }

  async getProgress(): Promise<GameProgress> {
    const response = await apiRequest<{ success: boolean } & GameProgress>('/games/progress');
    if (!response.success) {
      throw new Error('Failed to load progress');
    }
    return {
      userId: response.userId,
      totalScore: response.totalScore,
      gamesPlayed: response.gamesPlayed,
      gamesWon: response.gamesWon,
      currentStreak: response.currentStreak,
      bestStreak: response.bestStreak,
      averageAttempts: response.averageAttempts,
      distribution: response.distribution,
    };
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return apiRequest<LeaderboardEntry[]>('/leaderboard');
  }

  async updateStatistics(stats: Partial<GameProgress>): Promise<void> {
    await apiRequest('/games/statistics', {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  }
}

export const gameService = new GameService();

