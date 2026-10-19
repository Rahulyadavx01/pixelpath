import React from 'react';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AntiGamingCard: React.FC = () => {
  const { facultyData } = useApp();

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-inner bg-win-tint border border-[#BDEBD7] flex items-center justify-center text-win shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-ink">XP Integrity & Fair Play</h4>
            <p className="text-[11px] text-ink-3">Automated learning verification suite</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-win font-mono">
            {facultyData.xpIntegrityScore}%
          </span>
          <p className="text-[10px] text-ink-3 uppercase tracking-wider font-bold font-mono">Integrity Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-3 rounded-inner bg-surface-2 border border-line flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-win shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-ink">Quiz & Quest Limits</p>
            <p className="text-[10px] text-ink-2 mt-0.5">1 scored attempt / question / 24h with minimum read timer</p>
          </div>
        </div>

        <div className="p-3 rounded-inner bg-surface-2 border border-line flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-win shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-ink">AST Similarity Engine</p>
            <p className="text-[10px] text-ink-2 mt-0.5">Syntactic fingerprinting prevents unauthorized answer collusion</p>
          </div>
        </div>

        <div className="p-3 rounded-inner bg-surface-2 border border-line flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-win shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-ink">Input Velocity Monitor</p>
            <p className="text-[10px] text-ink-2 mt-0.5">Detects macro pasting and flags instantaneous solutions to faculty</p>
          </div>
        </div>

        <div className="p-3 rounded-inner bg-surface-2 border border-line flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-win shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-ink">Sandboxed Execution</p>
            <p className="text-[10px] text-ink-2 mt-0.5">Hidden sandbox test cases executed on submit only</p>
          </div>
        </div>

        <div className="p-3 rounded-inner bg-surface-2 border border-line flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-win shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-ink">Reciprocal Review Audit</p>
            <p className="text-[10px] text-ink-2 mt-0.5">Peer help rewards require genuine student approval</p>
          </div>
        </div>

        <div className="p-3 rounded-inner bg-surface-2 border border-line flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-ink">Non-Academic Isolation</p>
            <p className="text-[10px] text-ink-2 mt-0.5">Gamified XP never alters official university GPA</p>
          </div>
        </div>
      </div>
    </div>
  );
};
