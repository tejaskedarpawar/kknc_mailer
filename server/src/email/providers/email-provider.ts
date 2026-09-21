/**
 * Email Provider Abstraction
 * 
 * Defines the EmailProvider interface and implements SMTPEmailProvider
 * using Nodemailer. Supports CID logo embedding and multipart/alternative.
 */

import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { config, isDevelopmentMode } from '../../config/index.js';

export interface EmailAttachment {
  filename: string;
  content?: Buffer;
  path?: string;
  contentType?: string;
  cid?: string;
}

export interface SendEmailOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Abstract email provider interface.
 * Implement this for different email services.
 */
export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}

/**
 * SMTP Email Provider using Nodemailer
 */
export class SMTPEmailProvider implements EmailProvider {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      // Build attachments array with logo CID
      const attachments: nodemailer.SendMailOptions['attachments'] = [];

      // Add KKNC logo as CID attachment
      const logoPath = config.paths.logo;
      if (fs.existsSync(logoPath)) {
        attachments.push({
          filename: 'kknc-logo.png',
          path: logoPath,
          cid: 'kknc-logo',
          contentDisposition: 'inline',
        });
      }

      // Add user attachments
      if (options.attachments) {
        for (const att of options.attachments) {
          if (att.cid) {
            attachments.push({
              filename: att.filename,
              content: att.content,
              path: att.path,
              contentType: att.contentType,
              cid: att.cid,
              contentDisposition: 'inline',
            });
          } else {
            attachments.push({
              filename: att.filename,
              content: att.content,
              path: att.path,
              contentType: att.contentType,
            });
          }
        }
      }

      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to: options.to.join(', '),
        cc: options.cc?.join(', ') || undefined,
        bcc: options.bcc?.join(', ') || undefined,
        replyTo: options.replyTo || config.smtp.replyTo || undefined,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('[SMTP] Send error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

/**
 * Mock Email Provider for development mode.
 * Does not actually send emails — just logs the output.
 */
export class MockEmailProvider implements EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    console.log('\n[DEV MODE] ═══════════════════════════════════════════');
    console.log(`[DEV MODE] To: ${options.to.join(', ')}`);
    if (options.cc?.length) console.log(`[DEV MODE] CC: ${options.cc.join(', ')}`);
    if (options.bcc?.length) console.log(`[DEV MODE] BCC: ${options.bcc.join(', ')}`);
    console.log(`[DEV MODE] Subject: ${options.subject}`);
    console.log(`[DEV MODE] Attachments: ${options.attachments?.filter(a => !a.cid).length || 0}`);
    console.log(`[DEV MODE] HTML Length: ${options.html.length} chars`);
    console.log(`[DEV MODE] Plain Text Length: ${options.text.length} chars`);
    console.log('[DEV MODE] ═══════════════════════════════════════════\n');

    return {
      success: true,
      messageId: `dev-${Date.now()}@localhost`,
    };
  }
}

/**
 * Get the appropriate email provider based on configuration.
 */
export function getEmailProvider(): EmailProvider {
  if (isDevelopmentMode()) {
    console.log('[EMAIL] Using MockEmailProvider (development mode)');
    return new MockEmailProvider();
  }
  return new SMTPEmailProvider();
}
