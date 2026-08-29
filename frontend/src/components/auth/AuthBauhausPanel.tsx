import { useEffect, useRef } from "react";

const WORDS = ["Write.", "Read.", "Feel.", "Share.", "Begin.", "Follow.", "Reflect.", "Belong."];

export function AuthBauhausPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const wordElRef = useRef<HTMLDivElement>(null);
  const frameElRef = useRef<HTMLDivElement>(null);
  const counterElRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const canvas = canvasRef.current;
    if (!panel || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spacing = 28;
    const influenceRadius = 130;
    const maxPull = 16;
    const ease = 0.15;
    let dots: { ox: number; oy: number; x: number; y: number }[] = [];
    let ripples: { x: number; y: number; radius: number; alpha: number }[] = [];
    const mouse = { x: -9999, y: -9999 };
    const dpr = window.devicePixelRatio || 1;
    const panelSize = { w: 0, h: 0 };

    const ringWrap = ringWrapRef.current;
    const linesSvg = linesRef.current;
    const parallaxStrength = 0.04;
    const parallaxMax = 18;
    const parallax = { x: 0, y: 0 };

    function buildDots(w: number, h: number) {
      dots = [];
      for (let y = spacing / 2; y < h; y += spacing) {
        for (let x = spacing / 2; x < w; x += spacing) {
          dots.push({ ox: x, oy: y, x, y });
        }
      }
    }

    function resize() {
      if (!panel || !canvas) return;
      const rect = panel.getBoundingClientRect();
      panelSize.w = rect.width;
      panelSize.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots(rect.width, rect.height);
    }

    let rafId: number;
    function tick() {
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = mouse.x - d.ox;
        const dy = mouse.y - d.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let targetX = d.ox;
        let targetY = d.oy;
        let proximity = 0;
        if (dist < influenceRadius) {
          proximity = 1 - dist / influenceRadius;
          const angle = Math.atan2(dy, dx);
          targetX = d.ox + Math.cos(angle) * proximity * maxPull;
          targetY = d.oy + Math.sin(angle) * proximity * maxPull;
        }
        d.x += (targetX - d.x) * ease;
        d.y += (targetY - d.y) * ease;

        const size = 1 + proximity * 1.6;
        const alpha = 0.12 + proximity * 0.55;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(203, 234, 216, " + alpha + ")";
        ctx!.fill();
      }

      for (let r = ripples.length - 1; r >= 0; r--) {
        const rp = ripples[r];
        rp.radius += 2.6;
        rp.alpha -= 0.016;
        if (rp.alpha <= 0 || rp.radius > 110) {
          ripples.splice(r, 1);
          continue;
        }
        ctx!.beginPath();
        ctx!.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx!.strokeStyle = "rgba(203, 234, 216, " + rp.alpha + ")";
        ctx!.lineWidth = 1.2;
        ctx!.stroke();
      }

      const cx = panelSize.w / 2;
      const cy = panelSize.h / 2;
      let targetPX = 0;
      let targetPY = 0;
      if (mouse.x > -9000) {
        targetPX = Math.max(-parallaxMax, Math.min(parallaxMax, -(mouse.x - cx) * parallaxStrength));
        targetPY = Math.max(-parallaxMax, Math.min(parallaxMax, -(mouse.y - cy) * parallaxStrength));
      }
      parallax.x += (targetPX - parallax.x) * 0.08;
      parallax.y += (targetPY - parallax.y) * 0.08;
      const t = "translate(" + parallax.x.toFixed(1) + "px, " + parallax.y.toFixed(1) + "px)";
      if (ringWrap) ringWrap.style.transform = t;
      if (linesSvg) linesSvg.style.transform = t;

      rafId = requestAnimationFrame(tick);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = panel!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function handleMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function handleClick(e: MouseEvent) {
      const rect = panel!.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, radius: 0, alpha: 0.6 });
    }

    panel.addEventListener("mousemove", handleMouseMove);
    panel.addEventListener("mouseleave", handleMouseLeave);
    panel.addEventListener("click", handleClick);
    window.addEventListener("resize", resize);

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) {
      resize();
      tick();
    }

    const ring = ringRef.current;
    const lines = linesRef.current;
    const ringMaxOffset = 8;
    const linesMaxOffset = 14;

    function handleParallaxMove(e: MouseEvent) {
      const rect = panel!.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (ring) ring.style.transform = `translate(${-relX * ringMaxOffset}px, ${-relY * ringMaxOffset}px)`;
      if (lines) lines.style.transform = `translate(${-relX * linesMaxOffset}px, ${-relY * linesMaxOffset}px)`;
    }
    function handleParallaxLeave() {
      if (ring) ring.style.transform = "translate(0, 0)";
      if (lines) lines.style.transform = "translate(0, 0)";
    }
    panel.addEventListener("mousemove", handleParallaxMove);
    panel.addEventListener("mouseleave", handleParallaxLeave);

    function handleRippleClick(e: MouseEvent) {
      const rect = panel!.getBoundingClientRect();
      const ripple = document.createElement("div");
      ripple.className = "click-ripple";
      ripple.style.left = e.clientX - rect.left + "px";
      ripple.style.top = e.clientY - rect.top + "px";
      panel.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }
    panel.addEventListener("click", handleRippleClick);

    const wordEl = wordElRef.current;
    const frameEl = frameElRef.current;
    const counterEl = counterElRef.current;
    let wordTimer: ReturnType<typeof setTimeout> | undefined;
    let idx = 0;
    const holdDuration = 1800;
    const fadeDuration = 300;
    function pad(n: number) {
      return n < 10 ? "0" + n : "" + n;
    }
    function cycle() {
      if (!frameEl || !wordEl || !counterEl) return;
      frameEl.style.opacity = "0";
      wordTimer = setTimeout(() => {
        idx = (idx + 1) % WORDS.length;
        wordEl.textContent = WORDS[idx];
        counterEl.textContent = pad(idx + 1);
        frameEl.style.opacity = "1";
        wordTimer = setTimeout(cycle, holdDuration);
      }, fadeDuration);
    }
    if (isDesktop && wordEl && frameEl && counterEl) {
      wordTimer = setTimeout(cycle, holdDuration);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(wordTimer);
      panel.removeEventListener("mousemove", handleMouseMove);
      panel.removeEventListener("mouseleave", handleMouseLeave);
      panel.removeEventListener("click", handleClick);
      panel.removeEventListener("mousemove", handleParallaxMove);
      panel.removeEventListener("mouseleave", handleParallaxLeave);
      panel.removeEventListener("click", handleRippleClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="bauhaus-panel hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden"
    >
      <canvas ref={canvasRef} className="bauhaus-dotgrid-canvas" />
      <div ref={ringWrapRef} className="bauhaus-ring-wrap">
        <div ref={ringRef} className="bauhaus-ring" />
      </div>
      <svg ref={linesRef} className="bauhaus-lines" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="130" x2="260" y2="130" stroke="rgba(203,234,216,0.15)" strokeWidth="1" />
        <line x1="130" y1="0" x2="130" y2="260" stroke="rgba(203,234,216,0.15)" strokeWidth="1" />
        <circle cx="130" cy="130" r="60" fill="none" stroke="rgba(255,218,217,0.18)" strokeWidth="1" />
      </svg>

      <div className="relative z-10 text-center">
        <div className="bauhaus-counter">
          <span className="current" ref={counterElRef}>
            01
          </span>{" "}
          / 08
        </div>
        <div className="word-frame" ref={frameElRef}>
          <div className="bauhaus-word" ref={wordElRef}>
            Write.
          </div>
          <div className="bauhaus-underline" />
        </div>
        <p className="bauhaus-tagline">Storyhub — a quiet space for stories worth telling.</p>
      </div>
    </div>
  );
}
