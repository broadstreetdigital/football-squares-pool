/**
 * SendGrid Email Service
 * Handles sending transactional emails using SendGrid
 */

import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@footballsquarespool.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballsquarespool.com';

/**
 * Load and process email template
 */
function loadTemplate(templateName: string, variables: Record<string, any>): string {
  const templatePath = path.join(process.cwd(), 'lib', 'email', 'templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace all variables in the template
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, variables[key] || '');
  });

  return html;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
}) {
  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping welcome email');
    return;
  }

  const html = loadTemplate('welcome', {
    name: params.name,
    dashboardUrl: `${SITE_URL}/dashboard`,
    siteUrl: SITE_URL,
  });

  const msg = {
    to: params.email,
    from: FROM_EMAIL,
    subject: 'Welcome to Football Squares Pool!',
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Welcome email sent to:', params.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Send pool created confirmation email to manager
 */
export async function sendPoolCreatedEmail(params: {
  email: string;
  managerName: string;
  poolName: string;
  poolId: string;
  gameDate: string;
  maxSquares: number;
  visibility: string;
}) {
  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping pool created email');
    return;
  }

  const html = loadTemplate('pool-created', {
    managerName: params.managerName,
    poolName: params.poolName,
    poolUrl: `${SITE_URL}/pool/${params.poolId}`,
    gameDate: params.gameDate,
    maxSquares: params.maxSquares.toString(),
    visibility: params.visibility,
    siteUrl: SITE_URL,
  });

  const msg = {
    to: params.email,
    from: FROM_EMAIL,
    subject: `Pool Created: ${params.poolName}`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Pool created email sent to:', params.email);
  } catch (error) {
    console.error('Error sending pool created email:', error);
    throw error;
  }
}

/**
 * Send board locked notification to manager
 */
export async function sendBoardLockedManagerEmail(params: {
  email: string;
  managerName: string;
  poolName: string;
  poolId: string;
  claimedSquares: number;
  participantCount: number;
}) {
  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping board locked manager email');
    return;
  }

  const html = loadTemplate('board-locked-manager', {
    managerName: params.managerName,
    poolName: params.poolName,
    poolUrl: `${SITE_URL}/pool/${params.poolId}`,
    claimedSquares: params.claimedSquares.toString(),
    participantCount: params.participantCount.toString(),
    siteUrl: SITE_URL,
  });

  const msg = {
    to: params.email,
    from: FROM_EMAIL,
    subject: `Board Locked: ${params.poolName}`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Board locked manager email sent to:', params.email);
  } catch (error) {
    console.error('Error sending board locked manager email:', error);
    throw error;
  }
}

/**
 * Send board locked notification to participant
 */
export async function sendBoardLockedParticipantEmail(params: {
  email: string;
  participantName: string;
  poolName: string;
  poolId: string;
  gameDate: string;
  userSquareCount: number;
  participantCount: number;
}) {
  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping board locked participant email');
    return;
  }

  const html = loadTemplate('board-locked-participant', {
    participantName: params.participantName,
    poolName: params.poolName,
    poolUrl: `${SITE_URL}/pool/${params.poolId}`,
    gameDate: params.gameDate,
    userSquareCount: params.userSquareCount.toString(),
    multipleSquares: params.userSquareCount > 1,
    participantCount: params.participantCount.toString(),
    siteUrl: SITE_URL,
  });

  const msg = {
    to: params.email,
    from: FROM_EMAIL,
    subject: `Board Locked: ${params.poolName}`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Board locked participant email sent to:', params.email);
  } catch (error) {
    console.error('Error sending board locked participant email:', error);
    throw error;
  }
}

/**
 * Send digits randomized notification to manager
 */
