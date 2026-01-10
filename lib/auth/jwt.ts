/**
 * JWT implementation using Web Crypto API (edge-compatible)
 */

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  iat: number; // issued at
  exp: number; // expiry
}

// Validate JWT_SECRET at module load time
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. ' +
    'Generate a secure secret with: openssl rand -base64 32'
  );
}

if (JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET must be at least 32 characters long for security. ' +
    'Current length: ' + JWT_SECRET.length
  );
}

const JWT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Encode base64url (URL-safe)
 */
function base64urlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode base64url
 */
function base64urlDecode(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

/**
 * Sign data using HMAC-SHA256
 */
async function sign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  return base64urlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
}

/**
 * Create a JWT token
 */
export async function createToken(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const now = Date.now();

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: JWTPayload = {
    sub: userId,
    email,
    name,
    iat: now,
    exp: now + JWT_EXPIRY,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(dataToSign);

  return `${dataToSign}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await sign(dataToVerify);

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payloadJson = base64urlDecode(encodedPayload);
    const payload = JSON.parse(payloadJson) as JWTPayload;

    // Check expiry
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}
