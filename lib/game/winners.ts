/**
 * Winner calculation logic
 */

import { Score, Winner, Square } from '../db/types';

export interface WinnerResult {
  row: number;
  col: number;
  home_digit: number;
  away_digit: number;
}

/**
 * Calculate winning square based on score
 *
 * Convention: X axis (columns) = Away team, Y axis (rows) = Home team
 */
export function calculateWinner(
  homeScore: number,
  awayScore: number,
  xDigits: number[], // Away team digits (columns)
  yDigits: number[] // Home team digits (rows)
): WinnerResult {
  const homeLastDigit = homeScore % 10;
  const awayLastDigit = awayScore % 10;

  // Find which column has the away team's last digit
  const col = xDigits.indexOf(awayLastDigit);

  // Find which row has the home team's last digit
  const row = yDigits.indexOf(homeLastDigit);

  if (col === -1 || row === -1) {
    throw new Error('Invalid digit assignment - digit not found in axis');
  }

  return {
    row,
    col,
    home_digit: homeLastDigit,
    away_digit: awayLastDigit,
  };
}

/**
 * Calculate all winners for a pool given scores and axis
 */
export function calculateAllWinners(
  scores: Score[],
  xDigits: number[],
  yDigits: number[],
  squares: Square[]
): Winner[] {
  const winners: Winner[] = [];

  for (const score of scores) {
    const winnerPos = calculateWinner(
      score.home_score,
      score.away_score,
      xDigits,
      yDigits
    );

    const winningSquare = squares.find(
      (s) => s.row === winnerPos.row && s.col === winnerPos.col
    );

    if (winningSquare) {
      winners.push({
        bucket: score.bucket,
        row: winnerPos.row,
        col: winnerPos.col,
        home_score: score.home_score,
        away_score: score.away_score,
        claimed_by_user_id: winningSquare.claimed_by_user_id,
        claimed_display_name: winningSquare.claimed_display_name,
      });
    }
  }

  return winners;
}
