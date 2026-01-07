import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from '../services/game';

interface SettingsScreenProps {
  navigation: any;
}

interface Settings {
  soundEnabled: boolean;
  language: string;
  difficulty: string;
  notificationsEnabled: boolean;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    language: 'ru',
    difficulty: 'MEDIUM',
    notificationsEnabled: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Настройки сохранены', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const syncResults = async () => {
    setIsSyncing(true);
    try {
      // Загружаем статистику с сервера
      const progress = await gameService.getProgress();

      // Обновляем локальное хранилище
      const stats = {
        gamesPlayed: progress.gamesPlayed,
        gamesWon: progress.gamesWon,
        currentStreak: progress.currentStreak,
        bestStreak: progress.bestStreak,
        totalScore: progress.totalScore,
        averageAttempts: progress.averageAttempts,
        distribution: progress.distribution,
      };

      await AsyncStorage.setItem('statistics', JSON.stringify(stats));

      if (Platform.OS === 'android') {
        ToastAndroid.show('Результаты синхронизированы', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Sync error:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Ошибка синхронизации', ToastAndroid.SHORT);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Настройки</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Звук</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Включить звуки</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
              trackColor={{ false: '#767577', true: '#0a84ff' }}
              thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Язык</Text>
          <Picker
            selectedValue={settings.language}
            onValueChange={(value) => updateSetting('language', value)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Русский" value="ru" />
            <Picker.Item label="English" value="en" />
          </Picker>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сложность по умолчанию</Text>
          <Picker
            selectedValue={settings.difficulty}
            onValueChange={(value) => updateSetting('difficulty', value)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Легкая" value="EASY" />
            <Picker.Item label="Средняя" value="MEDIUM" />
            <Picker.Item label="Сложная" value="HARD" />
          </Picker>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уведомления</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Включить уведомления</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSetting('notificationsEnabled', value)}
              trackColor={{ false: '#767577', true: '#0a84ff' }}
              thumbColor={settings.notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Данные</Text>
          <Pressable
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={syncResults}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.syncButtonText}>🔄 Синхронизировать результаты с сервером</Text>
            )}
          </Pressable>
          <Text style={styles.syncHint}>
            Загрузить актуальную статистику с сервера
          </Text>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  picker: {
    width: '100%',
    color: '#fff',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  syncButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  syncButtonDisabled: {
    backgroundColor: '#555',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  syncHint: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

