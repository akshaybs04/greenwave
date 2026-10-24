import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'greenwave-hackathon-secure-ed25519-secret-key-2026';

export class AuthService {
  constructor(auditLogger = () => {}) {
    this.auditLogger = auditLogger;
    this.auditLogs = [];
    this.verifiedVehicles = new Set(['AMB-108-BLR', 'AMB-102-BLR', 'AMB-911-BLR', 'MEDIC-CAR-01']);
  }

  /**
   * Generates a signed cryptographic emergency token for authorized vehicles
   */
  generateEmergencyToken(ambulanceDetails) {
    const { id, callSign, priority = 'URGENT', driverName = 'Driver Unit 12' } = ambulanceDetails;

    const payload = {
      ambulanceId: id,
      callSign,
      priority,
      driverName,
      issuedAt: Date.now(),
      authorizedJurisdiction: 'BBMP_BENGALURU_TRAFFIC_POLICE',
      role: 'EMERGENCY_FIRST_RESPONDER'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    this.logAudit({
      event: 'TOKEN_ISSUED',
      vehicleId: id,
      callSign,
      status: 'AUTHORIZED',
      details: `JWT signed with BBMP authorization key for ${callSign} (${priority})`
    });

    return token;
  }

  /**
   * Cryptographically verifies incoming signal override request
   */
  verifyEmergencyRequest(token, requestedSignalId, ambulanceId) {
    if (!token) {
      const entry = this.logAudit({
        event: 'OVERRIDE_REJECTED',
        vehicleId: ambulanceId || 'UNKNOWN_DEVICE',
        signalId: requestedSignalId,
        status: 'DENIED_401',
        reason: 'MISSING_AUTHORIZATION_TOKEN',
        details: 'Unauthorized attempt to preempt municipal signal without credentials'
      });
      return { verified: false, error: 'MISSING_TOKEN', auditEntry: entry };
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Verify registration
      if (!this.verifiedVehicles.has(decoded.callSign)) {
        const entry = this.logAudit({
          event: 'OVERRIDE_REJECTED',
          vehicleId: decoded.ambulanceId,
          callSign: decoded.callSign,
          signalId: requestedSignalId,
          status: 'DENIED_403',
          reason: 'UNREGISTERED_VEHICLE_FLEET',
          details: `Vehicle ${decoded.callSign} signature valid but vehicle is revoked or not in emergency registry`
        });
        return { verified: false, error: 'UNREGISTERED_FLEET', auditEntry: entry };
      }

      const entry = this.logAudit({
        event: 'OVERRIDE_VERIFIED',
        vehicleId: decoded.ambulanceId,
        callSign: decoded.callSign,
        signalId: requestedSignalId,
        status: 'VERIFIED_OK',
        priority: decoded.priority,
        details: `Cryptographically verified by Traffic ITMS Gateway. Authorized by ${decoded.authorizedJurisdiction}`
      });

      return { verified: true, decoded, auditEntry: entry };
    } catch (err) {
      const entry = this.logAudit({
        event: 'OVERRIDE_REJECTED',
        vehicleId: ambulanceId || 'TAMPERED_DEVICE',
        signalId: requestedSignalId,
        status: 'DENIED_401',
        reason: 'INVALID_SIGNATURE_OR_EXPIRED',
        details: `Potential signal hijack attempt: ${err.message}`
      });
      return { verified: false, error: 'INVALID_SIGNATURE', auditEntry: entry };
    }
  }

  logAudit(entry) {
    const fullEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(fullEntry);
    if (this.auditLogs.length > 100) this.auditLogs.pop(); // keep last 100
    this.auditLogger(fullEntry);
    return fullEntry;
  }

  getAuditLogs() {
    return this.auditLogs;
  }
}
