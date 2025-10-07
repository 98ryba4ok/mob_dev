import { evaluateGuess } from '../src/utils/wordle';

// Simulate a simple game sequence headlessly using evaluateGuess only
describe('integration: play until win', () => {
  it('wins within 6 attempts', () => {
    const secret = 'APPLE';
    const attempts = ['MANGO', 'GRAPE', 'AMPLE', 'APPLE'];
    let won = false;
    for (const guess of attempts) {
      const res = evaluateGuess(secret, guess);
      if (res.every(s => s === 'correct')) {
        won = true;
        break;
      }
    }
    expect(won).toBe(true);
  });
});


