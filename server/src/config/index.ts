import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or server directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import fs from 'fs';

function findLogo(): string {
  const candidates = [
    path.resolve(__dirname, '../assets/logo.png'),
    path.resolve(__dirname, '../../server/src/assets/logo.png'),
    path.resolve(process.cwd(), 'server/src/assets/logo.png'),
    path.resolve(process.cwd(), 'logo.png'),
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {}
  }
  return path.resolve(__dirname, '../assets/logo.png');
}

export const config = {
  server: {
    port: parseInt(process.env.SERVER_PORT || '3001', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  smtp: {
    host: (process.env.SMTP_HOST || '').trim(),
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: (process.env.SMTP_USER || '').trim(),
    password: (process.env.SMTP_PASSWORD || '').replace(/\s+/g, ''),
    from: (process.env.SMTP_FROM || 'KKNC Solutions <hello@kkncsolutions.dev>').trim(),
    replyTo: (process.env.SMTP_REPLY_TO || '').trim(),
  },
  email: {
    logoUrl: process.env.LOGO_URL || '',
    companyName: 'KKNC Solutions',
    websiteUrl: 'https://kkncsolutions.dev',
    contactEmail: 'kkncsolutions@gmail.com',
    phoneNumbers: ['+91 9156544002', '+91 9699449842', '+91 8767812762'],
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_ATTACHMENT_SIZE || String(10 * 1024 * 1024), 10),
    maxTotalSize: parseInt(process.env.MAX_TOTAL_ATTACHMENT_SIZE || String(25 * 1024 * 1024), 10),
    tempDir: process.env.VERCEL ? '/tmp/uploads' : path.resolve(__dirname, '../../uploads/temp'),
  },
  paths: {
    assets: path.resolve(__dirname, '../assets'),
    logo: findLogo(),
    db: process.env.VERCEL ? '/tmp/kknc-mailer.sqlite' : path.resolve(__dirname, '../../data/kknc-mailer.sqlite'),
  },
};

export function isDevelopmentMode(): boolean {
  return !config.smtp.host || !config.smtp.user || !config.smtp.password;
}
