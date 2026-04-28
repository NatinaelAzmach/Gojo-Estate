'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { validateImageFile } from '@/lib/validation';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
}

interface FileEntry {
  file: File;
  preview: string;
  error?: string;
}

export default function ImageUploader({
  onFilesChange,
  multiple = true,
  label = 'Upload Images',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);

  function processFiles(fileList: FileList | null) {
    if (!fileList) return;

    const incoming = Array.from(fileList);
    const newEntries: FileEntry[] = incoming.map((file) => {
      const result = validateImageFile(file);
      if (!result.valid) {
        return { file, preview: '', error: result.error };
      }
      return { file, preview: URL.createObjectURL(file) };
    });

    const merged = multiple ? [...entries, ...newEntries] : newEntries;
    setEntries(merged);

    const validFiles = merged.filter((e) => !e.error).map((e) => e.file);
    onFilesChange(validFiles);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    processFiles(e.target.files);
    // reset so same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function removeEntry(index: number) {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    onFilesChange(updated.filter((e) => !e.error).map((e) => e.file));
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragging
            ? 'border-teal-brand bg-teal-50'
            : 'border-gray-300 hover:border-teal-brand hover:bg-gray-50'
        }`}
      >
        <svg
          className="mx-auto w-10 h-10 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-500">
          Drag &amp; drop images here, or{' '}
          <span className="text-teal-brand font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 10 MB each</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />

      {/* Previews / errors */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {entries.map((entry, i) => (
            <div key={i} className="relative group">
              {entry.error ? (
                <div className="flex flex-col items-center justify-center h-24 rounded-lg border border-red-300 bg-red-50 p-2 text-center">
                  <svg className="w-5 h-5 text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-600 leading-tight">{entry.error}</p>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.preview}
                  alt={entry.file.name}
                  className="h-24 w-full object-cover rounded-lg border border-gray-200"
                />
              )}
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
