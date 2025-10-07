export const WORDS: string[] = [
  'APPLE', 'GRAPE', 'MANGO', 'BERRY', 'PEACH', 'LEMON', 'OLIVE', 'BANJO', 'CHAIR', 'TABLE',
  'RIVER', 'MONEY', 'HONEY', 'WATER', 'EARTH', 'SMILE', 'BRAVE', 'CRANE', 'PLANT', 'CLOUD',
];

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export const VALID_SET: Set<string> = new Set(WORDS);


