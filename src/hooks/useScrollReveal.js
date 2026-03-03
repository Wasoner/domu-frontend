import { useCallback, useEffect, useRef } from 'react';

/**
 * Adds `is-visible` class when the element enters the viewport.
 * Respects `prefers-reduced-motion`.
 * Uses a callback ref so it works even when the element mounts after the first render.
 * @param {{ threshold?: number, rootMargin?: string }} options
 */
export default function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const observerRef = useRef(null);

  const ref = useCallback((el) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    observerRef.current = observer;
  }, [threshold, rootMargin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return ref;
}
