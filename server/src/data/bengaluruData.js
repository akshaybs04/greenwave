// Bengaluru Geographic and Traffic Signal Seed Data
export const HOSPITALS = [
  {
    id: 'hosp-1',
    name: "St. John's Medical College Hospital",
    location: { lat: 12.9298, lng: 77.6207 },
    area: 'Koramangala',
    address: 'Sarjapur Main Road, John Nagar, Koramangala, Bengaluru',
    type: 'Multi-Specialty & Trauma Centre',
    traumaLevel: 1,
    icuBedsTotal: 65,
    icuBedsAvailable: 14,
    emergencyDeptStatus: 'Operational - High Capacity',
    specializations: ['Trauma', 'Cardiology', 'Pediatrics', 'Critical Care'],
    contact: '+91 80 2206 5000',
    verifiedAgentSource: 'TinyFish Web Agent (Karnataka State Health Portal & Hospital Live Roster)',
    rating: 4.8
  },
  {
    id: 'hosp-2',
    name: 'Manipal Hospital (Old Airport Road)',
    location: { lat: 12.9592, lng: 77.6477 },
    area: 'Old Airport Road / Kodihalli',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    type: 'Quaternary Care & Stroke Center',
    traumaLevel: 1,
    icuBedsTotal: 80,
    icuBedsAvailable: 8,
    emergencyDeptStatus: 'Operational - Optimal',
    specializations: ['Cardiology', 'Neurology/Stroke', 'Organ Transplant', 'Trauma'],
    contact: '+91 80 2502 4444',
    verifiedAgentSource: 'TinyFish Web Agent (Manipal Health Live ER Telemetry)',
    rating: 4.9
  },
  {
    id: 'hosp-3',
    name: 'Victoria Hospital (BMCRI Trauma Centre)',
    location: { lat: 12.9625, lng: 77.5746 },
    area: 'KR Market / Kalasipalya',
    address: 'Fort Road, near City Market, Bengaluru',
    type: 'Government Apex Trauma Center',
    traumaLevel: 1,
    icuBedsTotal: 120,
    icuBedsAvailable: 26,
    emergencyDeptStatus: 'Operational - Rapid Admissions Active',
    specializations: ['Mass Casualty', 'Severe Trauma', 'Burns', 'Emergency General'],
    contact: '+91 80 2670 1150',
    verifiedAgentSource: 'TinyFish Web Agent (Govt Health Roster Scraping Protocol)',
    rating: 4.7
  },
  {
    id: 'hosp-4',
    name: 'Apollo Hospital (Bannerghatta)',
    location: { lat: 12.8938, lng: 77.5973 },
    area: 'Bannerghatta Road',
    address: '154/11, Opp. IIMB, Bannerghatta Rd, Bengaluru',
    type: 'Tertiary Care Super Specialty',
    traumaLevel: 2,
    icuBedsTotal: 50,
    icuBedsAvailable: 11,
    emergencyDeptStatus: 'Operational - Normal Load',
    specializations: ['Cardiology', 'Orthopedics', 'Pulmonology'],
    contact: '+91 80 2630 4050',
    verifiedAgentSource: 'TinyFish Web Agent (Apollo Health Bed Status Scraper)',
    rating: 4.8
  }
];

