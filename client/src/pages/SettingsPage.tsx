import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

const SETTINGS_KEY = 'kknc-mailer-settings';

interface SenderSettings {
  senderName: string;
  senderEmail: string;
  replyTo: string;
  companyName: string;
  websiteUrl: string;
  logoUrl: string;
  defaultSignature: string;
}

const defaults: SenderSettings = {
  senderName: '',
  senderEmail: '',
  replyTo: '',
  companyName: 'KKNC Solutions',
  websiteUrl: 'https://kkncsolutions.dev',
  logoUrl: '',
  defaultSignature: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SenderSettings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, field, placeholder, type = 'text' }: {
    label: string; field: keyof SenderSettings; placeholder: string; type?: string;
  }) => (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={settings[field]}
        onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text outline-none focus:border-gold transition-colors placeholder:text-text-muted"
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-gold" />
        <h1 className="text-xl font-semibold text-text">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="border border-border rounded-lg p-6 bg-surface">
          <h2 className="text-sm font-medium text-text mb-4">Sender Information</h2>
          <div className="space-y-4">
            <Field label="Sender Name" field="senderName" placeholder="Tejas Kedar" />
            <Field label="Sender Email" field="senderEmail" placeholder="hello@kkncsolutions.dev" type="email" />
            <Field label="Reply-To" field="replyTo" placeholder="kkncsolutions@gmail.com" type="email" />
          </div>
        </div>

        <div className="border border-border rounded-lg p-6 bg-surface">
          <h2 className="text-sm font-medium text-text mb-4">Company Details</h2>
          <div className="space-y-4">
            <Field label="Company Name" field="companyName" placeholder="KKNC Solutions" />
            <Field label="Website URL" field="websiteUrl" placeholder="https://kkncsolutions.dev" />
            <Field label="Logo URL (HTTPS)" field="logoUrl" placeholder="https://kkncsolutions.dev/logo.png" />
          </div>
        </div>

        <div className="border border-border rounded-lg p-6 bg-surface">
          <h2 className="text-sm font-medium text-text mb-4">Default Signature</h2>
          <textarea
            value={settings.defaultSignature}
            onChange={(e) => setSettings({ ...settings, defaultSignature: e.target.value })}
            placeholder="Regards, KKNC Solutions"
            rows={3}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text outline-none focus:border-gold transition-colors placeholder:text-text-muted resize-none"
          />
        </div>

        <div className="border border-border rounded-lg p-4 bg-surface-raised">
          <h2 className="text-sm font-medium text-text mb-2">SMTP Configuration</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            SMTP credentials are configured through environment variables on the server
            for security. Edit the <code className="text-gold bg-bg px-1 py-0.5 rounded">.env</code> file in the server root.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-medium rounded-lg hover:bg-gold-hover transition-colors cursor-pointer"
        >
          {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saved ? 'Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
