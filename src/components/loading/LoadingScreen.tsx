import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Preparing business workspace...',
  'Organizing sales intelligence...',
  'Synchronizing operational insights...',
  'Preparing AI workspace...',
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [messageIdx, setMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const totalDuration = prefersReduced ? 350 : 1280;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);
      const nextIdx = Math.min(MESSAGES.length - 1, Math.floor((pct / 100) * MESSAGES.length));
      setMessageIdx(nextIdx);
      if (elapsed < totalDuration) {
        rafId = requestAnimationFrame(tick);
      } else {
        setVisible(false);
        setTimeout(onComplete, prefersReduced ? 50 : 320);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-[#F7F8F6] flex flex-col items-center justify-center px-6"
          role="status"
          aria-live="polite"
        >
          {/* Subtle animated interconnected geometric mark */}
          <div className="mb-7 relative">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <motion.path
                d="M14 22L32 12L50 22M14 22L18 44L32 52M50 22L46 44L32 52M32 12V52M14 22L46 44M50 22L18 44"
                stroke="#82988A"
                strokeWidth="1.25"
                strokeOpacity="0.55"
                initial={{ pathLength: 0.2, opacity: 0.3 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 1.05, ease: 'easeOut' }}
              />
              {[
                { cx: 14, cy: 22, fill: '#244B3D', r: 3.2 },
                { cx: 32, cy: 12, fill: '#B89B68', r: 3.5 },
                { cx: 50, cy: 22, fill: '#244B3D', r: 3.2 },
                { cx: 18, cy: 44, fill: '#82988A', r: 3 },
                { cx: 46, cy: 44, fill: '#82988A', r: 3 },
                { cx: 32, cy: 52, fill: '#B89B68', r: 3.5 },
                { cx: 32, cy: 32, fill: '#18382E', r: 4 },
              ].map((node, i) => (
                <motion.circle
                  key={i}
                  cx={node.cx}
                  cy={node.cy}
                  r={node.r}
                  fill={node.fill}
                  initial={{ scale: 0.7, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                />
              ))}
            </svg>
          </div>

          <h1 className="font-editorial text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] text-[#18382E] text-center">
            Healthy Learning LLC
          </h1>
          <p className="mt-2 text-[14px] text-[#748078] tracking-[-0.005em] text-center">
            Connecting your business intelligence.
          </p>

          {/* Forest-green animated progress line */}
          <div className="mt-7 w-64 sm:w-72 h-[2px] bg-[#E6EAE5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#244B3D] rounded-full transition-[width] duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3.5 text-[12px] text-[#748078] h-4 tracking-wide">
            {MESSAGES[messageIdx]}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
