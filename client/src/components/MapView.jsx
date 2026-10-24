import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({
  signals = [],
  ambulances = [],
  hospitals = [],
  activeRoute = null,
  onSignalClick = () => {},
  darkMode = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const signalMarkersRef = useRef(new Map());
  const ambulanceMarkersRef = useRef(new Map());
  const geofenceCirclesRef = useRef(new Map());
  const hospitalMarkersRef = useRef(new Map());
  const routePolylineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center Bengaluru
      const map = L.map(mapContainerRef.current, {
        center: [12.945, 77.62],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark Matter Tiles (free CartoDB without API key)
      const tileUrl = darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // cleanup handled if unmounted
    };
  }, []);

  // Update Hospital Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hospitals) return;

    hospitals.forEach((hosp) => {
      let marker = hospitalMarkersRef.current.get(hosp.id);
      const iconHtml = `
        <div style="transform: translate(-50%, -50%); cursor: pointer;">
          <div style="background: rgba(15, 23, 42, 0.9); border: 2px solid #38bdf8; border-radius: 12px; padding: 4px 8px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);">
            <span style="color: #38bdf8; font-weight: bold; font-size: 14px;">🏥</span>
            <div style="line-height: 1.1;">
              <div style="color: #f8fafc; font-weight: 700; font-size: 10px; white-space: nowrap;">${hosp.name.split('(')[0]}</div>
              <div style="color: #38bdf8; font-size: 9px; font-weight: 600;">${hosp.icuBedsAvailable} ICU Beds</div>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-hosp-marker',
        html: iconHtml,
        iconSize: [0, 0]
      });

      if (!marker) {
        marker = L.marker([hosp.location.lat, hosp.location.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="color: #0f172a; padding: 4px;">
            <strong style="font-size: 12px;">${hosp.name}</strong><br/>
            <span style="font-size: 11px; color: #475569;">${hosp.area}</span><br/>
            <span style="font-size: 11px; color: #0284c7; font-weight: 600;">ICU Capacity: ${hosp.icuBedsAvailable} / ${hosp.icuBedsTotal}</span><br/>
            <span style="font-size: 10px; color: #64748b;">Emergency Dept: ${hosp.emergencyDeptStatus}</span>
          </div>
        `);
        hospitalMarkersRef.current.set(hosp.id, marker);
      } else {
        marker.setIcon(customIcon);
      }
    });
  }, [hospitals]);

  // Update Traffic Signals
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !signals) return;

    signals.forEach((sig) => {
      let marker = signalMarkersRef.current.get(sig.id);

      // Determine phase color & effect
      let bulbColor = '#ef4444'; // Red
      let glowClass = '';
      let statusLabel = 'STOP';

      if (sig.currentPhase === 'GREEN' || sig.state === 'EMERGENCY_GREEN') {
        bulbColor = '#10b981'; // Green
        glowClass = 'corridor-glow-active';
        statusLabel = 'GREEN WAVE';
      } else if (sig.currentPhase === 'YELLOW' || sig.state === 'PREPARING_CLEARANCE' || sig.state === 'RESTORE_YELLOW') {
        bulbColor = '#f59e0b'; // Yellow
        statusLabel = `CLEAR (${sig.transitionCountdown}s)`;
      } else if (sig.currentPhase === 'ALL_RED' || sig.state === 'ALL_RED_CLEARANCE') {
        bulbColor = '#dc2626'; // All Red
        statusLabel = `ALL-RED (${sig.transitionCountdown}s)`;
      }

      const isEmergency = sig.emergencyHold || sig.state === 'EMERGENCY_GREEN';

      const iconHtml = `
        <div style="transform: translate(-50%, -50%); cursor: pointer; text-align: center;">
          <div style="
            background: #090d16;
            border: 2px solid ${isEmergency ? '#10b981' : '#334155'};
            border-radius: 9999px;
            padding: 4px 7px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            box-shadow: ${isEmergency ? '0 0 16px rgba(16, 185, 129, 0.8)' : '0 2px 6px rgba(0,0,0,0.6)'};
          ">
            <span style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${bulbColor};
              box-shadow: 0 0 8px ${bulbColor};
              display: inline-block;
            "></span>
            <span style="
              font-size: 9px;
              font-weight: 800;
              color: ${isEmergency ? '#34d399' : '#94a3b8'};
              font-family: monospace;
              letter-spacing: -0.2px;
            ">${sig.id.replace('sig-', 'S')}</span>
          </div>
          ${isEmergency ? `
            <div style="
              background: rgba(16, 185, 129, 0.95);
              color: #022c22;
              font-size: 8px;
              font-weight: 900;
              padding: 1px 4px;
              border-radius: 4px;
              margin-top: 2px;
              white-space: nowrap;
              letter-spacing: 0.5px;
            ">CORRIDOR</div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-signal-marker',
        html: iconHtml,
        iconSize: [0, 0]
      });

      if (!marker) {
        marker = L.marker([sig.location.lat, sig.location.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => onSignalClick(sig));
        signalMarkersRef.current.set(sig.id, marker);
      } else {
        marker.setIcon(customIcon);
        marker.setLatLng([sig.location.lat, sig.location.lng]);
      }
    });
  }, [signals, onSignalClick]);

  // Update Ambulances & 1km Dynamic Geofence Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Track active IDs to remove finished ones
    const currentAmbIds = new Set(ambulances.map((a) => a.id));

    // Remove obsolete
    for (const [id, marker] of ambulanceMarkersRef.current.entries()) {
      if (!currentAmbIds.has(id)) {
        map.removeLayer(marker);
        ambulanceMarkersRef.current.delete(id);
      }
    }
    for (const [id, circle] of geofenceCirclesRef.current.entries()) {
      if (!currentAmbIds.has(id)) {
        map.removeLayer(circle);
        geofenceCirclesRef.current.delete(id);
      }
    }

    ambulances.forEach((amb) => {
      if (!amb.location) return;

      const isCritical = amb.priority === 'CRITICAL';
      const sirenColor = isCritical ? '#ef4444' : '#f59e0b';

      const iconHtml = `
        <div style="transform: translate(-50%, -50%);">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #090d16;
            border: 2px solid ${sirenColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px ${sirenColor};
            animation: pulse-corridor 1.5s infinite;
          ">
            <span style="font-size: 16px;">🚑</span>
          </div>
          <div style="
            position: absolute;
            top: 34px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid ${sirenColor};
            padding: 1px 5px;
            border-radius: 4px;
            color: #fff;
            font-size: 9px;
            font-weight: bold;
            white-space: nowrap;
          ">
            ${amb.callSign.split(' ')[0]} • ${amb.speedKmh} km/h
          </div>
        </div>
      `;

      const ambIcon = L.divIcon({
        className: 'custom-amb-marker',
        html: iconHtml,
        iconSize: [0, 0]
      });

      let marker = ambulanceMarkersRef.current.get(amb.id);
      if (!marker) {
        marker = L.marker([amb.location.lat, amb.location.lng], { icon: ambIcon, zIndexOffset: 1000 }).addTo(map);
        ambulanceMarkersRef.current.set(amb.id, marker);
      } else {
        marker.setIcon(ambIcon);
        marker.setLatLng([amb.location.lat, amb.location.lng]);
      }

      // Draw 1000m (1 km) dynamic geofence radius circle around ambulance
      let circle = geofenceCirclesRef.current.get(amb.id);
      const geofenceRadiusMeters = 1000;

      if (!circle) {
        circle = L.circle([amb.location.lat, amb.location.lng], {
          radius: geofenceRadiusMeters,
          color: isCritical ? '#ef4444' : '#f59e0b',
          weight: 1.5,
          dashArray: '4, 6',
          fillColor: isCritical ? '#ef4444' : '#f59e0b',
          fillOpacity: 0.08
        }).addTo(map);
        geofenceCirclesRef.current.set(amb.id, circle);
      } else {
        circle.setLatLng([amb.location.lat, amb.location.lng]);
      }
    });
  }, [ambulances]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeRoute && activeRoute.waypoints && activeRoute.waypoints.length > 0) {
      const latlngs = activeRoute.waypoints.map((wp) => [wp.lat, wp.lng]);

      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }

      routePolylineRef.current = L.polyline(latlngs, {
        color: '#10b981',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);
    } else if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
  }, [activeRoute]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend & Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5 shadow-lg pointer-events-auto">
        <div className="font-bold text-slate-300 text-xs mb-1">Bengaluru Corridor Map</div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
          <span className="text-slate-300">Green Corridor Locked</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-slate-300">Yellow/All-Red Clearance</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-slate-300">Normal ITMS Red</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-1 border-b-2 border-dashed border-red-400"></span>
          <span className="text-slate-300">1 km Geofence Radius</span>
        </div>
      </div>
    </div>
  );
}
