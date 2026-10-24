import React, { useState, useEffect, useRef } from 'react';
import { Siren, Radio, X, Volume2, AlertCircle } from 'lucide-react';

// Floating public alert toast displayed to simulated nearby drivers within 500m of an approaching emergency vehicle
export default function PublicAlertToast({
  ambulances = [],
  signals = [],
  soundMuted = true
}) {
  const [activeAlert, setActiveAlert] = useState(null);
  const [dismissedAlertId, setDismissedAlertId] = useState(null);
  const lastAlertTimeRef = useRef(0);

  useEffect(() => {
    // Find any active ambulance approaching a signal within 500m
    const activeAmb = ambulances.find((a) => a.status === 'IN_TRANSIT');
    if (!activeAmb) {
      setActiveAlert(null);
      return;
    }

    // Check upcoming signals within 500m (0.5 km)
    if (activeAmb.nextSignals && activeAmb.nextSignals.length > 0) {
      const nearestSignal = activeAmb.nextSignals[0];
      if (nearestSignal && nearestSignal.distanceMeters <= 500) {
        const alertKey = `${activeAmb.id}-${nearestSignal.id}`;
        if (alertKey !== dismissedAlertId) {
          const etaSec = Math.max(10, nearestSignal.etaSeconds || 40);
          setActiveAlert({
            id: alertKey,
            ambulanceCallSign: activeAmb.callSign,
            signalName: nearestSignal.name,
            distanceMeters: nearestSignal.distanceMeters,
            etaSeconds: etaSec,
            message: `Ambulance approaching from the south in ${etaSec}s. Move left.`
          });
        }
        return;
      }
    }

    // Clear alert when ambulance moves past
    setActiveAlert(null);
  }, [ambulances, dismissedAlertId]);

  if (!activeAlert) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-red-500 shadow-2xl shadow-red-500/30 text-white backdrop-blur-xl relative overflow-hidden">
        {/* Pulsing Red Flasher Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
              <Siren className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30 inline-block">
                CIVILIAN V2X DRIVER ALERT
              </span>
              <h4 className="text-sm font-black text-white mt-0.5">Emergency Vehicle Nearby</h4>
            </div>
          </div>

          <button
            onClick={() => setDismissedAlertId(activeAlert.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Banner as requested */}
        <div className="mt-3 p-2.5 rounded-xl bg-red-950/50 border border-red-500/30">
          <p className="text-xs font-bold text-red-200 leading-snug">
            "{activeAlert.message}"
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mt-1 pt-1 border-t border-red-500/20">
            <span>Proximity: {activeAlert.distanceMeters}m</span>
            <span>Junction: {activeAlert.signalName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
