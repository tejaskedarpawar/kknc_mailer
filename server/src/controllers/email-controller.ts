/**
 * Email Controller
 * 
 * Handles email sending and preview generation.
 */

import { Request, Response } from 'express';
import fs from 'fs';
import { sendEmailSchema, previewEmailSchema } from '../shared/schemas/email.js';
import { generateHTMLEmail } from '../email/generators/html-generator.js';
import { generatePlainText } from '../email/generators/plaintext-generator.js';
import { getEmailProvider, EmailAttachment } from '../email/providers/email-provider.js';
import { saveSentEmail } from '../services/history-service.js';
import { config, isDevelopmentMode } from '../config/index.js';
import { cleanupTempFiles } from '../middleware/upload.js';

/**
 * POST /api/email/send
 * Send a branded KKNC email.
 */
export async function sendEmail(req: Request, res: Response): Promise<void> {
  const uploadedFiles = (req.files as Express.Multer.File[]) || [];

  try {
    // Parse JSON body from form data
    let bodyData;
    try {
      bodyData = JSON.parse(req.body.data || '{}');
    } catch {
      res.status(400).json({ success: false, message: 'Invalid request data' });
      return;
    }

    // Validate
    const parsed = sendEmailSchema.safeParse(bodyData);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, message: `Validation error: ${errors}` });
      return;
    }

    const data = parsed.data;

    // Check total attachment size
    const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > config.upload.maxTotalSize) {
      res.status(400).json({
        success: false,
        message: `Total attachment size exceeds ${Math.round(config.upload.maxTotalSize / 1024 / 1024)}MB limit`,
      });
      return;
    }

    // Determine logo source
    const logoSrc = config.email.logoUrl || 'cid:kknc-logo';

    // Generate HTML email
    const html = generateHTMLEmail({
      subject: data.subject,
      body: data.body,
      variables: data.variables,
      cta: data.cta,
      senderName: data.senderName,
      logoSrc,
    });

    // Generate plain text
    const text = generatePlainText({
      subject: data.subject,
      body: data.body,
      senderName: data.senderName,
      cta: data.cta,
    });

    // Process variables in subject for sending
    let processedSubject = data.subject;
    if (data.variables) {
      for (const [key, value] of Object.entries(data.variables)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
        processedSubject = processedSubject.replace(regex, value);
      }
    }

    // Build file attachments
    const attachments: EmailAttachment[] = uploadedFiles.map((file) => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype,
    }));

    // Send
    const provider = getEmailProvider();
    const result = await provider.sendEmail({
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: processedSubject,
      html,
      text,
      attachments,
      replyTo: data.senderEmail,
    });

    // Save to history
    saveSentEmail({
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: processedSubject,
      status: result.success ? 'sent' : 'failed',
      messageId: result.messageId,
      error: result.error,
    });

    if (result.success) {
      const response: any = {
        success: true,
        message: isDevelopmentMode()
          ? 'Development mode — email generated successfully (not actually sent)'
          : 'Email sent successfully',
        messageId: result.messageId,
        developmentMode: isDevelopmentMode(),
      };

      // In dev mode, return the generated HTML and text for inspection
      if (isDevelopmentMode()) {
        response.html = html;
        response.plainText = text;
      }

      res.json(response);
    } else {
      res.status(500).json({
        success: false,
        message: 'Unable to send email. Please check your SMTP configuration.',
      });
    }
  } catch (error: any) {
    console.error('[EMAIL CONTROLLER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while sending the email.',
    });
  } finally {
    // Cleanup temp files
    cleanupTempFiles(uploadedFiles);
  }
}

/**
 * POST /api/email/preview
 * Generate email preview without sending.
 */
export async function previewEmail(req: Request, res: Response): Promise<void> {
  try {
    const parsed = previewEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, message: `Validation error: ${errors}` });
      return;
    }

    const data = parsed.data;

    // Use CID or HTTPS logo
    const logoSrc = config.email.logoUrl || 'cid:kknc-logo';

    // For preview, convert CID to base64 data URI so it displays in the browser
    let previewLogoSrc = logoSrc;
    if (logoSrc === 'cid:kknc-logo' && fs.existsSync(config.paths.logo)) {
      const logoBuffer = fs.readFileSync(config.paths.logo);
      previewLogoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }

    const html = generateHTMLEmail({
      subject: data.subject || 'Email Preview',
      body: data.body || '',
      variables: data.variables,
      cta: data.cta,
      senderName: data.senderName,
      logoSrc: previewLogoSrc,
    });

    const text = generatePlainText({
      subject: data.subject || 'Email Preview',
      body: data.body || '',
      senderName: data.senderName,
      cta: data.cta,
    });

    res.json({ html, plainText: text });
  } catch (error: any) {
    console.error('[PREVIEW CONTROLLER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview.',
    });
  }
}
