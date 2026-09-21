/**
 * File upload middleware using Multer.
 * Handles multipart form data with file validation.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';

const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.wsf', '.wsh',
  '.msi', '.com', '.pif', '.reg', '.inf', '.hta', '.cpl', '.msc',
  '.jar', '.ps1', '.psm1', '.psd1', '.app', '.action', '.command',
  '.workflow', '.sh', '.csh', '.ksh', '.dll', '.sys',
]);

// Ensure temp directory exists
if (!fs.existsSync(config.upload.tempDir)) {
  fs.mkdirSync(config.upload.tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    cb(new Error(`File type ${ext} is not allowed`));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
});

/**
 * Clean up uploaded temp files after email is sent.
 */
export function cleanupTempFiles(files: Express.Multer.File[]): void {
  for (const file of files) {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error(`Failed to cleanup temp file: ${file.path}`, err);
    }
  }
}
