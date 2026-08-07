"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Native getUserMedia QR scanner for the BTS admin scan-to-verify page.
 *
 * No external QR-decoding library is available in this project, so this
 * component provides two modes:
 *   1. Camera viewport via getUserMedia (rear camera preferred) — the
 *      operator points the camera at a QR code. A dedicated barcode/
 *      QR detector (BarcodeDetector API where available) reads the
 *      encoded value; on browsers without it, the viewport still shows
 *      a live feed and the operator falls back to manual entry.
 *   2. Manual Application ID entry — an <input type="text"> for typing
 *      or pasting the ID.
 *
 * On a successful read, the component redirects to the site's verify
 * page with ?aid=<id>.
 */
export function BtsQrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<unknown>(null);
  const rafRef = useRef<number | null>(null);

  const [cameraState, setCameraState] = useState<"idle" | "starting" | "live" | "denied" | "unsupported" | "error">("idle");
  const [manualId, setManualId] = useState("");
  const [detectedHint, setDetectedHint] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleDetectedValue(raw: string) {
    const aid = extractApplicationId(raw);
    if (!aid) return;
    setDetectedHint(aid);
    // Brief delay so the operator sees confirmation before redirect.
    setTimeout(() => {
      router.push(`/bts/verify?aid=${encodeURIComponent(aid)}`);
    }, 350);
  }

  function handleSubmitManual(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = manualId.trim();
    if (!trimmed) return;
    handleDetectedValue(trimmed);
  }

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("idle");
  }, []);

  const scanLoop = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    try {
      const detector = detectorRef.current as { detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>> } | null;
      if (detector) {
        const results = await detector.detect(video);
        for (const r of results) {
          if (r.rawValue) {
            handleDetectedValue(r.rawValue);
            return;
          }
        }
      }
    } catch {
      // transient detection errors — keep scanning
    }
    rafRef.current = requestAnimationFrame(scanLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMsg(null);
    setDetectedHint(null);

    const barcodeDetectorSupported = typeof window !== "undefined" && "BarcodeDetector" in window;
    if (barcodeDetectorSupported) {
      try {
        const Bd = (window as unknown as { BarcodeDetector: new (opts?: { types?: string[] }) => { detect: (s: CanvasImageSource) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
        detectorRef.current = new Bd({ types: ["qr_code"] });
      } catch {
        detectorRef.current = null;
      }
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }

    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraState("live");
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraState("denied");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCameraState("unsupported");
      } else {
        setCameraState("error");
        setErrorMsg((err as Error)?.message ?? "Could not start camera.");
      }
    }
  }, [scanLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Camera viewport */}
      <div className="bts-fade-in-up rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-cyan-900">Camera Scanner</h2>
        <p className="mt-1 text-sm text-gray-600">
          Point the camera at the QR code on the registration confirmation. The Application ID
          is read automatically and the verify page opens.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-cyan-200 bg-gray-900">
          <div className="relative aspect-square w-full sm:aspect-[4/3]">
            <video
              ref={videoRef}
              className={cn(
                "h-full w-full object-cover transition-opacity",
                cameraState === "live" ? "opacity-100" : "opacity-0",
              )}
              playsInline
              muted
            />
            {cameraState !== "live" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                {cameraState === "starting" && (
                  <p className="text-sm text-gray-300">Starting camera…</p>
                )}
                {cameraState === "idle" && (
                  <>
                    <CameraIcon className="h-12 w-12 text-cyan-300" />
                    <p className="text-sm text-gray-300">Camera is off.</p>
                  </>
                )}
                {cameraState === "denied" && (
                  <>
                    <CameraOffIcon className="h-12 w-12 text-red-400" />
                    <p className="text-sm text-red-300">Camera access denied. Grant permission or use manual entry below.</p>
                  </>
                )}
                {cameraState === "unsupported" && (
                  <>
                    <CameraOffIcon className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-300">No camera detected on this device. Use manual entry below.</p>
                  </>
                )}
                {cameraState === "error" && (
                  <>
                    <CameraOffIcon className="h-12 w-12 text-red-400" />
                    <p className="text-sm text-red-300">{errorMsg ?? "Camera error."}</p>
                  </>
                )}
              </div>
            )}
            {/* Scanning reticle */}
            {cameraState === "live" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-xl border-2 border-cyan-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                  <div className="bts-scan-line h-0.5 w-full bg-cyan-300" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {cameraState === "live" ? (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Stop camera
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              disabled={cameraState === "starting"}
              className={cn(
                "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-cyan-700",
                cameraState === "starting" && "opacity-60",
              )}
            >
              {cameraState === "starting" ? "Starting…" : "Start camera"}
            </button>
          )}
        </div>

        {detectedHint && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            ✓ Detected Application ID{" "}
            <code className="font-mono font-semibold">{detectedHint}</code> — opening verify…
          </div>
        )}
      </div>

      {/* Manual entry fallback */}
      <div className="bts-fade-in-up rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-cyan-900">Manual Entry</h2>
        <p className="mt-1 text-sm text-gray-600">
          If the camera isn&rsquo;t available, type or paste the Application ID (e.g.{" "}
          <code className="font-mono">BTS-260806-ABC123</code>).
        </p>
        <form onSubmit={handleSubmitManual} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="BTS-YYMMDD-XXXXXX"
            className="min-h-[44px] flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={!manualId.trim()}
            className={cn(
              "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-cyan-700",
              !manualId.trim() && "opacity-60",
            )}
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Extract an Application ID from a scanned value.
 * QR codes encode a full verify URL (e.g.
 *   https://backtoschoolwithmegan.tha.tt/bts/verify?aid=BTS-260806-ABC123
 * ) but the scanner may also receive a raw ID. Handle both.
 */
function extractApplicationId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // URL form — pull the `aid` query param.
  if (/^https?:\/\//i.test(trimmed) || trimmed.includes("?aid=")) {
    try {
      const url = new URL(trimmed);
      const aid = url.searchParams.get("aid");
      if (aid) return aid;
    } catch {
      // not a valid URL — fall through
    }
  }

  // Raw Application ID form (e.g. BTS-260806-ABC123 or MD-260806-ABC123).
  if (/^(BTS|MD)-\d{6}-[A-Z0-9]{6}$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L15 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.5 5.5L12 4h0l1.5 2h2a2 2 0 0 1 2 2v2l2 2v6a2 2 0 0 1-.5 1.3" />
      <path d="M6.5 6.5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 1.3-.5" />
      <path d="M9.5 13a3 3 0 0 0 4 4" />
    </svg>
  );
}