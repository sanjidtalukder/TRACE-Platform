'use client';

import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SarChangeLegendProps {
  isOpen: boolean;
  onToggle: () => void;
  opacity: number;
  onOpacityChange: (val: number) => void;
  baselineDate?: string;
  postEventDate?: string;
  onTimeframeChange?: (t1: string, t2: string) => void;
  className?: string;
}

export function SarChangeLegend({
  isOpen,
  onToggle,
  opacity,
  onOpacityChange,
  baselineDate = '2026-08-15',
  postEventDate = '2026-09-21',
  className = '',
}: SarChangeLegendProps) {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  return (
    <div
      className={`glass-panel rounded-xl border-amber-500/30 shadow-2xl backdrop-blur-xl bg-slate-950/90 text-xs font-mono select-none transition-all duration-200 ${
        isOpen ? 'w-64 sm:w-72' : 'w-auto'
      } ${className}`}
      role="region"
      aria-label="SAR Change Detection Legend and Controls"
    >
      <div className="tech-corner-tl" />
      <div className="tech-corner-tr" />

      {/* Header bar / Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full p-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-900/60 transition-colors rounded-xl"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-extrabold text-[10px] text-white uppercase tracking-wider truncate">
            Change Detection Layer
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <span className="text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded font-bold">
            Δσ°
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Legend Content */}
      {isOpen && (
        <div className="p-3 pt-0 border-t border-amber-500/15 space-y-3">
          {/* Temporal Difference Timeframe Window */}
          <div className="bg-slate-900/70 p-2 rounded-lg border border-amber-500/20 space-y-1.5 mt-2">
            <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                Comparison Epochs:
              </span>
              <span className="text-amber-300 font-bold">SENTINEL-1</span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-200">
              <div className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                <span className="text-[8px] text-slate-400 block font-normal">T₁ BASELINE</span>
                <span>{baselineDate}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-amber-400 mx-1 shrink-0" />
              <div className="bg-slate-950/80 px-2 py-0.5 rounded border border-rose-500/30 text-rose-300">
                <span className="text-[8px] text-slate-400 block font-normal">T₂ POST-EVENT</span>
                <span>{postEventDate}</span>
              </div>
            </div>
          </div>

          {/* Color Ramp Bar with Intensity Markers */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider">
              <span className="font-bold text-rose-400">Loss (Attenuation)</span>
              <span className="text-slate-400 font-normal">0 dB</span>
              <span className="font-bold text-emerald-400">Gain (Roughness)</span>
            </div>

            {/* Continuous Scientific Heatmap Ramp */}
            <div className="relative h-3 rounded-full overflow-hidden shadow-inner border border-amber-500/30">
              <div
                className="w-full h-full"
                style={{
                  background:
                    'linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #1e293b 50%, #06b6d4 75%, #10b981 100%)',
                }}
              />
            </div>

            {/* dB Scales */}
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 px-0.5">
              <span>≤ -4 dB</span>
              <span>-2 dB</span>
              <span>0 dB</span>
              <span>+2 dB</span>
              <span>≥ +4 dB</span>
            </div>
          </div>

          {/* Categorical Color Legend Explanations */}
          <div className="space-y-1 text-[9px] font-sans">
            <div className="flex items-center gap-2 p-1 rounded bg-rose-500/10 border border-rose-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <div className="min-w-0">
                <span className="font-bold text-rose-300 font-mono">Severe Drop (&lt; -3.0 dB):</span>{' '}
                <span className="text-slate-300">Surface water flood inundation, deforestation canopy loss.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 rounded bg-amber-500/10 border border-amber-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-amber-300 font-mono">Moderate Drop (-1 to -3 dB):</span>{' '}
                <span className="text-slate-300">High soil moisture attenuation, early vegetation thinning.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <div className="min-w-0">
                <span className="font-bold text-emerald-300 font-mono">Backscatter Gain (&gt; +2.5 dB):</span>{' '}
                <span className="text-slate-300">Surface roughening, structural debris, regrowth.</span>
              </div>
            </div>
          </div>

          {/* Opacity Slider Control */}
          <div className="pt-2 border-t border-amber-500/15 space-y-1">
            <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-400" />
                Layer Opacity:
              </span>
              <span className="font-mono text-amber-300 font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              aria-label="Change detection layer opacity"
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
          </div>

          {/* Mathematical Metric Formula Note */}
          <div className="text-[8px] text-slate-500 leading-tight pt-1">
            Log-Ratio Metric: <span className="font-mono text-slate-400">Δσ° = 10 · log₁₀(σ°_T2 / σ°_T1) dB</span>
          </div>
        </div>
      )}
    </div>
  );
}
