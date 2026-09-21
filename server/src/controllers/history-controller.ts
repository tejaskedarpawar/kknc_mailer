/**
 * History Controller
 */

import { Request, Response } from 'express';
import { getSentEmails } from '../services/history-service.js';

export function getHistory(req: Request, res: Response): void {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const emails = getSentEmails(limit, offset);
    res.json({ emails });
  } catch (error: any) {
    console.error('[HISTORY] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load history.' });
  }
}