export async function sendDigitsRandomizedManagerEmail(params: {
  email: string;
  managerName: string;
  poolName: string;
  poolId: string;
  teamAName: string;
  teamBName: string;
  xDigits: number[];
  yDigits: number[];
  randomizedTime: string;
}) {
  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping digits randomized manager email');
    return;
  }

  // Create variables for each digit position
  const digitVars: Record<string, string> = {};
  params.xDigits.forEach((digit, index) => {
    digitVars[`xDigit${index}`] = digit.toString();
  });
  params.yDigits.forEach((digit, index) => {
    digitVars[`yDigit${index}`] = digit.toString();
  });

  const html = loadTemplate('digits-randomized-manager', {
    managerName: params.managerName,
    poolName: params.poolName,
    poolUrl: `${SITE_URL}/pool/${params.poolId}`,
    teamAName: params.teamAName,
    teamBName: params.teamBName,
    ...digitVars,
    randomizedTime: params.randomizedTime,
    siteUrl: SITE_URL,
  });

  const msg = {
    to: params.email,
    from: FROM_EMAIL,
    subject: `Digits Randomized: ${params.poolName}`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Digits randomized manager email sent to:', params.email);
  } catch (error) {
    console.error('Error sending digits randomized manager email:', error);
    throw error;
  }
}

/**
 * Send digits randomized notification to participant
 */
export async function sendDigitsRandomizedParticipantEmail(params: {
  email: string;
  participantName: string;
  poolName: string;
  poolId: string;
  gameDate: string;
  teamAName: string;
  teamBName: string;
  xDigits: number[];
  yDigits: number[];
  userSquareCount: number;
  participantCount: number;
}) {
  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping digits randomized participant email');
    return;
  }

  // Create variables for each digit position
  const digitVars: Record<string, string> = {};
  params.xDigits.forEach((digit, index) => {
    digitVars[`xDigit${index}`] = digit.toString();
  });
  params.yDigits.forEach((digit, index) => {
    digitVars[`yDigit${index}`] = digit.toString();
  });

  const html = loadTemplate('digits-randomized-participant', {
    participantName: params.participantName,
    poolName: params.poolName,
    poolUrl: `${SITE_URL}/pool/${params.poolId}`,
    gameDate: params.gameDate,
    teamAName: params.teamAName,
    teamBName: params.teamBName,
    ...digitVars,
    userSquareCount: params.userSquareCount.toString(),
    multipleSquares: params.userSquareCount > 1,
    participantCount: params.participantCount.toString(),
    siteUrl: SITE_URL,
  });

  const msg = {
    to: params.email,
    from: FROM_EMAIL,
    subject: `Digits Randomized: ${params.poolName}`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Digits randomized participant email sent to:', params.email);
  } catch (error) {
    console.error('Error sending digits randomized participant email:', error);
    throw error;
  }
}

/**
 * Send pool invitation email
 */
export async function sendPoolInvitationEmail(params: {
  email: string;
  invitedName: string;
  managerName: string;
  poolName: string;
  poolId: string;
  gameDate: string;
  squarePrice: number;
  squares: Array<{ row: number; col: number }>;
  invitationToken: string;
}) {
  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping pool invitation email');
    return;
  }

  const squareCount = params.squares.length;
  const totalCost = (squareCount * params.squarePrice).toFixed(2);

  // Generate squares list HTML
  const squaresList = params.squares
    .map((sq) => `<span class="square-item">(${sq.row}, ${sq.col})</span>`)
    .join('');

  const html = loadTemplate('pool-invitation', {
    invitedName: params.invitedName,
    managerName: params.managerName,
    poolName: params.poolName,
    gameDate: params.gameDate,
    squarePrice: params.squarePrice.toFixed(2),
    squareCount: squareCount.toString(),
    totalCost,
    multipleSquares: squareCount > 1,
    squaresList,
    invitationUrl: `${SITE_URL}/invitation/${params.invitationToken}`,
    siteUrl: SITE_URL,
  });

  const msg = {
    to: params.email,
    from: FROM_EMAIL,
    subject: `You're invited to join ${params.poolName}!`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Pool invitation email sent to:', params.email);
  } catch (error) {
    console.error('Error sending pool invitation email:', error);
    throw error;
  }
}
