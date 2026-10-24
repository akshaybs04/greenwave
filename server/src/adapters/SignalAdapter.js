// Traffic Signal Controller Adapter Interface & Implementations
// Allows seamless interchange between Simulated Signals, City ITMS (SCATS), or NTCIP 1202 hardware controllers.

export class BaseSignalAdapter {
  constructor(name = 'BaseAdapter') {
    this.name = name;
  }

  async getAllSignals() {
    throw new Error('getAllSignals() must be implemented by adapter');
  }

  async getSignal(signalId) {
    throw new Error('getSignal() must be implemented by adapter');
  }

  async requestGreenCorridor(signalId, ambulanceContext) {
    throw new Error('requestGreenCorridor() must be implemented by adapter');
  }

  async releaseGreenCorridor(signalId, reason) {
    throw new Error('releaseGreenCorridor() must be implemented by adapter');
  }

  async tick(deltaSeconds) {
    // optional periodic update hook
  }
}

/**
 * High-fidelity Simulated Signal Controller.
 * Enforces safe phase clearance:
 * RED -> (YELLOW 3s) -> (ALL-RED 2s) -> GREEN CORRIDOR
 * CORRIDOR GREEN -> (YELLOW 3s) -> NORMAL CYCLE
 */
export class SimulatedSignalAdapter extends BaseSignalAdapter {
  constructor(initialSignals = [], eventLogger = () => {}) {
    super('Simulated ITMS Controller v4.2');
    this.eventLogger = eventLogger;
    this.signals = new Map();

    initialSignals.forEach((sig) => {
      this.signals.set(sig.id, {
        ...sig,
        // State tracking
        state: 'NORMAL_CYCLE', // 'NORMAL_CYCLE', 'PREPARING_CLEARANCE', 'ALL_RED_CLEARANCE', 'EMERGENCY_GREEN', 'RESTORE_YELLOW'
        currentPhase: sig.currentPhase || 'RED',
        transitionCountdown: 0,
        activeAmbulanceId: null,
        activeAmbulancePriority: null,
        overrideStartedAt: null,
        crossTrafficWarning: false,
        totalOverridesHandled: 0
      });
    });
  }

  async getAllSignals() {
    return Array.from(this.signals.values());
  }

  async getSignal(signalId) {
    return this.signals.get(signalId) || null;
  }

  /**
   * Request safe green corridor transition for an approaching emergency vehicle.
   */
  async requestGreenCorridor(signalId, ambulanceContext) {
    const sig = this.signals.get(signalId);
    if (!sig) return { success: false, reason: 'SIGNAL_NOT_FOUND' };

    const { ambulanceId, priority = 'URGENT', callSign = 'AMB-108' } = ambulanceContext;

    // Check if already held for higher priority
    if (sig.state === 'EMERGENCY_GREEN' && sig.activeAmbulanceId !== ambulanceId) {
      const priorityWeights = { CRITICAL: 3, URGENT: 2, STANDARD: 1 };
      const currentWeight = priorityWeights[sig.activeAmbulancePriority] || 1;
      const incomingWeight = priorityWeights[priority] || 1;

      if (incomingWeight <= currentWeight) {
        this.eventLogger({
          type: 'CONFLICT_REJECTED',
          signalId,
          signalName: sig.name,
          message: `Conflict at ${sig.name}: Held for ${sig.activeAmbulanceId} (${sig.activeAmbulancePriority}). Vehicle ${ambulanceId} (${priority}) queued.`,
          level: 'warn'
        });
        return { success: false, status: 'QUEUED_CONFLICT', heldFor: sig.activeAmbulanceId };
      } else {
        this.eventLogger({
          type: 'PRIORITY_PREEMPTION',
          signalId,
          signalName: sig.name,
          message: `Emergency Preemption: Higher priority ${priority} (${callSign}) preempted ${sig.activeAmbulancePriority}`,
          level: 'critical'
        });
      }
    }

    // If already emergency green for this ambulance
    if (sig.state === 'EMERGENCY_GREEN' && sig.activeAmbulanceId === ambulanceId) {
      return { success: true, phase: 'GREEN', state: 'EMERGENCY_GREEN' };
    }

    // Begin Safe Transition Sequence:
    // If currently RED, we must alert cross traffic with YELLOW (3s) -> ALL-RED (2s) -> GREEN
    sig.activeAmbulanceId = ambulanceId;
    sig.activeAmbulancePriority = priority;
    sig.emergencyHold = true;

    if (sig.currentPhase === 'GREEN') {
      // Already green in our corridor direction, hold it indefinitely!
      sig.state = 'EMERGENCY_GREEN';
      sig.transitionCountdown = 0;
      sig.crossTrafficWarning = true;
      sig.overrideStartedAt = Date.now();
      sig.totalOverridesHandled += 1;

      this.eventLogger({
        type: 'CORRIDOR_HOLD_ACTIVE',
        signalId,
        signalName: sig.name,
        message: `Signal ${sig.name} holds GREEN for ${callSign} (${priority}). Cross-traffic halted.`,
        level: 'success'
      });
      return { success: true, phase: 'GREEN', state: 'EMERGENCY_GREEN' };
    }

    // Initiate Yellow Clearance
    sig.state = 'PREPARING_CLEARANCE';
    sig.currentPhase = 'YELLOW';
    sig.transitionCountdown = 3; // 3 seconds yellow
    sig.crossTrafficWarning = true;

    this.eventLogger({
      type: 'TRANSITION_INITIATED',
      signalId,
      signalName: sig.name,
      message: `Safe clearance initiated at ${sig.name}. Yellow phase (3s) for pedestrian/cross vehicle safety.`,
      level: 'info'
    });

    return { success: true, phase: 'YELLOW', state: 'PREPARING_CLEARANCE' };
  }

