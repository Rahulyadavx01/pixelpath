import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  CheckCircle2,
  BookOpen,
  Code2,
  Users,
  Flame,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const XpHistoryCard: React.FC = () => {
  const { xpActivities } = useApp();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attendance':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'quiz':
        return <BookOpen className="w-4 h-4 text-[#2563EB]" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-[#DB2777]" />;
      case 'coding':
        return <Code2 className="w-4 h-4 text-[#EA580C]" />;
      case 'peer_help':
        return <Users className="w-4 h-4 text-[#7C3AED]" />;
      case 'streak_bonus':
        return <Flame className="w-4 h-4 text-[#F97316]" />;
      default:
        return <Zap className="w-4 h-4 text-[#D97706]" />;
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-[#F1E5E9] p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F1E5E9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
            <Zap className="w-4 h-4 fill-[#D97706]" />
          </div>
          <h3 className="text-sm font-extrabold text-[#24324B] tracking-tight">Verified XP Activity Ledger</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Every point maps to real learning</span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {xpActivities.map((act) => (
          <div
            key={act.id}
            className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#F1E5E9] hover:border-[#F9A8D4] transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#F1E5E9] flex items-center justify-center shrink-0 shadow-xs">
                {getCategoryIcon(act.category)}
              </div>
              <div>
                <p className="text-xs font-bold text-[#24324B] leading-snug">{act.action}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#64748B] mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#94A3B8]" />
                    {act.timestamp}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">Academic Mark: Unchanged</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-[#D97706] font-mono px-2.5 py-1 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] shadow-xs">
                +{act.amount} XP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
