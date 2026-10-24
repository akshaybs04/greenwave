import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { SIGNALS, HOSPITALS, PRESET_ROUTES } from './data/bengaluruData.js';
import { SimulatedSignalAdapter } from './adapters/SignalAdapter.js';
import { AuthService } from './security/AuthService.js';
import { TinyFishAgentService } from './agents/TinyFishAgent.js';
import { CorridorEngine } from './engine/CorridorEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket clients pool
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send initial full state immediately
  engine.getFullState().then((state) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'INIT_STATE', payload: state }));
    }
  });

  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

// Broadcast helper
function broadcastState(state) {
  const payload = JSON.stringify({ type: 'CORRIDOR_UPDATE', payload: state });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Instantiate Architecture Modules
const authService = new AuthService((entry) => {
  // console.log(`[AUTH AUDIT] ${entry.event}: ${entry.status}`);
});

const signalAdapter = new SimulatedSignalAdapter(SIGNALS, (log) => {
  if (engine) engine.logEvent(log);
});

const tinyFishAgent = new TinyFishAgentService();

const engine = new CorridorEngine(signalAdapter, authService, tinyFishAgent, broadcastState);

// REST API Endpoints

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'GreenWave Municipal Corridor Gateway',
    city: 'Bengaluru (ITMS-BTP)',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/signals', async (req, res) => {
  const signals = await signalAdapter.getAllSignals();
  res.json(signals);
});

app.get('/api/hospitals', async (req, res) => {
  const { emergencyType = 'CARDIAC_ARREST', lat, lng } = req.query;
  const userLoc = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : { lat: 12.9228, lng: 77.6212 };
  const result = await tinyFishAgent.scanHospitalEmergencyStatus(emergencyType, userLoc);
  res.json(result);
});

app.get('/api/routes', (req, res) => {
  res.json(PRESET_ROUTES);
});

app.get('/api/traffic-alerts', async (req, res) => {
  const alerts = await tinyFishAgent.fetchLiveTrafficAlerts();
  res.json(alerts);
});

app.get('/api/state', async (req, res) => {
  const state = await engine.getFullState();
  res.json(state);
});

app.post('/api/ambulance/start', (req, res) => {
  const ambulance = engine.startEmergencyMission(req.body || {});
  res.json({ success: true, ambulance });
});

app.post('/api/ambulance/conflict-demo', (req, res) => {
  const secondAmb = engine.addConflictingAmbulance();
  res.json({ success: true, message: 'Secondary ambulance dispatched for conflict demo', ambulance: secondAmb });
});

app.post('/api/ambulance/reset', (req, res) => {
  engine.resetSimulation();
  res.json({ success: true, message: 'Simulation reset to default cycle' });
});

// Endpoint for hospital ER staff to acknowledge pre-alert and mark trauma bay ready
app.post('/api/hospital/team-ready', (req, res) => {
  const { ambulanceId = 'AMB-108-BLR' } = req.body || {};
  const result = engine.markTraumaTeamReady(ambulanceId);
  res.json(result);
});

app.post('/api/security/test-hijack', (req, res) => {
  const result = engine.simulateFakeHijackAttempt();
  res.status(401).json({
    success: false,
    message: 'Tamper Alarm: Unauthorized signal override rejected cryptographically.',
    result
  });
});

app.post('/api/pitch/start', (req, res) => {
  engine.startPitchMode();
  res.json({ success: true, message: '60-second Pitch Mode narrative started' });
});

app.post('/api/pitch/stop', (req, res) => {
  engine.stopPitchMode();
  res.json({ success: true, message: 'Pitch Mode stopped' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`GreenWave backend server listening on http://localhost:${PORT}`);
  console.log(`WebSocket server initialized on ws://localhost:${PORT}`);
});
