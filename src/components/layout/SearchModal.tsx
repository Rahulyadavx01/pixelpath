import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Zap,
  Code2,
  BookOpen,
  Trophy,
  Users,
  Shield,
  Award,
  ShoppingBag,
  ArrowRight,
  X
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items = [
    { title: 'Dashboard', desc: 'Active velocity, daily quiz & league HUD', route: '/dashboard', icon: Zap, category: 'Core' },
    { title: 'Daily Quiz', desc: 'Algorithm & data structure 5-question sprint (1 attempt/day)', route: '/quiz', icon: BookOpen, category: 'Learn' },
    { title: 'Coding Arena', desc: 'Two Sum, Valid Anagram, Binary Search test runner', route: '/coding', icon: Code2, category: 'Practice' },
    { title: 'Course Map', desc: 'Arrays → Linked Lists → Queues → Trees progression', route: '/courses', icon: BookOpen, category: 'Learn' },
    { title: 'Leaderboards', desc: 'Class, Division & Campus growth-first rankings', route: '/leaderboard', icon: Trophy, category: 'Compete' },
    { title: 'Weekly Leagues', desc: 'Gold League cohort standing & promotion zone', route: '/leagues', icon: Shield, category: 'Compete' },
    { title: 'Team Battles', desc: 'Weekend Coding Sprint: Team Nova vs Phoenix', route: '/battles', icon: Users, category: 'Compete' },
    { title: 'Achievements', desc: 'Badge gallery, 7-day streak & mastery milestones', route: '/achievements', icon: Award, category: 'Progression' },
    { title: 'Rewards Store', desc: 'MSOT merch, event VIP passes & mentor sessions', route: '/rewards', icon: ShoppingBag, category: 'Store' },
    { title: 'Student Community', desc: 'Peer study forum & accepted answer XP', route: '/community', icon: Users, category: 'Social' },
    { title: 'Faculty Dashboard', desc: 'Instructor analytics & XP anti-gaming controls', route: '/faculty', icon: Shield, category: 'Faculty' },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (route: string) => {
    navigate(route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#24324B]/35 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-white border border-[#F1E5E9] rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-[#F1E5E9] gap-3">
            <Search className="w-5 h-5 text-[#EC4899]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to route, challenge, course, or leaderboard..."
              className="flex-1 bg-transparent text-[#24324B] placeholder-[#94A3B8] text-sm focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#FFF5F8] text-[#64748B] hover:text-[#24324B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-[#64748B] text-sm">
                No matching results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    onClick={() => handleSelect(item.route)}
                    className="w-full text-left p-3 rounded-2xl hover:bg-[#FFF9F5] border border-transparent hover:border-[#F9A8D4] flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFF5F8] group-hover:bg-[#FCE7F3] border border-[#F1E5E9] flex items-center justify-center text-[#EC4899] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#24324B] group-hover:text-[#DB2777]">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] line-clamp-1">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#EC4899] transform group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2.5 bg-[#FFF9F5] border-t border-[#F1E5E9] flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Use ↑ ↓ to navigate</span>
            <span>ESC to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
