import React, { useState, useEffect, useCallback } from 'react';
import DashboardShell from '../components/DashboardShell';
import { learnApi } from '../services/api';

export default function LearnPage() {
  const [data, setData] = useState({ books: [], masterclasses: [], resources: [] });
  const [completedChapters, setCompletedChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReading, setActiveReading] = useState(null); // { book, chapter } or masterclass
  const [activeTab, setActiveTab] = useState('books'); // books | guides | resources

  const loadLearningData = useCallback(async () => {
    setLoading(true);
    try {
      const [modulesRes, progRes] = await Promise.allSettled([
        learnApi.getModules(),
        learnApi.getProgress(),
      ]);
      if (modulesRes.status === 'fulfilled') {
        setData(modulesRes.value.data || { books: [], masterclasses: [], resources: [] });
      }
      if (progRes.status === 'fulfilled') {
        setCompletedChapters(progRes.value.data?.completedChapters || []);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLearningData();
  }, [loadLearningData]);

  const handleToggleComplete = async (chapterId, bookId) => {
    const isDone = completedChapters.includes(chapterId);
    try {
      await learnApi.saveProgress(chapterId, bookId, !isDone);
      if (isDone) {
        setCompletedChapters((prev) => prev.filter((id) => id !== chapterId));
      } else {
        setCompletedChapters((prev) => [...prev, chapterId]);
      }
    } catch {
      // optimistic
      setCompletedChapters((prev) =>
        isDone ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
      );
    }
  };

  return (
    <DashboardShell>
      {/* ── Reading Modal / Drawer ───────────────────────────────────────── */}
      {activeReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="bg-brand-paper border border-brand-border rounded-md shadow-card-lift w-full max-w-2xl p-6 sm:p-8 relative my-8">
            <button
              onClick={() => setActiveReading(null)}
              className="absolute top-4 right-4 text-brand-ink/40 hover:text-brand-ink transition-colors p-1"
              aria-label="Close reading view"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal border border-brand-teal/20">
                {activeReading.bookTitle || activeReading.badge || 'Curated Reading'}
              </span>
            </div>

            <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink font-medium leading-snug mb-3">
              {activeReading.title}
            </h2>

            {activeReading.summary && (
              <p className="text-xs text-brand-ink/70 italic border-l-2 border-brand-teal pl-3 py-1 mb-4 leading-relaxed bg-brand-canvas/60">
                {activeReading.summary}
              </p>
            )}

            <div className="prose prose-sm text-xs sm:text-sm text-brand-ink/80 space-y-4 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed whitespace-pre-line border-t border-brand-border/40 pt-4">
              {activeReading.content}
            </div>

            <div className="pt-6 mt-4 border-t border-brand-border/60 flex items-center justify-between">
              {activeReading.chapterId ? (
                <button
                  onClick={() => {
                    handleToggleComplete(activeReading.chapterId, activeReading.bookId);
                  }}
                  className={`px-4 py-2 rounded text-xs font-medium transition-colors flex items-center gap-2 ${
                    completedChapters.includes(activeReading.chapterId)
                      ? 'bg-brand-softSuccess text-clinical-success border border-clinical-success/30'
                      : 'bg-brand-teal text-white hover:bg-brand-tealDark'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {completedChapters.includes(activeReading.chapterId) ? 'check' : 'bookmark_added'}
                  </span>
                  <span>
                    {completedChapters.includes(activeReading.chapterId)
                      ? 'Explored & Understood'
                      : 'Mark Chapter Explored'}
                  </span>
                </button>
              ) : (
                <span className="text-xs text-brand-ink/50 italic">Clinical Masterclass Note</span>
              )}

              <button
                onClick={() => setActiveReading(null)}
                className="px-4 py-2 rounded border border-brand-border text-xs text-brand-ink hover:bg-brand-canvas"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-lavender text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lavender"></span>
              <span>Evidence-Based Psychoeducation</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-ink font-medium leading-tight">
              Curated Educational <span className="italic text-brand-lavender">Sanctuary</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-ink/70 mt-1 max-w-2xl leading-relaxed">
              Grounding your practice in the science of OCD and Exposure & Response Prevention. No pop psychology, no empty platitudes.
            </p>
          </div>

          <div className="flex gap-1.5 p-1 rounded bg-brand-paper border border-brand-border text-xs self-start sm:self-auto">
            {[
              { id: 'books', label: 'Books & Volumes' },
              { id: 'guides', label: 'Clinical Deep Dives' },
              { id: 'resources', label: 'External Authorities' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded transition-all font-medium ${
                  activeTab === t.id
                    ? 'bg-brand-ink text-white font-semibold shadow-xs'
                    : 'text-brand-ink/70 hover:text-brand-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* ── Tab 1: Books & Volumes ──────────────────────────────────────── */}
        {activeTab === 'books' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(data.books || []).map((book) => {
                const bookReadCount = (book.chapters || []).filter((c) =>
                  completedChapters.includes(c.id)
                ).length;
                const totalChapters = book.chapters?.length || 0;

                return (
                  <div
                    key={book.id}
                    className="bg-brand-paper border border-brand-border rounded p-6 shadow-card-lift flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-brand-softerTeal text-brand-teal border border-brand-teal/20">
                          {book.badge}
                        </span>
                        <span className="text-xs font-mono text-brand-ink/50">
                          {bookReadCount}/{totalChapters} read
                        </span>
                      </div>

                      <div>
                        <h2 className="font-editorial text-2xl text-brand-ink font-medium leading-snug">
                          {book.title}
                        </h2>
                        <p className="text-xs text-brand-ink/65 mt-1 leading-relaxed">
                          {book.subtitle}
                        </p>
                      </div>

                      {/* Chapters list */}
                      <div className="space-y-2 pt-2 border-t border-brand-border/50">
                        {(book.chapters || []).map((ch, idx) => {
                          const isDone = completedChapters.includes(ch.id);
                          return (
                            <button
                              key={ch.id}
                              onClick={() =>
                                setActiveReading({
                                  ...ch,
                                  chapterId: ch.id,
                                  bookId: book.id,
                                  bookTitle: book.title,
                                })
                              }
                              className="w-full text-left p-2 rounded hover:bg-brand-canvas border border-transparent hover:border-brand-border/60 transition-colors flex items-start gap-2 text-xs group"
                            >
                              <span
                                className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                                  isDone ? 'text-brand-teal' : 'text-brand-ink/30 group-hover:text-brand-ink/50'
                                }`}
                              >
                                {isDone ? 'check_circle' : 'article'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className={`font-medium block leading-snug truncate ${isDone ? 'text-brand-ink/60' : 'text-brand-ink'}`}>
                                  {idx + 1}. {ch.title}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-border/50">
                      <button
                        onClick={() => {
                          const firstUnread =
                            (book.chapters || []).find((c) => !completedChapters.includes(c.id)) ||
                            book.chapters[0];
                          if (firstUnread) {
                            setActiveReading({
                              ...firstUnread,
                              chapterId: firstUnread.id,
                              bookId: book.id,
                              bookTitle: book.title,
                            });
                          }
                        }}
                        className="w-full py-2 rounded bg-brand-canvas hover:bg-brand-softerTeal text-brand-ink hover:text-brand-teal border border-brand-border text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span>{bookReadCount > 0 ? 'Continue Reading' : 'Open Volume'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab 2: Clinical Deep Dives ──────────────────────────────────── */}
        {activeTab === 'guides' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(data.masterclasses || []).map((guide) => (
                <div
                  key={guide.id}
                  className="bg-brand-paper border border-brand-border rounded p-6 shadow-card-lift flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-brand-amberSoft text-brand-amber border border-brand-amber/30">
                        {guide.badge}
                      </span>
                      <span className="text-xs font-mono text-brand-ink/50">{guide.duration}</span>
                    </div>

                    <h3 className="font-editorial text-xl text-brand-ink font-medium leading-snug">
                      {guide.title}
                    </h3>

                    <p className="text-xs text-brand-ink/70 line-clamp-4 leading-relaxed whitespace-pre-line">
                      {guide.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-brand-border/50">
                    <button
                      onClick={() => setActiveReading(guide)}
                      className="w-full py-2 rounded bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                      <span>Read Complete Guide</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* When to talk to a professional callout */}
            <div className="p-6 rounded bg-brand-softerTeal border border-brand-teal/30 shadow-card-lift space-y-3">
              <div className="flex items-center gap-2 text-brand-teal font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px]">support</span>
                <span>When to Consult a Licensed Professional</span>
              </div>
              <h3 className="font-editorial text-2xl text-brand-ink font-medium">
                Self-Help vs. Clinical Collaboration
              </h3>
              <p className="text-xs text-brand-ink/80 leading-relaxed max-w-3xl">
                Between Sessions is an intentional companion for self-directed practice and therapy continuity. However, if obsessions consume more than 2 hours a day, cause severe functional impairment in your career or family, or if you feel overwhelmed by panic, collaborating with an ERP specialist is strongly recommended.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab 3: Curated Resource Library ─────────────────────────────── */}
        {activeTab === 'resources' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data.resources || []).map((res) => (
                <div
                  key={res.id}
                  className="bg-brand-paper border border-brand-border rounded p-5 shadow-card-lift flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-canvas border border-brand-border text-brand-ink/70">
                        {res.category}
                      </span>
                    </div>

                    <h3 className="font-editorial text-xl text-brand-ink font-medium leading-snug">
                      {res.name}
                    </h3>

                    <p className="text-xs text-brand-ink/70 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-brand-border/40">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:text-brand-tealDark transition-colors"
                    >
                      <span>Visit Authority Website</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
