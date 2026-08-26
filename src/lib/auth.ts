import { randomBytes, createHash, timingSafeEqual } from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zalsports2024';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory token store: token hash -> expiry timestamp
const validTokens = new Map<string, number>();

// Clean expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [hash, expiry] of validTokens.entries()) {
    if (expiry <= now) validTokens.delete(hash);
  }
}, 60 * 60 * 1000); // every hour

/**
 * Verify admin credentials
 */
export function verifyAdmin(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

/**
 * Create a signed admin token. Returns the raw token string.
 */
export function createAdminToken(): string {
  const secret = process.env.ADMIN_SECRET || 'zalsports-default-secret-change-me';
  const raw = randomBytes(48).toString('hex');
  const payload = `${raw}:${Date.now() + TOKEN_EXPIRY_MS}`;
  const sig = createHash('sha256').update(`${payload}:${secret}`).digest('hex');
  const token = `${payload}.${sig}`;

  // Store the hash for verification
  const tokenHash = createHash('sha256').update(token).digest('hex');
  validTokens.set(tokenHash, Date.now() + TOKEN_EXPIRY_MS);

  return token;
}

/**
 * Verify an admin token. Returns true if valid and not expired.
 */
export function verifyAdminToken(token: string): boolean {
  if (!token) return false;

  const secret = process.env.ADMIN_SECRET || 'zalsports-default-secret-change-me';
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, sig] = parts;
  const expectedSig = createHash('sha256').update(`${payload}:${secret}`).digest('hex');

  // Timing-safe comparison to prevent timing attacks
  if (sig.length !== expectedSig.length) return false;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
  } catch {
    return false;
  }

  // Check expiry in payload
  const payloadParts = payload.split(':');
  if (payloadParts.length !== 2) return false;
  const expiry = parseInt(payloadParts[1], 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;

  // Check in-memory store
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const storedExpiry = validTokens.get(tokenHash);
  if (!storedExpiry || Date.now() > storedExpiry) {
    validTokens.delete(tokenHash);
    return false;
  }

  return true;
}
