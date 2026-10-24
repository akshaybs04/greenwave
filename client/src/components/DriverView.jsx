import React, { useState, useEffect, useRef } from 'react';
import {
  Siren,
  Hospital,
  Clock,
  Compass,
  AlertCircle,
  Radio,
  CheckCircle,
  Loader2,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function DriverView({
  ambulance,
  onStartEmergency,
  signals,
  publicAlerts,
  darkMode
}) {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('hosp-2'); // default Manipal
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('CARDIAC_ARREST');
  const [selectedPriority, setSelectedPriority] = useState('CRITICAL');
  const [patientCondition, setPatientCondition] = useState('Severe STEMI / Acute Myocardial Infarction');
  const [bloodGroup, setBloodGroup] = useState('O-Negative (Universal)');
  const [selectedRoute, setSelectedRoute] = useState('silkBoardToManipal');
  const [speedSlider, setSpeedSlider] = useState(65);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [agentMetadata, setAgentMetadata] = useState(null);
  const [voiceMuted, setVoiceMuted] = useState(false);

  const spokenSignalsRef = useRef(new Set());

  // Uses browser SpeechSynthesis API to vocalize auditory driving alerts
  const speakVoiceAlert = (text) => {
    if (voiceMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('SpeechSynthesis error', e);
      }
    }
  };

  // Watches upcoming signals and triggers vocal announcement when a signal turns green
  useEffect(() => {
    if (!ambulance || !ambulance.nextSignals) return;

    ambulance.nextSignals.forEach((sig) => {
      const isCleared = sig.phase === 'GREEN' && sig.state === 'EMERGENCY_GREEN';
      if (isCleared && !spokenSignalsRef.current.has(sig.id)) {
        spokenSignalsRef.current.add(sig.id);
        speakVoiceAlert('Signal cleared ahead, proceed.');
      }
    });
  }, [ambulance?.nextSignals, voiceMuted]);

  // Fetch hospital intelligence from TinyFish agent backend
  const fetchHospitalTelemetry = async (emergencyType = selectedEmergencyType) => {
    setLoadingAgent(true);
    try {
      const res = await fetch(`/api/hospitals?emergencyType=${emergencyType}&lat=12.9228&lng=77.6212`);
      const data = await res.json();
      setHospitals(data.hospitals || []);
      setAgentMetadata({
        log: data.agentLog,
        isLive: data.isLiveAgent,
        queriedAt: data.queriedAt
      });
      if (data.recommendedHospitalId) {
        setSelectedHospitalId(data.recommendedHospitalId);
      }
    } catch (e) {
      console.error('Failed to fetch hospitals', e);
    } finally {
      setLoadingAgent(false);
    }
  };

  useEffect(() => {
    fetchHospitalTelemetry();
  }, [selectedEmergencyType]);

  // Dispatches emergency mission with clinical condition, blood group, and destination hospital
  const handleStartMission = () => {
    onStartEmergency({
      ambulanceId: 'AMB-108-BLR',
      callSign: 'Ambulance 108 (Code Red)',
      priority: selectedPriority,
      emergencyType: selectedEmergencyType,
      patientCondition,
      bloodGroup,
      hospitalId: selectedHospitalId,
      routePreset: selectedRoute,
      speedKmh: speedSlider
    });
  };

  // Find selected hospital details
  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId);

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      {/* Mobile Terminal Container Frame */}
      <div className="rounded-[36px] bg-slate-950 border-4 border-slate-800 shadow-2xl p-4 sm:p-5 relative overflow-hidden">
        {/* Mobile Header Notch */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-slate-300">EMERGENCY TERMINAL #108</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Voice Alert Mute Toggle */}
            <button
              onClick={() => {
                const next = !voiceMuted;
                setVoiceMuted(next);
                if (!next) speakVoiceAlert('Voice alerts enabled.');
              }}
              className={`p-1.5 rounded-lg border text-[10px] font-semibold flex items-center space-x-1 transition ${
                voiceMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
              title={voiceMuted ? 'Unmute Driver Voice Alerts' : 'Mute Driver Voice Alerts'}
            >
              {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{voiceMuted ? 'Voice Muted' : 'Voice ON'}</span>
            </button>

            <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>ITMS MESH</span>
            </div>
          </div>
        </div>

        {/* Status Card: In Transit vs Ready */}
        {ambulance && ambulance.status !== 'ARRIVED' ? (
          <div className="space-y-4">
            {/* Active Mission Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/80 to-slate-900 border border-red-500/40 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 inline-flex items-center space-x-1">
                    <Siren className="w-3 h-3 animate-pulse" />
                    <span>ACTIVE GREEN CORRIDOR</span>
                  </span>
                  <h3 className="text-xl font-black text-white mt-1.5">{ambulance.callSign}</h3>
                  <p className="text-xs text-red-200 mt-0.5 font-medium flex items-center space-x-1">
                    <span>Priority: {ambulance.priority}</span>
                    <span>•</span>
                    <span>{ambulance.emergencyType.replace('_', ' ')}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Transit Speed</span>
                  <div className="text-2xl font-black font-mono text-white flex items-baseline justify-end">
                    <span>{ambulance.speedKmh}</span>
                    <span className="text-xs font-sans text-slate-400 ml-1">km/h</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Departure: Silk Board</span>
                  <span>{ambulance.progressPercent}% to Hospital</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ambulance.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Destination Hospital Telemetry */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Hospital className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Destination ER</span>
                  <div className="text-xs font-bold text-slate-100">{ambulance.hospitalName}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Trauma Team Pre-Alerted • ICU Bed Reserved</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black font-mono text-emerald-400">
                  {Math.max(1, Math.ceil((100 - ambulance.progressPercent) * 0.08))}m
                </div>
                <div className="text-[10px] text-slate-400 font-mono">EST. ETA</div>
              </div>
            </div>

            {/* Next Signals Ahead Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Next Signals Ahead (Sequential Geofence)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1 km Lookahead</span>
              </div>

              {ambulance.nextSignals && ambulance.nextSignals.length > 0 ? (
                ambulance.nextSignals.map((sig) => {
                  const isCleared = sig.phase === 'GREEN' && sig.state === 'EMERGENCY_GREEN';
                  const isClearing = sig.state === 'PREPARING_CLEARANCE' || sig.state === 'ALL_RED_CLEARANCE';

                  return (
                    <div
                      key={sig.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isCleared
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                          : isClearing
                          ? 'bg-amber-950/30 border-amber-500/40 animate-pulse'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isCleared
                              ? 'bg-emerald-400 shadow-md shadow-emerald-400'
                              : isClearing
                              ? 'bg-amber-400 shadow-md shadow-amber-400'
                              : 'bg-red-500'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{sig.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                            <span>{sig.distanceMeters}m away</span>
                            <span>•</span>
                            <span className="font-mono">ETA {sig.etaSeconds}s</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCleared
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isClearing
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCleared ? 'CORRIDOR GREEN' : isClearing ? `CLEARING (${sig.countdown}s)` : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                  Approaching intermediate corridor sector. Scanning upcoming ITMS junction nodes...
                </div>
              )}
            </div>

            {/* Driver & Public Alert Broadcast Monitor */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Nearby Public Driver Push Broadcast</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed font-mono">
                {publicAlerts && publicAlerts[0]
                  ? `"${publicAlerts[0].text}"`
                  : '"Broadcasting emergency geofence warning to nearby navigation displays within 500m..."'}
              </p>
            </div>
          </div>
        ) : (
          /* Mission Configuration & Start Emergency View */
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h2 className="text-xl font-black text-white">Ambulance Dispatch Control</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure patient severity & let TinyFish agent select optimal hospital
              </p>
            </div>

            {/* Emergency Severity Level */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Patient Emergency Severity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CRITICAL', label: 'Critical', sub: 'Code Red', color: 'border-red-500 bg-red-950/40 text-red-300' },
                  { id: 'URGENT', label: 'Urgent', sub: 'Code Yellow', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                  { id: 'STANDARD', label: 'Standard', sub: 'Code Green', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedPriority(item.id);
                      if (item.id === 'CRITICAL') setSelectedEmergencyType('CARDIAC_ARREST');
                      else if (item.id === 'URGENT') setSelectedEmergencyType('STROKE');
                      else setSelectedEmergencyType('STABLE_TRANSFER');
                    }}
                    className={`p-2 rounded-xl text-center border text-xs font-semibold transition ${
                      selectedPriority === item.id
                        ? item.color + ' ring-2 ring-emerald-500/40'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] opacity-75 font-normal">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Type Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Clinical Category
              </label>
              <select
                value={selectedEmergencyType}
                onChange={(e) => {
                  setSelectedEmergencyType(e.target.value);
                  if (e.target.value === 'CARDIAC_ARREST') setPatientCondition('Severe STEMI / Acute Myocardial Infarction');
                  else if (e.target.value === 'TRAUMA') setPatientCondition('Multiple Blunt Polytrauma / Pelvic Fracture');
                  else if (e.target.value === 'STROKE') setPatientCondition('Acute Ischemic Stroke (LVO - Clot Retrieval)');
                  else if (e.target.value === 'RESPIRATORY_FAILURE') setPatientCondition('Acute Respiratory Distress / ARDS');
                  else setPatientCondition('Scheduled Critical Care Transfer');
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="CARDIAC_ARREST">Cardiac Arrest / Myocardial Infarction</option>
                <option value="TRAUMA">Severe Polytrauma / Road Accident</option>
                <option value="STROKE">Acute Ischemic Stroke (Time Sensitive)</option>
                <option value="RESPIRATORY_FAILURE">Severe Respiratory Distress / ICU Needed</option>
                <option value="STABLE_TRANSFER">Stable Inter-Hospital Transfer</option>
              </select>
            </div>

            {/* Specific Patient Diagnosis / Condition */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Patient Diagnosis & Notes
              </label>
              <input
                type="text"
                value={patientCondition}
                onChange={(e) => setPatientCondition(e.target.value)}
                placeholder="e.g. Severe STEMI / Acute Infarction"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Blood Group Needed */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-red-400 mb-1.5 flex items-center justify-between">
                <span>Blood Group Required (ER Pre-Alert)</span>
                <span className="text-[10px] text-slate-400 font-mono">Immediate Crossmatch</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-900 border border-red-500/40 rounded-xl px-3 py-2 text-xs text-red-300 focus:outline-none focus:border-red-500 font-semibold"
              >
                <option value="O-Negative (Universal)">O-Negative (Universal Donor / Emergency)</option>
                <option value="O-Positive">O-Positive</option>
                <option value="A-Positive">A-Positive</option>
                <option value="A-Negative">A-Negative</option>
                <option value="B-Positive">B-Positive</option>
                <option value="B-Negative">B-Negative</option>
                <option value="AB-Positive">AB-Positive (Universal Recipient)</option>
                <option value="AB-Negative">AB-Negative</option>
              </select>
            </div>

            {/* Smart Hospital Selection powered by TinyFish Web Agent */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hospital Selection (TinyFish Agent)</span>
                </label>
                <button
                  onClick={() => fetchHospitalTelemetry(selectedEmergencyType)}
                  disabled={loadingAgent}
                  className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingAgent ? 'animate-spin' : ''}`} />
                  <span>Refresh Agent</span>
                </button>
              </div>

              {/* Agent Status Badge */}
              {agentMetadata && (
                <div className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-between">
                  <span className="truncate">{agentMetadata.isLive ? '🟢 TinyFish Live Crawler Active' : '🟡 Karnataka Health Dept Telemetry'}</span>
                  <span className="font-mono text-purple-400 shrink-0 ml-1">Verified</span>
                </div>
              )}

              {/* Hospital Options */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {hospitals.map((hosp) => {
                  const isSelected = hosp.id === selectedHospitalId;
                  const isRecommended = hosp.smartScore >= 90;

                  return (
                    <div
                      key={hosp.id}
                      onClick={() => setSelectedHospitalId(hosp.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                            <span>{hosp.name}</span>
                            {isRecommended && (
                              <span className="text-[9px] bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-1.5 py-0.2 rounded font-semibold">
                                Best Match
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {hosp.area} • {hosp.distanceKm} km away • Level {hosp.traumaLevel} Trauma
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              hosp.icuBedsAvailable > 10
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {hosp.icuBedsAvailable} ICU Beds
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/60 font-mono">
                        💡 {hosp.recommendationReason}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Route Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Corridor Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="silkBoardToManipal">Silk Board → Manipal Hospital (6.8 km, 9 signals)</option>
                <option value="koramangalaToVictoria">Koramangala → Victoria Apex Trauma (7.4 km, 8 signals)</option>
                <option value="mgRoadToStJohns">MG Road → St. John's Medical College (6.2 km, 7 signals)</option>
              </select>
            </div>

            {/* Start Emergency Button */}
            <button
              onClick={handleStartMission}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transform active:scale-95 transition"
            >
              <Siren className="w-5 h-5 animate-bounce" />
              <span>START EMERGENCY CORRIDOR</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
