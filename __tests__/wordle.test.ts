import {
  evaluateGuess,
  mergeKeyState,
  LetterState,
} from '../src/utils/wordle';
import {
  getRandomWord,
  WORDS_BY_CATEGORY,
  VALID_SET,
  CATEGORIES,
  WORDS,
} from '../src/data/words';

// ==================== Базовые проверки ====================
describe('WORDS data validation', () => {
  it('every word should have length 5', () => {
    for (const w of WORDS) {
      expect(w).toHaveLength(5);
    }
  });

  it('VALID_SET includes all words', () => {
    for (const w of WORDS) {
      expect(VALID_SET.has(w)).toBe(true);
    }
  });

  it('getRandomWord returns a valid 5-letter word', () => {
    const w = getRandomWord();
    expect(typeof w).toBe('string');
    expect(w).toHaveLength(5);
    expect(VALID_SET.has(w)).toBe(true);
  });

  it('getRandomWord(category) returns a word from that category', () => {
    for (const c of CATEGORIES) {
      const w = getRandomWord(c);
      expect(WORDS_BY_CATEGORY[c]).toContain(w);
    }
  });
});

// ==================== evaluateGuess расширенные тесты ====================
describe('evaluateGuess — advanced cases', () => {
  it('handles partially correct letters', () => {
    expect(evaluateGuess('MONEY', 'MONKS')).toEqual([
      'correct', 'correct', 'correct', 'absent', 'absent',
    ]);
  });

  it('handles duplicate letters when only one is correct', () => {
    expect(evaluateGuess('APPLE', 'ABBBB')).toEqual([
      'correct', 'absent', 'absent', 'absent', 'absent',
    ]);
  });


});

// ==================== mergeKeyState расширенные тесты ====================
describe('mergeKeyState additional cases', () => {
  it('prefers stronger state', () => {
    expect(mergeKeyState('present', 'absent')).toBe('present');
    expect(mergeKeyState('absent', 'correct')).toBe('correct');
  });

  it('does not downgrade present to absent', () => {
    expect(mergeKeyState('present', 'absent')).toBe('present');
  });

  it('handles empty previous gracefully', () => {
    expect(mergeKeyState(undefined, 'correct')).toBe('correct');
  });
});

// ==================== Интеграция и логика подсказок ====================
describe('integration: game flow', () => {
  it('detects win correctly', () => {
    const secret = 'GRAPE';
    const guesses = ['MANGO', 'GRAPE'];
    let win = false;
    for (const g of guesses) {
      const res = evaluateGuess(secret, g);
      if (res.every(s => s === 'correct')) win = true;
    }
    expect(win).toBe(true);
  });

  it('detects loss after max attempts', () => {
    const secret = 'BERRY';
    const attempts = ['MANGO', 'APPLE', 'PLANT', 'CLOUD', 'STONE', 'CHAIR'];
    let win = false;
    for (const g of attempts) {
      const res = evaluateGuess(secret, g);
      if (res.every(s => s === 'correct')) win = true;
    }
    expect(win).toBe(false);
  });

  it('supports hint logic simulation (after 2 failed attempts)', () => {
    // Симулируем подсказку: после 2 неверных попыток появляется сообщение
    const secret = 'APPLE';
    const attempts = ['MANGO', 'GRAPE', 'LEMON'];
    const revealedPositions: boolean[] = Array(5).fill(false);

    for (let i = 0; i < attempts.length; i++) {
      const res = evaluateGuess(secret, attempts[i]);
      res.forEach((r, j) => {
        if (r === 'correct') revealedPositions[j] = true;
      });
      // после двух неверных
      if (i >= 1) {
        const unrevealed = revealedPositions.map((v, idx) => !v ? idx + 1 : null).filter(Boolean);
        expect(unrevealed.length).toBeGreaterThan(0);
      }
    }
  });
});
