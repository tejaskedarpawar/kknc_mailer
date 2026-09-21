import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Send, Eye, Code, FileText, Monitor, Smartphone,
  ChevronDown, ChevronUp, Loader2, CheckCircle2,
  XCircle, AlertTriangle, Copy, Check, Layout,
} from 'lucide-react';
import RecipientInput from '../components/composer/RecipientInput';
import AttachmentUploader from '../components/composer/AttachmentUploader';
import RichTextEditor from '../components/editor/RichTextEditor';
import { sendEmail, getPreview, getTemplates } from '../services/api';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  cta?: { enabled: boolean; text?: string; url?: string };
  variables: string[];
}

type PreviewTab = 'preview' | 'html' | 'plaintext';
type ViewSize = 'desktop' | 'mobile';
type SendStatus = 'idle' | 'sending' | 'success' | 'error';

const DRAFT_KEY = 'kknc-mailer-draft';

function saveDraft(data: any) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
  } catch {}
}

function loadDraft(): any {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function ComposePage() {
  // --- Form State ---
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // CTA
  const [ctaEnabled, setCtaEnabled] = useState(false);
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  // Variables
  const [variables, setVariables] = useState<Record<string, string>>({
    client_name: '',
    sender_name: '',
    project_name: '',
    company_name: '',
  });
  const [showVariables, setShowVariables] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Preview
  const [previewTab, setPreviewTab] = useState<PreviewTab>('preview');
  const [viewSize, setViewSize] = useState<ViewSize>('desktop');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Send
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [sendMessage, setSendMessage] = useState('');
  const [devHtml, setDevHtml] = useState('');
  const [devText, setDevText] = useState('');

  // Draft
  const [lastSaved, setLastSaved] = useState('');

  // Refs
  const previewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Load templates
  useEffect(() => {
    getTemplates().then((res: any) => {
      if (res.templates) setTemplates(res.templates);
    }).catch(() => {});
  }, []);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.to) setTo(draft.to);
      if (draft.cc?.length) { setCc(draft.cc); setShowCcBcc(true); }
      if (draft.bcc?.length) { setBcc(draft.bcc); setShowCcBcc(true); }
      if (draft.subject) setSubject(draft.subject);
      if (draft.body) setBody(draft.body);
      if (draft.ctaEnabled) setCtaEnabled(true);
      if (draft.ctaText) setCtaText(draft.ctaText);
      if (draft.ctaUrl) setCtaUrl(draft.ctaUrl);
      if (draft.variables) setVariables({ ...variables, ...draft.variables });
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (draftTimeout.current) clearTimeout(draftTimeout.current);
    draftTimeout.current = setTimeout(() => {
      saveDraft({ to, cc, bcc, subject, body, ctaEnabled, ctaText, ctaUrl, variables });
      setLastSaved('Saved just now');
      setTimeout(() => setLastSaved(''), 3000);
    }, 2000);
    return () => { if (draftTimeout.current) clearTimeout(draftTimeout.current); };
  }, [to, cc, bcc, subject, body, ctaEnabled, ctaText, ctaUrl, variables]);

  // Update preview (debounced)
  const updatePreview = useCallback(() => {
    if (previewTimeout.current) clearTimeout(previewTimeout.current);
    previewTimeout.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await getPreview({
          subject: subject || 'Email Preview',
          body: body || '<p>Start typing your email...</p>',
          variables: Object.fromEntries(Object.entries(variables).filter(([_, v]) => v)),
          cta: { enabled: ctaEnabled, text: ctaText, url: ctaUrl },
          senderName: variables.sender_name || undefined,
        });
        if (res.html) setPreviewHtml(res.html);
        if (res.plainText) setPreviewText(res.plainText);
      } catch {}
      setPreviewLoading(false);
    }, 600);
  }, [subject, body, variables, ctaEnabled, ctaText, ctaUrl]);

  useEffect(() => {
    updatePreview();
    return () => { if (previewTimeout.current) clearTimeout(previewTimeout.current); };
  }, [updatePreview]);

  // Handle send
  const handleSend = async () => {
    if (to.length === 0) {
      setSendStatus('error');
      setSendMessage('Please add at least one recipient');
      return;
    }
    if (!subject.trim()) {
      setSendStatus('error');
      setSendMessage('Please enter a subject');
      return;
    }

    setSendStatus('sending');
    setSendMessage('');

    try {
      const result = await sendEmail(
        {
          to, cc, bcc, subject, body,
          variables: Object.fromEntries(Object.entries(variables).filter(([_, v]) => v)),
          cta: ctaEnabled ? { enabled: true, text: ctaText, url: ctaUrl } : undefined,
          senderName: variables.sender_name || undefined,
        },
        files.length > 0 ? files : undefined
      );

      if (result.success) {
        setSendStatus('success');
        setSendMessage(result.message || 'Email sent successfully');
        if (result.html) setDevHtml(result.html);
        if (result.plainText) setDevText(result.plainText);
        // Clear draft
        localStorage.removeItem(DRAFT_KEY);
      } else {
        setSendStatus('error');
        setSendMessage(result.message || 'Failed to send email');
      }
    } catch (err: any) {
      setSendStatus('error');
      setSendMessage('Network error. Is the server running?');
    }
  };

  // Load template
  const loadTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setBody(template.body);
    if (template.cta) {
      setCtaEnabled(template.cta.enabled);
      setCtaText(template.cta.text || '');
      setCtaUrl(template.cta.url || '');
    }
    // Set variable fields from template
    const newVars = { ...variables };
    for (const v of template.variables) {
      if (!(v in newVars)) newVars[v] = '';
    }
    setVariables(newVars);
    setShowTemplates(false);
  };

  const handleCopyHtml = () => {
    const htmlContent = devHtml || previewHtml;
    navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyText = () => {
    const textContent = devText || previewText;
    navigator.clipboard.writeText(textContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Reset after send
  const handleNewEmail = () => {
    setTo([]);
    setCc([]);
    setBcc([]);
    setSubject('');
    setBody('');
    setFiles([]);
    setCtaEnabled(false);
    setCtaText('');
    setCtaUrl('');
    setVariables({ client_name: '', sender_name: '', project_name: '', company_name: '' });
    setSendStatus('idle');
    setSendMessage('');
    setDevHtml('');
    setDevText('');
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* ══════════ LEFT: COMPOSER ══════════ */}
      <div className="w-1/2 border-r border-border overflow-y-auto">
        <div className="p-6 space-y-5">

          {/* Template Selector */}
          <div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 text-sm text-gold hover:text-gold-hover transition-colors cursor-pointer"
            >
              <Layout size={16} />
              Use Template
              {showTemplates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showTemplates && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => loadTemplate(t)}
                    className="text-left p-3 bg-surface border border-border rounded-lg hover:border-gold/40 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-text">{t.name}</p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{t.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recipients */}
          <RecipientInput label="To" emails={to} onChange={setTo} placeholder="client@example.com" />
          
          <div className="flex items-center">
            <button
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-xs text-text-muted hover:text-gold transition-colors cursor-pointer"
            >
              {showCcBcc ? 'Hide' : 'Show'} CC / BCC
            </button>
          </div>

          {showCcBcc && (
            <div className="space-y-4">
              <RecipientInput label="CC" emails={cc} onChange={setCc} />
              <RecipientInput label="BCC" emails={bcc} onChange={setBcc} />
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Project Proposal — KKNC Solutions"
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text outline-none focus:border-gold transition-colors placeholder:text-text-muted"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
              Body
            </label>
            <RichTextEditor content={body} onChange={setBody} />
          </div>

          {/* Variables */}
          <div>
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              {showVariables ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Template Variables
            </button>
            {showVariables && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs text-text-muted mb-1">{`{{${key}}}`}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                      placeholder={key.replace(/_/g, ' ')}
                      className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-gold transition-colors placeholder:text-text-muted"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <button
                    onClick={() => {
                      const key = prompt('Variable name (e.g., invoice_number):');
                      if (key && !variables[key]) {
                        setVariables({ ...variables, [key.trim()]: '' });
                      }
                    }}
                    className="text-xs text-gold hover:text-gold-hover transition-colors cursor-pointer"
                  >
                    + Add Variable
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="border border-border rounded-lg p-4 bg-surface">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ctaEnabled}
                onChange={(e) => setCtaEnabled(e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              <span className="text-sm text-text">Add Call-to-Action Button</span>
            </label>
            {ctaEnabled && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="View Proposal"
                    className="w-full bg-bg border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-gold transition-colors placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Button URL</label>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-bg border border-border rounded px-3 py-1.5 text-sm text-text outline-none focus:border-gold transition-colors placeholder:text-text-muted"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Attachments */}
          <AttachmentUploader files={files} onChange={setFiles} />

          {/* Draft indicator */}
          {lastSaved && (
            <p className="text-xs text-text-muted italic">{lastSaved}</p>
          )}

          {/* Send Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSend}
              disabled={sendStatus === 'sending'}
              className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white font-medium rounded-lg hover:bg-gold-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              {sendStatus === 'sending' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {sendStatus === 'sending' ? 'Sending...' : 'Send Email'}
            </button>

            {sendStatus === 'success' && (
              <button
                onClick={handleNewEmail}
                className="text-sm text-gold hover:text-gold-hover transition-colors cursor-pointer"
              >
                Compose New
              </button>
            )}
          </div>

          {/* Status Message */}
          {sendMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              sendStatus === 'success' ? 'bg-success/10 text-success' :
              sendStatus === 'error' ? 'bg-error/10 text-error' :
              'bg-warning/10 text-warning'
            }`}>
              {sendStatus === 'success' && <CheckCircle2 size={18} />}
              {sendStatus === 'error' && <XCircle size={18} />}
              {sendStatus !== 'success' && sendStatus !== 'error' && <AlertTriangle size={18} />}
              {sendMessage}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ RIGHT: PREVIEW ══════════ */}
      <div className="w-1/2 flex flex-col bg-bg">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-1">
            {(['preview', 'html', 'plaintext'] as PreviewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setPreviewTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                  previewTab === tab
                    ? 'bg-gold/15 text-gold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {tab === 'preview' && <Eye size={13} className="inline mr-1.5 -mt-0.5" />}
                {tab === 'html' && <Code size={13} className="inline mr-1.5 -mt-0.5" />}
                {tab === 'plaintext' && <FileText size={13} className="inline mr-1.5 -mt-0.5" />}
                {tab === 'preview' ? 'Preview' : tab === 'html' ? 'HTML' : 'Plain Text'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {previewTab === 'preview' && (
              <div className="flex items-center gap-1 bg-surface-raised rounded-lg p-0.5">
                <button
                  onClick={() => setViewSize('desktop')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${viewSize === 'desktop' ? 'bg-gold/15 text-gold' : 'text-text-muted hover:text-text'}`}
                  title="Desktop"
                >
                  <Monitor size={14} />
                </button>
                <button
                  onClick={() => setViewSize('mobile')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${viewSize === 'mobile' ? 'bg-gold/15 text-gold' : 'text-text-muted hover:text-text'}`}
                  title="Mobile"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}
            {previewTab === 'html' && (
              <button onClick={handleCopyHtml} className="flex items-center gap-1 text-xs text-text-muted hover:text-gold transition-colors cursor-pointer">
                {copiedHtml ? <Check size={13} /> : <Copy size={13} />}
                {copiedHtml ? 'Copied' : 'Copy HTML'}
              </button>
            )}
            {previewTab === 'plaintext' && (
              <button onClick={handleCopyText} className="flex items-center gap-1 text-xs text-text-muted hover:text-gold transition-colors cursor-pointer">
                {copiedText ? <Check size={13} /> : <Copy size={13} />}
                {copiedText ? 'Copied' : 'Copy Text'}
              </button>
            )}
            {previewLoading && <Loader2 size={14} className="text-gold animate-spin" />}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4">
          {previewTab === 'preview' && (
            <div className="flex justify-center">
              <div
                className="preview-frame transition-all duration-300"
                style={{
                  width: viewSize === 'desktop' ? '620px' : '375px',
                  maxWidth: '100%',
                }}
              >
                <iframe
                  srcDoc={previewHtml || '<html><body style="background:#f7f3ea;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#999"><p>Compose an email to see the preview</p></body></html>'}
                  title="Email Preview"
                  style={{
                    width: '100%',
                    minHeight: viewSize === 'desktop' ? '700px' : '800px',
                    border: 'none',
                  }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}

          {previewTab === 'html' && (
            <pre className="text-xs text-text-secondary bg-surface border border-border rounded-lg p-4 overflow-auto whitespace-pre-wrap break-all font-mono leading-relaxed max-h-full">
              {devHtml || previewHtml || 'No HTML generated yet'}
            </pre>
          )}

          {previewTab === 'plaintext' && (
            <pre className="text-xs text-text-secondary bg-surface border border-border rounded-lg p-4 overflow-auto whitespace-pre-wrap font-mono leading-relaxed max-h-full">
              {devText || previewText || 'No plain text generated yet'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
