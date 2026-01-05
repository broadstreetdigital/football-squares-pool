/**
 * Randomization logic for board digits using Web Crypto API
 */

/**
 * Generate randomized digits 0-9 using Fisher-Yates shuffle
 * Uses Web Crypto API for cryptographically secure randomness
 */
export function generateRandomDigits(): number[] {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Fisher-Yates shuffle
  for (let i = digits.length - 1; i > 0; i--) {
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);

    // Get random index from 0 to i (inclusive)
    const j = randomBytes[0] % (i + 1);

    // Swap
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  return digits;
}

/**
 * Validate that digits array is a valid permutation of 0-9
 */
export function validateDigits(digits: number[]): boolean {
  if (digits.length !== 10) {
    return false;
  }

  const seen = new Set<number>();

  for (const digit of digits) {
    if (digit < 0 || digit > 9 || seen.has(digit)) {
      return false;
    }
    seen.add(digit);
  }

  return true;
}
