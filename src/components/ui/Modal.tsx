import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-lg',
  children,
  footer,
}) => {
  useEscapeKey(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#18382E]/30 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${maxWidth} bg-white border border-[#E6EAE5] rounded-xl shadow-[0_20px_50px_rgba(24,56,46,0.16)] overflow-hidden flex flex-col max-h-[90vh]`}
          >
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#E6EAE5] bg-[#FAFBFA]">
              <div>
                <h3 id="modal-title" className="text-[16px] font-semibold text-[#202923]">
                  {title}
                </h3>
                {subtitle && <p className="text-[12.5px] text-[#748078] mt-0.5">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-[#748078] hover:text-[#202923] hover:bg-[#F0F3EF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="px-5 py-3.5 border-t border-[#E6EAE5] bg-[#FAFBFA] flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
