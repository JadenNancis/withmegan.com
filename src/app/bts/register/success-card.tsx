"use client";

import { useState } from "react";
import Link from "next/link";
import { SuccessCheckmark } from "@/components/bts-illustrations";
import { SITES } from "@/sites/site-registry";
import type { SubmitResult } from "./steps/review-step";

export function SuccessCard({
  result,
  phone,
  onRegisterAnother,
}: {
  result: SubmitResult;
  phone: string;
  onRegisterAnother: () => void;
}) {
  const [sentText, setSentText] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function textMyId() {
    setSentText("sending");
    try {
      const res = await fetch("/api/bts/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      if (!res.ok) throw new Error("Send failed");
      setSentText("sent");
    } catch {
      setSentText("error");
    }
  }

  function downloadIcs() {
    const d = new Date(SITES.bts.eventDate + "T09:00:00");
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = (x: Date) =>
      `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}T${pad(
        x.getUTCHours(),
      )}${pad(x.getUTCMinutes())}00Z`;
    const end = new Date(d.getTime() + 4 * 60 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//withmegan//bts//EN",
      "BEGIN:VEVENT",
      `UID:${result.thaId}@withmegan`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(d)}`,
      `DTEND:${stamp(end)}`,
      "SUMMARY:Back to School with Megan · Collection Day",
      `DESCRIPTION:Your Application ID is ${result.thaId}. Show it (or the QR code we sent) at the distribution counter.`,
      "LOCATION:Mt. St. George Community Centre\\, Tobago",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bts-collection-${result.thaId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 py-2 sm:py-6">
      {/* Celebration header */}
      <div className="text-center">
        <div className="motion-safe:bts-bounce-in mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 drop-shadow-lg">
          <SuccessCheckmark className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-xl" />
        </div>
        <h1 className="text-title text-brand-900">You&rsquo;re all set</h1>
        <p className="mt-3 text-body text-gray-600 max-w-md mx-auto leading-relaxed">
          Confirmation is on its way to <span className="font-semibold text-gray-900">{phone}</span>.
          {" "}Keep your Application ID somewhere safe. You&rsquo;ll show it on collection day.
        </p>
      </div>

      {/* ID card */}
      <div className="rounded-2xl border-2 border-dashed border-brand-300 bg-gradient-to-br from-brand-50 to-white p-5 sm:p-8 text-center shadow-lg">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
          Your Application ID
        </p>
        <p className="mt-3 text-3xl sm:text-4xl font-bold font-mono tracking-wider text-brand-900 break-all leading-tight">
          {result.thaId}
        </p>
        {result.qrCode && (
          <div className="mt-5 inline-block rounded-2xl bg-white p-3 sm:p-4 shadow-md ring-1 ring-brand-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.qrCode} alt="QR code for event day" width={180} height={180} className="w-40 h-40 sm:w-[180px] sm:h-[180px]" />
          </div>
        )}
        <p className="mt-4 text-sm text-gray-500">
          {result.dependentsCount}{" "}
          {result.dependentsCount === 1 ? "student" : "students"} registered
        </p>
      </div>

      {/* Action grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ActionButton
          label="Text me my ID"
          sub="Send ID + QR as SMS"
          onClick={textMyId}
          state={sentText}
        />
        <ActionButton
          label="Add to calendar"
          sub={new Date(SITES.bts.eventDate + "T12:00:00").toLocaleDateString("en-TT", {
            month: "short",
            day: "numeric",
          })}
          onClick={downloadIcs}
        />
        <Link
          href="/bts"
          className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-4 text-center shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow active:scale-95 transition-all duration-150 min-h-[80px]"
        >
          <span className="text-sm font-bold text-gray-800">Back home</span>
          <span className="text-xs text-gray-500 mt-0.5">Return to the site</span>
        </Link>
      </div>

      {sentText === "error" && (
        <p className="text-center text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          Couldn&rsquo;t send right now. Your ID above is still valid. Write it down.
        </p>
      )}

      <p className="text-center pt-2">
        <Link
          href="/bts/recover"
          className="inline-flex items-center justify-center rounded-full border border-white/25 bg-brand-950/55 backdrop-blur-md px-5 py-2.5 text-xs font-semibold text-brand-100 underline underline-offset-2 hover:bg-brand-900/70 hover:text-white transition-colors min-h-[44px]"
        >
          Lost your ID later? Recover it here
        </Link>
      </p>

      <div className="text-center">
        <button
          type="button"
          onClick={onRegisterAnother}
          className="inline-flex items-center justify-center rounded-full border border-white/25 bg-brand-950/55 backdrop-blur-md px-5 py-2.5 text-xs font-semibold text-brand-100 hover:bg-brand-900/70 hover:text-white transition-colors min-h-[44px]"
        >
          Register another family
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  sub,
  onClick,
  state = "idle",
}: {
  label: string;
  sub: string;
  onClick: () => void;
  state?: "idle" | "sending" | "sent" | "error";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "sending" || state === "sent"}
      className="flex flex-col items-center justify-center rounded-xl bg-brand-600 px-4 py-4 text-center shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 active:scale-95 transition-all duration-150 min-h-[80px] disabled:opacity-70 text-white"
    >
      <span className="text-sm font-bold">
        {state === "sending" ? "Sending…" : state === "sent" ? "Sent ✓" : label}
      </span>
      <span className="text-xs text-brand-100 mt-0.5">{sub}</span>
    </button>
  );
}
