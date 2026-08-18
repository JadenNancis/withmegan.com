"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/cn";

interface BookListViewerProps {
  bookListUrl: string;
  studentName: string;
}

function isPdf(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

function isImage(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(url.toLowerCase());
}

function fileExt(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function BookListViewer({ bookListUrl, studentName }: BookListViewerProps) {
  const [open, setOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Folder flap rotation — animates 0deg (closed) to -160deg (open)
  const flapRotate = useMotionValue(0);
  const flapRotateX = useTransform(flapRotate, [0, -160], [0, -160]);

  useEffect(() => {
    const controls = animate(flapRotate, open ? -160 : 0, {
      type: "spring",
      stiffness: 120,
      damping: 18,
      mass: 0.8,
    });
    return () => controls.stop();
  }, [open, flapRotate]);

  // Reset iframe loaded state when closing
  useEffect(() => {
    if (!open) setIframeLoaded(false);
  }, [open]);

  const ext = fileExt(bookListUrl);
  const pdf = isPdf(bookListUrl);
  const image = isImage(bookListUrl);

  return (
    <div ref={containerRef} className="relative">
      {/* Closed folder tab — click to open */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? `Close book list for ${studentName}` : `Open book list for ${studentName}`}
        className="group flex w-full items-center gap-3 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 px-4 py-2.5 text-left transition-colors hover:from-blue-100 hover:to-blue-100 min-h-[44px]"
      >
        {/* Folder icon with animated flap */}
        <div className="relative h-8 w-10 shrink-0" style={{ perspective: 100 }}>
          {/* Folder body (back) */}
          <div className="absolute bottom-0 left-0 h-6 w-10 rounded-b-md rounded-tr-md bg-blue-400 shadow-sm" />
          {/* Folder flap (front top) — rotates open */}
          <motion.div
            style={{ rotateX: flapRotateX, transformOrigin: "top center" }}
            className="absolute top-0 left-0 h-3 w-10 rounded-t-md bg-blue-500 shadow-sm"
          />
          {/* Inner paper peeking out */}
          <div className="absolute bottom-1 left-1.5 right-1.5 h-4 rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900">
            {open ? "Close book list" : "View book list"}
          </p>
          <p className="text-xs text-blue-600/70 truncate">
            {ext.toUpperCase()} document
          </p>
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Expanded content — folder interior */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: "spring", stiffness: 200, damping: 26 },
              opacity: { duration: 0.2, delay: open ? 0.1 : 0 },
            }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg border-2 border-blue-100 bg-white p-4 shadow-inner">
              {/* Folder interior header */}
              <div className="mb-3 flex items-center justify-between border-b border-blue-100 pb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  {studentName}&apos;s Book List
                </p>
                <a
                  href={bookListUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  Open in new tab
                </a>
              </div>

              {/* Content area — PDF iframe, image preview, or Word download card */}
              {pdf ? (
                <div className="relative">
                  {!iframeLoaded && (
                    <div className="flex h-64 items-center justify-center rounded-md bg-gray-50">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                        <p className="text-xs">Loading document…</p>
                      </div>
                    </div>
                  )}
                  <motion.iframe
                    initial={{ opacity: 0 }}
                    animate={{ opacity: iframeLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    src={bookListUrl}
                    title={`Book list for ${studentName}`}
                    onLoad={() => setIframeLoaded(true)}
                    className={cn(
                      "w-full rounded-md border border-gray-200",
                      iframeLoaded ? "h-[500px]" : "h-0",
                    )}
                  />
                </div>
              ) : image ? (
                <ImagePreview url={bookListUrl} ext={ext} studentName={studentName} />
              ) : (
                <WordDocCard url={bookListUrl} ext={ext} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImagePreview({ url, ext, studentName }: { url: string; ext: string; studentName: string }) {
  return (
    <div>
      <motion.img
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        src={url}
        alt={`Book list photo for ${studentName}`}
        className="mx-auto max-h-[560px] w-auto max-w-full rounded-md border border-gray-200 object-contain"
      />
      <p className="mt-2 text-center text-xs text-gray-500">
        Photo of the book list ({ext.toUpperCase()}) — tap &ldquo;Open in new tab&rdquo; to zoom.
      </p>
    </div>
  );
}

function WordDocCard({ url, ext }: { url: string; ext: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md bg-gray-50 py-12">
      <div className="flex h-16 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm">
        <span className="text-xs font-bold text-blue-700">{ext.toUpperCase()}</span>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          This document type can&apos;t be previewed in the browser.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Download {ext.toUpperCase()} file
        </a>
      </div>
    </div>
  );
}