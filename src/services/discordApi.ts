import { CheckApiResponse } from '../types';

export async function checkDiscordUsername(
  username: string,
  token?: string,
  useSimulationFallback = false
): Promise<CheckApiResponse> {
  const cleanUsername = username.toLowerCase().trim();

  // If simulation is enabled, simulate realistic Discord response with slight delay
  if (useSimulationFallback) {
    await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));
    // 3-letter pure dictionary or very common ones are usually taken, rare ones ~8% available
    const isRare = Math.random() < 0.12;
    return {
      username: cleanUsername,
      available: isRare,
      status: isRare ? 'available' : 'taken',
      latencyMs: Math.round(150 + Math.random() * 120),
      checkedAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch('/api/check-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: cleanUsername,
        token: token && token.trim().length > 0 ? token.trim() : undefined,
      }),
    });

    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      return {
        username: cleanUsername,
        available: false,
        status: 'rate_limited',
        retryAfter: data.retryAfter || 5,
        error: data.message || 'Limite de requêtes Discord atteinte',
        latencyMs: data.latencyMs || 250,
      };
    }

    if (!res.ok && res.status !== 400) {
      // If server returned non-200, check if json error
      const errData = await res.json().catch(() => ({}));
      return {
        username: cleanUsername,
        available: false,
        status: 'error',
        error: errData.error || `Erreur HTTP ${res.status}`,
      };
    }

    const data: CheckApiResponse = await res.json();
    return data;
  } catch (error: any) {
    return {
      username: cleanUsername,
      available: false,
      status: 'error',
      error: error.message || 'Échec de connexion au serveur de vérification',
    };
  }
}
