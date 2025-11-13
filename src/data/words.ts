// src/data/words.ts

export const WORDS_BY_CATEGORY: Record<string, string[]> = {
  FRUITS: [
    'APPLE', 'GRAPE', 'MANGO', 'BERRY', 'PEACH', 'LEMON', 'OLIVE', 'PLUMS', 'CHERR', 'GUAVA',
    'LYCHE', 'APRIC', 'KIWIS', 'FIGGY', 'DATES', 'RAISN', 'BANAN', 'PRUNE', 'QUINC', 'MELON'
  ],
  OBJECTS: [
    'CHAIR', 'TABLE', 'LAMPY', 'PHONE', 'CLOCK', 'PENNY', 'BOOKS', 'BAGGY', 'KEYBO', 'DOORR',
     'SPOON', 'FORKS', 'KNIFE', 'SHELF', 'PILLO', 'BRUSH', 'SCISS', 'RADIO'
  ],
  NATURE: [
    'RIVER', 'WATER', 'EARTH', 'CLOUD', 'PLANT', 'TREES', 'STONE', 'FLOWR', 'GRASS', 'ROCKS',
    'MOUNN', 'HILLS', 'LEAFS', 'BERRY', 'RAINY', 'SNOWY', 'BEACH', 'CAVEY', 'STORM', 'OCEAN'
  ],
  ANIMALS: [
    'TIGER', 'LIONN', 'ZEBRA', 'HORSE', 'SHEEP', 'GOATS', 'BEEES', 'WOLFF', 'MOUSE', 'RABIT',
    'SNAKE', 'LLAMA', 'CAMEL', 'OTTER', 'FISHY', 'CRABY', 'EAGLE', 'SHARK', 'PANDA'
  ],
  FOOD: [
    'BREAD', 'PASTA', 'RICEE', 'MEATY', 'MILKS', 'CHEES', 'EGGSS', 'SAUCE', 'SUGAR', 'HONEY',
    'APPLE', 'PEACH', 'GRAPE', 'JUICE', 'CAKEE', 'BUNNY', 'TOAST', 'NOODL', 'FRUIT', 'SNACK'
  ]
};

// Универсальный набор всех слов
export const WORDS = Object.values(WORDS_BY_CATEGORY).flat();

// Множество для проверки допустимости
export const VALID_SET: Set<string> = new Set(WORDS);

// Функция получения случайного слова из категории
export function getRandomWord(category?: string): string {
  if (category && WORDS_BY_CATEGORY[category]) {
    const list = WORDS_BY_CATEGORY[category];
    return list[Math.floor(Math.random() * list.length)];
  }
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// Список доступных категорий
export const CATEGORIES = Object.keys(WORDS_BY_CATEGORY);
