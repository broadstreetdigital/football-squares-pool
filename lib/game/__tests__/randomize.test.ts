/**
 * Tests for randomization logic
 */

import { describe, it, expect } from 'vitest';
import { generateRandomDigits, validateDigits } from '../randomize';

describe('generateRandomDigits', () => {
  it('should generate an array of 10 digits', () => {
    const digits = generateRandomDigits();
    expect(digits).toHaveLength(10);
  });

  it('should contain all digits 0-9 exactly once', () => {
    const digits = generateRandomDigits();
    const sorted = [...digits].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should generate different permutations', () => {
    const results = new Set<string>();

    // Generate 100 permutations
    for (let i = 0; i < 100; i++) {
      const digits = generateRandomDigits();
      results.add(digits.join(','));
    }

    // Should have multiple unique permutations
    // (probability of all 100 being the same is essentially 0)
    expect(results.size).toBeGreaterThan(50);
  });

  it('should pass validation', () => {
    const digits = generateRandomDigits();
    expect(validateDigits(digits)).toBe(true);
  });
});

describe('validateDigits', () => {
  it('should validate correct digit arrays', () => {
    expect(validateDigits([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(true);
    expect(validateDigits([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])).toBe(true);
    expect(validateDigits([5, 2, 8, 1, 9, 0, 4, 7, 3, 6])).toBe(true);
  });

  it('should reject arrays with wrong length', () => {
    expect(validateDigits([0, 1, 2])).toBe(false);
    expect(validateDigits([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(false);
    expect(validateDigits([])).toBe(false);
  });

  it('should reject arrays with duplicate digits', () => {
    expect(validateDigits([0, 1, 2, 3, 4, 5, 6, 7, 8, 8])).toBe(false);
    expect(validateDigits([5, 5, 5, 5, 5, 5, 5, 5, 5, 5])).toBe(false);
  });

  it('should reject arrays with invalid digits', () => {
    expect(validateDigits([0, 1, 2, 3, 4, 5, 6, 7, 8, 10])).toBe(false);
    expect(validateDigits([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8])).toBe(false);
  });
});
