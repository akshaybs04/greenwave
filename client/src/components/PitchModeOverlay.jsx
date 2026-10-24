import React from 'react';
import { Sparkles, Square, ArrowRight, CheckCircle2, Siren } from 'lucide-react';

export default function PitchModeOverlay({ pitchState, onStop }) {
  if (!pitchState || !pitchState.active) return null;

  const currentStep = pitchState.currentStep || {
    step: 1,
    title: 'Emergency 108 Call Received',
    desc: 'Cardiac arrest reported at Silk Board Junction. TinyFish Web Agent initiates live hospital capacity scan.'
  };

  const stepPercent = Math.min(100, Math.round((pitchState.stepIndex / 6) * 100));

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 rounded-3xl bg-slate-950/95 border-2 border-amber-500/60 shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hackathon 60-Second Pitch Mode</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-400 font-bold">
              Step {pitchState.stepIndex || 1} of 6
            </span>
            <button
              onClick={onStop}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Exit Pitch Mode"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Narrative Content */}
        <div className="py-3">
          <h4 className="text-base font-black text-white flex items-center space-x-2">
            <span>{currentStep.title}</span>
          </h4>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {currentStep.desc}
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${stepPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
