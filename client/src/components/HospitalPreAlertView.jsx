import React, { useState } from 'react';
import {
  Hospital,
  Siren,
  Clock,
  HeartPulse,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Bed,
  Shield,
  Activity,
  PhoneCall,
  Loader2
} from 'lucide-react';

// Displays emergency department pre-alert dashboard with incoming ambulance cards, patient telemetry, and trauma team readiness controls
export default function HospitalPreAlertView({
  ambulances = [],
  hospitals = [],
  onMarkTeamReady = () => {},
  darkMode = true
}) {
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filter ambulances arriving at selected hospital
  const activeAmbulances = ambulances.filter(
    (amb) => amb.status !== 'ARRIVED' && (selectedHospitalFilter === 'ALL' || amb.hospitalId === selectedHospitalFilter)
  );

  // Handler to acknowledge emergency pre-alert and notify dispatch that the trauma team is ready
  const handleTeamReadyClick = async (ambulanceId) => {
    setLoadingAction(true);
    setErrorMsg(null);
    try {
      await onMarkTeamReady(ambulanceId);
    } catch (err) {
      setErrorMsg('Failed to update trauma team status. Please retry.');
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white tracking-tight">Hospital Emergency Department Triage</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  LIVE ER TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time pre-arrival notifications from GreenWave emergency ambulances across Bengaluru
              </p>
            </div>
          </div>
        </div>

        {/* Hospital Filter Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-semibold uppercase">Facility:</label>
          <select
            value={selectedHospitalFilter}
            onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">All Bengaluru Hospitals (Apex View)</option>
            {hospitals.map((hosp) => (
              <option key={hosp.id} value={hosp.id}>
                {hosp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Incoming Ambulances Grid */}
      {activeAmbulances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeAmbulances.map((amb) => {
            const isCritical = amb.priority === 'CRITICAL';
            const isUrgent = amb.priority === 'URGENT';
            const progress = amb.progressPercent || 0;
            // Estimated minutes to arrival
            const etaMinutes = Math.max(1, Math.ceil((100 - progress) * 0.09));
            const etaSeconds = Math.max(15, Math.ceil((100 - progress) * 5.4));

            return (
              <div
                key={amb.id}
                className={`rounded-3xl border-2 p-6 space-y-5 transition-all shadow-2xl relative overflow-hidden ${
                  isCritical
                    ? 'bg-slate-950/90 border-red-500/60 shadow-red-500/10'
                    : isUrgent
                    ? 'bg-slate-950/90 border-amber-500/50 shadow-amber-500/10'
                    : 'bg-slate-950/90 border-emerald-500/40 shadow-emerald-500/10'
                }`}
              >
                {/* Ambient glow */}
                <div
                  className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
                    isCritical ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />

                {/* Card Top Ribbon */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : isUrgent
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {amb.priority} PRIORITY ({isCritical ? 'CODE RED' : isUrgent ? 'CODE YELLOW' : 'CODE GREEN'})
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mt-1.5">{amb.callSign}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Routing via GreenWave Corridor • Destination: <strong className="text-slate-200">{amb.hospitalName}</strong>
                    </p>
                  </div>

                  {/* Live ETA Countdown Badge */}
                  <div className="text-right p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Live Transit ETA
                    </span>
                    <div className="text-3xl font-black font-mono text-emerald-400 flex items-baseline justify-end space-x-1">
                      <span>{etaMinutes}</span>
                      <span className="text-xs font-sans text-slate-400">min</span>
                      <span className="text-lg font-mono text-emerald-300/80">({etaSeconds}s)</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">GreenWave Corridor Locked</div>
                  </div>
                </div>

                {/* Progress bar towards hospital */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>En Route ({amb.speedKmh} km/h)</span>
                    <span className="font-bold text-emerald-400">{progress}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Clinical Pre-Alert Specs Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Patient Condition */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                      <span>Reported Condition</span>
                    </span>
                    <div className="font-bold text-slate-100 text-sm leading-snug">
                      {amb.patientCondition || amb.emergencyType.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Blood Group Needed */}
                  <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-red-300 tracking-wider flex items-center space-x-1">
                      <Droplet className="w-3.5 h-3.5 text-red-400" />
                      <span>Blood Crossmatch Required</span>
                    </span>
                    <div className="font-black text-red-300 text-base font-mono">
                      {amb.bloodGroup || 'O-Negative'} (2 Units)
                    </div>
                  </div>
                </div>

                {/* Action: Team Ready Confirmation */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400">
                    {amb.traumaTeamReady ? (
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Trauma Team Acknowledged & In Bay ({amb.traumaTeamReadyAt || 'Ready'})</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>Awaiting Emergency Department Team Sign-off</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleTeamReadyClick(amb.id)}
                    disabled={amb.traumaTeamReady || loadingAction}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg ${
                      amb.traumaTeamReady
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                    }`}
                  >
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : amb.traumaTeamReady ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Team Ready at Bay</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Confirm Team Ready</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto">
            <Hospital className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">No Incoming Emergency Vehicles Active</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              When an ambulance driver initiates an emergency mission in the Driver View, the hospital's incoming pre-alert card will populate here instantly over WebSocket.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 inline-block">
              Listening on BBMP Emergency Health Network • WebSocket Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
