import React, { useState } from 'react';
import { checkinsApi } from '../services/api';

const SUDS_LABELS = {
  0: 'None', 1: 'Minimal', 2: 'Mild', 3: 'Mild+', 4: 'Moderate',
  5: 'Moderate', 6: 'High', 7: 'Significant', 8: 'Severe', 9: 'Extreme', 10: 'Peak',
};

export default function CheckinModal({ onClose, onSaved }) {
  const [score, setScore] = useState(5);
  const [urge, setUrge] = useState(5);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await checkinsApi.create({
        sudsScore: score,
        urgeScore: urge,
        note: note.trim() || undefined,
      });
      if (onSaved) onSaved({ sudsScore: score, urgeScore: urge });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save check-in.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in p-4">
      <div className="bg-brand-paper border border-brand-border rounded-md shadow-card-lift w-full max-w-md p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-ink/40 hover:text-brand-ink transition-colors p-1"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2 text-brand-teal mb-3">
          <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
          <span className="text-xs font-bold uppercase tracking-widest">Daily Check-in</span>
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl text-brand-ink mb-1 font-medium">
          How distressed do you feel right now?
        </h2>
        <p className="text-brand-ink/60 text-xs mb-6 leading-relaxed">
          SUDS: Subjective Units of Distress Scale (0 = peaceful neutrality, 10 = peak acute distress).
        </p>

        {error && (
          <div className="p-3 mb-4 rounded bg-brand-coralSoft border border-brand-coral/30 text-brand-coral text-xs">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-brand-ink uppercase tracking-wider">Distress (SUDS)</label>
              <span className="font-mono text-xl font-medium text-brand-ink">
                {score} <span className="text-xs text-brand-ink/50 font-sans ml-1">({SUDS_LABELS[score]})</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-2 bg-brand-canvas rounded-lg appearance-none cursor-pointer accent-brand-teal"
            />
            <div className="flex justify-between text-[10px] text-brand-ink/40 font-mono mt-1">
              <span>0 (None)</span>
              <span>5 (Moderate)</span>
              <span>10 (Peak)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-brand-ink uppercase tracking-wider">Urge to Ritualize</label>
              <span className="font-mono text-xl font-medium text-brand-coral">
                {urge} <span className="text-xs text-brand-ink/50 font-sans ml-1">/ 10</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={urge}
              onChange={(e) => setUrge(Number(e.target.value))}
              className="w-full h-2 bg-brand-canvas rounded-lg appearance-none cursor-pointer accent-brand-coral"
            />
            <div className="flex justify-between text-[10px] text-brand-ink/40 font-mono mt-1">
              <span>0 (No Urge)</span>
              <span>5 (Noticeable Pull)</span>
              <span>10 (Urgent Pressure)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
              Brief Context <span className="text-brand-ink/40 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Intrusive thought about front door, preparing dinner"
              className="w-full text-xs px-3.5 py-2.5 rounded border border-brand-border bg-brand-canvas/60 text-brand-ink focus:outline-none focus:border-brand-teal"
              maxLength={120}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-brand-ink/60 hover:text-brand-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Recording...' : 'Record Check-in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
