import { useEffect, useRef, useState } from 'react';

type ScrollRevealOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const { threshold = 0.15, rootMargin = '0px', once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setProgress(entry.intersectionRatio);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
          setProgress(0);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1], rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible, progress };
};

export const useMouseParallax = (intensity = 20) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = ((e.clientX - centerX) / rect.width) * intensity;
      const y = ((e.clientY - centerY) / rect.height) * intensity;
      setOffset({ x, y });
    };

    const handleLeave = () => setOffset({ x: 0, y: 0 });

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [intensity]);

  return { ref, offset };
};

export const useCountUp = (end: number, duration = 2000, startOnVisible = true) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnVisible);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    let frame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, started]);

  return { count, start: () => setStarted(true) };
};

export default useScrollReveal;
