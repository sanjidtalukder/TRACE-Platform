'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  AlertTriangle,
  RefreshCw,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  Maximize2,
  Info,
} from 'lucide-react';
import type { GlobalEventItem } from '@/lib/api';
import {
  type SarPolarization,
  type SarInspectionData,
  generatePointTimeSeries,
  generateChangeDetectionGrid,
  POLARIZATION_REGISTRY,
} from '@/lib/sarAnalysis';
import { SarPolarizationControl } from './sar/SarPolarizationControl';
import { SarChangeLegend } from './sar/SarChangeLegend';
import { SarInspectSignalDrawer } from './sar/SarInspectSignalDrawer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface PlanetaryRealMapProps {
  events: GlobalEventItem[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  caseGeometry?: any;
  loading?: boolean;
  initialPolarization?: SarPolarization;
  defaultChangeDetection?: boolean;
  onPointInspected?: (data: SarInspectionData) => void;
}

export function PlanetaryRealMap({
  events,
  selectedCaseId,
  onSelectCase,
  caseGeometry,
  loading = false,
  initialPolarization = 'VV',
  defaultChangeDetection = false,
  onPointInspected,
}: PlanetaryRealMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const geometryLayerRef = useRef<any>(null);
  const changeLayerRef = useRef<any>(null);
  const inspectMarkerRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState<boolean>(false);
  const [tileError, setTileError] = useState<boolean>(false);
  const [currentCenterCoords, setCurrentCenterCoords] = useState<{ lat: number; lng: number } | null>(null);

  // 1. SAR Radar Polarization State (VV vs VH vs RGB)
  const [polarization, setPolarization] = useState<SarPolarization>(initialPolarization);

  // 2. Automatic Change Detection Heatmap State
  const [isChangeDetectionActive, setIsChangeDetectionActive] = useState<boolean>(defaultChangeDetection);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.75);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);

  // 3. Point-based Signal Inspector State
  const [isInspectModeActive, setIsInspectModeActive] = useState<boolean>(false);
  const [inspectedData, setInspectedData] = useState<SarInspectionData | null>(null);
  const [isInspectDrawerOpen, setIsInspectDrawerOpen] = useState<boolean>(false);

  const selectedEvent = events.find((e) => e.case_id === selectedCaseId) || events[0] || null;

  // Helper to determine tile filter class
  const getTileClassName = useCallback((pol: SarPolarization) => {
    switch (pol) {
      case 'VV':
        return 'trace-osm-dark-tiles trace-sar-vv-tiles';
      case 'VH':
        return 'trace-osm-dark-tiles trace-sar-vh-tiles';
      case 'RGB':
        return 'trace-osm-dark-tiles trace-sar-rgb-tiles';
      default:
        return 'trace-osm-dark-tiles';
    }
  }, []);

  // 1. Initialize Map Instance
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    function initMap() {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Determine initial center from runtime coordinates
      const defaultLat = selectedEvent?.latitude != null ? selectedEvent.latitude : 23.8;
      const defaultLng = selectedEvent?.longitude != null ? selectedEvent.longitude : 90.4;
      const defaultZoom = events.length > 1 ? 5 : 6;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false, // Custom tactical controls
        attributionControl: false,
      });

      // Public OpenStreetMap Geographic Basemap with Dark SAR Filter
      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        className: getTileClassName(polarization),
        maxZoom: 19,
      });

      let tileErrorCount = 0;
      tileLayer.on('tileerror', () => {
        tileErrorCount++;
        if (tileErrorCount > 5 && isMounted) {
          setTileError(true);
        }
      });

      tileLayer.on('load', () => {
        tileErrorCount = 0;
        if (isMounted) setTileError(false);
      });

      tileLayer.addTo(map);

      // Attribution Control placed unobtrusively in bottom right
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[9px] font-mono text-slate-500">WGS84 // TRACE FIELD v2.0</span>',
        })
        .addTo(map);

      // Layer groups for dynamic markers, geometry, change detection, and inspect points
      const markersLayer = L.layerGroup().addTo(map);
      const geometryLayer = L.layerGroup().addTo(map);
      const changeLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;
      geometryLayerRef.current = geometryLayer;
      changeLayerRef.current = changeLayer;

      map.on('move', () => {
        const center = map.getCenter();
        setCurrentCenterCoords({ lat: center.lat, lng: center.lng });
      });

      setCurrentCenterCoords({ lat: defaultLat, lng: defaultLng });
      setMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Handle Polarization Toggle Dynamically without reloading map context
  const handlePolarizationChange = useCallback(
    (newPol: SarPolarization) => {
      setPolarization(newPol);

      // Dynamically update tile class on the existing layer container
      if (tileLayerRef.current) {
        const container =
          tileLayerRef.current.getContainer?.() || tileLayerRef.current._container;
        if (container) {
          container.classList.remove(
            'trace-sar-vv-tiles',
            'trace-sar-vh-tiles',
            'trace-sar-rgb-tiles'
          );
          if (newPol === 'VV') container.classList.add('trace-sar-vv-tiles');
          else if (newPol === 'VH') container.classList.add('trace-sar-vh-tiles');
          else if (newPol === 'RGB') container.classList.add('trace-sar-rgb-tiles');
        }
      }

      // Also sync to map container for universal styling consistency
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.remove(
          'trace-sar-vv-tiles',
          'trace-sar-vh-tiles',
          'trace-sar-rgb-tiles'
        );
        if (newPol === 'VV') mapContainerRef.current.classList.add('trace-sar-vv-tiles');
        else if (newPol === 'VH') mapContainerRef.current.classList.add('trace-sar-vh-tiles');
        else if (newPol === 'RGB') mapContainerRef.current.classList.add('trace-sar-rgb-tiles');
      }
    },
    []
  );

  // 3. Update Markers when events or selectedCaseId change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    let isMounted = true;

    function updateMarkers() {
      if (!isMounted || !markersLayerRef.current) return;

      const layer = markersLayerRef.current;
      layer.clearLayers();

      events.forEach((evt) => {
        if (evt.latitude == null || evt.longitude == null) return;

        const isSelected = evt.case_id === selectedCaseId;

        // Custom High-Contrast TRACE Scientific Marker Icon
        const statusBorder =
          evt.audit_verdict === 'SUPPORTED'
            ? 'border-emerald-400 bg-emerald-500 shadow-emerald-400/50'
            : evt.audit_verdict === 'REJECTED'
            ? 'border-rose-400 bg-rose-500 shadow-rose-400/50'
            : 'border-amber-400 bg-amber-500 shadow-amber-400/50';

        const labelColor = isSelected
          ? 'bg-slate-950/95 text-sky-300 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)] ring-1 ring-sky-400/50'
          : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:border-sky-400';

        const pingEffect = isSelected
          ? '<span class="absolute -inset-2.5 rounded-full bg-sky-400/35 animate-ping pointer-events-none"></span>'
          : '';

        const iconHtml = `
          <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            ${pingEffect}
            <div class="relative flex items-center justify-center w-5 h-5 rounded-full border-2 ${statusBorder} shadow-lg transition-transform duration-200 ${
              isSelected ? 'scale-125 ring-4 ring-sky-400/60' : 'group-hover:scale-110'
            }">
              <div class="w-1.5 h-1.5 rounded-full bg-[#050914]"></div>
            </div>
            <div class="mt-1 whitespace-nowrap text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${labelColor} transition-all pointer-events-none">
              ${evt.case_id}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'trace-custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([evt.latitude, evt.longitude], {
          icon: customIcon,
          title: `${evt.case_id} (${evt.event_type})`,
        });

        marker.on('click', () => {
          onSelectCase(evt.case_id);
        });

        layer.addLayer(marker);
      });
    }

    updateMarkers();

    return () => {
      isMounted = false;
    };
  }, [events, selectedCaseId, mapReady, onSelectCase]);

  // 4. Pan to Selected Case or AOI Geometry on change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedEvent) return;

    if (selectedEvent.latitude != null && selectedEvent.longitude != null) {
      mapInstanceRef.current.flyTo(
        [selectedEvent.latitude, selectedEvent.longitude],
        Math.max(mapInstanceRef.current.getZoom(), 6),
        { duration: 0.8 }
      );
    }
  }, [selectedCaseId, mapReady]);

  // 5. Render Actual Case GeoJSON Geometry if available
  useEffect(() => {
    if (!mapReady || !geometryLayerRef.current) return;

    let isMounted = true;

    function updateGeometry() {
      if (!isMounted || !geometryLayerRef.current) return;

      const layer = geometryLayerRef.current;
      layer.clearLayers();

      if (caseGeometry) {
        try {
          const geoJsonLayer = L.geoJSON(caseGeometry, {
            style: {
              color: '#38bdf8',
              weight: 2,
              opacity: 0.85,
              fillColor: '#0ea5e9',
              fillOpacity: 0.15,
              dashArray: '4, 4',
            },
          });
          layer.addLayer(geoJsonLayer);
        } catch {
          // Graceful ignore of invalid geometry
        }
      }
    }

    updateGeometry();

    return () => {
      isMounted = false;
    };
  }, [caseGeometry, mapReady]);

  // 6. Render Automatic Change Detection Heatmap Layer
  useEffect(() => {
    if (!mapReady || !changeLayerRef.current) return;

    let isMounted = true;

    function updateChangeDetectionLayer() {
      if (!isMounted || !changeLayerRef.current) return;

      const layer = changeLayerRef.current;
      layer.clearLayers();

      if (!isChangeDetectionActive) return;

      const centerLat = selectedEvent?.latitude != null ? selectedEvent.latitude : 23.8;
      const centerLng = selectedEvent?.longitude != null ? selectedEvent.longitude : 90.4;
      const baseDelta = -3.4; // Calibrated flood/disturbance drop

      const cells = generateChangeDetectionGrid(centerLat, centerLng, baseDelta, 35);

      cells.forEach((cell) => {
        const circle = L.circle([cell.lat, cell.lng], {
          radius: 2400, // ~2.4 km cell radius
          color: cell.color,
          weight: 0.75,
          opacity: Math.min(1, heatmapOpacity * 0.9),
          fillColor: cell.color,
          fillOpacity: Math.min(0.9, heatmapOpacity * cell.intensity * 0.85),
          className: 'sar-change-heatmap-cell',
        });

        // Hover tooltip explaining exact dB change intensity
        circle.bindTooltip(
          `
          <div style="font-family: monospace; font-size: 10px; background: rgba(5,9,20,0.92); color: #f8fafc; border: 1px solid rgba(56,189,248,0.35); padding: 5px 8px; border-radius: 6px;">
            <div style="font-weight: bold; color: ${cell.deltaDb < 0 ? '#f43f5e' : '#34d399'};">
              Δσ°: ${cell.deltaDb > 0 ? '+' : ''}${cell.deltaDb.toFixed(2)} dB
            </div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
              ${cell.label}
            </div>
          </div>
          `,
          { sticky: true, opacity: 0.95 }
        );

        layer.addLayer(circle);
      });
    }

    updateChangeDetectionLayer();

    return () => {
      isMounted = false;
    };
  }, [isChangeDetectionActive, heatmapOpacity, selectedEvent, mapReady]);

  // 7. Interactive Click-to-Inspect Signal Mode Handler
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    function handleMapClick(e: any) {
      if (!isInspectModeActive) return;

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // Update inspected reticle pin on the map
      if (inspectMarkerRef.current) {
        inspectMarkerRef.current.remove();
      }

      const reticleHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div class="absolute w-8 h-8 rounded-full border border-sky-400 bg-sky-400/25 sar-inspect-pulse"></div>
          <div class="relative w-4 h-4 rounded-full border-2 border-sky-300 bg-slate-950 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.9)]">
            <div class="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
          </div>
          <div class="absolute top-4 whitespace-nowrap text-[8px] font-mono font-extrabold px-1 py-0.2 bg-slate-950/90 text-sky-300 border border-sky-400/50 rounded shadow">
            PROBE LOCK
          </div>
        </div>
      `;

      const inspectIcon = L.divIcon({
        html: reticleHtml,
        className: 'sar-inspected-point-pin',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const newMarker = L.marker([lat, lng], { icon: inspectIcon }).addTo(map);
      inspectMarkerRef.current = newMarker;

      // Synthesize Sentinel-1 backscatter time-series profile for clicked point
      const result = generatePointTimeSeries(lat, lng, caseGeometry, events);
      setInspectedData(result);
      setIsInspectDrawerOpen(true);
      onPointInspected?.(result);
    }

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isInspectModeActive, mapReady, caseGeometry, events, onPointInspected]);

  // Handle Zoom In / Out
  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  }, []);

  // Recenter to Active Case Location
  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current && selectedEvent?.latitude != null && selectedEvent?.longitude != null) {
      mapInstanceRef.current.flyTo(
        [selectedEvent.latitude, selectedEvent.longitude],
        7,
        { duration: 0.8 }
      );
    }
  }, [selectedEvent]);

  // Toggle Change Detection Layer
  const handleToggleChangeDetection = () => {
    setIsChangeDetectionActive((prev) => {
      const next = !prev;
      if (next) setIsLegendOpen(true);
      return next;
    });
  };

  // Toggle Inspect Signal Tool Mode
  const handleToggleInspectMode = () => {
    setIsInspectModeActive((prev) => {
      const next = !prev;
      if (!next && inspectMarkerRef.current) {
        inspectMarkerRef.current.remove();
        inspectMarkerRef.current = null;
      }
      return next;
    });
  };

  return (
    <div
      className={`relative w-full h-[360px] sm:h-[420px] md:h-[460px] bg-[#050914] overflow-hidden select-none ${
        isInspectModeActive ? 'cursor-tactical-crosshair' : ''
      }`}
    >
      {/* Real Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Cyber Reticle / WGS84 Crosshairs Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-sky-500/10" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-sky-500/10" />
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />
      </div>

      {/* TOP FLOATING ANALYSIS TOOLBAR: POLARIZATION & TOOLS */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)]">
        {/* 1. SAR RADAR POLARIZATION TOGGLE CONTROL (VV vs VH vs RGB) */}
        <SarPolarizationControl
          currentPolarization={polarization}
          onPolarizationChange={handlePolarizationChange}
        />

        {/* 2. AUTOMATIC CHANGE DETECTION TOGGLE BUTTON */}
        <button
          onClick={handleToggleChangeDetection}
          className={`h-8 px-2.5 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 border shadow-lg backdrop-blur-xl ${
            isChangeDetectionActive
              ? 'bg-rose-500/20 text-rose-300 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.35)] ring-1 ring-rose-400'
              : 'bg-slate-950/85 text-slate-400 hover:text-slate-200 border-sky-500/30 hover:bg-slate-900/80'
          }`}
          title="Toggle Temporal Change Detection Layer (Log-Ratio Difference)"
          aria-pressed={isChangeDetectionActive}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isChangeDetectionActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Change Detection</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/30">
            {isChangeDetectionActive ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* 3. POINT-BASED SIGNAL INSPECTOR TOOL MODE BUTTON */}
        <button
          onClick={handleToggleInspectMode}
          className={`h-8 px-2.5 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 border shadow-lg backdrop-blur-xl ${
            isInspectModeActive
              ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.5)] ring-1 ring-sky-300'
              : 'bg-slate-950/85 text-slate-400 hover:text-slate-200 border-sky-500/30 hover:bg-slate-900/80'
          }`}
          title="Enable Inspect Signal Probe: Click anywhere on map to view Backscatter Time-Series"
          aria-pressed={isInspectModeActive}
        >
          <Crosshair className={`w-3.5 h-3.5 ${isInspectModeActive ? 'stroke-[2.5px] animate-spin' : ''}`} />
          <span className="hidden xs:inline">Inspect Signal</span>
          <span
            className={`text-[9px] font-mono px-1 py-0.2 rounded ${
              isInspectModeActive ? 'bg-slate-950 text-sky-300 font-extrabold' : 'bg-black/30'
            }`}
          >
            {isInspectModeActive ? 'ACTIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* TOP-RIGHT MAP ZOOM & RECENTER CONTROLS */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-xl">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-7 h-7 rounded-lg bg-slate-950/85 border border-sky-500/30 text-sky-300 hover:text-white hover:bg-sky-500/20 hover:border-sky-400 flex items-center justify-center transition-all shadow-md active:scale-95"
          title="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-7 h-7 rounded-lg bg-slate-950/85 border border-sky-500/30 text-sky-300 hover:text-white hover:bg-sky-500/20 hover:border-sky-400 flex items-center justify-center transition-all shadow-md active:scale-95"
          title="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleRecenter}
          aria-label="Recenter to active case location"
          className="w-7 h-7 rounded-lg bg-slate-950/85 border border-sky-500/30 text-sky-300 hover:text-white hover:bg-sky-500/20 hover:border-sky-400 flex items-center justify-center transition-all shadow-md active:scale-95"
          title="Recenter to active target"
        >
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
        </button>
      </div>

      {/* BOTTOM-RIGHT CHANGE DETECTION SIDE LEGEND */}
      {isChangeDetectionActive && (
        <div className="absolute bottom-3 right-3 z-20">
          <SarChangeLegend
            isOpen={isLegendOpen}
            onToggle={() => setIsLegendOpen((prev) => !prev)}
            opacity={heatmapOpacity}
            onOpacityChange={setHeatmapOpacity}
            baselineDate={selectedEvent?.observation_start?.split('T')[0] || '2026-08-15'}
            postEventDate={selectedEvent?.observation_end?.split('T')[0] || '2026-09-21'}
          />
        </div>
      )}

      {/* BOTTOM-LEFT TELEMETRY STRIP */}
      <div className="absolute bottom-2 left-3 z-20 pointer-events-none flex flex-wrap items-center gap-1.5">
        {/* Coordinate Telemetry Badge */}
        <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-sky-500/20 font-mono text-[9px] text-slate-400 flex items-center gap-2 shadow-md">
          <span className="text-sky-400 font-bold">WGS84:</span>
          <span>
            {currentCenterCoords
              ? `${Math.abs(currentCenterCoords.lat).toFixed(4)}°${
                  currentCenterCoords.lat >= 0 ? 'N' : 'S'
                }, ${Math.abs(currentCenterCoords.lng).toFixed(4)}°${
                  currentCenterCoords.lng >= 0 ? 'E' : 'W'
                }`
              : selectedEvent?.latitude != null && selectedEvent?.longitude != null
              ? `${selectedEvent.latitude.toFixed(4)}°N, ${selectedEvent.longitude.toFixed(4)}°E`
              : 'GRID CALIBRATING'}
          </span>
        </div>

        {/* Active Polarization Pill Badge */}
        <div className="bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-md border border-sky-500/20 font-mono text-[9px] text-slate-300 flex items-center gap-1.5 shadow-md">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: POLARIZATION_REGISTRY[polarization].colorTheme }}
          />
          <span className="text-slate-400">POL:</span>
          <span className="font-extrabold text-white">{polarization}</span>
        </div>

        {/* Active Inspect Mode Notice */}
        {isInspectModeActive && (
          <div className="bg-sky-500/20 backdrop-blur-md px-2 py-1 rounded-md border border-sky-400/40 font-mono text-[9px] text-sky-300 flex items-center gap-1 animate-pulse shadow-md">
            <Crosshair className="w-3 h-3 text-sky-400" />
            <span>CLICK MAP TO PROBE SIGNAL</span>
          </div>
        )}
      </div>

      {/* Graceful Fallback if Tile Server is Unreachable */}
      {tileError && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-2 font-mono">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            MAP TILE DATA STREAM UNAVAILABLE
          </div>
          <div className="text-[11px] text-slate-400 max-w-sm">
            Geographic basemap connection interrupted. Case coordinates:{' '}
            <span className="text-sky-300 font-bold">
              {selectedEvent?.latitude != null && selectedEvent?.longitude != null
                ? `${selectedEvent.latitude.toFixed(4)}°, ${selectedEvent.longitude.toFixed(4)}°`
                : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setTileError(false)}
            className="mt-2 text-[10px] px-2.5 py-1 rounded border border-sky-500/30 text-sky-300 hover:bg-sky-500/15 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Retry Stream
          </button>
        </div>
      )}

      {/* Empty State when no events exist */}
      {!loading && events.length === 0 && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center space-y-2 font-mono">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
          <div className="text-xs font-bold text-slate-200 uppercase">NO TRACE EVENTS IN FILTER</div>
          <p className="text-[11px] text-slate-400">
            No active satellite cases match the selected pulse filters.
          </p>
        </div>
      )}

      {/* INTERACTIVE SIGNAL INSPECTOR DRAWER / MODAL (CHART.JS TIME-SERIES) */}
      <SarInspectSignalDrawer
        isOpen={isInspectDrawerOpen}
        onClose={() => setIsInspectDrawerOpen(false)}
        inspectionData={inspectedData}
      />
    </div>
  );
}
