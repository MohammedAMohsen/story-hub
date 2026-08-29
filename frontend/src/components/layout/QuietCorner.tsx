import { useEffect, useState } from "react";

const TYPING_SPEED_MS = 70;
const HOLD_DURATION_MS = 5200;
const FADE_DURATION_MS = 600;

type Phase = "typing" | "fading";

export function QuietCorner({ quotes }: { quotes: string[] }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || isPaused || quotes.length === 0) return;
    const currentQuote = quotes[quoteIndex];

    if (phase === "typing") {
      if (charCount < currentQuote.length) {
        const timeout = setTimeout(() => setCharCount((c) => c + 1), TYPING_SPEED_MS);
        return () => clearTimeout(timeout);
      }
      const timeout = setTimeout(() => setPhase("fading"), HOLD_DURATION_MS);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
      setCharCount(0);
      setPhase("typing");
    }, FADE_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [phase, charCount, quoteIndex, quotes, reducedMotion, isPaused]);

  if (quotes.length === 0) return null;

  if (reducedMotion) {
    return (
      <div className="flex flex-col gap-3">
        {quotes.map((quote, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 mt-2" />
            <p className="text-body-md text-on-surface-variant leading-relaxed">{quote}</p>
          </div>
        ))}
      </div>
    );
  }

  const visibleText = quotes[quoteIndex].slice(0, charCount);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`flex items-start gap-2.5 min-h-16 transition-opacity ${
        phase === "fading" && !isPaused ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 mt-2" />
      <p className="text-body-md text-on-surface-variant leading-relaxed">
        {visibleText}
        <span className="caret-blink inline-block w-[2px] h-[1em] -mb-0.5 ml-0.5 bg-primary/70" aria-hidden="true" />
      </p>
    </div>
  );
}