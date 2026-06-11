type AnalyticsValue = string | number | boolean | null | undefined;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, AnalyticsValue>>;
  }
}

function cleanParams(params: Record<string, AnalyticsValue>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
}

export function trackEvent(event: string, params: Record<string, AnalyticsValue> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(cleanParams({ event, ...params }));
}

export function trackPageView(path: string, title = document.title) {
  trackEvent("virtual_page_view", {
    page_path: path,
    page_title: title
  });
}

export function reportWebVitals() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return () => {};
  const observers: PerformanceObserver[] = [];
  let clsValue = 0;
  let inpValue = 0;

  const observe = (type: string, callback: PerformanceObserverCallback) => {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ type, buffered: true } as PerformanceObserverInit);
      observers.push(observer);
    } catch {
      // Older browsers may not support every performance entry type.
    }
  };

  observe("largest-contentful-paint", (list) => {
    const entries = list.getEntries();
    const entry = entries[entries.length - 1];
    if (entry) trackEvent("web_vital", { metric_name: "LCP", metric_value: Math.round(entry.startTime) });
  });

  observe("layout-shift", (list) => {
    for (const entry of list.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
      if (!entry.hadRecentInput) clsValue += entry.value || 0;
    }
  });

  observe("event", (list) => {
    for (const entry of list.getEntries() as Array<PerformanceEntry & { duration: number; interactionId?: number }>) {
      if (entry.interactionId && entry.duration > inpValue) inpValue = entry.duration;
    }
  });

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navigation) {
    trackEvent("web_vital", {
      metric_name: "TTFB",
      metric_value: Math.round(navigation.responseStart)
    });
  }

  const flush = () => {
    trackEvent("web_vital", { metric_name: "CLS", metric_value: Number(clsValue.toFixed(4)) });
    if (inpValue > 0) trackEvent("web_vital", { metric_name: "INP", metric_value: Math.round(inpValue) });
  };
  window.addEventListener("pagehide", flush, { once: true });

  return () => {
    window.removeEventListener("pagehide", flush);
    observers.forEach((observer) => observer.disconnect());
  };
}
