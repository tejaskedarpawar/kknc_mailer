/**
 * Express Routes
 */

import { Router } from 'express';
import { sendEmail, previewEmail } from '../controllers/email-controller.js';
import { getTemplates, getTemplate } from '../controllers/template-controller.js';
import { getHistory } from '../controllers/history-controller.js';
import { upload } from '../middleware/upload.js';
import { emailRateLimiter, apiRateLimiter } from '../middleware/rate-limiter.js';
import { isDevelopmentMode } from '../config/index.js';

const router = Router();

// Status
router.get('/status', (_req, res) => {
  res.json({
    status: 'ok',
    developmentMode: isDevelopmentMode(),
    version: '1.0.0',
  });
});

// Email
router.post('/email/send', emailRateLimiter, upload.array('attachments', 10), sendEmail);
router.post('/email/preview', apiRateLimiter, previewEmail);

// Templates
router.get('/templates', apiRateLimiter, getTemplates);
router.get('/templates/:id', apiRateLimiter, getTemplate);

// History
router.get('/history', apiRateLimiter, getHistory);

export default router;
