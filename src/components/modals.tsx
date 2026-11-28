"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  KeyRound,
  Loader2,
  Lock,
  MailCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { AIConfigSettings, PlanTier } from "@/types/statement";

interface AISettingsModalProps {
  open: boolean;
  config: AIConfigSettings;
  onClose: () => void;
  onSave: (next: AIConfigSettings) => void;
}

const PROVIDER_PRESETS = [
  {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  {
    label: "Bailian / Qwen",
    baseUrl: "https://maas.qianwenaiapi.com/compatible-mode/v1",
    model: "qwen-plus",
  },
];

export function AISettingsModal({
  open,
  config,
  onClose,
  onSave,
}: AISettingsModalProps) {
  const [draft, setDraft] = useState<AIConfigSettings>(config);
  const [validationErr, setValidationErr] = useState("");

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setDraft(config);
        setValidationErr("");
      });
    }
  }, [open, config]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0b0e]/65 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
    >
      <div className="sf-frosted-modal w-full max-w-lg rounded-2xl p-6 text-[#111215]">
        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <h2 id="ai-settings-title" className="text-xl font-semibold tracking-tight">
              AI Extraction Engine
            </h2>
            <p className="mt-1 text-sm text-[#494b52]">
              Use our zero-key managed engine out of the box, or attach your own OpenAI-compatible API endpoint (BYOK).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI settings"
            className="sf-btn inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-[#e8e8ed]/80 text-[#111215] hover:bg-[#dcdce4]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-2 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDraft({ ...draft, provider: "demo" })}
              className={`sf-btn flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                draft.provider === "demo"
                  ? "bg-[#0066cc] text-white shadow-sm"
                  : "bg-[#e8e8ed]/80 text-[#111215] hover:bg-[#dfe0e6]"
              }`}
            >
              <Sparkles className="size-4 shrink-0" />
              <div>
                <div>Managed Cloud + Local</div>
                <div className="text-xs font-normal opacity-85">Zero API key needed</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft({ ...draft, provider: "openai_compatible" })
              }
              className={`sf-btn flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                draft.provider === "openai_compatible"
                  ? "bg-[#0066cc] text-white shadow-sm"
                  : "bg-[#e8e8ed]/80 text-[#111215] hover:bg-[#dfe0e6]"
              }`}
            >
              <KeyRound className="size-4 shrink-0" />
              <div>
                <div>Custom BYOK Endpoint</div>
                <div className="text-xs font-normal opacity-85">OpenAI, DeepSeek, Qwen</div>
              </div>
            </button>
          </div>

          {draft.provider === "openai_compatible" && (
            <div className="space-y-3 rounded-xl border border-black/5 bg-[#eef0f5] p-4">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#494b52]">
                  Quick Endpoint Presets
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROVIDER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          baseUrl: preset.baseUrl,
                          model: preset.model,
                        })
                      }
                      className="sf-btn min-h-9 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#111215] hover:border-[#0066cc]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="ai-base-url"
                  className="block text-xs font-semibold text-[#111215]"
                >
                  API Base URL (HTTPS)
                </label>
                <input
                  id="ai-base-url"
                  type="url"
                  value={draft.baseUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, baseUrl: e.target.value })
                  }
                  placeholder="https://api.openai.com/v1"
                  className="mt-1 block min-h-11 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-base text-[#111215] sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="ai-model-name"
                  className="block text-xs font-semibold text-[#111215]"
                >
                  Model Identifier
                </label>
                <input
                  id="ai-model-name"
                  type="text"
                  value={draft.model}
                  onChange={(e) =>
                    setDraft({ ...draft, model: e.target.value })
                  }
                  placeholder="gpt-4o-mini"
                  className="mt-1 block min-h-11 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-base text-[#111215] sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="ai-api-key"
                  className="block text-xs font-semibold text-[#111215]"
                >
                  API Secret Key (Stored in Browser Only · Never Logged)
                </label>
                <input
                  id="ai-api-key"
                  type="password"
                  value={draft.apiKey}
                  onChange={(e) =>
                    setDraft({ ...draft, apiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  autoComplete="off"
                  className="mt-1 block min-h-11 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-base text-[#111215] sm:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-[#eef0f5] px-3.5 py-3 text-xs text-[#494b52]">
            <ShieldCheck className="size-4 shrink-0 text-[#0066cc]" />
            <span>
              Protected by 30s timeout guards, strict JSON schema validation, and deterministic cent-level reconciliation.
            </span>
          </div>
          {validationErr && (
            <p className="rounded-xl bg-[#c92a2a]/10 px-3 py-2 text-xs font-medium text-[#c92a2a]">
              {validationErr}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="sf-btn min-h-10 rounded-xl bg-[#e8e8ed] px-4 py-2 text-sm font-medium text-[#111215]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (draft.provider === "openai_compatible") {
                if (!draft.apiKey.trim()) {
                  setValidationErr("Please enter your API Secret Key or switch back to Managed Cloud + Local.");
                  return;
                }
                if (!/^https:\/\/.+/i.test(draft.baseUrl.trim())) {
                  setValidationErr("Custom API Base URL must start with https://.");
                  return;
                }
              }
              setValidationErr("");
              onSave(draft);
              onClose();
            }}
            className="sf-btn min-h-10 rounded-xl bg-[#0066cc] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0058b3]"
          >
            Save Engine Settings
          </button>
        </div>
      </div>
    </div>
  );
}

