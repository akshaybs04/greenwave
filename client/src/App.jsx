import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import LandingView from './components/LandingView';
import DriverView from './components/DriverView';
import ControlRoomView from './components/ControlRoomView';
import SimulationView from './components/SimulationView';
import HospitalPreAlertView from './components/HospitalPreAlertView';
import RaceCompareView from './components/RaceCompareView';
import PublicAlertToast from './components/PublicAlertToast';
import PitchModeOverlay from './components/PitchModeOverlay';
import { audioService } from './components/AudioService';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [connected, setConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [soundMuted, setSoundMuted] = useState(true);

  // Core Simulation State
  const [signals, setSignals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [publicAlerts, setPublicAlerts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSecondsSaved: 1420,
    totalSignalsPreempted: 18,
    totalMissionsCompleted: 3,
    fuelSavedLiters: 4.8,
    co2ReducedKg: 11.2,
    estimatedLivesImpactScore: 5
  });
  const [pitchState, setPitchState] = useState({ active: false });

  const wsRef = useRef(null);

  // Synchronizes browser URL navigation with active tab view
  const navigateTab = (tab) => {
    setActiveTab(tab);
    const targetPath = tab === 'landing' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // Listens to browser URL history popstate events and sets initial tab from URL path
  useEffect(() => {
    const rawPath = window.location.pathname.replace('/', '').toLowerCase();
    if (['hospital', 'compare', 'driver', 'control', 'simulation'].includes(rawPath)) {
      setActiveTab(rawPath);
    }

    const handlePopState = () => {
      const p = window.location.pathname.replace('/', '').toLowerCase();
      setActiveTab(p || 'landing');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Apply State Update from Server
  const handleStateUpdate = (state) => {
    if (!state) return;
    if (state.signals) setSignals(state.signals);
    if (state.ambulances) setAmbulances(state.ambulances);
    if (state.eventLogs) setEventLogs(state.eventLogs);
    if (state.auditLogs) setAuditLogs(state.auditLogs);
    if (state.publicAlerts) setPublicAlerts(state.publicAlerts);
    if (state.metrics) setMetrics(state.metrics);
    if (state.pitchMode) {
      setPitchState(state.pitchMode);
      // Automatically navigate to designated narrative view during Pitch Mode steps
      if (state.pitchMode.active && state.pitchMode.currentStep?.targetView) {
        navigateTab(state.pitchMode.currentStep.targetView);
      } else if (state.pitchMode.active && activeTab === 'landing') {
        navigateTab('control');
      }
    }
  };

  // Initial Rest Fetch
  useEffect(() => {
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => handleStateUpdate(data))
      .catch((err) => console.log('Init state fetch standby', err));

    fetch('/api/hospitals')
      .then((res) => res.json())
      .then((data) => {
        if (data.hospitals) setHospitals(data.hospitals);
      })
      .catch((err) => console.log('Hospitals fetch standby', err));
  }, []);

  // WebSocket Connection with Auto-reconnect & Polling Fallback
  useEffect(() => {
    let ws;
    let fallbackInterval;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In Vite dev server, proxy handles /ws or connect to direct host:5000
      const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setConnected(true);
          if (fallbackInterval) clearInterval(fallbackInterval);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'INIT_STATE' || msg.type === 'CORRIDOR_UPDATE') {
              handleStateUpdate(msg.payload);
            }
          } catch (e) {
            console.error('Error parsing WS message', e);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // start lightweight polling fallback
          if (!fallbackInterval) {
            fallbackInterval = setInterval(() => {
              fetch('/api/state')
                .then((r) => r.json())
                .then((d) => handleStateUpdate(d))
                .catch(() => {});
            }, 1000);
          }
          // attempt reconnect in 3s
          setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('WebSocket connection failed, using polling fallback', err);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  // Sound Handler
  const toggleSound = () => {
    const isMuted = audioService.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) {
      audioService.playSignalGreenChime();
    }
  };

  // API Actions
  const handleStartMission = async (missionParams) => {
    try {
      audioService.playSirenPing();
      const res = await fetch('/api/ambulance/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missionParams)
      });
      const data = await res.json();
      if (activeTab === 'landing') setActiveTab('control');
    } catch (err) {
      console.error('Failed to start mission', err);
    }
  };

  const handleConflictDemo = async () => {
    try {
      audioService.playAlertAlarm();
      await fetch('/api/ambulance/conflict-demo', { method: 'POST' });
    } catch (err) {
      console.error('Failed to dispatch 2nd ambulance', err);
    }
  };

  const handleTestHijack = async () => {
    try {
      audioService.playAlertAlarm();
      await fetch('/api/security/test-hijack', { method: 'POST' });
    } catch (err) {
      // 401 is expected for hijack test!
      console.log('Hijack test completed and rejected as expected.');
    }
  };

  const handleResetSimulation = async () => {
    try {
      await fetch('/api/ambulance/reset', { method: 'POST' });
    } catch (err) {
      console.error('Failed to reset simulation', err);
    }
  };

  // Sends trauma team readiness acknowledgment to backend over REST & WebSocket
  const handleMarkTeamReady = async (ambulanceId = 'AMB-108-BLR') => {
    try {
      audioService.playSignalGreenChime();
      const res = await fetch('/api/hospital/team-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambulanceId })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to notify team ready', err);
      throw err;
    }
  };

  const handleStartPitch = async () => {
    try {
      audioService.playSirenPing();
      await fetch('/api/pitch/start', { method: 'POST' });
      navigateTab('hospital');
    } catch (err) {
      console.error('Failed to start pitch', err);
    }
  };

  const handleStopPitch = async () => {
    try {
      await fetch('/api/pitch/stop', { method: 'POST' });
    } catch (err) {
      console.error('Failed to stop pitch', err);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTab}
        connected={connected}
        pitchActive={pitchState?.active}
        onStartPitch={handleStartPitch}
        onStopPitch={handleStopPitch}
        soundMuted={soundMuted}
        onToggleSound={toggleSound}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        metrics={metrics}
        activeAmbulancesCount={ambulances.length}
      />

      {/* Floating Public Alert Toast for Nearby Simulated Drivers */}
      <PublicAlertToast
        ambulances={ambulances}
        signals={signals}
        soundMuted={soundMuted}
      />

      <main className="transition-all duration-300">
        {activeTab === 'landing' && (
          <LandingView
            metrics={metrics}
            onLaunchDemo={() => navigateTab('control')}
            onStartPitch={handleStartPitch}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'driver' && (
          <DriverView
            ambulance={ambulances[0]}
            onStartEmergency={handleStartMission}
            signals={signals}
            publicAlerts={publicAlerts}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'hospital' && (
          <HospitalPreAlertView
            ambulances={ambulances}
            hospitals={hospitals}
            onMarkTeamReady={handleMarkTeamReady}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'compare' && (
          <RaceCompareView
            darkMode={darkMode}
          />
        )}

        {activeTab === 'control' && (
          <ControlRoomView
            signals={signals}
            ambulances={ambulances}
            hospitals={hospitals}
            eventLogs={eventLogs}
            auditLogs={auditLogs}
            metrics={metrics}
            publicAlerts={publicAlerts}
            onStartMission={handleStartMission}
            onConflictDemo={handleConflictDemo}
            onResetSimulation={handleResetSimulation}
            onTestHijack={handleTestHijack}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationView
            signals={signals}
            ambulances={ambulances}
            hospitals={hospitals}
            metrics={metrics}
            onStartMission={handleStartMission}
            onResetSimulation={handleResetSimulation}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Floating Pitch Mode Script Overlay */}
      <PitchModeOverlay pitchState={pitchState} onStop={handleStopPitch} />
    </div>
  );
}
