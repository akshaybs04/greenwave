import React, { useState } from 'react';
import {
  Radio,
  Siren,
  Shield,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Clock,
  Layers,
  FileText,
  TrendingUp,
  Cpu,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';
import MapView from './MapView';

export default function ControlRoomView({
  signals,
  ambulances,
  hospitals,
  eventLogs,
  auditLogs,
  metrics,
  publicAlerts,
  onStartMission,
  onConflictDemo,
  onResetSimulation,
  onTestHijack,
  darkMode
}) {
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showTinyFishModal, setShowTinyFishModal] = useState(false);

  const activeAmbulance = ambulances[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Quick Action Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">
              Bengaluru Traffic Control Command Center
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ITMS MESH ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Green-Corridor preemption telemetry • Autonomous dynamic geofencing active
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              onStartMission({
                ambulanceId: 'AMB-108-BLR',
                callSign: 'Ambulance 108 (Code Red)',
                priority: 'CRITICAL',
                emergencyType: 'CARDIAC_ARREST',
                routePreset: 'silkBoardToManipal',
                speedKmh: 65
              })
            }
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Mission (Silk Board → Manipal)</span>
          </button>

          <button
            onClick={onConflictDemo}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition"
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Simulate 2nd Ambulance Conflict</span>
          </button>

          <button
            onClick={onTestHijack}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Test Unauthorized Hijack</span>
          </button>

          <button
            onClick={onResetSimulation}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset All Signals & Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Live Map + Event Feed & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-[520px] relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <MapView
              signals={signals}
              ambulances={ambulances}
              hospitals={hospitals}
              activeRoute={activeAmbulance ? { waypoints: activeAmbulance.waypoints } : null}
              onSignalClick={(sig) => setSelectedSignal(sig)}
              darkMode={darkMode}
            />
          </div>

          {/* Quick Signal Inspector / Public Notification Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Inspector */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Signal Telemetry Inspector</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedSignal ? selectedSignal.id : 'Click signal on map'}
                </span>
              </div>
              {selectedSignal ? (
                <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-400">Junction:</span> <strong className="text-white">{selectedSignal.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Current Phase:</span>{' '}
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        selectedSignal.currentPhase === 'GREEN'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : selectedSignal.currentPhase === 'YELLOW'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {selectedSignal.currentPhase}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">State:</span> {selectedSignal.state}
                  </div>
                  <div>
                    <span className="text-slate-400">Transition Timer:</span> {selectedSignal.transitionCountdown}s
                  </div>
                  <div>
                    <span className="text-slate-400">Active Corridor Hold:</span>{' '}
                    {selectedSignal.emergencyHold ? '🟢 LOCKED' : '⚪ Standard ITMS Cycle'}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">
                  Click on any traffic signal icon on the map above to view phase cycles, controller type, and clearance timers.
                </p>
              )}
            </div>

            {/* Public Push Warning */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Public Driver Broadcast Alert</span>
                </span>
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                  {publicAlerts && publicAlerts[0]
                    ? publicAlerts[0].text
                    : 'System standby. Warning messages will push to nearby connected navigation units upon geofence breach.'}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between font-mono">
                <span>Protocol: V2X Alert Mesh</span>
                <span>Radius: 500m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Metrics & Live Event Stream */}
        <div className="space-y-4">
          {/* Key Impact Metrics Card */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Impact Telemetry</span>
              </span>
              <button
                onClick={() => setShowAuditModal(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">Total Time Saved</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                  {metrics?.totalSecondsSaved || 0}s
                </div>
                <div className="text-[10px] text-slate-400">
                  ≈ {((metrics?.totalSecondsSaved || 0) / 60).toFixed(1)} mins saved
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">Preempted Signals</span>
                <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">
                  {metrics?.totalSignalsPreempted || 0}
                </div>
                <div className="text-[10px] text-slate-400">Zero Red Stoppages</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">Fuel Saved</span>
                <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
                  {metrics?.fuelSavedLiters || 0} L
                </div>
                <div className="text-[10px] text-slate-400">Reduced Idling</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">Potential Lives Index</span>
                <div className="text-xl font-black font-mono text-purple-400 mt-0.5">
                  +{metrics?.estimatedLivesImpactScore || 0}
                </div>
                <div className="text-[9px] text-slate-400">Estimated Survival Boost</div>
              </div>
            </div>

            {/* Normal Trip vs GreenWave Corridor Comparison */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                Trip Time Benchmarking (Silk Board → Manipal)
              </span>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Standard Traffic (Normal ITMS Cycles)</span>
                  <span className="font-mono text-red-400">23.0 mins</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500/80 h-2 rounded-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>GreenWave Dynamic Corridor</span>
                  <span className="font-mono text-emerald-400">9.0 mins (61% Faster)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[39%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time ITMS Event Feed */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col h-[280px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Live Event Stream</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">{eventLogs.length} events logged</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
              {eventLogs.length > 0 ? (
                eventLogs.map((log) => {
                  let badgeColor = 'text-slate-400 bg-slate-800';
                  if (log.level === 'critical' || log.type === 'PRIORITY_PREEMPTION')
                    badgeColor = 'text-red-300 bg-red-950/60 border border-red-500/30';
                  else if (log.level === 'success' || log.type === 'CORRIDOR_GREEN_LOCKED')
                    badgeColor = 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30';
                  else if (log.level === 'warn' || log.type === 'TRANSITION_INITIATED')
                    badgeColor = 'text-amber-300 bg-amber-950/60 border border-amber-500/30';

                  return (
                    <div key={log.id} className={`p-2 rounded-xl text-[11px] leading-tight ${badgeColor}`}>
                      <div className="flex items-center justify-between text-[9px] opacity-75 mb-0.5">
                        <span className="font-bold">{log.type}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="font-sans text-[11px] font-medium">{log.message}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-400 py-10 text-[11px] font-sans">
                  System idling. Press "Start Mission" to trigger live preemption events.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Cryptographic Override Audit Log</h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Every signal preemption requires a valid JWT signed by Bengaluru Traffic Police (BBMP ITMS). Spoofed or unauthorized requests are cryptographically rejected and logged below.
            </p>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border ${
                      log.status === 'VERIFIED_OK' || log.status === 'AUTHORIZED'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-bold">{log.event} • {log.status}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div>Vehicle ID: {log.vehicleId}</div>
                    <div>Details: {log.details}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">No security override events recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
