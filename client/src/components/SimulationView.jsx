import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  MapPin,
  Hospital,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import MapView from './MapView';

export default function SimulationView({
  signals,
  ambulances,
  hospitals,
  metrics,
  onStartMission,
  onResetSimulation,
  darkMode
}) {
  const [selectedPreset, setSelectedPreset] = useState('silkBoardToManipal');
  const [speed, setSpeed] = useState(65);
  const [trafficAlerts, setTrafficAlerts] = useState(null);
  const [activeTabSub, setActiveTabSub] = useState('sandbox'); // 'sandbox' | 'safety' | 'roadalerts'

  useEffect(() => {
    fetch('/api/traffic-alerts')
      .then((res) => res.json())
      .then((data) => setTrafficAlerts(data))
      .catch((err) => console.error('Traffic alerts fetch error', err));
  }, []);

  const activeAmbulance = ambulances[0];

  const handleLaunch = () => {
    onStartMission({
      ambulanceId: 'AMB-108-BLR',
      callSign: 'Ambulance 108 (Code Red)',
      priority: 'CRITICAL',
      emergencyType: 'CARDIAC_ARREST',
      routePreset: selectedPreset,
      speedKmh: speed
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Interactive Corridor Simulation & Physics Sandbox
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test geofencing velocity lookaheads, safe signal transitions, and autonomous rerouting
          </p>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTabSub('sandbox')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTabSub === 'sandbox' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Route Simulator
          </button>
          <button
            onClick={() => setActiveTabSub('safety')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTabSub === 'safety' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safe Transition Phases
          </button>
          <button
            onClick={() => setActiveTabSub('roadalerts')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTabSub === 'roadalerts' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            TinyFish Road Advisories
          </button>
        </div>
      </div>

      {activeTabSub === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map on Left 2 cols */}
          <div className="lg:col-span-2 h-[560px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <MapView
              signals={signals}
              ambulances={ambulances}
              hospitals={hospitals}
              activeRoute={activeAmbulance ? { waypoints: activeAmbulance.waypoints } : null}
              darkMode={darkMode}
            />
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Corridor Simulation Parameters
              </h3>

              {/* Preset Route Choice */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Pre-mapped Road Corridor
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'silkBoardToManipal',
                      title: 'Silk Board → Manipal Hospital',
                      desc: '6.8 km via Koramangala 100ft & Domlur (9 Signals)'
                    },
                    {
                      id: 'koramangalaToVictoria',
                      title: 'Sony World → Victoria Trauma Center',
                      desc: '7.4 km via Adugodi, Dairy Circle & KR Market (8 Signals)'
                    },
                    {
                      id: 'mgRoadToStJohns',
                      title: "MG Road → St. John's Medical College",
                      desc: '6.2 km via Residency Rd & Richmond Circle (7 Signals)'
                    }
                  ].map((route) => (
                    <div
                      key={route.id}
                      onClick={() => setSelectedPreset(route.id)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${
                        selectedPreset === route.id
                          ? 'border-emerald-500 bg-emerald-950/30 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-bold">{route.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{route.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speed Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-bold uppercase text-[11px]">Transit Speed</span>
                  <span className="font-mono text-emerald-400 font-bold">{speed} km/h</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="90"
                  step="5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>35 km/h (Dense Rain)</span>
                  <span>65 km/h (Rapid)</span>
                  <span>90 km/h (Expressway)</span>
                </div>
              </div>

              {/* Launch & Reset Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={handleLaunch}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Simulation</span>
                </button>
                <button
                  onClick={onResetSimulation}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Progress Card when Active */}
            {activeAmbulance && (
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Simulation Status</span>
                  <span className="text-emerald-400 font-mono font-bold">{activeAmbulance.status}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Time Saved on This Run</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {Math.round(activeAmbulance.secondsSavedOnTrip)}s
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activeAmbulance.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safe Signal Transition Phase Diagram */}
      {activeTabSub === 'safety' && (
        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white">Safe Signal Clearance Protocol</h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Municipal safety regulations strictly prohibit instantaneous Red-to-Green switching. GreenWave implements a multi-phase fail-safe transition cycle that guarantees cross-traffic and pedestrians clear the intersection before emergency priority locks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Phase 1 */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-200">Yellow Phase (3 Seconds)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Triggered when ambulance breaks 1km dynamic geofence. Signals crossing lanes to brake safely and cease entering intersection.
              </p>
              <div className="flex items-center space-x-1.5 text-[10px] text-amber-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Active clearance warning</span>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-red-500/30 bg-red-950/20 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-bold font-mono">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-200">All-Red Clearance (2 Seconds)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ALL directions turn solid RED simultaneously. Trapped vehicles clear intersection box; pedestrian crosswalks finalize clearance.
              </p>
              <div className="flex items-center space-x-1.5 text-[10px] text-red-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                <span>Pedestrian safety buffer</span>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 bg-emerald-950/20 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-200">Corridor Green Locked</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Target corridor switches to solid GREEN. Held continuously until ambulance passes intersection threshold.
              </p>
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Zero stoppage traversal</span>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
                04
              </div>
              <h4 className="text-sm font-bold text-slate-200">Smooth ITMS Auto-Restore</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ambulance departure detected by geofence egress. Controller transitions through a 3s Yellow buffer back to municipal cycle.
              </p>
              <div className="flex items-center space-x-1.5 text-[10px] text-cyan-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Normal cycle resumed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TinyFish Live Road Advisories */}
      {activeTabSub === 'roadalerts' && (
        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">TinyFish Web Agent Road Intelligence</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Autonomous scraping of Bengaluru Traffic Police (BTP) bulletins, road work notices & weather advisories
              </p>
            </div>
            <div className="text-[11px] font-mono text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Agent Status: Crawling Public Feeds
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trafficAlerts && trafficAlerts.activeAlerts ? (
              trafficAlerts.activeAlerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        alert.severity === 'HIGH'
                          ? 'bg-red-500/20 text-red-300'
                          : alert.severity === 'MODERATE'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {alert.type} • {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.reportedAt}</span>
                  </div>
                  <h4 className="font-bold text-slate-200">{alert.location}</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{alert.impact}</p>
                  <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-300">
                    <strong>Corridor Action:</strong> {alert.recommendation}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono pt-1">Source: {alert.source}</div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-xs py-8">Fetching live web agent alerts...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
