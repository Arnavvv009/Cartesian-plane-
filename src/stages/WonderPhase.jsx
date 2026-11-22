import React, { useEffect } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { wonderNarration } from '../utils/narration.js';
import { WONDER } from '../utils/lessonScript.js';
import { CoordGrid } from '../components/CoordGrid.jsx';

/* Captain Ava's map: treasure at (−3, 4), crew dug at (4, −3) */
function TreasureMap() {
  return (
    <div className="w-40 sm:w-52 shrink-0 max-h-[22vh] aspect-square drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]">
      <CoordGrid
        min={-5} max={5} S={300} quadLabels
        points={[
          { x: -3, y: 4, label: '💰 (−3, 4)', color: '#facc15' },
          { x: 4, y: -3, label: '(4, −3) ✗', color: '#f87171' }
        ]}
        walks={[{ to: [-3, 4], color: '#4ade80' }, { to: [4, -3], color: '#f87171' }]}
      />
    </div>
  );
}

export function WonderPhase({ muted, onNext }) {
  useEffect(() => {
    narrate(wonderNarration(), !muted);
    return () => stopNarration();
  }, [muted]);

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none z-10">
      <BgSymbols />

      <div className="w-full max-w-2xl glass-card flex flex-col items-center text-center fade-in-up z-20 my-auto">
        {/* Glowing Phase Band */}
        <div className="phase-band phase-band--wonder" />

        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🔍</span>
          <span className="text-purple-300 font-display font-800 text-xs sm:text-sm tracking-wider uppercase">
            Phase 1: Wonder & Curiosity
          </span>
        </div>

        <h2 className="text-main-heading text-purple-200 mb-3 max-w-xl">
          Where Is Captain Ava's Treasure?
        </h2>

        {/* Feature Stat Box */}
        <div className="w-full bg-[#1e143c]/90 border border-purple-400/30 rounded-2xl p-4 sm:p-6 mb-4 flex flex-col items-center shadow-xl">
          <div className="text-number text-amber-300 text-4xl sm:text-6xl mb-1">
            (−3, 4) ≠ (4, −3)!
          </div>
          <div className="flex items-center gap-4 w-full">
            <TreasureMap />
            <p className="text-body text-slate-200 text-left">
              {WONDER.paragraph}
            </p>
          </div>
        </div>

        {/* Mascot Thinking Bubble */}
        <div className="flex items-center gap-3 bg-[#14082c]/80 border border-purple-500/30 rounded-full px-5 py-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-purple-500/30 text-purple-200 flex items-center justify-center font-bold text-sm shrink-0">
            🤖
          </div>
          <p className="text-slate-300 text-xs sm:text-sm font-semibold">
            {WONDER.question}
          </p>
        </div>

        <button onClick={onNext} className="btn-gold flex items-center gap-2">
          <span>Explore the Story</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
