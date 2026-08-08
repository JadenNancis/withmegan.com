"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotatingBackground } from "@/components/rotating-background";
import { TextInput } from "@/components/form";

type Tab = "signin" | "signup";

function AuthCard() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const [tab, setTab] = useState<Tab>(params.get("tab") === "signup" ? "signup" : "signin");

  // Shared state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sign-up only
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials. If you just signed up, your account may be awaiting administrator approval.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSignupSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "Could not create account.");
        return;
      }

      setSignupSuccess(
        "Account created. An administrator must approve it before you can sign in.",
      );
      setName("");
      setPassword("");
      setConfirmPassword("");
      setTab("signin");
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <RotatingBackground />
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white p-5 sm:p-8 shadow-2xl">
        {/* Tab switcher — 48px rows */}
        <div className="flex gap-1 mb-6 rounded-xl bg-gray-100 p-1" role="tablist" aria-label="Sign in or sign up">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signin"}
            onClick={() => { setTab("signin"); setError(null); setSignupSuccess(null); }}
            className={`flex-1 rounded-lg px-4 min-h-[48px] text-sm font-semibold transition-all ${
              tab === "signin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signup"}
            onClick={() => { setTab("signup"); setError(null); setSignupSuccess(null); }}
            className={`flex-1 rounded-lg px-4 min-h-[48px] text-sm font-semibold transition-all ${
              tab === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {signupSuccess && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {signupSuccess}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {tab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
              <TextInput
                id="email"
                type="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
              <TextInput
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[52px] rounded-xl bg-brand-600 px-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full name</label>
              <TextInput
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700">Email</label>
              <TextInput
                id="signup-email"
                type="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700">
                Password <span className="text-gray-400 font-normal">(min 8 characters)</span>
              </label>
              <TextInput
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700">Confirm password</label>
              <TextInput
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[52px] rounded-xl bg-brand-600 px-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
            <p className="text-center text-xs text-gray-500">
              New accounts need administrator approval before signing in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <RotatingBackground />
          <span className="sr-only">Loading…</span>
        </div>
      }
    >
      <AuthCard />
    </Suspense>
  );
}