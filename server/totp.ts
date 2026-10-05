import crypto from 'crypto';
import QRCode from 'qrcode';

// Base32 RFC 4648 standard alphabet
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate a cryptographically secure Base32 secret for Google Authenticator (20 bytes = 160 bits)
 */
export function generateSecret(length = 20): string {
  const randomBytes = crypto.randomBytes(length);
  return base32Encode(randomBytes);
}

/**
 * Calculate the RFC 6238 TOTP 6-digit code for a given timestamp
 */
export function calculateTotpCode(secret: string, timeMs: number = Date.now()): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timeMs / 1000 / 30);

  // 8-byte big-endian counter buffer
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const binaryCode =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binaryCode % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify a 6-digit token against the secret, with window drift allowance (+/- 1 step of 30s)
 */
export function verifyTotpCode(secret: string, token: string, windowSteps = 1): boolean {
  if (!token || typeof token !== 'string') return false;
  const sanitizedToken = token.trim();
  if (sanitizedToken.length !== 6) return false;

  const now = Date.now();
  for (let i = -windowSteps; i <= windowSteps; i++) {
    const expected = calculateTotpCode(secret, now + i * 30000);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sanitizedToken))) {
      return true;
    }
  }
  return false;
}

/**
 * Build the standardized Google Authenticator otpauth:// URI
 */
export function buildOtpauthUrl(email: string, secret: string, issuer = 'DoualaSanté'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${encodeURIComponent(
    secret
  )}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate a PNG Data URL of the QR Code that Google Authenticator can scan immediately
 */
export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: 'M',
    width: 280,
    margin: 2,
    color: {
      dark: '#0f172a', // Deep slate
      light: '#ffffff',
    },
  });
}
