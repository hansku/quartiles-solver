export type DictionaryType = 'twl06' | 'enable' | 'both';

export interface DictionaryInfo {
  url: string;
  filename: string;
  name: string;
  description: string;
}

export const DICTIONARIES: Record<string, DictionaryInfo> = {
  'twl06': {
    'url': 'https://raw.githubusercontent.com/jessicatysu/scrabble/master/TWL06.txt',
    'filename': 'twl06.txt',
    'name': 'TWL06 (Tournament Word List 2006)',
    'description': 'Standard North American tournament word list, 178k words'
  },
  'enable': {
    'url': 'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt',
    'filename': 'enable1.txt',
    'name': 'ENABLE',
    'description': 'Enhanced North American Basic Lexicon, 173k words'
  }
};

// Cache for loaded dictionaries
const dictionaryCache = new Map<string, Set<string>>();

export async function loadDictionary(dictName: string): Promise<Set<string>> {
  if (dictName === 'both') {
    const [words1, words2] = await Promise.all([
      loadDictionary('twl06'),
      loadDictionary('enable')
    ]);
    return new Set([...words1, ...words2]);
  }

  // Check cache first
  if (dictionaryCache.has(dictName)) {
    return dictionaryCache.get(dictName)!;
  }

  if (!DICTIONARIES[dictName]) {
    return new Set();
  }

  const dictInfo = DICTIONARIES[dictName];
  
  try {
    // Try API route first (server-side caching)
    let words: string[] = [];
    
    try {
      const apiResponse = await fetch(`/api/dictionary?dict=${dictName}`);
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        words = data.words || [];
      } else {
        throw new Error('API route failed');
      }
    } catch {
      // Fallback to direct URL fetch
      const urlResponse = await fetch(dictInfo.url);
      if (!urlResponse.ok) {
        return new Set();
      }
      const text = await urlResponse.text();
      words = text
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(word => word.length >= 2);
    }
    
    const wordSet = new Set(words);
    dictionaryCache.set(dictName, wordSet);
    return wordSet;
  } catch (error) {
    console.error(`Error loading dictionary ${dictName}:`, error);
    return new Set();
  }
}

export function filterWords(words: Set<string>): Set<string> {
  const profanity = new Set(['fuck', 'shit', 'bitch', 'dick', 'piss', 'cock', 'cunt', 'twat', 'ass', 'damn', 'hell']);
  const filtered = new Set<string>();
  
  for (const word of words) {
    if (/^[a-z]+$/.test(word) && !profanity.has(word)) {
      filtered.add(word);
    }
  }
  
  return filtered;
}

export function classifyWord(word: string): string[] {
  const tags: string[] = [];
  if (word.length <= 3 && /^[bcdfghjklmnpqrstvwxyz]+$/.test(word)) {
    tags.push('abbreviation');
  }
  return tags;
}

