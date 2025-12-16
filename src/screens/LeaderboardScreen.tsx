import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../services/api';

interface LeaderboardScreenProps {
  navigation: any;
}

interface LeaderboardEntry {
  username: string;
  totalScore: number;
  gamesWon: number;
  winRate: number;
  rank: number;
}

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) throw new Error('Failed to load leaderboard');
      const data = await response.json();
      setLeaderboard(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки рейтинга');
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Рейтинг игроков</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0a84ff" />
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadLeaderboard}>
              <Text style={styles.retryButtonText}>Повторить</Text>
            </Pressable>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Рейтинг пуст</Text>
            <Text style={styles.emptySubtext}>Станьте первым игроком!</Text>
          </View>
        ) : (
          <>
            {leaderboard.map((entry, index) => (
              <View
                key={index}
                style={[
                  styles.leaderboardItem,
                  index < 3 && styles.topThree,
                ]}
              >
                <View style={styles.rankContainer}>
                  <Text style={styles.rank}>{getRankIcon(entry.rank)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{entry.username}</Text>
                  <Text style={styles.userStats}>
                    {entry.totalScore} очков • {entry.gamesWon} побед • {entry.winRate}% побед
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Назад</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#ccc',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  leaderboardItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  topThree: {
    borderWidth: 2,
    borderColor: '#f1c40f',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 14,
    color: '#ccc',
  },
  backButton: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

