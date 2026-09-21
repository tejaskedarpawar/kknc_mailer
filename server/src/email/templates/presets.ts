/**
 * Email Template Presets
 * 
 * Pre-defined email templates for common business communications.
 */

import { EmailTemplate } from '../../shared/types/index.js';

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Email',
    description: 'Start with a clean slate',
    subject: '',
    body: '',
    variables: ['client_name', 'sender_name'],
  },
  {
    id: 'client-introduction',
    name: 'Client Introduction',
    description: 'Introduce KKNC Solutions to a new client',
    subject: 'Introduction — KKNC Solutions',
    body: `<p>Hello {{client_name}},</p>
<p>We are excited to introduce ourselves. KKNC Solutions is a technology company specialising in software development, design, and intelligent digital solutions.</p>
<p>We would love the opportunity to understand your requirements and explore how we can help you achieve your goals.</p>
<p>Please feel free to schedule a call at your convenience, or simply reply to this email.</p>`,
    cta: {
      enabled: true,
      text: 'Visit Our Website',
      url: 'https://kkncsolutions.dev',
    },
    variables: ['client_name', 'sender_name'],
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Share a project proposal with a client',
    subject: 'Project Proposal — {{project_name}}',
    body: `<p>Hello {{client_name}},</p>
<p>Thank you for taking the time to discuss your requirements with KKNC Solutions.</p>
<p>We are pleased to share the proposal for <strong>{{project_name}}</strong>.</p>
<p>Please find the relevant documents attached to this email. The proposal outlines our approach, timeline, and investment details.</p>
<p>If you have any questions or would like to discuss any aspect of the proposal, please do not hesitate to reach out.</p>`,
    cta: {
      enabled: true,
      text: 'View Proposal',
      url: 'https://kkncsolutions.dev',
    },
    variables: ['client_name', 'project_name', 'sender_name'],
  },
  {
    id: 'project-update',
    name: 'Project Update',
    description: 'Share a project progress update',
    subject: 'Project Update — {{project_name}}',
    body: `<p>Hello {{client_name}},</p>
<p>We wanted to share a progress update on <strong>{{project_name}}</strong>.</p>
<p>Here is a summary of what has been accomplished:</p>
<ul>
<li>Milestone updates and progress details</li>
<li>Any items requiring your attention or feedback</li>
<li>Upcoming deliverables and timeline</li>
</ul>
<p>Please review the attached documents for detailed information. We look forward to your feedback.</p>`,
    cta: {
      enabled: true,
      text: 'View Project Dashboard',
      url: 'https://kkncsolutions.dev',
    },
    variables: ['client_name', 'project_name', 'sender_name'],
  },
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Send an invoice to a client',
    subject: 'Invoice #{{invoice_number}} — KKNC Solutions',
    body: `<p>Hello {{client_name}},</p>
<p>Please find attached Invoice <strong>#{{invoice_number}}</strong> for the services provided by KKNC Solutions.</p>
<p><strong>Invoice Details:</strong></p>
<ul>
<li>Invoice Number: {{invoice_number}}</li>
<li>Project: {{project_name}}</li>
</ul>
<p>Kindly process the payment at your earliest convenience. If you have any questions regarding this invoice, please feel free to reach out.</p>`,
    variables: ['client_name', 'invoice_number', 'project_name', 'sender_name'],
  },
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    description: 'Send a friendly payment reminder',
    subject: 'Payment Reminder — Invoice #{{invoice_number}}',
    body: `<p>Hello {{client_name}},</p>
<p>This is a friendly reminder regarding Invoice <strong>#{{invoice_number}}</strong> which is currently pending.</p>
<p>We kindly request you to process the payment at your earliest convenience.</p>
<p>If the payment has already been made, please disregard this message. Should you have any questions or require any clarification, please do not hesitate to contact us.</p>`,
    variables: ['client_name', 'invoice_number', 'sender_name'],
  },
  {
    id: 'meeting-confirmation',
    name: 'Meeting Confirmation',
    description: 'Confirm a scheduled meeting',
    subject: 'Meeting Confirmation — {{meeting_date}}',
    body: `<p>Hello {{client_name}},</p>
<p>This email confirms our meeting scheduled for <strong>{{meeting_date}}</strong>.</p>
<p><strong>Meeting Details:</strong></p>
<ul>
<li>Date: {{meeting_date}}</li>
<li>Agenda: Discussion regarding {{project_name}}</li>
</ul>
<p>Please let us know if you need to reschedule or have any specific topics you would like to cover.</p>
<p>We look forward to speaking with you.</p>`,
    cta: {
      enabled: true,
      text: 'Join Meeting',
      url: 'https://meet.google.com',
    },
    variables: ['client_name', 'meeting_date', 'project_name', 'sender_name'],
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    description: 'Send a thank you message to a client',
    subject: 'Thank You — KKNC Solutions',
    body: `<p>Hello {{client_name}},</p>
<p>Thank you for choosing KKNC Solutions. It has been a pleasure working with you.</p>
<p>We truly value your trust in our team and are committed to delivering excellence in everything we do.</p>
<p>Should you need any further assistance or wish to explore new opportunities, we are always here to help.</p>
<p>We look forward to continuing our association.</p>`,
    cta: {
      enabled: true,
      text: 'Visit Our Website',
      url: 'https://kkncsolutions.dev',
    },
    variables: ['client_name', 'sender_name'],
  },
];

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find((t) => t.id === id);
}
