'use client';

import React, { useState } from 'react';
import {
  X,
  Crosshair,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  MapPin,
  Calendar,
  Share2,
  Check,
  Download,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SarTimeSeriesGraph } from './SarTimeSeriesGraph';
import { type SarInspectionData } from '@/lib/sarAnalysis';

interface SarInspectSignalDrawerProps {
  inspectionData: SarInspectionData | null;
  onClose: () => void;
  isOpen: boolean;
}

export function SarInspectSignalDrawer({
  inspectionData,
  onClose,
  isOpen,
}: SarInspectSignalDrawerProps) {
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  if (!isOpen || !inspectionData) return null;

  const {
    coordinate,
    dominantFeature,
    surfaceCategory,
    currentVV,
    currentVH,
    currentRatio,
    baselineVV,
    deltaVV,
    deltaVH,
    trendStatus,
    interpretation,
    recommendation,
    points,
    metrics,
    nearestCaseId,
  } = inspectionData;

  const handleCopyCoordinates = () => {
    const text = `${coordinate.lat.toFixed(5)}, ${coordinate.lng.toFixed(5)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  const handleDownloadCsv = () => {
    const headers = 'Date,Platform,Orbit,PassNumber,Phase,Sigma0_VV_dB,Sigma0_VH_dB,Ratio_dB,IsAnomaly\n';
    const rows = points
      .map(
        (p) =>
          `${p.date},${p.platform},${p.orbit},${p.passNumber},${p.phase},${p.vvDb},${p.vhDb},${p.ratioDb},${p.isAnomaly}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `SAR_Signal_Profile_${coordinate.lat.toFixed(4)}_${coordinate.lng.toFixed(4)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTrendBadge = () => {
    switch (trendStatus) {
      case 'SEVERE_ATTENUATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            ATTENUATION ({deltaVV} dB)
          </span>
        );
      case 'MODERATE_LOSS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <TrendingDown className="w-3 h-3 text-amber-400" />
            MODERATE LOSS ({deltaVV} dB)
          </span>
        );
      case 'BACKSCATTER_GAIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            SURFACE GAIN (+{deltaVV} dB)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800/70 text-slate-300 border border-slate-700/70">
            <Minus className="w-3 h-3 text-slate-400" />
            STABLE BASELINE (±0.5 dB)
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspect-signal-title"
    >
      <div className="glass-panel border-amber-500/35 rounded-2xl max-w-2xl w-full mx-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative bg-[#080d1a]/95">
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        {/* Modal / Drawer Header */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-slate-900/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-extrabold text-amber-300 uppercase tracking-widest bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-amber-400" />
                SIGNAL INSPECTOR // POINT PROBE
              </span>
              {getTrendBadge()}
            </div>
            <h2 id="inspect-signal-title" className="text-base font-extrabold text-white font-mono flex items-center gap-2">
              <span>SAR Backscatter Time-Series</span>
              {nearestCaseId && (
                <span className="text-xs font-normal text-slate-400">
                  (AOI: {nearestCaseId})
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCoordinates}
              className="h-8 px-2.5 text-[10px] font-mono border-amber-500/30 text-slate-300 hover:text-white hover:bg-amber-500/20"
              title="Copy Coordinates"
            >
              {copiedCoords ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3 text-amber-400 mr-1" />
                  {coordinate.lat.toFixed(4)}°, {coordinate.lng.toFixed(4)}°
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full border-amber-500/30 text-slate-400 hover:text-white hover:bg-amber-500/20"
              aria-label="Close Signal Inspector"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/25">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Current σ° (VV)</span>
              <p className="text-base font-black text-amber-300 mt-0.5">
                {currentVV > 0 ? '+' : ''}{currentVV.toFixed(2)} <span className="text-[10px] text-amber-400/80 font-normal">dB</span>
              </p>
              <span className="text-[8px] text-slate-500 block">Baseline: {baselineVV.toFixed(1)} dB</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/25">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Current σ° (VH)</span>
              <p className="text-base font-black text-emerald-300 mt-0.5">
                {currentVH > 0 ? '+' : ''}{currentVH.toFixed(2)} <span className="text-[10px] text-emerald-400/80 font-normal">dB</span>
              </p>
              <span className="text-[8px] text-slate-500 block">Volumetric Cross-Pol</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/25">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">VV - VH Ratio</span>
              <p className="text-base font-black text-amber-300 mt-0.5">
                {currentRatio.toFixed(2)} <span className="text-[10px] text-amber-400/80 font-normal">dB</span>
              </p>
              <span className="text-[8px] text-slate-500 block">Polarimetric Quotient</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/25">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Surface Character</span>
              <p className="text-xs font-bold text-slate-200 mt-1 truncate">
                {surfaceCategory}
              </p>
              <span className="text-[8px] text-slate-400 truncate block">{dominantFeature}</span>
            </div>
          </div>

          {/* Interactive Chart.js Dual-Line Graph */}
          <div className="glass-panel p-3 rounded-xl border-amber-500/20 space-y-2 bg-slate-950/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Sentinel-1 Multi-Pass Time-Series (dB vs Date)
              </span>
              <span className="text-[9px] text-slate-400">
                {points.length} Historical Passes (12-day Cycle)
              </span>
            </div>

            {/* Canvas Graph */}
            <SarTimeSeriesGraph
              points={points}
              baselineVV={baselineVV}
              height={220}
            />

            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-amber-500/10">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> σ° VV (Roughness / Water)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> σ° VH (Canopy / Volume)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Detected Anomaly
              </span>
            </div>
          </div>

          {/* Scientific Interpretation Narrative */}
          <div className="bg-slate-900/70 p-3 rounded-xl border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              Radar Physical Interpretation
            </div>
            <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
              {interpretation}
            </p>
            <div className="pt-1 text-[10px] text-slate-400 font-sans border-t border-slate-800">
              <span className="font-semibold text-emerald-400">Mission Operational Guidance:</span>{' '}
              {recommendation}
            </div>
          </div>
        </div>

        {/* Modal / Drawer Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-slate-900/40 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            className="h-8 text-xs font-mono border-amber-500/30 text-amber-300 hover:bg-amber-500/20 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Time-Series CSV
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs font-mono font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-md shadow-amber-500/20"
          >
            Close Signal Drawer
          </Button>
        </div>
      </div>
    </div>
  );
}
