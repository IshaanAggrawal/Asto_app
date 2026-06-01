import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook that triggers a callback when an element enters the viewport.
 * Used for scroll-based fade-in animations.
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Custom hook for streaming response text with typewriter effect.
 */
export function useStreamingResponse() {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const fullTextRef = useRef("");

  const reset = useCallback(() => {
    setDisplayText("");
    setIsComplete(false);
    fullTextRef.current = "";
  }, []);

  const appendText = useCallback((text: string) => {
    fullTextRef.current += text;
    setDisplayText(fullTextRef.current);
  }, []);

  const complete = useCallback(() => {
    setIsComplete(true);
    setDisplayText(fullTextRef.current);
  }, []);

  return { displayText, isComplete, reset, appendText, complete };
}
