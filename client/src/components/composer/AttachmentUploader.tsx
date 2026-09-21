import { useCallback, useRef, useState } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';

interface AttachmentUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.wsf', '.wsh',
  '.msi', '.com', '.pif', '.reg', '.inf', '.hta', '.cpl', '.msc',
  '.jar', '.ps1', '.dll', '.sys', '.sh',
]);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentUploader({ files, onChange }: AttachmentUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (BLOCKED_EXTENSIONS.has(ext)) return `File type ${ext} is not allowed`;
    if (file.size > MAX_FILE_SIZE) return `${file.name} exceeds 10MB limit`;
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const currentTotal = files.reduce((sum, f) => sum + f.size, 0);
    const toAdd: File[] = [];
    let err = '';

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        err = validationError;
        continue;
      }
      const newTotal = currentTotal + toAdd.reduce((s, f) => s + f.size, 0) + file.size;
      if (newTotal > MAX_TOTAL_SIZE) {
        err = 'Total attachment size exceeds 25MB limit';
        break;
      }
      toAdd.push(file);
    }

    setError(err);
    if (toAdd.length > 0) {
      onChange([...files, ...toAdd]);
    }
  }, [files, onChange]);

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
        Attachments
      </label>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-gold bg-gold/5'
            : 'border-border hover:border-border-light'
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-text-muted" />
        <p className="text-sm text-text-secondary">
          Drag & drop files here or{' '}
          <span className="text-gold underline">browse</span>
        </p>
        <p className="text-xs text-text-muted mt-1">Max 10MB per file, 25MB total</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-error">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2.5 bg-surface-raised border border-border rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <File size={18} className="text-gold shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-text truncate">{file.name}</p>
                  <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="text-text-muted hover:text-error transition-colors shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <p className="text-xs text-text-muted text-right">
            Total: {formatFileSize(totalSize)} / {formatFileSize(MAX_TOTAL_SIZE)}
          </p>
        </div>
      )}
    </div>
  );
}
