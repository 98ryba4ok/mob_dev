import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ToastAndroid,
  Platform,
  Vibration,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { evaluateGuess, LetterState, mergeKeyState } from '../utils/wordle';
import { getRandomWord, VALID_SET, CATEGORIES } from '../data/words';
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import { gameService } from '../services/game';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLS = 5;

const DIFFICULTY = {
  EASY: 8,
  MEDIUM: 6,
  HARD: 4,
};

type Difficulty = keyof typeof DIFFICULTY;
type KeyStateMap = Record<string, LetterState>;

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export default function GameScreen() {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [secret, setSecret] = useState<string>(() => getRandomWord(category));
  const [rows, setRows] = useState<string[]>(Array(DIFFICULTY[difficulty]).fill(''));
  const [evals, setEvals] = useState<LetterState[][]>(
    Array.from({ length: DIFFICULTY[difficulty] }, () => Array(COLS).fill('empty'))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [done, setDone] = useState<{ win: boolean } | null>(null);
  const [keyStates, setKeyStates] = useState<KeyStateMap>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

useEffect(() => {
  return () => {
    if (sound) {
      sound.unloadAsync().catch(() => {});
    }
  };
}, [sound]);


  useEffect(() => {
    reset();
  }, [category, difficulty]);

  const playSound = async (type: 'win' | 'lose') => {
    try {
      const file = type === 'win' ? require('../../assets/win.mp3') : require('../../assets/lose.mp3');
      const { sound: s } = await Audio.Sound.createAsync(file);
      setSound(s);
      await s.playAsync();
    } catch (err) {
      console.warn('Sound error:', err);
    }
  };

  const notify = (msg: string) => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
    else console.log('NOTIFY:', msg);
  };

  const onKey = (k: string) => {
    if (done) return;
    if (k === 'ENTER') return onEnter();
    if (k === '⌫') return onBackspace();
    if (!/^[A-Z]$/.test(k)) return;
    setRows(prev => {
      const next = [...prev];
      const cur = next[currentRow];
      if (cur.length < COLS) next[currentRow] = cur + k;
      return next;
    });
  };

  const onBackspace = () => {
    setRows(prev => {
      const next = [...prev];
      const cur = next[currentRow];
      if (cur.length > 0) next[currentRow] = cur.slice(0, -1);
      return next;
    });
  };

  const calculateScore = () => {
    const baseScore = 100;
    const penalty = (currentRow + hintsUsed) * 10;
    return Math.max(baseScore - penalty, 0);
  };

  const onEnter = () => {
    const guess = rows[currentRow];
    if (guess.length !== COLS) {
      notify('Введите 5 букв');
      return;
    }

    // Если слова нет в словаре — вибрация и подсказка по правилам (не считаем попыткой угаданной)
    if (!VALID_SET.has(guess)) {
      notify('Слова нет в словаре');
      if (Platform.OS === 'android') Vibration.vibrate(30);
      // не увеличиваем currentRow — даём подсказку только если уже было >=2 реальных попыток
      // но поскольку слово невалидное, считаем, что это не "попытка" — не вызываем подсказку тут
      return;
    }

    const res = evaluateGuess(secret, guess);

    // Создаём локальную копию evals с текущей строкой обновлённой — чтобы вычислить, какие позиции уже раскрыты
    const nextEvals = evals.map(r => [...r]);
    nextEvals[currentRow] = res;

    // Обновляем состояния (реакт асинхронно, но мы уже имеем nextEvals)
    setEvals(nextEvals);

    // Обновляем keyStates
    setKeyStates(prev => {
      const next = { ...prev } as KeyStateMap;
      for (let i = 0; i < guess.length; i++) {
        const ch = guess[i];
        next[ch] = mergeKeyState(next[ch], res[i]);
      }
      return next;
    });

    // Победа
    if (res.every(s => s === 'correct')) {
      const gained = calculateScore();
      setScore(prev => prev + gained);
      setDone({ win: true });
      playSound('win');
      notify(`Победа! +${gained} очков`);
      saveGameResult(true, currentRow + 1, gained);
      return;
    }

    // Если достигли лимита попыток — проигрыш
    if (currentRow + 1 >= DIFFICULTY[difficulty]) {
      setDone({ win: false });
      playSound('lose');
      notify(`Проигрыш. Слово: ${secret}`);
      saveGameResult(false, currentRow + 1, 0);
      return;
    }

    // Если игрок сделал уже >=2 неверных попыток (т.е. текущая попытка индекс >=1),
    // показываем подсказку для следующей попытки (не меняя ввод)
    if (currentRow >= 1) {
      // Вычисляем, какие позиции уже были угаданы верно на всех предыдущих evaluated rows (включая текущую)
      const revealed = Array(COLS).fill(false);
      for (let r = 0; r <= currentRow; r++) {
        for (let i = 0; i < COLS; i++) {
          if (nextEvals[r] && nextEvals[r][i] === 'correct') revealed[i] = true;
        }
      }
      // Собираем индексы нераскрытых позиций
      const unrevealedIndexes = revealed
        .map((v, i) => (!v ? i : -1))
        .filter(i => i !== -1);

      if (unrevealedIndexes.length > 0) {
        const hintIndex = unrevealedIndexes[Math.floor(Math.random() * unrevealedIndexes.length)];
        const hintLetter = secret[hintIndex];
        setHintsUsed(h => h + 1);
        notify(`💡 Подсказка: на позиции ${hintIndex + 1} — буква ${hintLetter}`);
      }
    }

    // переходим на следующий ряд (это завершает текущую попытку)
    setCurrentRow(r => r + 1);
  };

  const saveGameResult = async (won: boolean, attempts: number, scoreGained: number) => {
    try {
      // Сохраняем в бекенд
      await gameService.saveGameResult({
        attempts,
        won,
        score: scoreGained,
        word: secret,
      });

      // Обновляем локальную статистику
      const statsJson = await AsyncStorage.getItem('statistics');
      const stats = statsJson ? JSON.parse(statsJson) : {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalScore: 0,
        averageAttempts: 0,
        distribution: {},
      };

      stats.gamesPlayed += 1;
      if (won) {
        stats.gamesWon += 1;
        stats.currentStreak += 1;
        stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
        stats.totalScore += scoreGained;
        stats.distribution[attempts] = (stats.distribution[attempts] || 0) + 1;
        
        // Пересчитываем среднее количество попыток для побед
        const totalAttempts = Object.entries(stats.distribution).reduce(
          (sum, [att, count]) => sum + Number(att) * (count as number),
          0
        );
        stats.averageAttempts = totalAttempts / stats.gamesWon;
      } else {
        stats.currentStreak = 0;
      }

      await AsyncStorage.setItem('statistics', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  };

  const reset = () => {
    const attempts = DIFFICULTY[difficulty];
    setSecret(getRandomWord(category));
    setRows(Array(attempts).fill(''));
    setEvals(Array.from({ length: attempts }, () => Array(COLS).fill('empty')));
    setCurrentRow(0);
    setDone(null);
    setKeyStates({});
    setHintsUsed(0);
  };

  const Row = ({ text, states }: { text: string; states: LetterState[] }) => {
    const letters = text.padEnd(COLS).split('');
    return (
      <View style={styles.row}>
        {letters.map((ch, idx) => (
          <View key={idx} style={[styles.cell, stateStyle(states[idx])]}>
            <Text style={styles.cellText}>{ch}</Text>
          </View>
        ))}
      </View>
    );
  };

  const stateStyle = (s: LetterState) => {
    switch (s) {
      case 'correct': return { backgroundColor: '#2ecc71', borderColor: '#2ecc71' };
      case 'present': return { backgroundColor: '#f1c40f', borderColor: '#f1c40f' };
      case 'absent': return { backgroundColor: '#7f8c8d', borderColor: '#7f8c8d' };
      default: return {};
    }
  };

  const Key = ({ label }: { label: string }) => (
    <Pressable onPress={() => onKey(label)} style={[styles.key, keyBg(label)]}>
      <Text style={styles.keyText}>{label}</Text>
    </Pressable>
  );

  const keyBg = (label: string) => {
    const st = keyStates[label];
    if (label === 'ENTER' || label === '⌫') return { backgroundColor: '#34495e' };
    if (st === 'correct') return { backgroundColor: '#2ecc71' };
    if (st === 'present') return { backgroundColor: '#f1c40f' };
    if (st === 'absent') return { backgroundColor: '#555' };
    return {};
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0d0d0d' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Категория</Text>
        <Picker
          selectedValue={category}
          onValueChange={v => setCategory(v)}
          style={styles.picker}
          dropdownIconColor="#fff"
        >
          {CATEGORIES.map(c => <Picker.Item key={c} label={c} value={c} />)}
        </Picker>

        <Text style={styles.title}>Сложность</Text>
        <Picker
          selectedValue={difficulty}
          onValueChange={v => setDifficulty(v as Difficulty)}
          style={styles.picker}
          dropdownIconColor="#fff"
        >
          {Object.keys(DIFFICULTY).map(d => <Picker.Item key={d} label={d} value={d} />)}
        </Picker>

        <Text style={styles.title}>Угадайте слово</Text>
        <Text style={styles.info}>Очки: {score}</Text>
        <Text style={styles.info}>Попытки: {DIFFICULTY[difficulty] - currentRow}</Text>

        <View style={styles.grid}>
          {rows.map((_, r) => <Row key={r} text={rows[r]} states={evals[r]} />)}
        </View>

        <View style={styles.keyboardContainer}>
          {KEY_ROWS.map((kr, i) => (
            <View key={i} style={styles.keyRow}>
              {kr.map(k => <Key key={k} label={k} />)}
            </View>
          ))}
        </View>

        {done && (
          <View style={styles.resultBox}>
            <Image
              source={done.win ? require('../../assets/win.png') : require('../../assets/lose.png')}
              style={styles.resultImage}
            />
            <Pressable style={styles.button} onPress={reset}>
              <Text style={styles.buttonText}>Сыграть ещё</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
  },
  picker: {
    width: 240,
    color: '#fff',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  info: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 4,
  },
  grid: {
    marginTop: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  cell: {
    width: 52,
    height: 52,
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  cellText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  keyboardContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 5,
  },
  key: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultBox: {
    alignItems: 'center',
    marginTop: 30,
  },
  resultImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
