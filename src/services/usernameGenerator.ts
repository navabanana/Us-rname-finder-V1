import { GeneratorConfig, PatternType } from '../types';

const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const VOWELS = 'aeiou';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

const DICTIONARY_3L = [
  'zen', 'hex', 'sol', 'vox', 'neo', 'sky', 'axe', 'arc', 'fox', 'lyn', 'ryu', 'ivy',
  'ice', 'ash', 'orb', 'owl', 'run', 'aim', 'bot', 'gem', 'ray', 'ace', 'kai', 'lux',
  'fly', 'row', 'oak', 'elm', 'sea', 'bay', 'dew', 'fog', 'sun', 'tea', 'pie', 'van',
  'spy', 'vip', 'pro', 'max', 'fix', 'jam', 'zip', 'zap', 'mix', 'raw', 'top', 'win',
];

const DICTIONARY_4L = [
  'volt', 'mist', 'echo', 'rift', 'apex', 'flux', 'nova', 'byte', 'core', 'warp',
  'glow', 'wave', 'dusk', 'dawn', 'fade', 'dark', 'void', 'pure', 'sage', 'moss',
  'fern', 'leaf', 'root', 'stem', 'pine', 'jade', 'ruby', 'onyx', 'opal', 'zinc',
  'iron', 'lead', 'gold', 'neon', 'luna', 'mars', 'zeta', 'zero', 'hero', 'vibe',
  'cult', 'myth', 'lore', 'rune', 'soul', 'mind', 'flow', 'surf', 'tide', 'surf',
];

function getRandomChar(str: string): string {
  return str.charAt(Math.floor(Math.random() * str.length));
}

export function getTargetLength(config: GeneratorConfig): number {
  if (config.lengthMode === '2') return 2;
  if (config.lengthMode === '3') return 3;
  if (config.lengthMode === '4') return 4;
  if (config.lengthMode === '5') return 5;
  if (config.lengthMode === '6') return 6;
  if (config.lengthMode === 'mixed') return Math.random() < 0.5 ? 3 : 4;
  if (config.lengthMode === 'custom') {
    const len = Number(config.customLength);
    if (!isNaN(len) && len >= 2 && len <= 32) {
      return Math.floor(len);
    }
    return 5;
  }
  return 3;
}

// Generate single username according to length and pattern
export function generateSingleUsername(config: GeneratorConfig): string {
  const targetLen = getTargetLength(config);

  let generated = '';

  switch (config.pattern) {
    case 'pronounceable': {
      let isVowel = Math.random() < 0.5;
      for (let i = 0; i < targetLen; i++) {
        generated += isVowel ? getRandomChar(VOWELS) : getRandomChar(CONSONANTS);
        isVowel = !isVowel;
      }
      break;
    }

    case 'pure_alpha': {
      for (let i = 0; i < targetLen; i++) {
        generated += getRandomChar(LETTERS);
      }
      break;
    }

    case 'alphanumeric': {
      const pool = LETTERS + DIGITS;
      generated = getRandomChar(LETTERS);
      for (let i = 1; i < targetLen; i++) {
        generated += getRandomChar(pool);
      }
      break;
    }

    case 'symmetric': {
      if (targetLen <= 2) {
        const a = getRandomChar(LETTERS);
        generated = `${a}${a}`;
      } else {
        const halfLen = Math.floor(targetLen / 2);
        let firstHalf = '';
        for (let i = 0; i < halfLen; i++) {
          firstHalf += getRandomChar(LETTERS);
        }
        const middle = (targetLen % 2 === 1) ? getRandomChar(LETTERS) : '';
        const secondHalf = firstHalf.split('').reverse().join('');
        generated = `${firstHalf}${middle}${secondHalf}`;
      }
      break;
    }

    case 'with_special': {
      const sep = config.allowUnderscore && config.allowDot
        ? (Math.random() < 0.5 ? '_' : '.')
        : config.allowDot ? '.' : '_';

      if (targetLen <= 2) {
        generated = `${getRandomChar(LETTERS)}${getRandomChar(LETTERS)}`;
      } else {
        const sepIndex = Math.floor(Math.random() * (targetLen - 2)) + 1;
        for (let i = 0; i < targetLen; i++) {
          if (i === sepIndex) {
            generated += sep;
          } else {
            generated += getRandomChar(LETTERS);
          }
        }
      }
      break;
    }

    case 'dictionary': {
      if (targetLen === 3) {
        generated = DICTIONARY_3L[Math.floor(Math.random() * DICTIONARY_3L.length)];
      } else if (targetLen === 4) {
        generated = DICTIONARY_4L[Math.floor(Math.random() * DICTIONARY_4L.length)];
      } else {
        let isVowel = Math.random() < 0.5;
        for (let i = 0; i < targetLen; i++) {
          generated += isVowel ? getRandomChar(VOWELS) : getRandomChar(CONSONANTS);
          isVowel = !isVowel;
        }
      }
      break;
    }

    default: {
      for (let i = 0; i < targetLen; i++) {
        generated += getRandomChar(LETTERS);
      }
    }
  }

  // Handle prefix / suffix if specified
  if (config.prefix && config.prefix.trim()) {
    const cleanP = config.prefix.trim().toLowerCase();
    if (cleanP.length < targetLen) {
      generated = cleanP + generated.slice(cleanP.length);
    }
  }

  if (config.suffix && config.suffix.trim()) {
    const cleanS = config.suffix.trim().toLowerCase();
    if (cleanS.length < targetLen) {
      generated = generated.slice(0, targetLen - cleanS.length) + cleanS;
    }
  }

  // Ensure length constraints
  if (generated.length > targetLen) {
    generated = generated.slice(0, targetLen);
  }

  // Fix disallowed leading or trailing dot
  if (generated.startsWith('.')) {
    generated = getRandomChar(LETTERS) + generated.slice(1);
  }
  if (generated.endsWith('.')) {
    generated = generated.slice(0, -1) + getRandomChar(LETTERS);
  }

  return generated.toLowerCase();
}

// Generate a batch of unique usernames
export function generateBatchUsernames(config: GeneratorConfig, count: number, existingSet: Set<string>): string[] {
  const results: string[] = [];
  let attempts = 0;
  const maxAttempts = count * 15;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const name = generateSingleUsername(config);
    if (!existingSet.has(name) && !results.includes(name)) {
      results.push(name);
    }
  }

  return results;
}
