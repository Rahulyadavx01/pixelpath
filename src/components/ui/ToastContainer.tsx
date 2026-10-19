import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Zap, CheckCircle2, Award, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isXp = toast.type === 'xp';
          const isLevel = toast.type === 'level_up';
          const isSuccess = toast.type === 'success';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-xl flex items-start gap-3 relative overflow-hidden bg-white ${
                isLevel
                  ? 'border-[#F9A8D4] text-[#24324B] shadow-sunset/20'
                  : isXp
                  ? 'border-[#FDE68A] text-[#24324B] shadow-sm'
                  : isSuccess
                  ? 'border-emerald-200 text-[#24324B] shadow-sm'
                  : 'border-[#F1E5E9] text-[#24324B] shadow-sm'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isLevel
                    ? 'bg-[#FCE7F3] text-[#EC4899]'
                    : isXp
                    ? 'bg-[#FEF3C7] text-[#D97706]'
                    : isSuccess
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-[#EFF6FF] text-[#2563EB]'
                }`}
              >
                {isLevel ? (
                  <Award className="w-5 h-5 animate-bounce" />
                ) : isXp ? (
                  <Zap className="w-5 h-5 fill-[#D97706]" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold tracking-tight text-[#24324B]">{toast.title}</h4>
                  {toast.amount && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-extrabold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                      +{toast.amount} XP
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#94A3B8] hover:text-[#24324B] transition-colors absolute top-3 right-3 p-1 rounded-md"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Glowing accent bottom bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 ${
                  isLevel
                    ? 'bg-gradient-sunset'
                    : isXp
                    ? 'bg-[#FBBF24]'
                    : isSuccess
                    ? 'bg-emerald-500'
                    : 'bg-[#93C5FD]'
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