interface CheckoutModalProps {
  open: boolean;
  plan: Exclude<PlanTier, "free">;
  gateway: "creem" | "stripe";
  unlockReason?: string;
  onClose: () => void;
  onSuccessActivate?: (plan: Exclude<PlanTier, "free">, email: string, restoreToken?: string) => void;
  onOpenRestore?: () => void;
}

export function CheckoutModal({
  open,
  plan,
  gateway,
  unlockReason,
  onClose,
  onOpenRestore,
}: CheckoutModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const amount = plan === "business" ? 199 : 29;
  const planTitle =
    plan === "business"
      ? "Boutique Firm Pilot (14-Day · Unlimited Seats)"
      : "StatementFlow AI Pro (Lifetime Unlimited)";

  async function handleConfirmCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, gateway }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = (await res.json()) as {
        mode?: "live_redirect" | "concierge_invoice";
        checkoutUrl?: string;
        contactEmail?: string;
        error?: string;
      };

      if (data.mode === "live_redirect" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.mode === "concierge_invoice") {
        const to = data.contactEmail || "hello@statementflow.win";
        const subj = encodeURIComponent(
          "StatementFlow $199 Firm Pilot Onboarding Request"
        );
        const body = encodeURIComponent(
          `Hi StatementFlow Team,\n\nWe would like to start the $199 14-day StatementFlow Firm Pilot (unlimited seats).\nWork Email: ${email}\n\nPlease send the invoice link and onboarding instructions.`
        );
        window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
        setErrorMsg(
          `Direct B2B invoice draft opened for ${to}. You can also email us directly with your sample bank PDF.`
        );
        return;
      }

      throw new Error(data.error || "Checkout session unavailable");
    } catch {
      clearTimeout(timer);
      setErrorMsg("Unable to initialize checkout right now. Please retry or email hello@statementflow.win.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0b0e]/65 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="sf-frosted-modal w-full max-w-md rounded-2xl p-6 text-[#111215]">
        <div className="flex items-start justify-between gap-4 pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0066cc]/20 bg-[#0066cc]/10 px-2.5 py-1 text-xs font-semibold text-[#0055ad]">
              <CreditCard className="size-3.5 text-[#0066cc]" />
              Creem.io Merchant of Record
            </span>
            <h2
              id="checkout-modal-title"
              className="mt-2.5 text-xl font-semibold tracking-tight text-[#111215]"
            >
              {planTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="sf-btn inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-[#e8e8ed]/80 text-[#111215] hover:bg-[#dcdce4]"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmCheckout} className="mt-2 space-y-4">
          {unlockReason && (
            <div className="rounded-xl border border-[#0066cc]/30 bg-[#0066cc]/10 px-3.5 py-2.5 text-xs font-medium text-[#004488]">
              {unlockReason}
            </div>
          )}

          <div className="flex items-baseline justify-between rounded-xl border border-black/5 bg-[#eef0f5] px-4 py-3.5">
            <div>
              <div className="text-sm font-semibold text-[#111215]">
                {plan === "business" ? "14-Day Guided Firm Pilot" : "One-time lifetime license"}
              </div>
              <div className="text-xs text-[#494b52]">
                {plan === "business"
                  ? "Unlimited firm seats · Saves $989+/yr vs Dext per-seat"
                  : "No monthly subscription · Saves $439/yr vs $39/mo tools"}
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums text-[#111215]">
              ${amount}
              <span className="text-xs font-medium text-[#494b52]"> once</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-600/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-medium text-emerald-950">
            <ShieldCheck className="size-4 shrink-0 text-emerald-700" />
            <span>
              <strong>14-Day 100% Money-Back Guarantee:</strong> If any client bank PDF fails $0.00 reconciliation, reply to your receipt for an instant full refund.
            </span>
          </div>

          <div>
            <label
              htmlFor="checkout-email"
              className="block text-xs font-semibold text-[#111215]"
            >
              Optional: Work Email (Pre-fills Creem Checkout &amp; Multi-Device Link)
            </label>
            <input
              id="checkout-email"
              type="email"
              placeholder="accounting@yourfirm.com (optional — or enter on checkout)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-base text-[#111215] focus:border-[#0066cc] focus:outline-none sm:text-sm"
            />
          </div>

          <ul className="space-y-2 text-xs text-[#494b52]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#0066cc]" />
              <span>
                {plan === "business"
                  ? "Unlimited firm seats + white-glove tuning on tricky bank PDFs"
                  : "Unlimited batch PDF statements & scanned Vision OCR"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#0066cc]" />
              <span>Multi-sheet Excel (.xlsx), QuickBooks 3-col &amp; Xero 5-col CSV</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#0066cc]" />
              <span>Instant cross-device activation link + 14-day refund guarantee</span>
            </li>
          </ul>

          {errorMsg && (
            <p className="rounded-xl bg-[#c92a2a]/10 px-3 py-2 text-xs font-medium text-[#c92a2a]">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sf-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0066cc] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0058b3] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )}
            <span>
              {loading
                ? "Redirecting to Secure Creem Checkout..."
                : `Continue to Secure Checkout · $${amount} once`}
            </span>
          </button>

          <div className="flex flex-col items-center gap-1.5 pt-1 text-center text-xs text-[#494b52]">
            <span>
              Global VAT / Sales Tax handled automatically by Creem.io.
            </span>
            {onOpenRestore && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRestore();
                }}
                className="font-semibold text-[#0066cc] hover:underline cursor-pointer"
              >
                Already purchased? Restore Pro or activate team seat →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

interface RestoreLicenseModalProps {
  open: boolean;
  onClose: () => void;
  onRestored: (plan: Exclude<PlanTier, "free">, email: string, restoreToken?: string) => void;
}

export function RestoreLicenseModal({
  open,
  onClose,
  onRestored,
}: RestoreLicenseModalProps) {
  const [email, setEmail] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  async function handleRestore(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/license/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          orderRef: orderRef.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        restored?: boolean;
        magicLinkSent?: boolean;
        plan?: Exclude<PlanTier, "free">;
        email?: string;
        restoreToken?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Could not verify license. Check your email or order ID.");
        return;
      }
      if (data.restored && data.plan) {
        onRestored(data.plan, data.email || email.trim(), data.restoreToken);
        onClose();
        return;
      }
      setFeedback(
        data.message ||
          "If an active paid license exists for this email, we just sent a 1-click activation link to your inbox."
      );
    } catch {
      setErrorMsg("Network error while checking license. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0b0e]/65 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-modal-title"
    >
      <div className="sf-frosted-modal w-full max-w-md rounded-2xl p-6 text-[#111215]">
        <div className="flex items-start justify-between gap-4 pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0066cc]/20 bg-[#0066cc]/10 px-2.5 py-1 text-xs font-semibold text-[#0055ad]">
              <RotateCcw className="size-3.5 text-[#0066cc]" />
              Cross-Device &amp; Team Seat Recovery
            </span>
            <h2
              id="restore-modal-title"
              className="mt-2.5 text-xl font-semibold tracking-tight text-[#111215]"
            >
              Restore StatementFlow License
            </h2>
            <p className="mt-1 text-xs text-[#494b52]">
              Switched computers, cleared browser storage, or onboarding a bookkeeping colleague? Unlock your Pro or Firm Pilot license here.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close restore modal"
            className="sf-btn inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-[#e8e8ed]/80 text-[#111215] hover:bg-[#dcdce4]"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleRestore} className="mt-3 space-y-3.5">
          <div>
            <label
              htmlFor="restore-email"
              className="block text-xs font-semibold text-[#111215]"
            >
              Checkout Email Address
            </label>
            <input
              id="restore-email"
              type="email"
              required
              placeholder="you@yourfirm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-base text-[#111215] focus:border-[#0066cc] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="restore-order-ref"
              className="block text-xs font-semibold text-[#111215]"
            >
              Creem Order / Checkout ID{" "}
              <span className="font-normal text-[#494b52]">
                (Optional — unlocks immediately without waiting for email)
              </span>
            </label>
            <input
              id="restore-order-ref"
              type="text"
              placeholder="Full ch_... / ord_... ID (leave blank to get email link)"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2 text-base font-mono text-[#111215] focus:border-[#0066cc] focus:outline-none sm:text-sm"
            />
          </div>

          {feedback && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-600/25 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-900">
              <MailCheck className="size-4 shrink-0 text-emerald-700 mt-0.5" />
              <span>{feedback}</span>
            </div>
          )}

          {errorMsg && (
            <p className="rounded-xl bg-[#c92a2a]/10 px-3 py-2 text-xs font-medium text-[#c92a2a]">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sf-btn flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0066cc] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0058b3] disabled:opacity-60 cursor-pointer"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>
              {orderRef.trim().length >= 12
                ? "Verify & Unlock Immediately"
                : "Send 1-Click Activation Link"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
