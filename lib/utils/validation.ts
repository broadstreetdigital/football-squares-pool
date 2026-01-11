/**
 * Validation schemas using Zod
 */

import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),
  emailConsent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to receive emails and agree to the Privacy Policy',
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Pool schemas
export const createPoolSchema = z.object({
  name: z.string().min(1, 'Pool name is required').max(100),
  game_name: z.string().min(1, 'Game name is required').max(100),
  game_time: z.number().int().positive('Game time must be in the future'),
  entry_fee_info: z.string().max(500).optional(),
  square_price: z.number().min(0).max(10000),
  max_squares_per_user: z.number().int().min(1).max(100),
  visibility: z.enum(['public', 'private']),
  invite_code: z.string().length(8).optional(),
  rules: z.string().max(2000).optional(),
  home_team: z.string().min(1, 'Home team name is required').max(50),
  away_team: z.string().min(1, 'Away team name is required').max(50),
});

export const updatePoolSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  game_name: z.string().min(1).max(100).optional(),
  game_time: z.number().int().positive().optional(),
  entry_fee_info: z.string().max(500).optional(),
  square_price: z.number().min(0).max(10000).optional(),
  max_squares_per_user: z.number().int().min(1).max(100).optional(),
  rules: z.string().max(2000).optional(),
  home_team: z.string().min(1).max(50).optional(),
  away_team: z.string().min(1).max(50).optional(),
});

// Square schemas
export const claimSquaresSchema = z.object({
  squares: z
    .array(
      z.object({
        row: z.number().int().min(0).max(9),
        col: z.number().int().min(0).max(9),
      })
    )
    .min(1, 'Must claim at least one square')
    .max(25, 'Cannot claim more than 25 squares at once'),
});

export const ownerClaimSquareSchema = z.object({
  row: z.number().int().min(0).max(9),
  col: z.number().int().min(0).max(9),
  display_name: z.string().min(1).max(100),
  email: z.string().email().optional(),
});

// Score schemas
export const updateScoresSchema = z.object({
  scores: z.array(
    z.object({
      bucket: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'FINAL']),
      home_score: z.number().int().min(0).max(999),
      away_score: z.number().int().min(0).max(999),
    })
  ),
});

// Join pool schema
export const joinPoolSchema = z.object({
  invite_code: z.string().length(8),
});
