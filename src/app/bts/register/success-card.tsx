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
      "SUMMARY:Back to School with Megan — Collection Day",
      `DESCRIPTION:Your Application ID is ${result.thaId}. Show it (or the QR code we sent) at the distribution counter.`,
      "LOCATION:Mount St. George Community Centre\\, Tobago",
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
    <div className="space-y-5 py-4">
      <div className="text-center">
        <div className="bts-bounce-in mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <SuccessCheckmark className="h-20 w-20 drop-shadow-xl" />
        </div>
        <h1 className="text-title text-brand-900">Registration submitted</h1>
        <p className="mt-2 text-body text-gray-600 max-w-md mx-auto">
          We&rsquo;ve sent confirmation to <span className="font-semibold">{phone}</span>.
          Keep your Application ID safe — you&rsquo;ll need it on event day.
        </p>
      </div>

      {/* ID card */}
      <div className="rounded-card border-2 border-dashed border-brand-300 bg-gradient-to-br from-brand-50 to-white p-6 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Your Application ID
        </p>
        <p className="mt-2 text-3xl font-bold font-mono tracking-wider text-brand-900 break-all">
          {result.thaId}
        </p>
        {result.qrCode && (
          <div className="mt-4 inline-block rounded-lg bg-white p-3 shadow-sm ring-1 ring-brand-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.qrCode} alt="QR code — scan on event day" width={180} height={180} />
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">
          {result.dependentsCount}{" "}
          {result.dependentsCount === 1 ? "student" : "students"} registered
        </p>
      </div>

      {/* Action grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ActionButton
          label="Text me my ID"
          sub="Send the ID + QR as SMS"
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
          className="flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-4 text-center shadow-sm hover:bg-gray-50 transition-colors min-h-[72px]"
        >
          <span className="text-sm font-bold text-gray-800">Back home</span>
          <span className="text-xs text-gray-500 mt-0.5">Return to the site</span>
        </Link>
      </div>

      {sentText === "error" && (
        <p className="text-center text-xs text-red-600">
          Couldn&rsquo;t send right now. Your ID above is still valid — write it down.
        </p>
      )}
      <p className="text-center text-xs text-gray-500">
        Lost your ID later?{" "}
        <Link href="/bts/recover" className="font-semibold text-brand-700 underline">
          Recover it here
        </Link>
      </p>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onRegisterAnother}
          className="text-sm font-semibold text-brand-700 underline hover:text-brand-900"
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
      className="flex flex-col items-center justify-center rounded-xl bg-brand-600 px-4 py-4 text-center shadow-sm hover:bg-brand-700 transition-colors min-h-[72px] disabled:opacity-70 text-white"
    >
      <span className="text-sm font-bold">
        {state === "sending" ? "Sending…" : state === "sent" ? "Sent ✓" : label}
      </span>
      <span className="text-xs text-brand-100 mt-0.5">{sub}</span>
    </button>
  );
}
