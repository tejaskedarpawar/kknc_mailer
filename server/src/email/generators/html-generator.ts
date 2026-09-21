/**
 * HTML Email Generator
 * 
 * Takes email data, processes variables, sanitizes HTML body,
 * and generates the final branded KKNC HTML email.
 */

import sanitizeHtml from 'sanitize-html';
import { generateEmailHTML, type EmailTemplateData } from '../templates/kknc-email-template.js';
import { config } from '../../config/index.js';

export interface GenerateEmailOptions {
  subject: string;
  body: string;
  variables?: Record<string, string>;
  cta?: {
    enabled: boolean;
    text?: string;
    url?: string;
  };
  senderName?: string;
  logoSrc: string;
}

/**
 * Sanitize rich-text HTML to make it email-safe.
 */
function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr', 'img',
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'title', 'rel'],
      'img': ['src', 'alt', 'width', 'height', 'style'],
      '*': ['style', 'class'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'cid'],
    allowedStyles: {
      '*': {
        'color': [/.*/],
        'background-color': [/.*/],
        'text-align': [/^(left|center|right|justify)$/],
        'font-size': [/.*/],
        'font-weight': [/.*/],
        'font-style': [/.*/],
        'text-decoration': [/.*/],
        'margin': [/.*/],
        'margin-top': [/.*/],
        'margin-bottom': [/.*/],
        'padding': [/.*/],
        'padding-top': [/.*/],
        'padding-bottom': [/.*/],
        'border': [/.*/],
        'line-height': [/.*/],
      },
    },
    transformTags: {
      'a': (tagName: string, attribs: Record<string, string>) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: `color: #B47A32; text-decoration: underline; ${attribs.style || ''}`.trim(),
        },
      }),
    },
  });
}

/**
 * Replace template variables like {{client_name}} with actual values.
 */
function processVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'gi');
    result = result.replace(regex, escapeHtmlForBody(value));
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlForBody(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Convert inline styles for email compatibility.
 */
function convertToEmailSafeHTML(html: string): string {
  let result = html;

  result = result.replace(
    /<p([^>]*)>/gi,
    '<p$1 style="margin: 0 0 16px 0; padding: 0; line-height: 1.7;">'
  );
  result = result.replace(
    /<h1([^>]*)>/gi,
    '<h1$1 style="margin: 0 0 16px 0; font-family: Georgia, \'Times New Roman\', Times, serif; font-size: 22px; font-weight: 400; line-height: 1.35;">'
  );
  result = result.replace(
    /<h2([^>]*)>/gi,
    '<h2$1 style="margin: 0 0 14px 0; font-family: Georgia, \'Times New Roman\', Times, serif; font-size: 19px; font-weight: 400; line-height: 1.35;">'
  );
  result = result.replace(
    /<h3([^>]*)>/gi,
    '<h3$1 style="margin: 0 0 12px 0; font-family: Georgia, \'Times New Roman\', Times, serif; font-size: 17px; font-weight: 400; line-height: 1.35;">'
  );
  result = result.replace(
    /<ul([^>]*)>/gi,
    '<ul$1 style="margin: 0 0 16px 0; padding-left: 24px;">'
  );
  result = result.replace(
    /<ol([^>]*)>/gi,
    '<ol$1 style="margin: 0 0 16px 0; padding-left: 24px;">'
  );
  result = result.replace(
    /<li([^>]*)>/gi,
    '<li$1 style="margin: 0 0 6px 0; line-height: 1.6;">'
  );
  result = result.replace(
    /<blockquote([^>]*)>/gi,
    '<blockquote$1 style="margin: 0 0 16px 0; padding: 12px 20px; border-left: 3px solid #B47A32; background-color: rgba(180, 122, 50, 0.05); font-style: italic;">'
  );
  result = result.replace(
    /<hr([^>]*)\/?>/gi,
    '<hr$1 style="border: none; border-top: 1px solid #E5DED1; margin: 20px 0;">'
  );

  return result;
}

/**
 * Generate the complete branded KKNC HTML email.
 */
export function generateHTMLEmail(options: GenerateEmailOptions): string {
  let { body, subject } = options;
  const { variables = {}, cta, senderName, logoSrc } = options;

  // Process variables in subject and body
  subject = processVariables(subject, variables);
  body = processVariables(body, variables);

  // Sanitize the HTML body
  body = sanitizeBody(body);

  // Convert to email-safe inline styles
  body = convertToEmailSafeHTML(body);

  const templateData: EmailTemplateData = {
    subject,
    body,
    senderName,
    cta,
    logoSrc,
    companyName: config.email.companyName,
    websiteUrl: config.email.websiteUrl,
    contactEmail: config.email.contactEmail,
    phoneNumbers: config.email.phoneNumbers,
  };

  return generateEmailHTML(templateData);
}
