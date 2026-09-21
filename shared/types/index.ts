export interface EmailRequest {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  variables?: Record<string, string>;
  cta?: CTAConfig;
  senderName?: string;
  senderEmail?: string;
}

export interface CTAConfig {
  enabled: boolean;
  text?: string;
  url?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  developmentMode?: boolean;
  html?: string;
  plainText?: string;
}

export interface PreviewResponse {
  html: string;
  plainText: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  cta?: CTAConfig;
  variables: string[];
}

export interface DraftEmail {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  variables: Record<string, string>;
  cta: CTAConfig;
  templateId?: string;
  senderName?: string;
  updatedAt: string;
}

export interface SentEmail {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  status: 'sent' | 'failed';
  sentAt: string;
  messageId?: string;
  error?: string;
}

export interface SenderSettings {
  senderName: string;
  senderEmail: string;
  replyTo: string;
  companyName: string;
  websiteUrl: string;
  logoUrl: string;
  defaultSignature: string;
}