  /**
   * Safe restoration when ambulance passes intersection
   */
  async releaseGreenCorridor(signalId, reason = 'AMBULANCE_PASSED') {
    const sig = this.signals.get(signalId);
    if (!sig) return { success: false };

    if (!sig.emergencyHold && sig.state === 'NORMAL_CYCLE') {
      return { success: true, state: 'NORMAL_CYCLE' };
    }

    // Step into Restore Yellow (3s) before normal cycling
    sig.state = 'RESTORE_YELLOW';
    sig.currentPhase = 'YELLOW';
    sig.transitionCountdown = 3;
    sig.emergencyHold = false;
    sig.activeAmbulanceId = null;
    sig.activeAmbulancePriority = null;
    sig.crossTrafficWarning = false;

    this.eventLogger({
      type: 'AUTO_RESTORE_INITIATED',
      signalId,
      signalName: sig.name,
      message: `${reason}: ${sig.name} initiating smooth recovery phase. Returning to ITMS cycle.`,
      level: 'info'
    });

    return { success: true, state: 'RESTORE_YELLOW' };
  }

  /**
   * Advance controller state machine by delta seconds (default 1s per tick)
   */
  tick(deltaSeconds = 1) {
    const updates = [];

    for (const [id, sig] of this.signals.entries()) {
      let stateChanged = false;

      if (sig.state === 'PREPARING_CLEARANCE') {
        sig.transitionCountdown -= deltaSeconds;
        if (sig.transitionCountdown <= 0) {
          // Yellow finished -> All-Red Clearance
          sig.state = 'ALL_RED_CLEARANCE';
          sig.currentPhase = 'ALL_RED';
          sig.transitionCountdown = 2; // 2 seconds all-red
          stateChanged = true;
          this.eventLogger({
            type: 'ALL_RED_CLEARANCE',
            signalId: id,
            signalName: sig.name,
            message: `${sig.name} entering ALL-RED safety clearance (2s). Junction clearing.`,
            level: 'warn'
          });
        }
      } else if (sig.state === 'ALL_RED_CLEARANCE') {
        sig.transitionCountdown -= deltaSeconds;
        if (sig.transitionCountdown <= 0) {
          // All-red finished -> Emergency Corridor Green!
          sig.state = 'EMERGENCY_GREEN';
          sig.currentPhase = 'GREEN';
          sig.transitionCountdown = 0;
          sig.overrideStartedAt = Date.now();
          sig.totalOverridesHandled += 1;
          stateChanged = true;
          this.eventLogger({
            type: 'CORRIDOR_GREEN_LOCKED',
            signalId: id,
            signalName: sig.name,
            message: `CORRIDOR GREEN LOCKED: ${sig.name} is now GREEN for approaching emergency vehicle.`,
            level: 'success'
          });
        }
      } else if (sig.state === 'RESTORE_YELLOW') {
        sig.transitionCountdown -= deltaSeconds;
        if (sig.transitionCountdown <= 0) {
          // Restore yellow finished -> Resume Normal Red/Cycle
          sig.state = 'NORMAL_CYCLE';
          sig.currentPhase = 'RED';
          sig.currentCycleRemaining = sig.normalCycleSec;
          stateChanged = true;
          this.eventLogger({
            type: 'NORMAL_CYCLE_RESUMED',
            signalId: id,
            signalName: sig.name,
            message: `${sig.name} successfully restored to regular ITMS cycle.`,
            level: 'info'
          });
        }
      } else if (sig.state === 'NORMAL_CYCLE') {
        // Normal cycle ticking
        sig.currentCycleRemaining -= deltaSeconds;
        if (sig.currentCycleRemaining <= 0) {
          // Toggle regular red/green for background realism
          sig.currentPhase = sig.currentPhase === 'RED' ? 'GREEN' : 'RED';
          sig.currentCycleRemaining = sig.currentPhase === 'RED' ? sig.normalCycleSec : 25;
          stateChanged = true;
        }
      }

      if (stateChanged) {
        updates.push({ ...sig });
      }
    }

    return updates;
  }
}

/**
 * Example Municipal ITMS / NTCIP 1202 Signal Adapter
 * Demonstrates how real city controllers connect over standard protocols
 */
export class RealWorldNtcipSignalAdapter extends BaseSignalAdapter {
  constructor(endpointUrl, apiKey) {
    super('Municipal ITMS NTCIP Adapter');
    this.endpointUrl = endpointUrl;
    this.apiKey = apiKey;
  }

  async requestGreenCorridor(signalId, ambulanceContext) {
    // In production deployment:
    // return fetch(`${this.endpointUrl}/v1/signals/${signalId}/preemption`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ priority: ambulanceContext.priority, vehicleId: ambulanceContext.ambulanceId })
    // });
    return { success: true, note: 'Adapter interface ready for city ITMS integration' };
  }
}
