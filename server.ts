import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to validate basic Discord username format
function validateDiscordUsername(username: string): { valid: boolean; error?: string } {
  if (!username) return { valid: false, error: 'Pseudo requis' };
  const lower = username.toLowerCase().trim();
  if (lower.length < 2 || lower.length > 32) {
    return { valid: false, error: 'Doit comporter entre 2 et 32 caractères' };
  }
  if (!/^[a-z0-9_.]+$/.test(lower)) {
    return { valid: false, error: 'Caractères autorisés : a-z, 0-9, tiret bas (_) et point (.)' };
  }
  if (lower.startsWith('.') || lower.endsWith('.')) {
    return { valid: false, error: 'Ne peut pas commencer ou se terminer par un point' };
  }
  if (lower.includes('..')) {
    return { valid: false, error: 'Deux points consécutifs (..) ne sont pas autorisés' };
  }
  const reserved = ['discord', 'clyde', 'everyone', 'here', 'admin', 'system', 'moderator'];
  if (reserved.includes(lower)) {
    return { valid: false, error: 'Pseudo réservé par Discord' };
  }
  return { valid: true };
}

// API: Check single Discord username availability
app.post('/api/check-username', async (req, res) => {
  const startTime = Date.now();
  try {
    const { username, token } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username must be provided' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const validation = validateDiscordUsername(cleanUsername);
    if (!validation.valid) {
      return res.json({
        username: cleanUsername,
        available: false,
        status: 'invalid',
        error: validation.error,
        latencyMs: Date.now() - startTime,
      });
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Origin': 'https://discord.com',
      'Referer': 'https://discord.com/register',
    };

    let discordApiUrl = 'https://discord.com/api/v9/unique-username/username-attempt-unauthed';
    if (token && typeof token === 'string' && token.trim().length > 0) {
      headers['Authorization'] = token.trim();
      discordApiUrl = 'https://discord.com/api/v9/users/@me/pomelo-attempt';
    }

    const discordRes = await fetch(discordApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username: cleanUsername }),
    });

    const latencyMs = Date.now() - startTime;
    const statusCode = discordRes.status;

    if (statusCode === 200) {
      const data = (await discordRes.json()) as { taken?: boolean };
      const taken = Boolean(data.taken);
      return res.json({
        username: cleanUsername,
        available: !taken,
        status: !taken ? 'available' : 'taken',
        latencyMs,
        checkedAt: new Date().toISOString(),
      });
    }

    if (statusCode === 429) {
      const errorData = (await discordRes.json().catch(() => ({}))) as {
        retry_after?: number;
        message?: string;
      };
      const retryAfter = errorData.retry_after || 5;
      return res.status(429).json({
        username: cleanUsername,
        available: false,
        status: 'rate_limited',
        retryAfter,
        message: errorData.message || 'Rate limit Discord atteint.',
        latencyMs,
      });
    }

    if (statusCode === 400) {
      const errorData = (await discordRes.json().catch(() => ({}))) as {
        message?: string;
        code?: number;
      };
      return res.json({
        username: cleanUsername,
        available: false,
        status: 'invalid',
        error: errorData.message || 'Nom d\'utilisateur indisponible ou non conforme.',
        latencyMs,
      });
    }

    // If 401 Unauthorized (invalid token provided)
    if (statusCode === 401) {
      return res.status(401).json({
        username: cleanUsername,
        available: false,
        status: 'unauthorized',
        error: 'Jeton Discord invalide ou expiré.',
        latencyMs,
      });
    }

    // Cloudflare or other blocking
    return res.json({
      username: cleanUsername,
      available: false,
      status: 'blocked',
      error: `Discord a renvoyé le statut HTTP ${statusCode}.`,
      latencyMs,
    });
  } catch (err: any) {
    return res.status(500).json({
      username: req.body?.username || '',
      available: false,
      status: 'error',
      error: err?.message || 'Erreur réseau interne',
      latencyMs: Date.now() - startTime,
    });
  }
});

// API: Health / Gateway status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    target: 'Discord Username Checker 3-4L',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Discord Checker] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
