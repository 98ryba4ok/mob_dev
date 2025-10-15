
import { Image } from 'expo-image'; // ✅ вот этот импорт
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ToastAndroid, Platform, Vibration} from 'react-native';
import { evaluateGuess, LetterState, mergeKeyState } from '../utils/wordle';
import { getRandomWord, VALID_SET } from '../data/words';
import { Audio } from 'expo-av'; // 🟢 добавили для звуков

const ROWS = 6;
const COLS = 5;

type KeyStateMap = Record<string, LetterState>;

const KEY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

export default function GameScreen() {
const [secret, setSecret] = useState<string>(() => getRandomWord());

  const [rows, setRows] = useState<string[]>(Array(ROWS).fill(''));
const [evals, setEvals] = useState<LetterState[][]>(
  Array.from({ length: ROWS }, () => Array(COLS).fill('empty'))
);

  const [currentRow, setCurrentRow] = useState<number>(0);
  const [done, setDone] = useState<{win: boolean} | null>(null);
  const [keyStates, setKeyStates] = useState<KeyStateMap>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null); // 🟢
useEffect(() => {
  return () => {
    sound?.unloadAsync();
  };
}, [sound]);

  useEffect(() => {
    setSecret(getRandomWord());
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playSound = async (type: 'win' | 'lose') => { // 🟢 универсальная функция
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

  const onEnter = () => {
    const guess = rows[currentRow];
    if (guess.length !== COLS) {
      notify('Введите 5 букв');
      return;
    }
    if (!VALID_SET.has(guess)) {
      notify('Слова нет в словаре');
      if (Platform.OS === 'android') Vibration.vibrate(30);
      return;
    }

    const res = evaluateGuess(secret, guess);
    setEvals(prev => {
      const next = prev.map(r => [...r]);
      next[currentRow] = res;
      return next;
    });
    setKeyStates(prev => {
      const next = { ...prev } as KeyStateMap;
      for (let i = 0; i < guess.length; i++) {
        const ch = guess[i];
        next[ch] = mergeKeyState(next[ch], res[i]);
      }
      return next;
    });

    if (res.every(s => s === 'correct')) {
      setDone({ win: true });
      playSound('win'); // 🟢 звук победы
      notify('Победа!');
      return;
    }

    if (currentRow + 1 >= ROWS) {
      setDone({ win: false });
      playSound('lose'); // 🟢 звук поражения
      notify(`Проигрыш. Слово: ${secret}`);
      return;
    }

    setCurrentRow(r => r + 1);
  };

  const reset = () => {
    setSecret(getRandomWord());
    setRows(Array(ROWS).fill(''));
    setEvals(Array(ROWS).fill(Array(COLS).fill('empty')));
    setCurrentRow(0);
    setDone(null);
    setKeyStates({});
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
      case 'correct':
        return { backgroundColor: '#2ecc71', borderColor: '#2ecc71' };
      case 'present':
        return { backgroundColor: '#f1c40f', borderColor: '#f1c40f' };
      case 'absent':
        return { backgroundColor: '#95a5a6', borderColor: '#95a5a6' };
      default:
        return {};
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
    if (st === 'absent') return { backgroundColor: '#7f8c8d' };
    return {};
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Угадайте слово</Text>
      <View style={{ height: 8 }} />
      {Array.from({ length: ROWS }).map((_, r) => (
        <Row key={r} text={rows[r]} states={evals[r]} />
      ))}
      <View style={{ height: 16 }} />
      {KEY_ROWS.map((kr, i) => (
        <View key={i} style={styles.keyRow}>
          {kr.map(k => (
            <Key key={k} label={k} />
          ))}
        </View>
      ))}

      {/* 🟢 При победе или поражении показываем иконку */}
      {done && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Image
            source={done.win ? require('../../assets/win.png') : require('../../assets/lose.png')}
            style={{ width: 100, height: 100, marginBottom: 12 }}
          />
          <Pressable style={styles.button} onPress={reset}>
            <Text style={styles.buttonText}>Сыграть ещё</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 36,
    paddingHorizontal: 12,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  cell: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  cellText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  keyRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  key: {
    backgroundColor: '#555',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 34,
    alignItems: 'center',
  },
  keyText: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
