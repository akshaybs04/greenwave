# 🚑 GreenWave: Autonomous Emergency Vehicle Green-Corridor AI System

> **College Hackathon Project | Built with TinyFish Web Agents, React + Vite, Tailwind CSS, Leaflet & Node.js/WebSocket**  
> *Preempting urban traffic gridlock in Bengaluru to preserve the critical Golden Hour for emergency patients.*

---

## 🌟 Executive Summary

When an ambulance transporting a patient in critical distress is delayed by traffic signals, minutes lost turn into lives lost. In congested metropolitan cities like **Bengaluru, India**, ambulances encounter an average transit delay of **35 to 50 minutes**, with ambulances stopping at red signals every 400 to 800 meters.

**GreenWave** dynamically establishes an autonomous **Green Corridor**. When an authenticated ambulance with an active emergency approaches within a **1 km dynamic geofence**, the system preempts upcoming traffic signals sequentially—initiating a safe clearance transition (**Yellow → All-Red Safety Pause → Corridor Green**) before the vehicle arrives. Once the ambulance crosses the intersection, signals smoothly auto-restore to the city's standard ITMS cycle.

---

## 🏗️ System Architecture (Mermaid)

```mermaid
flowchart TD
    subgraph TinyFish["🤖 TinyFish Autonomous Web Agents"]
        TF1["🏥 Hospital Portal ER Telemetry Scraper"] --> TFE["Smart Hospital Recommendation Engine"]
        TF2["🚧 BTP Traffic Advisories & Road Closure Monitor"] --> TFE
        TFE --> |Ranked Hospitals & Route Alerts| Core
    end

    subgraph Security["🔐 Municipal Security & Auth Layer"]
        AUTH["JWT Emergency Dispatch Token Signer"]
        TAMPER["Rogue Preemption & Spoofing Detector"]
        AUDIT["Immutable ITMS Audit Log"]
    end

    subgraph Core["⚡ GreenWave Corridor Engine"]
        GEO["Dynamic Velocity-Adjusted 1km Geofence"]
        ARBITRATION["Multi-Ambulance Priority Arbitrator<br/>(Critical > Urgent > Standard)"]
        WAVE["Sequential Green Wave Phase Coordinator"]
    end

    subgraph Signals["🚦 Municipal Signal Controller Adapter"]
        ADAPTER["SignalAdapter (Interface)"]
        SIM["Simulated ITMS Adapter v4.2<br/>(Safe 3s Yellow + 2s All-Red Clearance)"]
        NTCIP["Municipal NTCIP 1202 / SCATS Adapter<br/>(Hardware Plug-in Ready)"]
        ADAPTER --> SIM
        ADAPTER -.-> NTCIP
    end

    subgraph Frontend["💻 Real-Time Command & Driver Interface"]
        LANDING["Landing Page (Seconds Saved Counter)"]
        DRIVER["Ambulance Driver View (SpeechSynthesis Vocal Alerts)"]
        HOSPITAL["Hospital ER Pre-Alert (/hospital - Patient Condition & Blood Group)"]
        COMPARE["Before vs After Race (/compare - Dual Map Benchmark)"]
        DASH["Traffic Control Room (Leaflet Map + Live Telemetry)"]
        SIM_PAGE["Simulation Sandbox & Phase Breakdown"]
        PITCH["60-Second Auto-Narrated Pitch Mode"]
    end

    Core --> Security
    Core --> Signals
    Core <--> |WebSocket (ws://localhost:5000)| Frontend
```

---

## 🚀 Key Features

1. **Dynamic Geofencing & Velocity Lookahead**:
   - Computes dynamic lookahead threshold based on ambulance speed: $\text{Trigger Distance} = \max(1.0\text{ km}, v \times t_{\text{lookahead}})$.
   - Fast ambulances trigger signals earlier, guaranteeing that cross-traffic queue dissipation completes prior to emergency vehicle arrival.

2. **Sequential Green Wave (No City-Wide Disruptions)**:
   - Signals along the route open sequentially as the ambulance advances—rather than switching all lights green simultaneously, which would cause gridlock on perpendicular arterial roads.

