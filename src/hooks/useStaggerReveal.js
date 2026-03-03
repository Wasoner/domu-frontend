import { useCallback, useEffect, useRef } from 'react';

/**
 * When the container enters the viewport, adds `is-visible` to each
 * `.reveal-stagger-child` with an incremental `--stagger-delay`.
 * Uses a callback ref so it works even when the element mounts after the first render.
 * @param {{ staggerMs?: number, threshold?: number }} options
 */
export default function useStaggerReveal({ staggerMs = 80, threshold = 0.1 } = {}) {
  const observerRef = useRef(null);

  const ref = useCallback((el) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const children = el.querySelectorAll('.reveal-stagger-child');

    if (prefersReduced) {
      el.classList.add('is-visible');
      children.forEach((child) => child.classList.add('is-visible'));
      return;
    }

    children.forEach((child, i) => {
      child.style.setProperty('--stagger-delay', `${i * staggerMs}ms`);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          children.forEach((child) => child.classList.add('is-visible'));
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    observerRef.current = observer;
  }, [staggerMs, threshold]);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return ref;
}
