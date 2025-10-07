export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export function evaluateGuess(secret: string, guess: string): LetterState[] {
  const result: LetterState[] = Array(guess.length).fill('absent');
  const secretChars = secret.split('');
  const guessChars = guess.split('');

  const used: boolean[] = Array(secret.length).fill(false);

  // First pass: correct positions
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === secretChars[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }

  // Second pass: present but wrong place
  for (let i = 0; i < guessChars.length; i++) {
    if (result[i] === 'correct') continue;
    const ch = guessChars[i];
    let found = -1;
    for (let j = 0; j < secretChars.length; j++) {
      if (!used[j] && secretChars[j] === ch) {
        found = j;
        break;
      }
    }
    if (found !== -1) {
      result[i] = 'present';
      used[found] = true;
    }
  }

  return result;
}

export function mergeKeyState(prev: LetterState | undefined, next: LetterState): LetterState {
  // Precedence: correct > present > absent > empty
  const rank = (s?: LetterState) => ({ empty: 0, absent: 1, present: 2, correct: 3 }[s ?? 'empty']);
  if (rank(next) >= rank(prev)) return next;
  return prev ?? 'empty';
}


