import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Mail } from 'lucide-react';
import { getHistory } from '../services/api';

interface SentEmail {
  id: string;
  to: string[];
  subject: string;
  status: 'sent' | 'failed';
  sentAt: string;
}

export default function SentPage() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((res: any) => {
        if (res.emails) setEmails(res.emails);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail size={24} className="text-gold" />
        <h1 className="text-xl font-semibold text-text">Sent Emails</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Clock size={24} className="text-text-muted animate-pulse" />
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Mail size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No emails sent yet</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Recipient</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Subject</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {emails.map((email) => (
                <tr key={email.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                    {formatDate(email.sentAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text">
                    {email.to.join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-text truncate max-w-[200px]">
                    {email.subject}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {email.status === 'sent' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 size={14} /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-error">
                        <XCircle size={14} /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
