"use client";

import { useState, useRef, useCallback } from "react";
import { SchoolBookIcon } from "@/components/bts-illustrations";
import { cn } from "@/lib/cn";
import { uploadGalleryPhoto } from "@/lib/gallery-upload";

export function BtsGalleryManager({ initialPhotos }: { initialPhotos: string[] }) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadGalleryPhoto(file, "bts");
        if (url) {
          setPhotos((prev) => [...prev, url].sort());
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }, []);

  async function handleDelete(url: string) {
    const filename = url.split("/").pop();
    if (!filename) return;
    if (!confirm("Delete this photo?")) return;

    setError(null);
    try {
      const res = await fetch(`/api/gallery?site=bts&filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed.");
      }
      setPhotos((prev) => prev.filter((p) => p !== url));
    } catch (err: any) {
      setError(err?.message ?? "Delete failed.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bts-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
            <SchoolBookIcon className="h-8 w-8" />
          </div>
          <div className="px-5 py-4">
            <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Gallery Manager</h1>
            <p className="mt-0.5 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
              {photos.length} photo{photos.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) {
            void uploadFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "bts-fade-in-up cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-cyan-500 bg-cyan-50" : "border-cyan-300 bg-cyan-50/30 hover:bg-cyan-50/60",
        )}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
          <svg className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-cyan-800">
          {uploading ? "Uploading…" : "Click or drag photos to upload"}
        </p>
        <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP, or GIF. Up to 8 MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Existing photos */}
      {photos.length === 0 ? (
        <div className="bts-fade-in-up rounded-2xl border border-dashed border-brand-400/50 bg-brand-950/60 backdrop-blur-md p-12 text-center shadow-xl">
          <div className="mx-auto mb-4 opacity-50">
            <SchoolBookIcon className="h-16 w-16 text-brand-300" />
          </div>
          <p className="text-sm font-medium text-brand-100/85">No photos uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((url) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-2xl shadow-md"
            >
              <img
                src={url}
                alt="Gallery photo"
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <button
                onClick={() => handleDelete(url)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label="Delete photo"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}