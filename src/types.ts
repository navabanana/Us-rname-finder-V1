export type UsernameLength = '2' | '3' | '4' | '5' | '6' | 'mixed' | 'custom';

export type PatternType =
  | 'pronounceable' // Consonant-Vowel-Consonant (e.g. zox, kuro, rax, vyle)
  | 'pure_alpha'    // a-z only (rarest OG)
  | 'alphanumeric'   // a-z + 0-9 (e.g. x0r, neo7)
  | 'symmetric'      // xox, abba, o_o
  | 'with_special'   // includes _ or .
  | 'dictionary';    // short words/syllables (e.g. volt, mist, echo)

export type CheckStatus =
  | 'pending'
  | 'checking'
  | 'available'
  | 'taken'
  | 'rate_limited'
  | 'invalid'
  | 'blocked'
  | 'unauthorized'
  | 'error';

export interface UsernameResult {
  id: string;
  username: string;
  length: number;
  pattern: PatternType;
  status: CheckStatus;
  available: boolean;
  latencyMs?: number;
  timestamp: string;
  error?: string;
  isFavorite?: boolean;
}

export interface GeneratorConfig {
  lengthMode: UsernameLength;
  customLength: number;
  pattern: PatternType;
  prefix: string;
  suffix: string;
  allowNumbers: boolean;
  allowUnderscore: boolean;
  allowDot: boolean;
  delayMs: number; // Interval between checks (ms)
  discordToken?: string;
  soundAlerts: boolean;
  autoSaveAvailable: boolean;
  autoEquipAvailable: boolean;
  useSimulationFallback: boolean; // if discord IP is blocked/rate limited
  adaptiveBackoff: boolean; // Automatically increase delays and respect retry-after to avoid IP sanctions
  safePacingMode: boolean; // Enforce minimum safe delays (>= 1200ms)
}

export interface CheckApiResponse {
  username: string;
  available: boolean;
  status: 'available' | 'taken' | 'rate_limited' | 'invalid' | 'blocked' | 'error' | 'unauthorized';
  latencyMs?: number;
  retryAfter?: number;
  error?: string;
  checkedAt?: string;
}

export interface CheckerStats {
  totalChecked: number;
  totalAvailable: number;
  totalTaken: number;
  totalRateLimits: number;
  avgLatencyMs: number;
  currentSpeedPerMin: number;
  startTime: number | null;
}
