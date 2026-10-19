import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function evaluatePasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) {
    return { score: 0, label: 'Too short', color: 'bg-slate-200' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-500' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { score, label, color } = evaluatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#64748B]">Password strength:</span>
        <span className="font-bold text-[#24324B]">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? color : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-[#64748B]">
        Must be at least 8 characters with a number or symbol.
      </p>
    </div>
  );
};
