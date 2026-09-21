import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface RecipientInputProps {
  label: string;
  emails: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecipientInput({ label, emails, onChange, placeholder }: RecipientInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const addEmail = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;

    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Invalid email address');
      return;
    }
    if (emails.includes(trimmed)) {
      setError('Email already added');
      return;
    }

    setError('');
    onChange([...emails, trimmed]);
    setInput('');
  };

  const removeEmail = (index: number) => {
    onChange(emails.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addEmail(input);
    }
    if (e.key === 'Backspace' && !input && emails.length > 0) {
      removeEmail(emails.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const parts = text.split(/[,;\s]+/).filter(Boolean);
    const newEmails = [...emails];
    for (const part of parts) {
      const trimmed = part.trim().toLowerCase();
      if (EMAIL_REGEX.test(trimmed) && !newEmails.includes(trimmed)) {
        newEmails.push(trimmed);
      }
    }
    onChange(newEmails);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-2 focus-within:border-gold transition-colors min-h-[42px]">
        {emails.map((email, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold/10 text-gold text-xs rounded-full border border-gold/20"
          >
            {email}
            <button
              onClick={() => removeEmail(i)}
              className="hover:text-gold-light transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="email"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addEmail(input)}
          onPaste={handlePaste}
          placeholder={emails.length === 0 ? (placeholder || 'Enter email and press Enter') : ''}
          className="flex-1 min-w-[180px] bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
        />
      </div>
      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
    </div>
  );
}
