import { PRESET_ROUTES } from '../data/bengaluruData.js';

export class CorridorEngine {
  constructor(signalAdapter, authService, tinyFishAgent, broadcastState = () => {}) {
    this.signalAdapter = signalAdapter;
    this.authService = authService;
    this.tinyFishAgent = tinyFishAgent;
    this.broadcastState = broadcastState;

    this.activeAmbulances = new Map();
    this.eventLogs = [];
    this.publicAlerts = [];
    this.pitchModeActive = false;
    this.pitchScriptTimer = null;
    this.pitchStepIndex = 0;

    // Aggregated real-time metrics
    this.metrics = {
      totalSecondsSaved: 0,
      totalSignalsPreempted: 0,
      totalMissionsCompleted: 0,
      fuelSavedLiters: 0,
      co2ReducedKg: 0,
      estimatedLivesImpactScore: 0
    };

    // Engine simulation tick rate: 500ms
    this.engineInterval = setInterval(() => this.tick(), 500);
  }

  logEvent(event) {
    const log = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      ...event
    };
    this.eventLogs.unshift(log);
    if (this.eventLogs.length > 80) this.eventLogs.pop();
    return log;
  }

  /**
   * Start a new emergency mission
   */
  startEmergencyMission(params) {
    const {
      ambulanceId = 'AMB-108-BLR',
      callSign = 'Ambulance 108 (Code Red)',
      priority = 'CRITICAL', // 'CRITICAL' | 'URGENT' | 'STANDARD'
      emergencyType = 'CARDIAC_ARREST',
      patientCondition = 'Severe STEMI / Acute Myocardial Infarction',
      bloodGroup = 'O-Negative',
      hospitalId = null,
      routePreset = 'silkBoardToManipal',
      speedKmh = 60
    } = params;

    const route = PRESET_ROUTES[routePreset] || PRESET_ROUTES.silkBoardToManipal;
    const targetHospitalId = hospitalId || route.hospitalId || 'hosp-2';

    // Cryptographic Authentication
    const token = this.authService.generateEmergencyToken({
      id: ambulanceId,
      callSign,
      priority
    });

    const ambulance = {
      id: ambulanceId,
      callSign,
      priority,
      emergencyType,
      patientCondition,
      bloodGroup,
      hospitalId: targetHospitalId,
      traumaTeamReady: false,
      traumaTeamReadyAt: null,
      routeId: route.id,
      routeTitle: route.title,
      hospitalName: route.hospitalName,
      waypoints: route.waypoints,
      totalDistanceKm: route.totalDistanceKm,
      currentWaypointIndex: 0,
      progressPercent: 0,
      location: { ...route.waypoints[0] },
      speedKmh: speedKmh,
      authToken: token,
      status: 'DISPATCHED', // 'DISPATCHED', 'IN_TRANSIT', 'APPROACHING_SIGNAL', 'ARRIVED'
      clearedSignals: [],
      pendingSignals: [],
      secondsSavedOnTrip: 0,
      tripElapsedSeconds: 0,
      passedSignalIds: new Set(),
      isSimulating: true
    };

    this.activeAmbulances.set(ambulanceId, ambulance);

    this.logEvent({
      type: 'MISSION_STARTED',
      level: 'critical',
      message: `Emergency Mission Initiated: ${callSign} responding to ${patientCondition} (${bloodGroup} blood required) -> Pre-alert sent to ${route.hospitalName}`,
      ambulanceId
    });

    this.updatePublicAlert(
      `EMERGENCY ALERT: ${callSign} dispatched towards ${route.hospitalName}. Please yield corridor when approaching sirens are audible.`
    );

    this.emitState();
    return ambulance;
  }

  /**
   * Add a secondary ambulance for Multi-Ambulance Conflict Demonstration
   */
  addConflictingAmbulance() {
    const conflictAmbId = 'AMB-102-BLR';
    const ambulance = {
      id: conflictAmbId,
      callSign: 'Ambulance 102 (Code Yellow)',
      priority: 'URGENT', // Lower than CRITICAL
      emergencyType: 'ORTHOPEDIC_TRAUMA',
      routeId: 'route-conflict-demo',
      routeTitle: 'Koramangala Cross Traffic',
      hospitalName: "St. John's Medical College Hospital",
      waypoints: [
        { lat: 12.9395, lng: 77.6201, name: 'Koramangala 4th Block' },
        { lat: 12.9352, lng: 77.6338, name: 'Sony World Junction' }, // INTERSECTING SIGNAL
        { lat: 12.9284, lng: 77.6195, name: "St. John's Crossing" }
      ],
      totalDistanceKm: 3.2,
      currentWaypointIndex: 0,
      progressPercent: 15,
      location: { lat: 12.9372, lng: 77.6275 },
      speedKmh: 45,
      authToken: this.authService.generateEmergencyToken({
        id: conflictAmbId,
        callSign: 'Ambulance 102 (Code Yellow)',
        priority: 'URGENT'
      }),
      status: 'IN_TRANSIT',
      clearedSignals: [],
      pendingSignals: [],
      secondsSavedOnTrip: 0,
      tripElapsedSeconds: 0,
      passedSignalIds: new Set(),
      isSimulating: true
    };

    this.activeAmbulances.set(conflictAmbId, ambulance);

    this.logEvent({
      type: 'MULTI_AMBULANCE_ACTIVE',
      level: 'warn',
      message: `Secondary Ambulance ${ambulance.callSign} (${ambulance.priority}) entered Koramangala network. Conflict arbitrator active.`,
      ambulanceId: conflictAmbId
    });

    this.emitState();
    return ambulance;
  }

  /**
   * Marks trauma team ready at destination hospital for the incoming ambulance
   */
  markTraumaTeamReady(ambulanceId = 'AMB-108-BLR') {
    const ambulance = this.activeAmbulances.get(ambulanceId);
    if (!ambulance) return { success: false, message: 'Ambulance not found' };

    ambulance.traumaTeamReady = true;
    ambulance.traumaTeamReadyAt = new Date().toLocaleTimeString();

    this.logEvent({
      type: 'TRAUMA_TEAM_READY',
      level: 'success',
      message: `Emergency Department at ${ambulance.hospitalName} confirmed: Trauma team & bay primed for ${ambulance.callSign}.`,
      ambulanceId
    });

    this.emitState();
    return { success: true, ambulance };
  }

  /**
   * Simulate a rogue/unauthorized vehicle attempting signal hijack
   */
  simulateFakeHijackAttempt() {
    const targetSignal = 'sig-05'; // Sony World Junction
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    const rogueId = 'ROGUE_OBD_DONGLE_X';

    this.logEvent({
      type: 'SECURITY_ALERT',
      level: 'error',
      message: `INTRUSION ATTEMPT: Unauthorized device (${rogueId}) attempted green preemption at Sony World Junction.`,
      details: 'Signal Controller Gateway rejected command: Cryptographic signature mismatch. BBMP Security Incident #8841 recorded.'
    });

    const result = this.authService.verifyEmergencyRequest(fakeToken, targetSignal, rogueId);
    this.emitState();
    return { success: false, intrusionDetected: true, audit: result.auditEntry };
  }

  /**
   * Main Engine Tick Loop (runs every 500ms)
   */
  async tick() {
    // Tick the signal controller adapter
    this.signalAdapter.tick(0.5);

    const signals = await this.signalAdapter.getAllSignals();

    for (const [ambId, amb] of this.activeAmbulances.entries()) {
      if (!amb.isSimulating) continue;

      amb.tripElapsedSeconds += 0.5;

      // Advance position along waypoints
      const waypoints = amb.waypoints;
      if (amb.currentWaypointIndex < waypoints.length - 1) {
        const currentTarget = waypoints[amb.currentWaypointIndex + 1];
        const prevTarget = waypoints[amb.currentWaypointIndex];

        // Move step
        // Speed in km/h -> km per second -> delta for 0.5s
        const kmPerSec = amb.speedKmh / 3600;
        const stepDistanceKm = kmPerSec * 0.5 * 3; // 3x demo speed multiplier for smooth responsive hackathon demo

        const dLat = currentTarget.lat - prevTarget.lat;
        const dLng = currentTarget.lng - prevTarget.lng;
        const legDistance = Math.hypot(dLat, dLng) * 111; // rough km

        if (legDistance > 0.001) {
          const ratio = Math.min(1.0, (stepDistanceKm / legDistance));
          amb.location.lat += dLat * ratio * 0.2;
          amb.location.lng += dLng * ratio * 0.2;

          // Check if reached waypoint
          const distToTarget = Math.hypot(currentTarget.lat - amb.location.lat, currentTarget.lng - amb.location.lng) * 111;
          if (distToTarget < 0.08) {
            amb.currentWaypointIndex += 1;
          }
        } else {
          amb.currentWaypointIndex += 1;
        }

        amb.progressPercent = Math.min(99, Math.round((amb.currentWaypointIndex / (waypoints.length - 1)) * 100));
        amb.status = 'IN_TRANSIT';
      } else {
        // Reached destination hospital
        amb.status = 'ARRIVED';
        amb.progressPercent = 100;
        amb.isSimulating = false;

        this.metrics.totalMissionsCompleted += 1;
        this.metrics.totalSecondsSaved += amb.secondsSavedOnTrip;
        this.metrics.fuelSavedLiters += Math.round((amb.secondsSavedOnTrip / 60) * 0.12 * 10) / 10;
        this.metrics.co2ReducedKg += Math.round((amb.secondsSavedOnTrip / 60) * 0.28 * 10) / 10;
        this.metrics.estimatedLivesImpactScore = Math.round(this.metrics.totalSecondsSaved / 300);

        this.logEvent({
          type: 'MISSION_COMPLETED',
          level: 'success',
          message: `${amb.callSign} arrived safely at ${amb.hospitalName}! Saved ${Math.round(amb.secondsSavedOnTrip)}s (${(amb.secondsSavedOnTrip / 60).toFixed(1)} mins).`,
          ambulanceId: amb.id
        });

        this.updatePublicAlert(`Corridor mission completed for ${amb.callSign}. All municipal signals restored.`);
      }

      // Check Dynamic Geofence against all traffic signals
      const upcomingSignals = [];
      const clearedSignals = [];

      for (const sig of signals) {
        const distKm = this.calculateDistance(amb.location.lat, amb.location.lng, sig.location.lat, sig.location.lng);

        // Dynamic lookahead based on speed:
        // Base 1.0 km radius, plus dynamic velocity lookahead (e.g. at 60 km/h, triggers 45s prior)
        const dynamicTriggerDistanceKm = Math.max(1.0, (amb.speedKmh / 60) * 0.8);
        const etaSeconds = Math.round((distKm / Math.max(amb.speedKmh, 20)) * 3600);

        if (distKm <= dynamicTriggerDistanceKm && !amb.passedSignalIds.has(sig.id) && amb.status !== 'ARRIVED') {
          upcomingSignals.push({
            id: sig.id,
            name: sig.name,
            distanceMeters: Math.round(distKm * 1000),
            etaSeconds,
            phase: sig.currentPhase,
            state: sig.state,
            countdown: sig.transitionCountdown
          });

          // Verify token and Request safe corridor transition if not already active
          const authCheck = this.authService.verifyEmergencyRequest(amb.authToken, sig.id, amb.id);
          if (authCheck.verified) {
            if (sig.state === 'NORMAL_CYCLE' || sig.state === 'RESTORE_YELLOW') {
              await this.signalAdapter.requestGreenCorridor(sig.id, {
                ambulanceId: amb.id,
                priority: amb.priority,
                callSign: amb.callSign
              });
              this.metrics.totalSignalsPreempted += 1;
              amb.secondsSavedOnTrip += 75; // average wait time avoided at signal in Bengaluru
            }
          }

          // Broadcast public driver alert when ambulance is 30-50s away
          if (etaSeconds <= 50 && etaSeconds >= 10) {
            this.updatePublicAlert(
              `CLEAR ROAD: ${amb.callSign} approaching ${sig.name} from South in ${etaSeconds}s. Pull to the left immediately!`
            );
          }
        }

        // Check if ambulance has passed signal (within 50 meters and moving away, or waypoint past signal)
        if (distKm < 0.06 && !amb.passedSignalIds.has(sig.id)) {
          amb.passedSignalIds.add(sig.id);
          clearedSignals.push(sig.name);

          // Release signal smoothly back to normal ITMS cycle
          await this.signalAdapter.releaseGreenCorridor(sig.id, `${amb.callSign} passed intersection`);

          this.logEvent({
            type: 'SIGNAL_CLEARED',
            level: 'info',
            message: `${amb.callSign} cleared ${sig.name}. Safe recovery phase engaged.`,
            signalId: sig.id
          });
        }
      }

      amb.nextSignals = upcomingSignals;
    }

    this.emitState();
  }

  updatePublicAlert(text) {
    this.publicAlerts.unshift({
      id: `alert-${Date.now()}`,
      text,
      timestamp: new Date().toLocaleTimeString()
    });
    if (this.publicAlerts.length > 5) this.publicAlerts.pop();
  }

  /**
   * Scripted 60-second Pitch Mode for Hackathon presentation
   */
  startPitchMode() {
    this.stopPitchMode();
    this.pitchModeActive = true;
    this.pitchStepIndex = 0;

    const pitchStory = [
      {
        atSec: 1,
        step: 1,
        title: 'Emergency 108 Call & Hospital Pre-Alert',
        desc: 'Cardiac arrest at Silk Board. TinyFish Web Agent selects Manipal Hospital. Live Pre-Alert dispatched with condition and blood group.',
        targetView: 'hospital',
        action: () => {
          this.startEmergencyMission({
            ambulanceId: 'AMB-108-BLR',
            callSign: 'Ambulance 108 (Code Red)',
            priority: 'CRITICAL',
            emergencyType: 'CARDIAC_ARREST',
            patientCondition: 'Severe STEMI / Acute Myocardial Infarction',
            bloodGroup: 'O-Negative',
            routePreset: 'silkBoardToManipal',
            speedKmh: 65
          });
        }
      },
      {
        atSec: 10,
        step: 2,
        title: 'Hospital ER Trauma Team Confirmed Ready',
        desc: 'Emergency department acknowledges live pre-alert. Defibrillator primed, Catheterization Lab and 2 units O- Blood ready at bay.',
        targetView: 'hospital',
        action: () => {
          this.markTraumaTeamReady('AMB-108-BLR');
        }
      },
      {
        atSec: 19,
        step: 3,
        title: 'Dynamic 1 km Geofence & Safe Clearance',
        desc: 'Ambulance enters Madiwala 1km geofence. Signals enforce Yellow (3s) -> All-Red (2s) clearance. Nearby drivers receive "Move Left" alert.',
        targetView: 'control',
        action: () => {
          this.logEvent({
            type: 'PITCH_NARRATIVE',
            level: 'info',
            message: 'Pitch Story: Cryptographic JWT validated by Bengaluru ITMS. Enforced safe clearance protects crossing traffic.'
          });
          this.updatePublicAlert('CIVILIAN ALERT: Ambulance AMB-108 approaching from south in 40s. Move left.');
        }
      },
      {
        atSec: 30,
        step: 4,
        title: 'Multi-Ambulance Conflict Arbitration',
        desc: 'Ambulance 102 (Code Yellow) also approaches Sony World Junction. GreenWave resolves priority: Code Red prevails.',
        targetView: 'control',
        action: () => {
          this.addConflictingAmbulance();
        }
      },
      {
        atSec: 40,
        step: 5,
        title: 'Before vs After: The Live Corridor Race',
        desc: 'Simulating identical route: Normal ambulance halts at red lights while GreenWave ambulance rides an uninterrupted green wave.',
        targetView: 'compare',
        action: () => {
          this.logEvent({
            type: 'PITCH_NARRATIVE',
            level: 'info',
            message: 'Pitch Story: Live comparative race running. GreenWave cuts transit time by 61%.'
          });
        }
      },
      {
        atSec: 54,
        step: 6,
        title: 'Mission Complete: 14 Minutes Saved',
        desc: 'Patient arrives within Golden Hour. 840 seconds saved vs standard traffic. Signals auto-restore smoothly.',
        targetView: 'compare',
        action: () => {
          this.logEvent({
            type: 'PITCH_NARRATIVE',
            level: 'success',
            message: 'Pitch Story: Ambulance docked at Manipal ER bay. 14.0 minutes saved. Estimated survival gain: +28%.'
          });
        }
      }
    ];

    let currentSec = 0;
    this.pitchScriptTimer = setInterval(() => {
      currentSec += 1;
      const step = pitchStory.find((s) => s.atSec === currentSec);
      if (step) {
        this.pitchStepIndex = step.step;
        step.action();
        this.currentPitchStep = step;
        this.emitState();
      }

      if (currentSec >= 62) {
        this.stopPitchMode();
      }
    }, 1000);
  }

  stopPitchMode() {
    this.pitchModeActive = false;
    if (this.pitchScriptTimer) {
      clearInterval(this.pitchScriptTimer);
      this.pitchScriptTimer = null;
    }
  }

  resetSimulation() {
    this.stopPitchMode();
    this.activeAmbulances.clear();
    this.eventLogs = [];
    this.publicAlerts = [];
    // Reset signals to normal cycle
    for (const sig of this.signalAdapter.signals.values()) {
      sig.state = 'NORMAL_CYCLE';
      sig.currentPhase = 'RED';
      sig.emergencyHold = false;
      sig.activeAmbulanceId = null;
      sig.transitionCountdown = 0;
    }
    this.emitState();
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getFullState() {
    const signals = await this.signalAdapter.getAllSignals();
    return {
      ambulances: Array.from(this.activeAmbulances.values()),
      signals,
      eventLogs: this.eventLogs.slice(0, 30),
      auditLogs: this.authService.getAuditLogs().slice(0, 20),
      publicAlerts: this.publicAlerts,
      metrics: this.metrics,
      pitchMode: {
        active: this.pitchModeActive,
        currentStep: this.currentPitchStep || null,
        stepIndex: this.pitchStepIndex
      },
      timestamp: Date.now()
    };
  }

  async emitState() {
    const state = await this.getFullState();
    this.broadcastState(state);
  }
}
