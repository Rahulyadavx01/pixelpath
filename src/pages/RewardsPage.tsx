import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { RewardItem } from '../types';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  CheckCircle2,
  X,
  QrCode
} from 'lucide-react';

export const RewardsPage: React.FC = () => {
  const { user, rewards, redeemReward } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  const categories = ['All', 'Passes', 'Merch', 'Mentorship', 'Customization'];

  const filtered = rewards.filter(
    (r: RewardItem) => activeCategory === 'All' || r.category === activeCategory
  );

  const handleRedeemClick = (item: RewardItem) => {
    setSelectedReward(item);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      redeemReward(selectedReward.id);
      setSelectedReward(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-quest-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono">
              CAMPUS REWARDS STORE
            </span>
            <span className="text-xs text-quest-muted">Sponsored by MSOT Student Life & IEEE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-quest-navy mt-1">Rewards Store</h1>
          <p className="text-xs text-quest-muted mt-0.5 font-medium">
            Redeem verified learning XP for campus life passes, department swag, and alumni mentorship.
          </p>
        </div>

        {/* User Balance Wallet Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-gradient-to-r from-amber-50 via-pink-50/70 to-purple-50/60 border border-amber-200 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Zap className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-quest-muted">Spendable Wallet</span>
            <p className="text-2xl font-black text-quest-navy font-mono leading-none tabular-nums">
              {user.xp.toLocaleString()} <span className="text-xs text-amber-600 font-bold">XP</span>
            </p>
          </div>
        </div>
      </div>

      {/* Policy Guarantee Banner */}
      <div className="rounded-2xl bg-sky-50/70 border border-sky-100 p-4 flex items-center justify-between text-xs text-quest-navy">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>MSOT Non-Academic Policy:</strong> Rewards are funded through university student life & alumni endowments. No redemption alters official academic evaluation or grading.
          </span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white shadow-sm'
                : 'bg-white text-quest-muted hover:text-quest-navy border border-quest-border shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reward Store Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item: RewardItem) => {
          const canAfford = user.xp >= item.xpCost;
          const isClaimed = item.claimed;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              className="rounded-3xl bg-white border border-quest-border overflow-hidden shadow-card flex flex-col justify-between group hover:border-pink-300 transition-all"
            >
              <div>
                {/* Image Banner */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-quest-navy border border-quest-border font-mono shadow-sm">
                    {item.category}
                  </span>
                  <div className="absolute top-3 right-3 text-xs font-black font-mono px-3 py-1.5 rounded-xl bg-amber-400 text-slate-900 shadow-sm tabular-nums">
                    {item.xpCost.toLocaleString()} XP
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <h3 className="text-base font-bold text-quest-navy leading-snug">{item.title}</h3>
                  <p className="text-xs text-quest-muted mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-quest-muted mt-3.5 font-medium">
                    Sponsor: {item.sponsorOrPartner}
                  </p>
                </div>
              </div>

              {/* Bottom Redemption Action */}
              <div className="p-6 pt-0">
                {isClaimed ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Voucher Claimed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRedeemClick(item)}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white shadow-sunset hover:opacity-95'
                        : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {canAfford ? 'Redeem Voucher' : `Need ${item.xpCost - user.xp} More XP`}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Redemption Confirmation Modal */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReward(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-quest-border p-7 shadow-2xl z-10 space-y-5 text-center"
            >
              <button
                onClick={() => setSelectedReward(null)}
                className="absolute top-5 right-5 text-quest-muted hover:text-quest-navy"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
                <QrCode className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-quest-navy">Confirm Voucher Claim</h3>
                <p className="text-xs text-quest-muted mt-1">{selectedReward.title}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-quest-border space-y-2 text-xs">
                <div className="flex justify-between text-quest-muted">
                  <span>Current Balance:</span>
                  <span className="font-mono text-quest-navy font-bold tabular-nums">{user.xp.toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between text-quest-muted">
                  <span>Reward Cost:</span>
                  <span className="font-mono text-amber-600 font-bold tabular-nums">-{selectedReward.xpCost.toLocaleString()} XP</span>
                </div>
                <div className="pt-2 border-t border-quest-border flex justify-between font-bold text-quest-navy">
                  <span>Balance After Claim:</span>
                  <span className="font-mono text-sky-600 tabular-nums">
                    {(user.xp - selectedReward.xpCost).toLocaleString()} XP
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-quest-muted italic">
                A digital QR redemption pass will be deposited into your verified student ID wallet.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-quest-muted hover:text-quest-navy text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRedeem}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all"
                >
                  Confirm Claim
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