3. **Safe Signal Clearance Phase Protocol**:
   - Zero abrupt Red $\rightarrow$ Green flips.
   - Enforces **Yellow clearance (3 seconds)** $\rightarrow$ **All-Red clearance (2 seconds)** to safely purge crossing vehicles and protect pedestrians before locking the green wave.

4. **Multi-Ambulance Priority Conflict Arbitration**:
   - When two emergency vehicles approach the same junction, GreenWave resolves the conflict by clinical priority:
     - **CRITICAL (Code Red)**: Cardiac Arrest / Severe Polytrauma (Weight 100)
     - **URGENT (Code Yellow)**: Acute Stroke / Compound Fracture (Weight 50)
     - **STANDARD (Code Green)**: Stable Inter-Facility Transfer (Weight 20)
   - Code Red preempts Code Yellow; the held ambulance receives a live ETA queue countdown.

5. **TinyFish Autonomous Web Agents**:
   - Scrapes public Karnataka State Health Department bed availability rosters and hospital ER telemetry.
   - Recommends the **clinically optimal hospital**, factoring in ICU bed readiness, trauma level, and specialization (e.g. cardiac catheterization lab availability) instead of simply picking the nearest building.
   - Crawls Bengaluru Traffic Police (BTP) road alerts and re-routes corridors around active water pipe excavations or metro construction bottlenecks.

6. **Cryptographic Security Layer**:
   - All signal preemption signals require signed cryptographic JWTs from municipal dispatch.
   - Built-in **"Test Unauthorized Hijack"** demonstration verifies instant 401 rejection and tamper logging when an unregistered device attempts to override city signals.

7. **Hospital Pre-Alert System (`/hospital`)**:
   - Live Emergency Department triage card showing real-time ETA countdown, clinical priority, patient condition diagnosis, blood group required (e.g. O-Negative Universal Donor), and an interactive **"Confirm Team Ready"** button updating instant dispatch readiness across the city via WebSocket.

8. **Before vs After Race Benchmark (`/compare`)**:
   - Dual synchronized Leaflet maps running the same route (Silk Board → Manipal Hospital).
   - Left: Standard Trip where the ambulance is repeatedly halted by red signal cycles (23 minutes).
   - Right: GreenWave where signals turn green sequentially ahead of the vehicle (9 minutes).
   - Live side-by-side timers and transparent simulation estimate label.

9. **V2X Public Proximity Driver Alert & Voice Guidance**:
   - Popup alert triggers for simulated nearby drivers when ambulance is within 500 meters: *"Ambulance approaching from the south in 40s. Move left."*
   - Driver terminal integrates the browser **SpeechSynthesis API** to vocalize auditory cues: *"Signal cleared ahead, proceed."* with mute toggle.

10. **Enhanced 60-Second Hackathon Pitch Mode**:
   - Auto-navigates across views: Emergency 108 Dispatch → Hospital ER Pre-Alert → 1km Geofence & Safe Transition → Priority Conflict Arbitration → Dual-Map Comparative Race → 14 Minutes Saved impact conclusion.

---

## 🏙️ Seeded Bengaluru Geographic Network

Seeded with real road network waypoints and municipal intersections:
- **Hospitals**:
  - *Manipal Hospital (Old Airport Road)* – Quaternary Stroke & Cardiac Center
  - *Victoria Hospital (BMCRI Apex Trauma Center, KR Market)* – Level 1 Trauma
  - *St. John's Medical College Hospital (Koramangala)* – Multi-Specialty & ICU Care
  - *Apollo Hospital (Bannerghatta Road)* – Tertiary Critical Care
- **16 Intersections**: Silk Board Junction, Madiwala Checkpost, Sony World Koramangala (100ft Rd), Maharaja Signal (80ft Rd), Domlur Flyover, Old Airport Road, Richmond Circle, Brigade Road-MG Road, Mayo Hall, Trinity Circle Metro, Adugodi Junction, Dairy Circle, and KR Market Gate.

---

## 🛠️ Project Structure

