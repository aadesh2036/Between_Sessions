import React from 'react';
import { Link } from 'react-router-dom';

export default function PracticeHistoryPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/app" className="w-8 h-8 rounded-full bg-brand-canvas flex items-center justify-center text-brand-ink/60 hover:text-brand-teal transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <h1 className="font-editorial text-3xl text-brand-ink">Practice History</h1>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-brand-border/40 shadow-sm text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-amberSoft flex items-center justify-center text-brand-amber">
          <span className="material-symbols-outlined text-[32px]">history</span>
        </div>
        <h3 className="font-editorial text-2xl text-brand-ink">Your private log.</h3>
        <p className="text-brand-ink/60 text-sm max-w-md mx-auto">
          Here you will see a non-evaluative timeline of your behavioral responses.
        </p>
      </div>
    </div>
  );
}
