/**
 * Sent Email History Service
 * Uses a JSON file for lightweight persistent storage.
 * Can be replaced with a database later.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { SentEmail } from '../shared/types/index.js';

const HISTORY_FILE = path.resolve(config.paths.db.replace('.sqlite', '.json'));

function ensureDir() {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readHistory(): SentEmail[] {
  ensureDir();
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeHistory(history: SentEmail[]): void {
  ensureDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

export function saveSentEmail(data: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
}): SentEmail {
  const history = readHistory();
  const entry: SentEmail = {
    id: uuidv4(),
    to: data.to,
    cc: data.cc || [],
    bcc: data.bcc || [],
    subject: data.subject,
    status: data.status,
    sentAt: new Date().toISOString(),
    messageId: data.messageId,
    error: data.error,
  };

  history.unshift(entry);

  // Keep only last 500 entries
  if (history.length > 500) {
    history.length = 500;
  }

  writeHistory(history);
  return entry;
}

export function getSentEmails(limit = 50, offset = 0): SentEmail[] {
  const history = readHistory();
  return history.slice(offset, offset + limit);
}
