/**
 * Plain Text Email Generator
 * 
 * Converts the email body and metadata into a clean plain-text
 * fallback for email clients that don't render HTML.
 */

import { convert } from 'html-to-text';
import { config } from '../../config/index.js';

export interface PlainTextOptions {
  subject: string;
  body: string;
  senderName?: string;
  cta?: {
    enabled: boolean;
    text?: string;
    url?: string;
  };
}

export function generatePlainText(options: PlainTextOptions): string {
  const { subject, body, senderName, cta } = options;

  const companyName = config?.email?.companyName || 'KKNC Solutions';
  const websiteUrl = config?.email?.websiteUrl || 'https://kkncsolutions.dev';
  const contactEmail = config?.email?.contactEmail || 'kkncsolutions@gmail.com';
  const phoneNumbers = config?.email?.phoneNumbers || ['+91 9156544002'];
  const displaySender = senderName || 'KKNC Solutions';
  const year = new Date().getFullYear();

  // Convert HTML body to plain text
  const plainBody = convert(body, {
    wordwrap: 76,
    selectors: [
      { selector: 'a', options: { linkBrackets: ['[', ']'] } },
      { selector: 'img', format: 'skip' },
      { selector: 'h1', options: { uppercase: false, trailingLineBreaks: 2 } },
      { selector: 'h2', options: { uppercase: false, trailingLineBreaks: 2 } },
      { selector: 'h3', options: { uppercase: false, trailingLineBreaks: 2 } },
    ],
  });

  const separator = '─'.repeat(50);

  let text = '';

  // Header
  text += `${separator}\n`;
  text += `KKNC SOLUTIONS\n`;
  text += `Software • Design • Intelligence\n`;
  text += `${separator}\n\n`;

  // Subject
  text += `${subject}\n\n`;

  // Body
  text += `${plainBody}\n\n`;

  // CTA
  if (cta?.enabled && cta?.text && cta?.url) {
    text += `${cta.text}: ${cta.url}\n\n`;
  }

  // Signature
  text += `${separator}\n\n`;
  text += `Regards,\n`;
  text += `${displaySender}\n`;
  text += `${companyName}\n\n`;

  // Footer
  text += `${separator}\n`;
  text += `${companyName}\n`;
  text += `${websiteUrl}\n`;
  text += `${contactEmail}\n`;
  text += `${phoneNumbers.join(' | ')}\n\n`;
  text += `© ${year} ${companyName}. All rights reserved.\n`;
  text += `${separator}\n`;

  return text;
}
