import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function useTabIndicator<T extends string>(activeTab: T) {
  const tabRefs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  const measure = useCallback((tab: T) => {
    const container = containerRef.current;
    const btn = tabRefs.current[tab];
    if (!container || !btn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({ width: btnRect.width, left: btnRect.left - containerRect.left });
  }, []);

  useLayoutEffect(() => {
    measure(activeTab);
  }, [activeTab, measure]);

  useEffect(() => {
    const container = containerRef.current;
    const btn = tabRefs.current[activeTab];
    if (!container || !btn || typeof ResizeObserver === "undefined") return;
    const onChange = () => measure(activeTab);
    const observer = new ResizeObserver(onChange);
    observer.observe(container);
    observer.observe(btn);
    window.addEventListener("resize", onChange);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onChange);
    };
  }, [activeTab, measure]);

  const setTabRef = useCallback(
    (tab: T) => (el: HTMLButtonElement | null) => {
      tabRefs.current[tab] = el;
    },
    []
  );

  return { containerRef, setTabRef, indicator };
}
