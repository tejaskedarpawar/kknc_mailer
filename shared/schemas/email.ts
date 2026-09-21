import { z } from 'zod';

// Dangerous file extensions that should be blocked
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.wsf', '.wsh',
  '.msi', '.com', '.pif', '.reg', '.inf', '.hta', '.cpl', '.msc',
  '.jar', '.ps1', '.psm1', '.psd1', '.app', '.action', '.command',
  '.workflow', '.sh', '.csh', '.ksh',
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const recipientSchema = z.string().regex(emailRegex, 'Invalid email address');

export const ctaSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(100, 'CTA text too long').optional(),
  url: z.string().url('Invalid CTA URL').optional(),
}).refine(
  (data) => {
    if (data.enabled) {
      return data.text && data.text.length > 0 && data.url && data.url.length > 0;
    }
    return true;
  },
  { message: 'CTA text and URL are required when CTA is enabled' }
);

export const variablesSchema = z.record(z.string(), z.string()).optional();

export const attachmentMetaSchema = z.object({
  filename: z.string().min(1),
  size: z.number().max(10 * 1024 * 1024, 'File exceeds 10MB limit'),
  mimetype: z.string(),
}).refine(
  (data) => {
    const ext = '.' + data.filename.split('.').pop()?.toLowerCase();
    return !BLOCKED_EXTENSIONS.includes(ext);
  },
  { message: 'File type not allowed' }
);

export const sendEmailSchema = z.object({
  to: z.array(recipientSchema).min(1, 'At least one recipient required'),
  cc: z.array(recipientSchema).optional().default([]),
  bcc: z.array(recipientSchema).optional().default([]),
  subject: z.string().min(1, 'Subject is required').max(998, 'Subject too long'),
  body: z.string().min(1, 'Email body is required'),
  variables: variablesSchema,
  cta: ctaSchema.optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
});

export const previewEmailSchema = z.object({
  subject: z.string().optional().default(''),
  body: z.string().optional().default(''),
  variables: variablesSchema,
  cta: ctaSchema.optional(),
  senderName: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type PreviewEmailInput = z.infer<typeof previewEmailSchema>;
