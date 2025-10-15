import { evaluateGuess } from '../src/utils/wordle';

describe('evaluateGuess', () => {
  it('marks correct letters and positions', () => {
    expect(evaluateGuess('APPLE', 'APPLE')).toEqual([
      'correct','correct','correct','correct','correct'
    ]);
  });

  it('marks present and absent correctly with duplicates', () => {
    // secret has two Ps, guess has one
    expect(evaluateGuess('APPLE', 'APRON')).toEqual([
      'correct','correct','absent','absent','absent'
    ]);
  });
});



