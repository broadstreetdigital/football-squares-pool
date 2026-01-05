/**
 * Tests for winner calculation
 */

import { describe, it, expect } from 'vitest';
import { calculateWinner, calculateAllWinners } from '../winners';
import { Score, Square } from '../../db/types';

describe('calculateWinner', () => {
  const xDigits = [3, 0, 7, 4, 1, 8, 5, 2, 9, 6]; // Away (columns)
  const yDigits = [2, 5, 8, 1, 4, 7, 0, 3, 6, 9]; // Home (rows)

  it('should calculate correct winner for score 17-14', () => {
    // Home: 17 → last digit 7 → row index 5 (yDigits[5] = 7)
    // Away: 14 → last digit 4 → col index 3 (xDigits[3] = 4)
    const winner = calculateWinner(17, 14, xDigits, yDigits);

    expect(winner).toEqual({
      row: 5,
      col: 3,
      home_digit: 7,
      away_digit: 4,
    });
  });

  it('should calculate correct winner for score 0-0', () => {
    // Home: 0 → last digit 0 → row index 6 (yDigits[6] = 0)
    // Away: 0 → last digit 0 → col index 1 (xDigits[1] = 0)
    const winner = calculateWinner(0, 0, xDigits, yDigits);

    expect(winner).toEqual({
      row: 6,
      col: 1,
      home_digit: 0,
      away_digit: 0,
    });
  });

  it('should calculate correct winner for score 23-30', () => {
    // Home: 23 → last digit 3 → row index 7 (yDigits[7] = 3)
    // Away: 30 → last digit 0 → col index 1 (xDigits[1] = 0)
    const winner = calculateWinner(23, 30, xDigits, yDigits);

    expect(winner).toEqual({
      row: 7,
      col: 1,
      home_digit: 3,
      away_digit: 0,
    });
  });

  it('should handle scores with last digit 9', () => {
    // Home: 19 → last digit 9 → row index 9 (yDigits[9] = 9)
    // Away: 29 → last digit 9 → col index 8 (xDigits[8] = 9)
    const winner = calculateWinner(19, 29, xDigits, yDigits);

    expect(winner).toEqual({
      row: 9,
      col: 8,
      home_digit: 9,
      away_digit: 9,
    });
  });
});

describe('calculateAllWinners', () => {
  const xDigits = [3, 0, 7, 4, 1, 8, 5, 2, 9, 6];
  const yDigits = [2, 5, 8, 1, 4, 7, 0, 3, 6, 9];

  const squares: Square[] = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      squares.push({
        pool_id: 'test-pool',
        row,
        col,
        claimed_by_user_id: row === 5 && col === 3 ? 'user1' : null,
        claimed_display_name: row === 5 && col === 3 ? 'John Doe' : null,
        claimed_email: null,
        claimed_at: null,
      });
    }
  }

  it('should calculate winners for multiple quarters', () => {
    const scores: Score[] = [
      {
        pool_id: 'test-pool',
        bucket: 'Q1',
        home_score: 7,
        away_score: 3,
        updated_at: Date.now(),
      },
      {
        pool_id: 'test-pool',
        bucket: 'Q2',
        home_score: 17,
        away_score: 14,
        updated_at: Date.now(),
      },
    ];

    const winners = calculateAllWinners(scores, xDigits, yDigits, squares);

    expect(winners).toHaveLength(2);

    // Q1: 7-3
    expect(winners[0].bucket).toBe('Q1');
    expect(winners[0].home_score).toBe(7);
    expect(winners[0].away_score).toBe(3);

    // Q2: 17-14
    expect(winners[1].bucket).toBe('Q2');
    expect(winners[1].home_score).toBe(17);
    expect(winners[1].away_score).toBe(14);
    expect(winners[1].row).toBe(5);
    expect(winners[1].col).toBe(3);
    expect(winners[1].claimed_display_name).toBe('John Doe');
  });

  it('should handle unclaimed winning squares', () => {
    const scores: Score[] = [
      {
        pool_id: 'test-pool',
        bucket: 'Q1',
        home_score: 10,
        away_score: 7,
        updated_at: Date.now(),
      },
    ];

    const winners = calculateAllWinners(scores, xDigits, yDigits, squares);

    expect(winners).toHaveLength(1);
    expect(winners[0].claimed_by_user_id).toBeNull();
    expect(winners[0].claimed_display_name).toBeNull();
  });
});
