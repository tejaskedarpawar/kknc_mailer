/**
 * Template Controller
 */

import { Request, Response } from 'express';
import { emailTemplates, getTemplateById } from '../email/templates/presets.js';

export function getTemplates(_req: Request, res: Response): void {
  res.json({ templates: emailTemplates });
}

export function getTemplate(req: Request, res: Response): void {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const template = getTemplateById(id);
  if (!template) {
    res.status(404).json({ success: false, message: 'Template not found' });
    return;
  }
  res.json({ template });
}
