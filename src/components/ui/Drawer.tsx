import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  width = 'max-w-xl',
  headerExtra,
  children,
}) => {
  useEscapeKey(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#18382E]/25 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${width} bg-white h-full border-l border-[#E6EAE5] shadow-[-12px_0_40px_rgba(24,56,46,0.12)] flex flex-col`}
          >
            <div className="px-6 py-4 border-b border-[#E6EAE5] bg-[#FAFBFA] flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <h3 id="drawer-title" className="text-[16.5px] font-semibold text-[#202923] truncate">
                  {title}
                </h3>
                {subtitle && <p className="text-[12.5px] text-[#748078] mt-0.5">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {headerExtra}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="p-1.5 rounded-lg text-[#748078] hover:text-[#202923] hover:bg-[#F0F3EF] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
