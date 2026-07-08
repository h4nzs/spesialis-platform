import { useRef, useState } from 'react';

export interface FileUploadProps {
  label?: string;
  error?: string;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
}

export function FileUpload({
  label,
  error,
  accept = 'image/*',
  maxSizeMB = 10,
  multiple = false,
  onChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setFileError(null);

    if (files.length === 0) return;

    const oversized = files.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (oversized) {
      setFileError(`Ukuran file maksimal ${maxSizeMB}MB`);
      return;
    }

    const imageUrls = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => (multiple ? [...prev, ...imageUrls] : imageUrls));
    onChange?.(files);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border-default bg-bg-surface px-4 py-6 text-sm text-text-muted hover:border-primary hover:text-primary transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Klik untuk upload
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        data-testid="file-input"
        onChange={handleChange}
      />
      {(fileError ?? error) && (
        <span className="text-xs text-danger-500">{fileError ?? error}</span>
      )}
      {previews.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative h-16 w-16 overflow-hidden rounded-md border border-border-default"
            >
              <img
                src={src}
                alt={`Preview ${i + 1}`}
                className="h-full w-full object-cover"
                onLoad={() => URL.revokeObjectURL(src)}
              />
              <button
                type="button"
                onClick={() => setPreviews((prev) => prev.filter((_, j) => j !== i))}
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-white text-[10px] cursor-pointer"
                aria-label="Hapus"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
