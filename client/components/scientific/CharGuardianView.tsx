'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Anchor,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Activity,
  BellRing,
  FileText,
  Layers,
  ChevronRight,
  RefreshCw,
  Eye,
  Radio,
  TrendingUp,
  TrendingDown,
  Volume2,
  Users,
  Compass,
  Sparkles,
  Waves,
  Satellite,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  fetchCases,
  fetchCharHistory,
  type CaseListItem,
  type CharHistoryResponse,
} from '@/lib/api';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { CaseSelect } from '@/components/ui/CaseSelect';
import { EvidenceConfidenceWall } from '@/components/scientific/EvidenceConfidenceWall';
import { HeroModuleHeader } from '@/components/mobile/HeroMissionHeader';

interface CharGuardianViewProps {
  initialCaseId?: string | null;
  onNavigateToFeel?: () => void;
  onNavigateToVerify?: () => void;
}

const CASE_REGIONAL_CONTEXT: Record<
  string,
  {
    optical: string;
    sar: string;
    regionName: string;
    drainageNetwork: string;
    populationAtRisk: string;
    vulnerabilityLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    primarySoil: string;
  }
> = {
  'TRACE-CHAR-01': {
    optical: '/imagery/char_optical.jpg',
    sar: '/imagery/char_sar.jpg',
    regionName: 'Jamuna River Basin, Sariakandi, Bogura',
    drainageNetwork: 'Brahmaputra-Jamuna Braided Drainage Network',
    populationAtRisk: '~12,400 seasonal farmers & char dwellers',
    vulnerabilityLevel: 'HIGH',
    primarySoil: 'Active Riverine Alluvial Silt (Shoal Deposition)',
  },
  'CASE-017': {
    optical: '/imagery/flood_optical.jpg',
    sar: '/imagery/flood_sar.jpg',
    regionName: 'San Jacinto River Watershed, Texas',
    drainageNetwork: 'San Jacinto Lowland Channel Network',
    populationAtRisk: '~8,200 floodplain residents',
    vulnerabilityLevel: 'HIGH',
    primarySoil: 'Clayey Floodplain Alluvium',
  },
  'TRACE-2026-001': {
    optical: '/imagery/flood_optical.jpg',
    sar: '/imagery/flood_sar.jpg',
    regionName: 'Brazos River Floodway, Texas Coast',
    drainageNetwork: 'Brazos River Inundation Plain',
    populationAtRisk: '~15,000 coastal valley inhabitants',
    vulnerabilityLevel: 'CRITICAL',
    primarySoil: 'Deltaic Mud & Sand Deposits',
  },
  'TRACE-WILD-01': {
    optical: '/imagery/wildfire_optical.jpg',
    sar: '/imagery/wildfire_sar.jpg',
    regionName: 'Sierra Nevada Foothills, California',
    drainageNetwork: 'Merced River Mountain Watershed',
    populationAtRisk: '~4,500 rural inhabitants',
    vulnerabilityLevel: 'HIGH',
    primarySoil: 'Granitic Mountain Colluvium',
  },
  'TRACE-QUAKE-01': {
    optical: '/imagery/char_optical.jpg',
    sar: '/imagery/char_sar.jpg',
    regionName: 'Searles Valley Seismic Fault Zone, California',
    drainageNetwork: 'Endorheic Playa Drainage Basin',
    populationAtRisk: '~1,200 desert basin inhabitants',
    vulnerabilityLevel: 'MODERATE',
    primarySoil: 'Saline Lacustrine Alluvium',
  },
  'TRACE-DEFOR-01': {
    optical: '/imagery/char_optical.jpg',
    sar: '/imagery/char_sar.jpg',
    regionName: 'Rondônia Basin, Amazon Rainforest',
    drainageNetwork: 'Madeira River Lowland Basin',
    populationAtRisk: '~6,800 indigenous community residents',
    vulnerabilityLevel: 'CRITICAL',
    primarySoil: 'Tropical Oxisol Forest Substrate',
  },
};