export const SIGNALS = [
  {
    id: 'sig-01',
    name: 'Silk Board Junction',
    location: { lat: 12.9176, lng: 77.6238 },
    corridorDirection: 'North-South',
    currentPhase: 'RED', // RED, YELLOW, ALL_RED, GREEN
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 90,
    currentCycleRemaining: 34,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-02',
    name: 'Madiwala Checkpost Junction',
    location: { lat: 12.9228, lng: 77.6212 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 60,
    currentCycleRemaining: 18,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-03',
    name: "St. John's Medical College Crossing",
    location: { lat: 12.9284, lng: 77.6195 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 75,
    currentCycleRemaining: 42,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-04',
    name: 'Koramangala Water Tank Signal',
    location: { lat: 12.9345, lng: 77.6231 },
    corridorDirection: 'East-West',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 60,
    currentCycleRemaining: 15,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-05',
    name: 'Sony World Junction (Koramangala 100ft Rd)',
    location: { lat: 12.9352, lng: 77.6338 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 90,
    currentCycleRemaining: 67,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-06',
    name: 'Koramangala Maharaja Signal (80ft Road)',
    location: { lat: 12.9412, lng: 77.6322 },
    corridorDirection: 'East-West',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 60,
    currentCycleRemaining: 23,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-07',
    name: 'Intermediate Ring Road - Domlur Flyover Signal',
    location: { lat: 12.9535, lng: 77.6418 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 90,
    currentCycleRemaining: 55,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-08',
    name: 'Old Airport Road - Manipal Hospital Junction',
    location: { lat: 12.9599, lng: 77.6472 },
    corridorDirection: 'East-West',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 60,
    currentCycleRemaining: 30,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-09',
    name: 'Richmond Circle Flyover Signal',
    location: { lat: 12.9645, lng: 77.5958 },
    corridorDirection: 'East-West',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 90,
    currentCycleRemaining: 48,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-10',
    name: 'Residency Road - Mayo Hall Signal',
    location: { lat: 12.9719, lng: 77.6095 },
    corridorDirection: 'East-West',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 75,
    currentCycleRemaining: 12,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-11',
    name: 'Brigade Road - MG Road Junction',
    location: { lat: 12.9742, lng: 77.6074 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 80,
    currentCycleRemaining: 38,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-12',
    name: 'Trinity Circle Metro Signal',
    location: { lat: 12.9729, lng: 77.6206 },
    corridorDirection: 'East-West',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 70,
    currentCycleRemaining: 29,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-13',
    name: 'Dairy Circle Junction (Hosur Rd)',
    location: { lat: 12.9365, lng: 77.5985 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 90,
    currentCycleRemaining: 40,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-14',
    name: 'Adugodi Junction Signal',
    location: { lat: 12.9441, lng: 77.6083 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 60,
    currentCycleRemaining: 19,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-15',
    name: 'Indiranagar 100ft Road - CMH Road Junction',
    location: { lat: 12.9784, lng: 77.6408 },
    corridorDirection: 'North-South',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 80,
    currentCycleRemaining: 51,
    controllerType: 'Simulated ITMS v4.2'
  },
  {
    id: 'sig-16',
    name: 'Victoria Hospital KR Market Signal',
    location: { lat: 12.9610, lng: 77.5758 },
    corridorDirection: 'East-West',
    currentPhase: 'RED',
    emergencyHold: false,
    activeAmbulanceId: null,
    clearanceCountdown: 0,
    normalCycleSec: 90,
    currentCycleRemaining: 62,
    controllerType: 'Simulated ITMS v4.2'
  }
];

// Seed routes connecting major points to hospitals with realistic coordinates
export const PRESET_ROUTES = {
  silkBoardToManipal: {
    id: 'route-silkboard-manipal',
    title: 'Silk Board to Manipal Hospital (Old Airport Rd)',
    startName: 'Silk Board Junction',
    hospitalId: 'hosp-2',
    hospitalName: 'Manipal Hospital (Old Airport Road)',
    totalDistanceKm: 6.8,
    estimatedNormalDurationSec: 1380, // 23 mins in peak Bengaluru traffic
    estimatedCorridorDurationSec: 540, // 9 mins with GreenWave (saves 14 mins!)
    waypoints: [
      { lat: 12.9176, lng: 77.6238, name: 'Silk Board Departure Point' },
      { lat: 12.9228, lng: 77.6212, name: 'Madiwala Underpass' },
      { lat: 12.9284, lng: 77.6195, name: "St. John's Junction" },
      { lat: 12.9345, lng: 77.6231, name: 'Koramangala 100ft Rd Entry' },
      { lat: 12.9352, lng: 77.6338, name: 'Sony World Junction' },
      { lat: 12.9412, lng: 77.6322, name: 'Maharaja Signal 80ft Rd' },
      { lat: 12.9478, lng: 77.6375, name: 'Inner Ring Road Ramp' },
      { lat: 12.9535, lng: 77.6418, name: 'Domlur Flyover' },
      { lat: 12.9572, lng: 77.6455, name: 'Old Airport Road Turn' },
      { lat: 12.9592, lng: 77.6477, name: 'Manipal Hospital ER Bay' }
    ]
  },
  koramangalaToVictoria: {
    id: 'route-koramangala-victoria',
    title: "Koramangala to Victoria Hospital (Apex Trauma)",
    startName: 'Sony World Koramangala',
    hospitalId: 'hosp-3',
    hospitalName: 'Victoria Hospital (BMCRI Trauma Centre)',
    totalDistanceKm: 7.4,
    estimatedNormalDurationSec: 1560, // 26 mins
    estimatedCorridorDurationSec: 610, // ~10 mins
    waypoints: [
      { lat: 12.9352, lng: 77.6338, name: 'Sony World Junction' },
      { lat: 12.9345, lng: 77.6231, name: 'Water Tank Koramangala' },
      { lat: 12.9441, lng: 77.6083, name: 'Adugodi Police Station' },
      { lat: 12.9365, lng: 77.5985, name: 'Dairy Circle Flyover' },
      { lat: 12.9502, lng: 77.5889, name: 'Lalbagh West Gate' },
      { lat: 12.9585, lng: 77.5795, name: 'KR Market Flyover Approach' },
      { lat: 12.9610, lng: 77.5758, name: 'City Market Gate Signal' },
      { lat: 12.9625, lng: 77.5746, name: 'Victoria Hospital Emergency Portico' }
    ]
  },
  mgRoadToStJohns: {
    id: 'route-mgroad-stjohns',
    title: "MG Road to St. John's Hospital",
    startName: 'Brigade Road - MG Road Junction',
    hospitalId: 'hosp-1',
    hospitalName: "St. John's Medical College Hospital",
    totalDistanceKm: 6.2,
    estimatedNormalDurationSec: 1320, // 22 mins
    estimatedCorridorDurationSec: 510, // 8.5 mins
    waypoints: [
      { lat: 12.9742, lng: 77.6074, name: 'Brigade Road Junction' },
      { lat: 12.9719, lng: 77.6095, name: 'Mayo Hall / Residency Rd' },
      { lat: 12.9645, lng: 77.5958, name: 'Richmond Circle' },
      { lat: 12.9441, lng: 77.6083, name: 'Adugodi Crossing' },
      { lat: 12.9345, lng: 77.6231, name: 'Koramangala Road' },
      { lat: 12.9284, lng: 77.6195, name: "St. John's Crossing" },
      { lat: 12.9298, lng: 77.6207, name: "St. John's Emergency Triage" }
    ]
  }
};
