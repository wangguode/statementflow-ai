"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  KeyRound,
  Lock,
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
  {
    label: "Local Ollama",
    baseUrl: "http://localhost:11434/v1",
    model: "qwen2.5:7b",
  },
];

export function AISettingsModal({
  open,
  config,
  onClose,
  onSave,
}: AISettingsModalProps) {
  const [draft, setDraft] = useState<AIConfigSettings>(config);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0b0e]/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-[#f5f5f7] p-6 text-[#111215]">
        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <h2 id="ai-settings-title" className="text-xl font-semibold">
              Engine settings
            </h2>
            <p className="mt-1 text-base text-[#494b52]">
              Switch between keyless local parsing or connect any OpenAI-compatible API endpoint.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI settings"
            className="sf-btn inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[#e8e8ed] text-[#111215]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDraft({ ...draft, provider: "demo" })}
              className={`sf-btn flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-medium ${
                draft.provider === "demo"
                  ? "bg-[#0066cc] text-white"
                  : "bg-[#e8e8ed] text-[#111215]"
              }`}
            >
              <Sparkles className="size-4 shrink-0" />
              <div>
                <div>Keyless Demo Mode</div>
                <div className="text-sm opacity-80">Zero API key needed</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft({ ...draft, provider: "openai_compatible" })
              }
              className={`sf-btn flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-medium ${
                draft.provider === "openai_compatible"
                  ? "bg-[#0066cc] text-white"
                  : "bg-[#e8e8ed] text-[#111215]"
              }`}
            >
              <KeyRound className="size-4 shrink-0" />
              <div>
                <div>Live LLM API Mode</div>
                <div className="text-sm opacity-80">OpenAI, DeepSeek, Qwen</div>
              </div>
            </button>
          </div>

          {draft.provider === "openai_compatible" && (
            <div className="space-y-3 rounded-lg bg-[#e8e8ed] p-4">
              <div>
                <span className="block text-sm font-medium text-[#111215]">
                  Endpoint Presets
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
                      className="sf-btn min-h-11 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-[#111215]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="ai-base-url"
                  className="block text-sm font-medium text-[#111215]"
                >
                  API Base URL
                </label>
                <input
                  id="ai-base-url"
                  type="url"
                  value={draft.baseUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, baseUrl: e.target.value })
                  }
                  placeholder="https://api.openai.com/v1"
                  className="mt-1 block w-full rounded-lg bg-white px-3 py-2.5 text-base text-[#111215]"
                />
              </div>

              <div>
                <label
                  htmlFor="ai-model-name"
                  className="block text-sm font-medium text-[#111215]"
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
                  className="mt-1 block w-full rounded-lg bg-white px-3 py-2.5 text-base text-[#111215]"
                />
              </div>

              <div>
                <label
                  htmlFor="ai-api-key"
                  className="block text-sm font-medium text-[#111215]"
                >
                  API Secret Key (Proxied via Backend, Never Logged)
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
                  className="mt-1 block w-full rounded-lg bg-white px-3 py-2.5 text-base text-[#111215]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 rounded-lg bg-[#e8e8ed] px-3.5 py-3 text-sm text-[#494b52]">
            <ShieldCheck className="size-4 shrink-0 text-[#0066cc]" />
            <span>
              Protected by timeout guards, schema validation, and automatic local fallback.
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="sf-btn min-h-11 rounded-lg bg-[#e8e8ed] px-4 py-2 text-base font-medium text-[#111215]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="sf-btn min-h-11 rounded-lg bg-[#0066cc] px-5 py-2 text-base font-semibold text-white"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}

interface CheckoutModalProps {
  open: boolean;
  plan: Exclude<PlanTier, "free">;
  gateway: "lemonsqueezy" | "stripe";
  onClose: () => void;
  onSuccessActivate: (plan: Exclude<PlanTier, "free">, email: string) => void;
}

export function CheckoutModal({
  open,
  plan,
  gateway,
  onClose,
  onSuccessActivate,
}: CheckoutModalProps) {
  const [email, setEmail] = useState("founder@northstar-ops.io");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const amount = plan === "business" ? 49 : 19;
  const planTitle =
    plan === "business" ? "StatementFlow Firm" : "StatementFlow Pro";

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
        mode: "live_redirect" | "sandbox";
        checkoutUrl?: string;
      };

      if (data.mode === "live_redirect" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      onSuccessActivate(plan, email);
      onClose();
    } catch {
      clearTimeout(timer);
      setErrorMsg("Network timeout initializing checkout. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0b0e]/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-[#f5f5f7] p-6 text-[#111215]">
        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#e8e8ed] px-2.5 py-1 text-sm font-medium text-[#111215]">
              <CreditCard className="size-4 text-[#0066cc]" />
              {gateway === "lemonsqueezy"
                ? "Lemon Squeezy MoR"
                : "Stripe Checkout"}
            </span>
            <h2
              id="checkout-modal-title"
              className="mt-2 text-xl font-semibold text-[#111215]"
            >
              {planTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="sf-btn inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[#e8e8ed] text-[#111215]"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmCheckout} className="mt-3 space-y-4">
          <div className="flex items-baseline justify-between rounded-lg bg-[#e8e8ed] px-4 py-3">
            <div>
              <div className="text-base font-medium text-[#111215]">
                Monthly license
              </div>
              <div className="text-sm text-[#494b52]">
                Cancel anytime in one click
              </div>
            </div>
            <div className="text-2xl font-semibold tabular-nums text-[#111215]">
              ${amount}
              <span className="text-sm font-normal text-[#494b52]">/mo</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="checkout-email"
              className="block text-sm font-medium text-[#111215]"
            >
              Work Email for License & Tax Receipt
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-white px-3 py-2.5 text-base text-[#111215]"
            />
          </div>

          <ul className="space-y-2 text-base text-[#494b52]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#0066cc]" />
              <span>Unlimited statement and multi-page invoice runs</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#0066cc]" />
              <span>Multi-sheet Excel (.xls), UTF-8 CSV and JSON export</span>
            </li>
          </ul>

          {errorMsg && (
            <p className="rounded-lg bg-[#c92a2a]/10 px-3 py-2 text-sm text-[#c92a2a]">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sf-btn flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0066cc] px-5 py-3 text-base font-semibold text-white disabled:opacity-60"
          >
            <Lock className="size-4" />
            <span>
              {loading
                ? "Initializing Checkout..."
                : `Activate plan ($${amount}/mo)`}
            </span>
          </button>

          <p className="text-center text-sm text-[#494b52]">
            Sandbox activation enabled until{" "}
            <code className="rounded bg-[#e8e8ed] px-1.5 py-0.5">
              LEMONSQUEEZY_API_KEY
            </code>{" "}
            or{" "}
            <code className="rounded bg-[#e8e8ed] px-1.5 py-0.5">
              STRIPE_SECRET_KEY
            </code>{" "}
            is set.
          </p>
        </form>
      </div>
    </div>
  );
}
