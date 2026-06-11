import { useEffect, useRef, useState } from 'react';

const ADSENSE_SCRIPT_ID = 'adsbygoogle-runtime';
const ADSENSE_LOADED_EVENT = 'adsbygoogle-runtime:loaded';

export function useAdSenseActivation(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adElementRef = useRef<HTMLModElement>(null);
  const [shouldRenderAd, setShouldRenderAd] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    const container = containerRef.current;
    if (!container) return;

    const hasUsableWidth = () => {
      const current = containerRef.current;
      return Boolean(
        current
        && current.offsetParent !== null
        && current.getBoundingClientRect().width >= 40
      );
    };

    const updateEligibility = () => {
      if (hasUsableWidth()) setShouldRenderAd(true);
    };

    const observeWidth = () => {
      updateEligibility();
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(updateEligibility);
        resizeObserver.observe(container);
      }
    };

    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        intersectionObserver?.disconnect();
        observeWidth();
      }, { rootMargin: '500px 0px' });
      intersectionObserver.observe(container);
    } else {
      observeWidth();
    }

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !shouldRenderAd) return;

    let cancelled = false;
    let frame: number | undefined;

    const initializeAd = () => {
      frame = window.requestAnimationFrame(() => {
        const adElement = adElementRef.current;
        if (!adElement || cancelled) return;
        if (adElement.dataset.adInitialized === 'true' || adElement.dataset.adStatus || adElement.dataset.adsbygoogleStatus) return;
        if (adElement.offsetParent === null || adElement.getBoundingClientRect().width < 40) return;

        try {
          adElement.dataset.adInitialized = 'true';
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (error) {
          adElement.dataset.adFailed = 'true';
          console.warn('AdSense push warning (expected if script is still loading/blocked): ', error);
        }
      });
    };

    const script = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;
    if (script?.dataset.loaded === 'true') initializeAd();
    else window.addEventListener(ADSENSE_LOADED_EVENT, initializeAd, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener(ADSENSE_LOADED_EVENT, initializeAd);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [enabled, shouldRenderAd]);

  return { adElementRef, containerRef, shouldRenderAd };
}
