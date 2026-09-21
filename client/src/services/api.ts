const API_BASE = '/api';

export async function getStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getPreview(data: {
  subject?: string;
  body?: string;
  variables?: Record<string, string>;
  cta?: { enabled: boolean; text?: string; url?: string };
  senderName?: string;
}) {
  const res = await fetch(`${API_BASE}/email/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendEmail(data: {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  variables?: Record<string, string>;
  cta?: { enabled: boolean; text?: string; url?: string };
  senderName?: string;
  senderEmail?: string;
}, files?: File[]) {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));

  if (files) {
    for (const file of files) {
      formData.append('attachments', file);
    }
  }

  const res = await fetch(`${API_BASE}/email/send`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function getTemplates() {
  const res = await fetch(`${API_BASE}/templates`);
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
}