```
.
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioService.js          # Web Audio API alert synthesizer
│   │   │   ├── Navbar.jsx               # Header with Pitch Mode & Tab Switcher
│   │   │   ├── LandingView.jsx          # Hero page with live Seconds Saved counter
│   │   │   ├── DriverView.jsx           # Ambulance tablet UI with SpeechSynthesis alerts
│   │   │   ├── HospitalPreAlertView.jsx # Live ER pre-alert, patient triage & Team Ready button
│   │   │   ├── RaceCompareView.jsx      # Before vs After dual-map race benchmark
│   │   │   ├── PublicAlertToast.jsx     # Floating 500m proximity driver alert
│   │   │   ├── ControlRoomView.jsx      # Live Leaflet map, ITMS stream & stats
│   │   │   ├── SimulationView.jsx       # Interactive sandbox & safety phase diagrams
│   │   │   ├── MapView.jsx              # Leaflet map with CartoDB Dark Matter tiles
│   │   │   └── PitchModeOverlay.jsx     # Guided hackathon narrative overlay
│   │   ├── App.jsx                 # WebSocket client & application coordinator
│   │   └── index.css               # Tailwind CSS v4 & glassmorphic styling
│   ├── vite.config.js          # Vite config with backend API/WS reverse proxy
│   └── package.json
│
├── server/                     # Backend Service (Node.js + Express + WebSocket)
│   ├── src/
│   │   ├── adapters/
│   │   │   └── SignalAdapter.js    # Signal Controller Interface & Safe Phase Simulator
│   │   ├── agents/
│   │   │   └── TinyFishAgent.js    # TinyFish Web Agent scraper & hospital ranker
│   │   ├── security/
│   │   │   └── AuthService.js      # JWT authentication, hijack rejection & audit logs
│   │   ├── engine/
│   │   │   └── CorridorEngine.js   # Dynamic geofencing, green wave & pitch mode logic
│   │   ├── data/
│   │   │   └── bengaluruData.js    # Seed coordinates for 16 signals & 4 hospitals
│   │   └── index.js                # Express REST API & WebSocket broadcaster
│   └── package.json
│
├── run.js                      # Cross-platform one-command launcher
├── run-demo.bat                # Windows 1-click double-click launcher
├── package.json                # Root package configuration
└── README.md
```

---

## ⚡ Quick Start & Run Demo

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### One-Click Launch (Recommended)
Simply run from the root directory:
```bash
# Double click run-demo.bat on Windows, OR:
node run.js
```
This automatically starts:
1. **Backend Server & WebSocket** on `http://localhost:5000`
2. **React + Vite Frontend** on `http://localhost:5173`

Open your browser to:
👉 **`http://localhost:5173`**

---

### Manual Setup (Step-by-Step)

If you prefer to start services independently in two terminal windows:

#### Terminal 1 (Backend Server):
```bash
cd server
npm install
npm start
```
*Backend runs on port 5000 with WebSocket enabled.*

#### Terminal 2 (Frontend Client):
```bash
cd client
npm install
npm run dev
```
*Frontend runs on port 5173 with automated proxy to backend.*

---

## 🎯 Hackathon Presentation Cheat Sheet

For a winning demo during hackathon judging:
1. **Landing Page**: Highlight the problem statement (35-50 minute delays in Bengaluru) and point out the live **"Seconds Saved"** counter.
2. **Pitch Mode (Golden Button)**: Click **"Pitch Mode (60s)"** in the top navbar. Sit back as GreenWave automatically conducts a 6-stage demo narrative with on-screen slides!
3. **Control Room Tab**:
   - Observe the dark-themed Bengaluru map with all 16 signals.
   - Click **"Simulate 2nd Ambulance Conflict"** to show priority preemption where Code Red preempts Code Yellow with real-time arbitration logs.
   - Click **"Test Unauthorized Hijack"** to demonstrate cryptographic rejection of rogue spoofing devices with audit logs.
4. **Driver View Tab**:
   - Switch to the mobile-first Driver View to show hospital recommendation scoring by TinyFish web agent (evaluating ICU beds & trauma readiness).
5. **Simulation Tab**:
   - Switch between **"Route Simulator"**, **"Safe Transition Phases"**, and **"TinyFish Road Advisories"** to demonstrate engineering depth and municipal compliance.

---

## 📄 License
MIT License. Built for collegiate innovation hackathons.
#   g r e e n w a v e  
 