export function CharGuardianView({
  initialCaseId,
  onNavigateToFeel,
  onNavigateToVerify,
}: CharGuardianViewProps) {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId || null);
  const [charHistory, setCharHistory] = useState<CharHistoryResponse | null>(null);

  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Satellite canvas view mode: 'sar' (radar) | 'optical' (visible) | 'split' (comparison)
  const [satelliteViewMode, setSatelliteViewMode] = useState<'sar' | 'optical' | 'split'>('sar');

  const loadCaseList = async () => {
    setLoadingCases(true);
    setError(null);
    try {
      const res = await fetchCases(1, 50);
      setCases(res.items);
      if (res.items.length > 0) {
        const exists = selectedCaseId && res.items.some((c) => c.case_id === selectedCaseId);
        if (!selectedCaseId || !exists) {
          const charCase =
            res.items.find((c) =>
              ['CHAR', 'RIVER', 'FLOOD', 'WATER', 'LAND'].some((k) =>
                c.event_type.toUpperCase().includes(k)
              )
            ) || res.items[0];
          setSelectedCaseId(charCase.case_id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch TRACE cases.');
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    loadCaseList();
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;

    let isMounted = true;
    setLoadingHistory(true);
    setError(null);

    fetchCharHistory(selectedCaseId)
      .then((res) => {
        if (isMounted) {
          setCharHistory(res);
          setLoadingHistory(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.warn(`Char history fetch notice for ${selectedCaseId}:`, err);
          setLoadingHistory(false);
          if (cases.length > 0 && selectedCaseId !== cases[0].case_id) {
            setSelectedCaseId(cases[0].case_id);
          } else {
            setError(`Char Guardian history unavailable for selected case ID '${selectedCaseId}'.`);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCaseId, cases]);

  const selectedCaseItem = cases.find((c) => c.case_id === selectedCaseId);

  // Regional contextual metadata
  const currentContext = useMemo(() => {
    if (selectedCaseId && CASE_REGIONAL_CONTEXT[selectedCaseId]) {
      return CASE_REGIONAL_CONTEXT[selectedCaseId];
    }
    return CASE_REGIONAL_CONTEXT['TRACE-CHAR-01'];
  }, [selectedCaseId]);

  // Delta backscatter metric calculations for the Dynamic Gauge
  const deltaBackscatter = charHistory?.latest_delta_backscatter ?? -2.1;
  const isErosionInundation = deltaBackscatter <= -1.5;
  const isSiltAccretion = deltaBackscatter >= 1.0;
  const isEquilibrium = !isErosionInundation && !isSiltAccretion;

  // Normalized gauge position: -5.0 dB (0%) to +3.0 dB (100%)
  const gaugePercentage = useMemo(() => {
    const clamped = Math.max(-5.0, Math.min(3.0, deltaBackscatter));
    return Math.round(((clamped - -5.0) / (3.0 - -5.0)) * 100);
  }, [deltaBackscatter]);

  // Ground truth consensus
  const groundTruthStats = useMemo(() => {
    if (!charHistory?.ground_truth) {
      return { total: 0, confirmed: 0, denied: 0, pending: 0, ratio: 100 };
    }
    const { total_reports = 0, confirmed_reports = 0, denied_reports = 0, pending_reports = 0 } =
      charHistory.ground_truth;
    const ratio = total_reports > 0 ? Math.round((confirmed_reports / total_reports) * 100) : 100;
    return {
      total: total_reports,
      confirmed: confirmed_reports,
      denied: denied_reports,
      pending: pending_reports,
      ratio,
    };
  }, [charHistory]);

  const getChangeStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OBSERVED CHANGE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Observed SAR Change
          </span>
        );
      case 'POTENTIAL CHANGE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Potential Surface Change
          </span>
        );
      case 'INCONCLUSIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            Inconclusive Evidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            {status || 'UNAVAILABLE'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto px-3 sm:px-6 pb-28 sm:pb-24">
      {/* 1. MODULE ORIENTATION HERO HEADER */}
      <HeroModuleHeader
        module="char"
        targetCaseLabel={
          selectedCaseItem
            ? formatCaseLabel(selectedCaseItem)
            : selectedCaseId
            ? `CASE // ${selectedCaseId}`
            : null
        }
        statusBadge={
          charHistory ? (
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
              {charHistory.historical_observations?.length || 0} SAR ACQUISITIONS
            </span>
          ) : null
        }
        rightAction={
          cases.length > 0 ? (
            <div className="w-full sm:w-auto sm:min-w-[300px] shrink-0">
              <CaseSelect
                cases={cases}
                selectedCaseId={selectedCaseId}
                onSelectCaseId={setSelectedCaseId}
              />
            </div>
          ) : null
        }
      />

      {loadingHistory && (
        <Card className="glass-panel border-amber-500/20 bg-[#080d1a]/85">
          <CardContent className="p-10 min-h-[180px] flex flex-col items-center justify-center gap-3 text-center text-xs font-mono text-slate-400">
            <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
            <span className="tracking-wider">Loading Char Guardian Earth-Observation Telemetry...</span>
          </CardContent>
        </Card>
      )}

      {!loadingHistory && charHistory && (
        <>
          {/* ============================================================== */}
          {/* 2. SATELLITE RADAR MULTI-SPECTRAL VISUALIZER (NEW WOW FEATURE) */}
          {/* ============================================================== */}
          <Card className="glass-panel border-amber-500/30 shadow-2xl relative overflow-hidden bg-[#070b14]/90">
            <div className="tech-corner-tl" />
            <div className="tech-corner-tr" />

            <CardHeader className="p-4 sm:p-5 pb-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold text-amber-300 uppercase tracking-widest bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-400/30 flex items-center gap-1.5">
                      <Satellite className="w-3 h-3 text-amber-400" />
                      EARTH OBSERVATION ORBITAL CANVAS
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden xs:inline">
                      10m Spatial Resolution
                    </span>
                  </div>
                  <CardTitle className="text-base sm:text-lg font-extrabold text-white mt-1.5 font-mono tracking-tight flex items-center gap-2">
                    {currentContext.regionName}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 font-sans flex items-center gap-1.5 mt-0.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{currentContext.drainageNetwork}</span>
                  </CardDescription>
                </div>

                {/* VIEW MODE SEGMENTED TOGGLE */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-amber-500/25 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setSatelliteViewMode('sar')}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      satelliteViewMode === 'sar'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'text-slate-400 hover:text-amber-200'
                    }`}
                  >
                    <Radio className="w-3 h-3" />
                    <span>NISAR SAR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSatelliteViewMode('optical')}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      satelliteViewMode === 'optical'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'text-slate-400 hover:text-emerald-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Optical</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSatelliteViewMode('split')}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      satelliteViewMode === 'split'
                        ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                        : 'text-slate-400 hover:text-amber-200'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Dual</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-1 space-y-3">
              {/* IMAGE DISPLAY STAGE */}
              <div className="relative w-full h-[220px] sm:h-[290px] rounded-xl overflow-hidden border border-amber-500/25 bg-slate-950 shadow-inner group">
                {satelliteViewMode === 'sar' && (
                  <div className="relative w-full h-full">
                    <img
                      src={currentContext.sar}
                      alt="NISAR L-band SAR backscatter"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" />
                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1.5 shadow-lg">
                      <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>NISAR L-BAND GSLC • CLOUD-PENETRATING ACTIVE MICROWAVE</span>
                    </div>
                  </div>
                )}

                {satelliteViewMode === 'optical' && (
                  <div className="relative w-full h-full">
                    <img
                      src={currentContext.optical}
                      alt="Optical Multispectral Surface View"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" />
                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>SENTINEL-2 / MODIS OPTICAL MULTISPECTRAL SURFACE</span>
                    </div>
                  </div>
                )}

                {satelliteViewMode === 'split' && (
                  <div className="relative w-full h-full grid grid-cols-2 divide-x divide-amber-400/50">
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={currentContext.optical}
                        alt="Optical"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-300 border border-emerald-500/30">
                        OPTICAL
                      </div>
                    </div>
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={currentContext.sar}
                        alt="SAR Radar"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                        NISAR SAR
                      </div>
                    </div>
                  </div>
                )}

                {/* BOTTOM METADATA OVERLAY PILLS */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                  <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/30 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>
                      {charHistory.latitude != null && charHistory.longitude != null
                        ? `${charHistory.latitude.toFixed(4)}°N, ${charHistory.longitude.toFixed(4)}°E`
                        : '24.8000°N, 89.6500°E'}
                    </span>
                  </div>

                  <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
                    <Waves className="w-3 h-3 text-emerald-400" />
                    <span>Active Braided Shoal Polyline</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============================================================== */}
          {/* 3. EROSION VS. ACCRETION DYNAMIC GAUGE (NEW HIGH-IMPACT UX)     */}
          {/* ============================================================== */}
          <Card className="glass-panel border-amber-500/25 shadow-xl relative overflow-hidden bg-[#080d1a]/85">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-bold font-mono text-white tracking-wide uppercase">
                      Riverbed Dynamics // Erosion & Silt Accretion Gauge
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-sans">
                      Calibrated delta backscatter (Δσ° dB) indicating water inundation vs. emergent shoal silt.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-mono font-extrabold text-amber-300 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
                    Δσ° = {deltaBackscatter > 0 ? `+${deltaBackscatter.toFixed(2)}` : deltaBackscatter.toFixed(2)} dB
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-3 text-xs font-mono">
              {/* MULTI-SEGMENT GRADIENT TRACK */}
              <div className="space-y-1.5">
                <div className="relative w-full h-4 bg-gradient-to-r from-rose-600 via-amber-500/80 to-emerald-500 rounded-full shadow-inner border border-white/10">
                  {/* Baseline 0 dB marker */}
                  <div
                    className="absolute top-0 bottom-0 left-[62.5%] w-0.5 bg-white/70 z-10"
                    title="0 dB Baseline"
                  />

                  {/* Indicator Needle */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 z-20"
                    style={{ left: `${gaugePercentage}%` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,1)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    </div>
                  </div>
                </div>

                {/* TRACK LABELS */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    <TrendingDown className="w-3 h-3" />
                    Bank Erosion / Inundation (&lt; -1.5 dB)
                  </span>
                  <span className="text-slate-400 hidden sm:inline">Baseline (0 dB)</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    Emergent Silt Accretion (&gt; +1.0 dB)
                  </span>
                </div>
              </div>

              {/* DYNAMIC INTERPRETATION BANNER */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                  isErosionInundation
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    : isSiltAccretion
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-0.5">
                  <span className="font-bold tracking-wide uppercase text-[11px] block">
                    {isErosionInundation && 'OBSERVED INUNDATION // RIVERBANK WATER ENCROACHMENT'}
                    {isSiltAccretion && 'OBSERVED ACCRETION // NEW SANDBAR SILT EMERGENCE'}
                    {isEquilibrium && 'STABLE MORPHOLOGY // SEASONAL EQUILIBRIUM'}
                  </span>
                  <p className="text-[11px] text-slate-300 font-sans leading-normal">
                    {isErosionInundation &&
                      `Radar backscatter drop (${deltaBackscatter.toFixed(2)} dB) indicates open-water specular reflection. High water volumes have submerged seasonal shoals or eroded riverbank edges along this char perimeter.`}
                    {isSiltAccretion &&
                      `Radar backscatter elevation (+${deltaBackscatter.toFixed(2)} dB) reveals rough diffuse surface scattering. Post-monsoon river recession has exposed newly formed dry silt shoals suitable for winter agriculture.`}
                    {isEquilibrium &&
                      `Radar backscatter change (${deltaBackscatter.toFixed(2)} dB) remains within normal baseline bounds; no critical riverbank failure or major shoal emergence is detected.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============================================================== */}
          {/* 4. COMMUNITY IMPACT & DELTA VULNERABILITY CONTEXT              */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Card className="glass-panel border-amber-500/20 bg-[#080d1a]/85 shadow-lg">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Community & Humanitarian Vulnerability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2.5 text-xs font-mono">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Population at Risk:</span>
                  <span className="text-white font-bold">{currentContext.populationAtRisk}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Vulnerability Level:</span>
                  <span
                    className={`font-extrabold text-[11px] px-2 py-0.5 rounded border ${
                      currentContext.vulnerabilityLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : currentContext.vulnerabilityLevel === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {currentContext.vulnerabilityLevel}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Primary Soil Composition:</span>
                  <span className="text-amber-200 text-right text-[11px] truncate max-w-[200px]">
                    {currentContext.primarySoil}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* QUICK ACTIONS HUB */}
            <Card className="glass-panel border-amber-500/20 bg-[#080d1a]/85 shadow-lg flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Tactical Multi-Sensory Actions
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-sans">
                  Experience this shoal with audio sonification or log an offline field observation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2.5">
                {onNavigateToFeel && (
                  <Button
                    onClick={onNavigateToFeel}
                    className="w-full h-10 bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-200 border border-amber-500/40 font-mono font-bold text-xs gap-2 shadow-sm transition-all"
                  >
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Hear Char Sonification (FEEL)</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-400/70" />
                  </Button>
                )}

                {onNavigateToVerify && (
                  <Button
                    onClick={onNavigateToVerify}
                    className="w-full h-10 bg-gradient-to-r from-emerald-500/20 to-emerald-600/30 hover:from-emerald-500/30 hover:to-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs gap-2 shadow-sm transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Submit Ground-Truth Observation (VERIFY)</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400/70" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ============================================================== */}
          {/* 5. GROUND TRUTH CONSENSUS PROGRESS BAR (MODERNIZED)            */}
          {/* ============================================================== */}
          <Card className="glass-panel border-emerald-500/30 shadow-lg bg-[#080d1a]/85">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                      Ground Truth Field Verification Consensus
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-sans">
                      Synchronized field ranger observations and ground truth reports within this target bounding box.
                    </CardDescription>
                  </div>
                </div>

                <span className="text-xs font-mono font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                  {groundTruthStats.ratio}% VERIFICATION CONSENSUS
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-3.5 text-xs font-mono">
              {/* CONSENSUS VISUAL STACKED BAR */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-amber-500/20">
                  <div
                    style={{
                      width: `${
                        groundTruthStats.total > 0
                          ? (groundTruthStats.confirmed / groundTruthStats.total) * 100
                          : 100
                      }%`,
                    }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm transition-all duration-500"
                    title="Confirmed Reports"
                  />
                  <div
                    style={{
                      width: `${
                        groundTruthStats.total > 0
                          ? (groundTruthStats.denied / groundTruthStats.total) * 100
                          : 0
                      }%`,
                    }}
                    className="h-full bg-rose-500 transition-all duration-500"
                    title="Denied Reports"
                  />
                  <div
                    style={{
                      width: `${
                        groundTruthStats.total > 0
                          ? (groundTruthStats.pending / groundTruthStats.total) * 100
                          : 0
                      }%`,
                    }}
                    className="h-full bg-amber-500/80 transition-all duration-500"
                    title="Pending Reports"
                  />
                </div>
              </div>

              {/* METRIC PILLS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Reports</span>
                  <p className="text-base font-extrabold text-white mt-0.5">{groundTruthStats.total}</p>
                </div>

                <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30 shadow-inner">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Confirmed</span>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">{groundTruthStats.confirmed}</p>
                </div>

                <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-500/30 shadow-inner">
                  <span className="text-[10px] text-rose-400 uppercase tracking-wider block">Denied</span>
                  <p className="text-base font-extrabold text-rose-400 mt-0.5">{groundTruthStats.denied}</p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pending</span>
                  <p className="text-base font-extrabold text-slate-300 mt-0.5">{groundTruthStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============================================================== */}
          {/* 6. PRIMARY SAR OBSERVATION PARAMETERS GRID                     */}
          {/* ============================================================== */}
          <Card className="glass-panel border-amber-500/20 shadow-lg bg-[#080d1a]/85">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-extrabold text-emerald-300 uppercase tracking-widest bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-400/30 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                  CHAR // {charHistory.char_name_or_id}
                </span>
                {getChangeStatusBadge(charHistory.change_status)}
              </div>
              <CardTitle className="text-sm sm:text-base font-extrabold text-white capitalize mt-1.5 font-mono tracking-tight">
                {charHistory.event_type} — Calibrated SAR Radar Metrics
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Observation Window: {new Date(charHistory.observation_start).toLocaleDateString()} to{' '}
                {new Date(charHistory.observation_end).toLocaleDateString()}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Backscatter Delta</span>
                  <p className="text-sm font-extrabold font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                    {charHistory.latest_delta_backscatter != null
                      ? `${charHistory.latest_delta_backscatter.toFixed(2)} dB`
                      : 'Unavailable'}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Affected Area</span>
                  <p className="text-sm font-extrabold font-mono text-white">
                    {charHistory.latest_affected_area != null
                      ? `${charHistory.latest_affected_area.toFixed(1)} km²`
                      : 'Unavailable'}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Evidence State</span>
                  <p className="text-xs font-mono font-bold text-slate-200 truncate mt-1">{charHistory.evidence_status}</p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Self-Audit Verdict</span>
                  <p className="text-xs font-mono font-bold text-amber-300 truncate mt-1">{charHistory.audit_verdict}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============================================================== */}
          {/* 7. CONFIGURABLE ANOMALY THRESHOLD ALERTS                       */}
          {/* ============================================================== */}
          {charHistory.alerts && charHistory.alerts.length > 0 && (
            <Card className="glass-panel border-amber-500/20 bg-[#080d1a]/85 shadow-lg">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                  Configured Anomaly Threshold Alert Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-2 space-y-2.5 text-xs">
                {charHistory.alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-mono font-bold text-slate-200">
                        {a.metric_name} ({a.comparison} {a.threshold_value})
                      </span>
                      <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                        {a.triggered_state === 'TRIGGERED'
                          ? 'Observed change exceeded the configured safety threshold.'
                          : 'Alert configured and active.'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center ${
                        a.triggered_state === 'TRIGGERED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {a.triggered_state}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ============================================================== */}
          {/* 8. CHRONOLOGICAL OBSERVATION HISTORY (TIMELINE)                */}
          {/* ============================================================== */}
          <Card className="glass-panel border-amber-500/20 bg-[#080d1a]/85 shadow-lg">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                Chronological Observation History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2 text-xs">
              {charHistory.historical_observations.length > 0 ? (
                <div className="space-y-3.5 border-l-2 border-amber-500/40 ml-2 pl-4">
                  {charHistory.historical_observations.map((evt) => (
                    <div key={evt.id} className="relative space-y-0.5">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-[#080d1a] shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                      <p className="font-mono font-bold text-white leading-snug">{evt.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleString()} ({evt.phase.toUpperCase()})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic font-mono">Historical observation data unavailable.</p>
              )}
            </CardContent>
          </Card>

          {/* ============================================================== */}
          {/* 9. PROVENANCE & NASA ARCHIVE METADATA LINEAGE                  */}
          {/* ============================================================== */}
          {charHistory.provenance_records && charHistory.provenance_records.length > 0 && (
            <Card className="glass-panel border-amber-500/20 bg-[#080d1a]/85 shadow-lg">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  Lineage & Provenance Metadata ({charHistory.provenance_records.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-2 space-y-2 text-xs">
                {charHistory.provenance_records.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-1 font-mono text-[11px] break-words shadow-inner"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-bold text-amber-300">
                      <span className="break-all">{p.product_id || p.collection_id || 'NASA Data'}</span>
                      <span className="text-slate-400 text-[10px] font-normal">{p.processing_method}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Calculation: {p.calculation_method || 'SPATIAL_TEMPORAL_CROSS_CORRELATION'} — Ref:{' '}
                      {p.source_reference || 'NASA CMR'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ============================================================== */}
          {/* 10. EVIDENCE CONFIDENCE WALL                                   */}
          {/* ============================================================== */}
          <div className="pt-2 space-y-6">
            <EvidenceConfidenceWall caseId={charHistory.case_id} />
          </div>
        </>
      )}

      {!loadingHistory && !charHistory && (
        <Card className="glass-panel border-amber-500/20 bg-[#080d1a]/85">
          <CardContent className="p-8 flex flex-col items-center justify-center gap-3 text-center text-xs font-mono text-slate-400">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Char Guardian telemetry unavailable for this target case.</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
