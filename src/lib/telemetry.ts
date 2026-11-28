"use client";

const SF_UTM_STORAGE_KEY = "sf_utm_attribution_v1";

interface UtmSnapshot {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  landing_path?: string;
}

/**
 * 读取并持久化首跳 UTM 参数（跨 /convert/[slug] -> /#workbench 保持外联归因）
 */
export function captureAndGetUtm(): UtmSnapshot {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const src = params.get("utm_source")?.trim().slice(0, 64) || "";
    const camp = params.get("utm_campaign")?.trim().slice(0, 80) || "";
    const med = params.get("utm_medium")?.trim().slice(0, 64) || "";

    if (src || camp || med) {
      const fresh: UtmSnapshot = {
        ...(src ? { utm_source: src } : {}),
        ...(camp ? { utm_campaign: camp } : {}),
        ...(med ? { utm_medium: med } : {}),
        landing_path: window.location.pathname.slice(0, 100),
      };
      window.sessionStorage.setItem(SF_UTM_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const cached = window.sessionStorage.getItem(SF_UTM_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as UtmSnapshot;
    }
  } catch {
    // 隐私模式或禁用存储时静默降级
  }
  return {};
}

/**
 * 零 Cookie 轻量转化漏斗埋点，自动附带跨页持久化的 UTM 归因信息
 */
export function trackSfEvent(
  event: string,
  meta?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  try {
    const utm = captureAndGetUtm();
    const mergedMeta: Record<string, string | number | boolean> = {
      path: window.location.pathname.slice(0, 100),
      ...(utm.utm_source ? { utm_source: utm.utm_source } : {}),
      ...(utm.utm_campaign ? { utm_campaign: utm.utm_campaign } : {}),
      ...(utm.utm_medium ? { utm_medium: utm.utm_medium } : {}),
      ...(meta || {}),
    };
    const payload = JSON.stringify({ event, meta: mergedMeta });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/event",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // 埋点失败不阻塞业务主流程
  }
}
