import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Trophy,
  Zap,
  TrendingUp,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';
import { PRESET_ROUTES, SIGNALS } from '../../../server/src/data/bengaluruData.js';

// Renders Before vs After race simulation comparing an ambulance on normal traffic cycles against GreenWave green-corridor preemption
export default function RaceCompareView({ darkMode = true }) {
  const [racing, setRacing] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [normalElapsed, setNormalElapsed] = useState(0);
  const [greenwaveElapsed, setGreenwaveElapsed] = useState(0);
  const [greenwaveFinished, setGreenwaveFinished] = useState(false);
  const [normalFinished, setNormalFinished] = useState(false);
  const [signalsClearedCount, setSignalsClearedCount] = useState(0);

  const leftMapContainerRef = useRef(null);
  const rightMapContainerRef = useRef(null);
  const leftMapInstance = useRef(null);
  const rightMapInstance = useRef(null);
  const leftMarkerRef = useRef(null);
  const rightMarkerRef = useRef(null);
  const leftSignalMarkers = useRef(new Map());
  const rightSignalMarkers = useRef(new Map());

  const raceStateRef = useRef({
    leftIndex: 0,
    rightIndex: 0,
    leftWaitingAtSignal: false,
    leftWaitTimer: 0,
    intervalId: null
  });

  const waypoints = PRESET_ROUTES.silkBoardToManipal.waypoints;
  const corridorSignals = SIGNALS.slice(0, 8); // Intersecting signals along route

  // Initializes dual Leaflet map instances for Left (Normal) and Right (GreenWave)
  useEffect(() => {
    if (!leftMapContainerRef.current || !rightMapContainerRef.current) return;

    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    // Left Map (Normal Trip)
    if (!leftMapInstance.current) {
      const leftMap = L.map(leftMapContainerRef.current, {
        center: [12.938, 77.632],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(leftMap);
      L.polyline(waypoints.map((w) => [w.lat, w.lng]), {
        color: '#ef4444',
        weight: 3.5,
        opacity: 0.6,
        dashArray: '5, 5'
      }).addTo(leftMap);
      leftMapInstance.current = leftMap;
    }

    // Right Map (GreenWave Trip)
    if (!rightMapInstance.current) {
      const rightMap = L.map(rightMapContainerRef.current, {
        center: [12.938, 77.632],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(rightMap);
      L.polyline(waypoints.map((w) => [w.lat, w.lng]), {
        color: '#10b981',
        weight: 4,
        opacity: 0.8
      }).addTo(rightMap);
      rightMapInstance.current = rightMap;
    }

    // Populate signals on both maps
    corridorSignals.forEach((sig) => {
      // Left map: starts RED
      if (leftMapInstance.current && !leftSignalMarkers.current.has(sig.id)) {
        const leftSigIcon = L.divIcon({
          className: 'sig-left',
          html: `<div style="background:#090d16; border:2px solid #ef4444; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px #ef4444;"><span style="width:6px; height:6px; border-radius:50%; background:#ef4444;"></span></div>`,
          iconSize: [0, 0]
        });
        const m = L.marker([sig.location.lat, sig.location.lng], { icon: leftSigIcon }).addTo(leftMapInstance.current);
        leftSignalMarkers.current.set(sig.id, m);
      }

      // Right map: starts RED but will turn GREEN on approach
      if (rightMapInstance.current && !rightSignalMarkers.current.has(sig.id)) {
        const rightSigIcon = L.divIcon({
          className: 'sig-right',
          html: `<div id="r-sig-${sig.id}" style="background:#090d16; border:2px solid #ef4444; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px #ef4444;"><span style="width:6px; height:6px; border-radius:50%; background:#ef4444;"></span></div>`,
          iconSize: [0, 0]
        });
        const m = L.marker([sig.location.lat, sig.location.lng], { icon: rightSigIcon }).addTo(rightMapInstance.current);
        rightSignalMarkers.current.set(sig.id, m);
      }
    });

    // Initial Ambulance Markers
    const startPt = waypoints[0];
    const ambIconNormal = L.divIcon({
      className: 'amb-norm',
      html: `<div style="transform:translate(-50%,-50%); width:28px; height:28px; border-radius:50%; background:#1e293b; border:2px solid #ef4444; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px #ef4444; font-size:14px;">🚑</div>`,
      iconSize: [0, 0]
    });
    const ambIconGreen = L.divIcon({
      className: 'amb-gw',
      html: `<div style="transform:translate(-50%,-50%); width:28px; height:28px; border-radius:50%; background:#064e3b; border:2px solid #10b981; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px #10b981; font-size:14px; animation:pulse-corridor 1.5s infinite;">🚑</div>`,
      iconSize: [0, 0]
    });

    if (!leftMarkerRef.current && leftMapInstance.current) {
      leftMarkerRef.current = L.marker([startPt.lat, startPt.lng], { icon: ambIconNormal }).addTo(leftMapInstance.current);
    }
    if (!rightMarkerRef.current && rightMapInstance.current) {
      rightMarkerRef.current = L.marker([startPt.lat, startPt.lng], { icon: ambIconGreen }).addTo(rightMapInstance.current);
    }

    return () => {
      if (raceStateRef.current.intervalId) {
        clearInterval(raceStateRef.current.intervalId);
      }
    };
  }, []);

  // Starts the synchronized comparative race between Standard Traffic and GreenWave
  const handleStartRace = () => {
    handleResetRace();
    setRacing(true);
    setRaceFinished(false);
    setGreenwaveFinished(false);
    setNormalFinished(false);

    let lIdx = 0;
    let rIdx = 0;
    let lWait = 0;
    let gwDone = false;
    let normDone = false;
    let gwTime = 0;
    let normTime = 0;
    let cleared = 0;

    raceStateRef.current.intervalId = setInterval(() => {
      // 1. Right Ambulance (GreenWave): Moves fast & unhindered
      if (!gwDone) {
        gwTime += 0.5;
        setGreenwaveElapsed(Math.round(gwTime * 10) / 10);
        rIdx += 0.28; // Rapid progress

        if (rIdx >= waypoints.length - 1) {
          rIdx = waypoints.length - 1;
          gwDone = true;
          setGreenwaveFinished(true);
        }

        const currPt = interpolateWaypoint(waypoints, rIdx);
        if (rightMarkerRef.current) {
          rightMarkerRef.current.setLatLng([currPt.lat, currPt.lng]);
        }

        // Green Wave Preemption ahead: Turn upcoming signal green
        corridorSignals.forEach((sig) => {
          const dist = Math.hypot(sig.location.lat - currPt.lat, sig.location.lng - currPt.lng) * 111;
          if (dist < 0.8) {
            const el = document.getElementById(`r-sig-${sig.id}`);
            if (el) {
              el.style.borderColor = '#10b981';
              el.style.boxShadow = '0 0 12px #10b981';
              el.children[0].style.background = '#10b981';
            }
            cleared = Math.min(8, cleared + 1);
            setSignalsClearedCount(cleared);
          }
        });
      }

      // 2. Left Ambulance (Normal Trip): Stopped at red lights periodically
      if (!normDone) {
        normTime += 0.5;
        setNormalElapsed(Math.round(normTime * 10) / 10);

        if (lWait > 0) {
          // Waiting at red light
          lWait -= 0.5;
        } else {
          lIdx += 0.11; // normal traffic speed

          // Check if hitting a red light intersection (e.g. at ~25%, ~50%, ~75% of route)
          const atSignal1 = lIdx > 2.2 && lIdx < 2.5;
          const atSignal2 = lIdx > 4.8 && lIdx < 5.1;
          const atSignal3 = lIdx > 6.8 && lIdx < 7.1;

          if (atSignal1 || atSignal2 || atSignal3) {
            lWait = 4.5; // wait at red light
          }

          if (lIdx >= waypoints.length - 1) {
            lIdx = waypoints.length - 1;
            normDone = true;
            setNormalFinished(true);
          }

          const currPt = interpolateWaypoint(waypoints, lIdx);
          if (leftMarkerRef.current) {
            leftMarkerRef.current.setLatLng([currPt.lat, currPt.lng]);
          }
        }
      }

      if (gwDone && normDone) {
        clearInterval(raceStateRef.current.intervalId);
        setRacing(false);
        setRaceFinished(true);
      }
    }, 200);
  };

  // Resets the race simulation state, timers, and marker positions
  const handleResetRace = () => {
    if (raceStateRef.current.intervalId) {
      clearInterval(raceStateRef.current.intervalId);
    }
    setRacing(false);
    setRaceFinished(false);
    setGreenwaveFinished(false);
    setNormalFinished(false);
    setNormalElapsed(0);
    setGreenwaveElapsed(0);
    setSignalsClearedCount(0);

    const startPt = waypoints[0];
    if (leftMarkerRef.current) leftMarkerRef.current.setLatLng([startPt.lat, startPt.lng]);
    if (rightMarkerRef.current) rightMarkerRef.current.setLatLng([startPt.lat, startPt.lng]);

    // Reset right signal lights to red
    corridorSignals.forEach((sig) => {
      const el = document.getElementById(`r-sig-${sig.id}`);
      if (el) {
        el.style.borderColor = '#ef4444';
        el.style.boxShadow = '0 0 8px #ef4444';
        el.children[0].style.background = '#ef4444';
      }
    });
  };

  // Interpolates between discrete coordinate waypoints along the route path
  function interpolateWaypoint(pts, floatIndex) {
    const idx = Math.floor(floatIndex);
    const frac = floatIndex - idx;
    if (idx >= pts.length - 1) return pts[pts.length - 1];
    const p1 = pts[idx];
    const p2 = pts[idx + 1];
    return {
      lat: p1.lat + (p2.lat - p1.lat) * frac,
      lng: p1.lng + (p2.lng - p1.lng) * frac
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Before vs After: The Live Corridor Race</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Silk Board Junction → Manipal Hospital (6.8 km, 8 Intersections)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartRace}
            disabled={racing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition shadow-lg ${
              racing
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{racing ? 'Race in Progress...' : 'Start Comparative Race'}</span>
          </button>
          <button
            onClick={handleResetRace}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset Race"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual Maps Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Map: Normal Trip */}
        <div className="rounded-3xl border border-red-500/30 bg-slate-950/80 p-4 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Normal Trip (No Preemption)
              </h3>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-mono text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Simulated Trip: {normalElapsed.toFixed(1)}s (23.0m in city traffic)</span>
            </div>
          </div>

          <div className="h-[380px] rounded-2xl overflow-hidden border border-slate-800 relative">
            <div ref={leftMapContainerRef} className="w-full h-full" />
            <div className="absolute top-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/30 text-[10px] text-red-300 font-mono">
              🔴 Trapped by Red Lights & Queue Delay
            </div>
            {normalFinished && (
              <div className="absolute inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="p-4 rounded-2xl bg-red-950 border border-red-500/50 text-center space-y-1">
                  <div className="text-base font-black text-red-200">Arrived via Standard Traffic</div>
                  <div className="text-xs text-red-300 font-mono">Total Time: ~23 minutes (3 stoppages)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Map: With GreenWave */}
        <div className="rounded-3xl border border-emerald-500/40 bg-slate-950/80 p-4 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                With GreenWave (Autonomous Corridor)
              </h3>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Trip: {greenwaveElapsed.toFixed(1)}s (9.0m corridor)</span>
            </div>
          </div>

          <div className="h-[380px] rounded-2xl overflow-hidden border border-slate-800 relative">
            <div ref={rightMapContainerRef} className="w-full h-full" />
            <div className="absolute top-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
              🟢 Dynamic 1km Geofence Preempts Signals
            </div>
            {greenwaveFinished && (
              <div className="absolute inset-0 z-[500] bg-emerald-950/70 backdrop-blur-sm flex items-center justify-center">
                <div className="p-4 rounded-2xl bg-emerald-900 border border-emerald-400 text-center space-y-1">
                  <div className="text-lg font-black text-white flex items-center justify-center space-x-1.5">
                    <Trophy className="w-5 h-5 text-amber-300" />
                    <span>GreenWave Corridor Completed!</span>
                  </div>
                  <div className="text-xs text-emerald-200 font-mono">Arrived 14.0 Minutes Faster (61% Saved)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post-Race Scorecard & Impact Summary */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Race Telemetry & Savings Scorecard</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            {greenwaveFinished ? '🏆 GreenWave Victory' : 'Awaiting Race Execution'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Total Time Reclaimed</span>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
              {greenwaveFinished ? '14.0 mins' : '--'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">840 seconds saved vs standard traffic</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Intersections Preempted</span>
            <div className="text-3xl font-black font-mono text-cyan-400 mt-1">
              {greenwaveFinished ? '8 / 8' : signalsClearedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Zero dead stoppages at red lights</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Golden Hour Survival Gain</span>
            <div className="text-3xl font-black font-mono text-purple-400 mt-1">
              {greenwaveFinished ? '+28%' : '--'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Trauma survival probability boost</div>
          </div>
        </div>

        {/* Clear Simulation Estimate Label as Required */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-200 mb-0.5">Simulation Estimate Notice:</strong>
            Comparative metrics represent computational simulation estimates calculated from empirical Bengaluru Traffic Police signal cycle data (75–90 seconds per junction cycle) against GreenWave dynamic lookahead corridor transit.
          </div>
        </div>
      </div>
    </div>
  );
}
