import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAppState();

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon =
            toast.tone === 'warning'
              ? AlertTriangle
              : toast.tone === 'info'
                ? Info
                : CheckCircle2;
          const iconColor =
            toast.tone === 'warning'
              ? 'text-[#B58B4F]'
              : toast.tone === 'info'
                ? 'text-[#244B3D]'
                : 'text-[#557F64]';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto bg-white border border-[#DCE3DB] rounded-xl p-3.5 shadow-[0_12px_30px_rgba(24,56,46,0.12)] flex items-start gap-3"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#202923]">{toast.title}</p>
                {toast.description && (
                  <p className="text-[12px] text-[#748078] mt-0.5 leading-snug">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-[#748078] hover:text-[#202923] p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
