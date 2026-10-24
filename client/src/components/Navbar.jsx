import React from 'react';
import { Siren, Radio, Shield, MapPin, Play, Square, Volume2, VolumeX, Sun, Moon, Cpu, Sparkles, Hospital, GitCompare } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  connected,
  pitchActive,
  onStartPitch,
  onStopPitch,
  soundMuted,
  onToggleSound,
  darkMode,
  setDarkMode,
  metrics,
  activeAmbulancesCount
}) {
  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
      darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 shadow-lg shadow-emerald-500/25">
            <Siren className="w-5 h-5 text-white animate-pulse" />
            {activeAmbulancesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                GreenWave
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ITMS v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Emergency Vehicle Green-Corridor AI System • Bengaluru
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/60 border border-slate-800">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'landing'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'driver'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Driver View</span>
          </button>
          <button
            onClick={() => setActiveTab('control')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'control'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Control Room</span>
          </button>
          <button
            onClick={() => setActiveTab('hospital')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hospital'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Hospital ER</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'compare'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Race Compare</span>
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'simulation'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Pitch Mode Button */}
          {pitchActive ? (
            <button
              onClick={onStopPitch}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-500/30 animate-pulse transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Pitch</span>
            </button>
          ) : (
            <button
              onClick={onStartPitch}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pitch Mode (60s)</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundMuted ? 'Unmute Audio Effects' : 'Mute Audio Effects'}
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Theme"
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Connection Status Indicator */}
          <div
            title={connected ? 'Connected to Bengaluru Municipal ITMS' : 'Reconnecting to ITMS WebSocket...'}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]"
          >
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-400 font-mono hidden lg:inline">{connected ? 'LIVE' : 'SYNCING'}</span>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 justify-around">
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-3 py-1 rounded text-xs font-semibold ${
            activeTab === 'landing' ? 'bg-emerald-500 text-black' : 'text-slate-400'
          }`}
        >
          Landing
        </button>
        <button
          onClick={() => setActiveTab('driver')}
          className={`px-3 py-1 rounded text-xs font-semibold ${
            activeTab === 'driver' ? 'bg-emerald-500 text-black' : 'text-slate-400'
          }`}
        >
          Driver
        </button>
        <button
          onClick={() => setActiveTab('control')}
          className={`px-3 py-1 rounded text-xs font-semibold ${
            activeTab === 'control' ? 'bg-emerald-500 text-black' : 'text-slate-400'
          }`}
        >
          Control Room
        </button>
        <button
          onClick={() => setActiveTab('hospital')}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            activeTab === 'hospital' ? 'bg-emerald-500 text-black' : 'text-slate-400'
          }`}
        >
          Hospital
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            activeTab === 'compare' ? 'bg-emerald-500 text-black' : 'text-slate-400'
          }`}
        >
          Compare
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            activeTab === 'simulation' ? 'bg-emerald-500 text-black' : 'text-slate-400'
          }`}
        >
          Simulation
        </button>
      </div>
    </header>
  );
}
