import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from '../services/game';

interface ProgressScreenProps {
  navigation: any;
}

interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  averageAttempts: number;
  distribution: Record<number, number>;
}

export default function ProgressScreen({ navigation }: ProgressScreenProps) {
  const [stats, setStats] = useState<Statistics>({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalScore: 0,
    averageAttempts: 0,
    distribution: {},
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      try {
        const progress = await gameService.getProgress();
        setStats({
          gamesPlayed: progress.gamesPlayed,
          gamesWon: progress.gamesWon,
          currentStreak: progress.currentStreak,
          bestStreak: progress.bestStreak,
          totalScore: progress.totalScore,
          averageAttempts: progress.averageAttempts,
          distribution: progress.distribution || {},
        });
      } catch (error) {
        console.log('Backend unavailable, loading local stats');
        const saved = await AsyncStorage.getItem('statistics');
        if (saved) {
          setStats(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Статистика</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Игр сыграно</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Процент побед</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Текущая серия</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.bestStreak}</Text>
            <Text style={styles.statLabel}>Лучшая серия</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Общий счет</Text>
          <Text style={styles.score}>{stats.totalScore}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Среднее количество попыток</Text>
          <Text style={styles.attempts}>
            {stats.averageAttempts > 0 ? stats.averageAttempts.toFixed(1) : '—'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Распределение побед</Text>
          {Object.keys(stats.distribution).length > 0 ? (
            Object.entries(stats.distribution)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([attempts, count]) => (
                <View key={attempts} style={styles.distributionRow}>
                  <Text style={styles.distributionLabel}>{attempts} попытка</Text>
                  <View style={styles.distributionBarContainer}>
                    <View
                      style={[
                        styles.distributionBar,
                        {
                          width: `${(count / stats.gamesWon) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.distributionValue}>{count}</Text>
                </View>
              ))
          ) : (
            <Text style={styles.emptyText}>Нет данных</Text>
          )}
        </View>

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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0a84ff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2ecc71',
  },
  attempts: {
    fontSize: 36,
    fontWeight: '600',
    color: '#f1c40f',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  distributionLabel: {
    width: 100,
    fontSize: 14,
    color: '#ccc',
  },
  distributionBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    backgroundColor: '#0a84ff',
    borderRadius: 10,
  },
  distributionValue: {
    width: 30,
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
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

