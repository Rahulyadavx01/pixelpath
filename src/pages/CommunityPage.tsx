import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { PeerHelpRequest, DiscussionThread } from '../types';
import {
  HelpCircle,
  MessagesSquare,
  Plus,
  CheckCircle2,
  Trash2,
  Shield,
  Send,
  X,
  Sparkles,
  AlertCircle,
  Pin,
  Clock,
  BookOpen
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const {
    user,
    peerHelpRequests,
    createPeerHelpRequest,
    addPeerHelpResponse,
    acceptPeerHelp,
    discussions,
    createDiscussionThread,
    addDiscussionReply,
    deleteDiscussionThread,
    deleteDiscussionReply,
    moderateDiscussion,
    acceptDiscussionAnswer,
    triggerCelebration,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'peer-help' | 'discussions'>('peer-help');

  // Peer Help states
  const [peerFilter, setPeerFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [showAskHelpModal, setShowAskHelpModal] = useState(false);
  const [newHelpSubject, setNewHelpSubject] = useState('Algorithms (CS204)');
  const [newHelpTitle, setNewHelpTitle] = useState('');
  const [newHelpDesc, setNewHelpDesc] = useState('');
  const [helpReplyInputs, setHelpReplyInputs] = useState<{ [id: string]: string }>({});

  // Discussions states
  const [discTagFilter, setDiscTagFilter] = useState<string>('All');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadTag, setNewThreadTag] = useState('CS204: Algorithms');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');
  const [discReplyInputs, setDiscReplyInputs] = useState<{ [id: string]: string }>({});

  // Filtered lists
  const filteredPeerHelp = peerHelpRequests.filter((r) => {
    if (peerFilter === 'open') return r.status === 'open';
    if (peerFilter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const filteredDiscussions = discussions.filter((d) => {
    if (user.role !== 'faculty' && d.isHidden) return false;
    if (discTagFilter === 'All') return true;
    return d.courseTag === discTagFilter;
  });

  // Handle Ask Peer Help Submit
  const handleAskHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelpTitle.trim() || !newHelpDesc.trim()) return;
    createPeerHelpRequest(newHelpSubject, newHelpTitle.trim(), newHelpDesc.trim());
    setNewHelpTitle('');
    setNewHelpDesc('');
    setShowAskHelpModal(false);
    triggerCelebration();
  };

  // Handle Send Peer Help Response
  const handleSendHelpResponse = (requestId: string) => {
    const text = helpReplyInputs[requestId]?.trim();
    if (!text) return;
    addPeerHelpResponse(requestId, text);
    setHelpReplyInputs((prev) => ({ ...prev, [requestId]: '' }));
  };

  // Handle Accept Peer Help
  const handleAcceptPeerHelp = (requestId: string, responseId: string) => {
    acceptPeerHelp(requestId, responseId);
  };

  // Handle Create Discussion Submit
  const handleCreateThreadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadBody.trim()) return;
    createDiscussionThread(newThreadTag, newThreadTitle.trim(), newThreadBody.trim());
    setNewThreadTitle('');
    setNewThreadBody('');
    setShowNewThreadModal(false);
    triggerCelebration();
  };

  // Handle Send Discussion Reply
  const handleSendDiscReply = (threadId: string) => {
    const text = discReplyInputs[threadId]?.trim();
    if (!text) return;
    addDiscussionReply(threadId, text);
    setDiscReplyInputs((prev) => ({ ...prev, [threadId]: '' }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-quest-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200 font-mono">
              COLLABORATIVE COMMONS
            </span>
            <span className="text-xs text-quest-muted">Academic Peer Help & Community Forums</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-quest-navy mt-1">Community Hub</h1>
          <p className="text-xs text-quest-muted mt-0.5 font-medium">
            Solve blockers through peer explanations (+15 XP) or discuss course concepts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-quest-border shadow-sm">
          <button
            onClick={() => setActiveTab('peer-help')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'peer-help'
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-sm'
                : 'text-quest-muted hover:text-quest-navy'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Peer Help Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'discussions'
                ? 'bg-gradient-to-r from-sky-400 to-indigo-400 text-white shadow-sm'
                : 'text-quest-muted hover:text-quest-navy'
            }`}
          >
            <MessagesSquare className="w-4 h-4" />
            <span>Discussions</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PEER HELP REQUESTS */}
      {/* ============================================================== */}
      {activeTab === 'peer-help' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-quest-muted uppercase tracking-wider mr-1">Status:</span>
              {(['all', 'open', 'resolved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPeerFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    peerFilter === filter
                      ? 'bg-pink-100 text-pink-800 border border-pink-200'
                      : 'bg-white text-quest-muted hover:text-quest-navy border border-quest-border'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAskHelpModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ask for Peer Help</span>
            </button>
          </div>

          {/* Rules Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Peer Help Integrity Rules:</p>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Only the student who posted the request can mark an answer as accepted. Accepted helpers earn <strong>+15 XP</strong> (capped at 3 accepted solutions / day). Self-accepting is strictly disallowed.
              </p>
            </div>
          </div>

          {/* Peer Help Feed */}
          {filteredPeerHelp.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-quest-border shadow-card space-y-3">
              <HelpCircle className="w-10 h-10 text-quest-muted mx-auto opacity-50" />
              <h3 className="text-base font-bold text-quest-navy">No requests in this view</h3>
              <p className="text-xs text-quest-muted max-w-sm mx-auto">
                Got stuck on an algorithmic invariant or recurrence proof? Post a question to get peer assistance.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPeerHelp.map((req) => {
                const isRequester = user.id === req.requesterId;
                const isResolved = req.status === 'resolved';

                return (
                  <div
                    key={req.id}
                    className={`rounded-3xl bg-white border p-6 shadow-card space-y-4 transition-all ${
                      isResolved ? 'border-emerald-200/80' : 'border-quest-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.requesterAvatar}
                          alt={req.requesterName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-quest-navy">{req.requesterName}</h3>
                            {isRequester && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-pink-100 text-pink-700 font-mono">
                                YOU (REQUESTER)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-quest-muted">{req.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-quest-muted font-mono">
                          {req.subject}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg font-mono ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isResolved ? 'RESOLVED' : 'OPEN'}
                        </span>
                      </div>
                    </div>

                    {/* Question Title & Description */}
                    <div>
                      <h2 className="text-base font-bold text-quest-navy leading-snug">{req.title}</h2>
                      <p className="text-xs text-quest-muted mt-2 leading-relaxed whitespace-pre-line font-normal">
                        {req.description}
                      </p>
                    </div>

                    {/* Responses List */}
                    {req.responses.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-quest-border">
                        <span className="text-[10px] font-bold uppercase text-quest-muted tracking-wider block">
                          Peer Explanations ({req.responses.length})
                        </span>

                        {req.responses.map((resp) => {
                          const isHelper = resp.helperId === user.id;

                          return (
                            <div
                              key={resp.id}
                              className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                                resp.isAccepted
                                  ? 'bg-emerald-50/70 border-emerald-200 shadow-sm'
                                  : 'bg-slate-50/70 border-quest-border'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={resp.helperAvatar}
                                    alt={resp.helperName}
                                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-quest-navy">{resp.helperName}</span>
                                      {isHelper && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-quest-muted">{resp.createdAt}</span>
                                  </div>
                                </div>

                                {resp.isAccepted ? (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black font-mono">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>ACCEPTED SOLUTION (+15 XP AWARDED)</span>
                                  </div>
                                ) : (
                                  <>
                                    {/* Strictly only requester can accept AND helper cannot be requester */}
                                    {isRequester && !isHelper && (
                                      <button
                                        onClick={() => handleAcceptPeerHelp(req.id, resp.id)}
                                        className="text-[11px] font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 px-3 py-1 rounded-xl shadow-sm transition-all flex items-center gap-1"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Mark as Accepted (+15 XP)</span>
                                      </button>
                                    )}
                                    {!isRequester && (
                                      <span className="text-[10px] text-quest-muted italic">
                                        Pending requester acceptance
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>

                              <p className="text-quest-navy leading-relaxed whitespace-pre-line text-xs pl-9 font-normal">
                                {resp.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Response Form */}
                    {!isResolved && (
                      <div className="flex items-center gap-2 pt-2 border-t border-quest-border">
                        <input
                          type="text"
                          value={helpReplyInputs[req.id] || ''}
                          onChange={(e) =>
                            setHelpReplyInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleSendHelpResponse(req.id)}
                          placeholder="Provide a constructive academic explanation (+15 XP if accepted)..."
                          className="flex-1 bg-slate-50 border border-quest-border rounded-xl px-4 py-2.5 text-xs text-quest-navy placeholder-quest-muted focus:outline-none focus:border-pink-300"
                        />
                        <button
                          onClick={() => handleSendHelpResponse(req.id)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white text-xs font-bold shadow-sunset hover:opacity-95 transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DISCUSSIONS */}
      {/* ============================================================== */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-quest-muted uppercase tracking-wider mr-1">Course:</span>
              {['All', 'CS204: Algorithms', 'CS201: Data Structures', 'General CSE'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setDiscTagFilter(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    discTagFilter === tag
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-white text-quest-muted hover:text-quest-navy border border-quest-border'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewThreadModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white text-xs font-black shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Start Discussion</span>
            </button>
          </div>

          {/* Discussion Feed */}
          {filteredDiscussions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-quest-border shadow-card space-y-3">
              <MessagesSquare className="w-10 h-10 text-quest-muted mx-auto opacity-50" />
              <h3 className="text-base font-bold text-quest-navy">No discussion threads found</h3>
              <p className="text-xs text-quest-muted max-w-sm mx-auto">
                Be the first to share an algorithmic concept, optimization inquiry, or study question.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredDiscussions.map((thread) => {
                const isAuthor = user.id === thread.authorId;
                const canModerate = user.role === 'faculty';

                return (
                  <div
                    key={thread.id}
                    className={`rounded-3xl bg-white border p-6 shadow-card space-y-4 transition-all ${
                      thread.isHidden ? 'border-amber-300 opacity-60 bg-amber-50/20' : 'border-quest-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={thread.authorAvatar}
                          alt={thread.authorName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-quest-navy">{thread.authorName}</h3>
                            <span className="text-[10px] text-quest-muted font-medium">{thread.authorRole}</span>
                          </div>
                          <span className="text-[11px] text-quest-muted">{thread.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {thread.isPinned && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 font-mono">
                            <Pin className="w-3 h-3 text-amber-600" /> PINNED
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono">
                          {thread.courseTag}
                        </span>

                        {/* Author or Faculty Moderation actions */}
                        {(isAuthor || canModerate) && (
                          <button
                            onClick={() => deleteDiscussionThread(thread.id)}
                            title="Delete thread"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {canModerate && (
                          <button
                            onClick={() => moderateDiscussion(thread.id, !thread.isHidden)}
                            title={thread.isHidden ? 'Unhide thread' : 'Hide thread (Faculty)'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Thread Title & Content */}
                    <div>
                      <h2 className="text-base font-bold text-quest-navy leading-snug">{thread.title}</h2>
                      <p className="text-xs text-quest-muted mt-2 leading-relaxed whitespace-pre-line font-normal">
                        {thread.body}
                      </p>
                    </div>

                    {/* Replies */}
                    {thread.replies.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-quest-border">
                        <span className="text-[10px] font-bold uppercase text-quest-muted tracking-wider block">
                          Replies ({thread.replies.length})
                        </span>

                        {thread.replies.map((reply) => {
                          const isReplyAuthor = user.id === reply.authorId;
                          return (
                            <div key={reply.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-quest-border text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply.authorAvatar}
                                    alt={reply.authorName}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                  <span className="font-bold text-quest-navy">{reply.authorName}</span>
                                  <span className="text-[10px] text-quest-muted">{reply.createdAt}</span>
                                </div>

                                {(isReplyAuthor || canModerate) && (
                                  <button
                                    onClick={() => deleteDiscussionReply(thread.id, reply.id)}
                                    title="Delete reply"
                                    className="text-slate-400 hover:text-rose-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-quest-navy leading-relaxed text-xs pl-8 font-normal">
                                {reply.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Reply Input */}
                    <div className="flex items-center gap-2 pt-2 border-t border-quest-border">
                      <input
                        type="text"
                        value={discReplyInputs[thread.id] || ''}
                        onChange={(e) =>
                          setDiscReplyInputs((prev) => ({ ...prev, [thread.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleSendDiscReply(thread.id)}
                        placeholder="Join the discussion..."
                        className="flex-1 bg-slate-50 border border-quest-border rounded-xl px-4 py-2.5 text-xs text-quest-navy placeholder-quest-muted focus:outline-none focus:border-sky-300"
                      />
                      <button
                        onClick={() => handleSendDiscReply(thread.id)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-400 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Ask for Peer Help */}
      <AnimatePresence>
        {showAskHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAskHelpModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-quest-navy">
                  <HelpCircle className="w-5 h-5 text-pink-500" />
                  <h3 className="font-bold text-base">Ask for Peer Assistance</h3>
                </div>
                <button onClick={() => setShowAskHelpModal(false)} className="text-quest-muted hover:text-quest-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAskHelpSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                    Course / Subject
                  </label>
                  <select
                    value={newHelpSubject}
                    onChange={(e) => setNewHelpSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                  >
                    <option value="Algorithms (CS204)">Algorithms (CS204)</option>
                    <option value="Data Structures (CS201)">Data Structures (CS201)</option>
                    <option value="Computer Networks (CS301)">Computer Networks (CS301)</option>
                    <option value="General CSE">General CSE</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                    Problem Summary / Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Theorem Case 3 asymptotic gap proof"
                    value={newHelpTitle}
                    onChange={(e) => setNewHelpTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                    Detailed Question Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe where you are stuck, what you attempted, and what invariant or proof step is unclear..."
                    value={newHelpDesc}
                    onChange={(e) => setNewHelpDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 text-[11px] text-pink-800">
                  When a classmate answers, only you can mark it as accepted. Accepting will reward them with +15 XP.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:opacity-95 text-white text-xs font-bold shadow-sunset transition-all"
                >
                  Publish Question
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: New Discussion Thread */}
      <AnimatePresence>
        {showNewThreadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewThreadModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-quest-navy">
                  <MessagesSquare className="w-5 h-5 text-sky-500" />
                  <h3 className="font-bold text-base">Start Discussion Thread</h3>
                </div>
                <button onClick={() => setShowNewThreadModal(false)} className="text-quest-muted hover:text-quest-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateThreadSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                    Course Channel
                  </label>
                  <select
                    value={newThreadTag}
                    onChange={(e) => setNewThreadTag(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                  >
                    <option value="CS204: Algorithms">CS204: Algorithms</option>
                    <option value="CS201: Data Structures">CS201: Data Structures</option>
                    <option value="General CSE">General CSE</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                    Thread Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Recommended mental models for 2D dynamic programming"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                    Discussion Content
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share your thoughts, questions, or resources..."
                    value={newThreadBody}
                    onChange={(e) => setNewThreadBody(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Start Discussion
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
