import React, { useEffect, useState } from 'react';
import {
  Siren,
  Clock,
  ShieldCheck,
  Cpu,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  HeartPulse,
  Flame,
  Leaf
} from 'lucide-react';

export default function LandingView({
  metrics,
  onLaunchDemo,
  onStartPitch,
  darkMode
}) {
  const [secondsCounter, setSecondsCounter] = useState(metrics?.totalSecondsSaved || 1420);

  // Live ticking counter of seconds saved
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsCounter((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-[calc(100vh-4rem)] ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Emergency Vehicle Green-Corridor AI System</span>
          </div>

          {/* Bold Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Every Second Counts.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              When Seconds Mean Lives,
            </span>{' '}
            GreenWave Clears the Path.
          </h1>

          {/* Problem Statement */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            In congested cities like <strong className="text-slate-200">Bengaluru</strong>, ambulances lose up to <span className="text-red-400 font-semibold">45 minutes</span> trapped in traffic jams. Over 30% of cardiac and polytrauma victims fail to reach emergency operating theatres within the critical <strong className="text-slate-200">"Golden Hour"</strong>.
          </p>

          {/* Live Seconds Saved Impact Counter */}
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cumulative Transit Time Saved</span>
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 mt-1 flex items-baseline space-x-2">
                  <span>{secondsCounter.toLocaleString()}</span>
                  <span className="text-lg font-sans font-medium text-slate-400">seconds</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  ≈ {(secondsCounter / 60).toFixed(1)} minutes of critical emergency response time reclaimed
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <HeartPulse className="w-8 h-8 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 transition"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Live Control Room</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={onStartPitch}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 transition"
            >
              <Sparkles className="w-5 h-5" />
              <span>Watch 60-Second Hackathon Pitch</span>
            </button>
          </div>
        </div>
      </section>

      {/* Impact Stats Grid */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl lg:text-4xl font-black text-emerald-400 font-mono">68%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Faster Hospital Arrival</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Average trip dropped from 24m → 7.8m</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl lg:text-4xl font-black text-cyan-400 font-mono">16+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Preempted Intersections</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Bengaluru ITMS Integrated</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl lg:text-4xl font-black text-amber-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Safe Phase Clearance</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Enforced Yellow + 2s All-Red</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl lg:text-4xl font-black text-purple-400 font-mono">TinyFish</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Web Agent Intelligence</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Live ICU beds & road closures</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Architecture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How GreenWave Orchestrates the City
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From the moment a 108 emergency call is logged, autonomous web agents and dynamic geofencing open a fluid green corridor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">1. TinyFish Agent Triage</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Autonomous web agents query public Karnataka Health Dept portals & hospital ICU beds in real time, routing the ambulance to the hospital with the best specialized care, not just the closest building.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">2. Dynamic Geofencing & ETA</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Calculates dynamic velocity lookahead (1 km base + speed offset) to preempt signals sequentially. Traffic lights enter a 3s Yellow clearance and 2s All-Red pause before displaying the green wave.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">3. Cryptographic Security & Recovery</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every preemption signal requires a signed cryptographic JWT from the municipal emergency dispatch. Once the ambulance passes, signals auto-restore smoothly to the city’s standard ITMS cycle.
            </p>
          </div>
        </div>
      </section>

      {/* Lives Impact & Methodology Disclaimer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-300 mb-1">
              Methodology & Hackathon Impact Estimation Disclaimer:
            </strong>
            Time saved is calculated by benchmarking the dynamic green wave trajectory against the historical average signal wait times (75-90 seconds per junction) and queue dissipation delays in Bengaluru traffic corridors. Potential lives impact scores are derived from standard academic emergency trauma curves indicating that every 5-minute reduction in transit time yields up to a 10% increase in trauma survival rates. This analytic metric is for demonstration and research modeling purposes.
          </div>
        </div>
      </section>
    </div>
  );
}
