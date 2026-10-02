'use client';

import React, { useState } from 'react';
import { Waves, Trees, Sparkles, Info, ChevronDown, Check } from 'lucide-react';
import {
  type SarPolarization,
  POLARIZATION_REGISTRY,
} from '@/lib/sarAnalysis';

interface SarPolarizationControlProps {
  currentPolarization: SarPolarization;
  onPolarizationChange: (pol: SarPolarization) => void;
  className?: string;
  compact?: boolean;
}

export function SarPolarizationControl({
  currentPolarization,
  onPolarizationChange,
  className = '',
  compact = false,
}: SarPolarizationControlProps) {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const activeInfo = POLARIZATION_REGISTRY[currentPolarization];

  const polarizations: Array<{
    id: SarPolarization;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge: string;
  }> = [
    {
      id: 'VV',
      label: 'VV',
      sublabel: 'Surface / Water',
      icon: Waves,
      badge: 'CO-POL',
    },
    {
      id: 'VH',
      label: 'VH',
      sublabel: 'Canopy / Biomass',
      icon: Trees,
      badge: 'CROSS-POL',
    },
    {
      id: 'RGB',
      label: 'RGB',
      sublabel: 'Composite',
      icon: Sparkles,
      badge: 'DUAL-POL',
    },
  ];

  return (
    <div
      className={`relative inline-flex flex-col select-none ${className}`}
      role="region"
      aria-label="SAR Radar Polarization Control"
    >
      {/* Outer Tactical Glass Container */}
      <div className="glass-panel p-1 rounded-xl border-sky-500/30 shadow-2xl flex items-center gap-1 backdrop-blur-xl bg-slate-950/85">
        {/* Radar Icon & Band Label */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 border-r border-sky-500/20 text-sky-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">
            POL:
          </span>
        </div>

        {/* 3 Polarization Buttons (VV / VH / RGB) */}
        <div className="flex items-center gap-1" role="tablist" aria-label="SAR Polarization Selector">
          {polarizations.map((item) => {
            const Icon = item.icon;
            const isActive = currentPolarization === item.id;

            return (
              <button
                key={item.id}
                role="tab"
                id={`pol-tab-${item.id}`}
                aria-selected={isActive}
                aria-controls={`pol-desc-${item.id}`}
                onClick={() => onPolarizationChange(item.id)}
                className={`relative group px-2.5 py-1.5 sm:py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? item.id === 'VV'
                      ? 'bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.45)] ring-1 ring-sky-400'
                      : item.id === 'VH'
                      ? 'bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.45)] ring-1 ring-emerald-300'
                      : 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.45)] ring-1 ring-amber-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`}
                title={`${item.label} Polarization: ${item.sublabel}`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5px]' : 'group-hover:scale-105'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-extrabold">{item.label}</span>
                {!compact && (
                  <span
                    className={`hidden md:inline-block text-[8px] font-mono uppercase px-1 py-0.2 rounded transition-opacity ${
                      isActive
                        ? 'bg-black/20 text-slate-950 font-black'
                        : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Explainer Toggle Button */}
        <button
          onClick={() => setShowTooltip((prev) => !prev)}
          className={`p-1.5 rounded-lg border transition-all ml-0.5 ${
            showTooltip
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'border-sky-500/20 text-slate-400 hover:text-sky-300 hover:bg-slate-900/60'
          }`}
          title="SAR Polarization Physics & Interpretations"
          aria-expanded={showTooltip}
          aria-label="Explain SAR Polarizations"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Flyout Technical Tooltip / Drawer */}
      {showTooltip && (
        <div
          id={`pol-desc-${currentPolarization}`}
          className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-50 w-72 sm:w-80 max-w-[calc(100vw-24px)] glass-panel border-sky-500/35 p-3.5 rounded-xl shadow-2xl space-y-2.5 font-mono text-[11px] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="tech-corner-tl" />
          <div className="tech-corner-tr" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeInfo.colorTheme }}
              />
              <span className="font-extrabold text-white uppercase text-[10px] tracking-wide">
                {activeInfo.label}
              </span>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-[9px] text-slate-400 hover:text-white px-1"
              aria-label="Close explanation"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
            {activeInfo.description}
          </p>

          {/* Physical Mechanism */}
          <div className="bg-slate-950/80 p-2 rounded-lg border border-sky-500/20 space-y-1">
            <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider block">
              Physical Mechanism:
            </span>
            <p className="text-[10px] text-slate-400 leading-normal font-sans">
              {activeInfo.physicsContext}
            </p>
          </div>

          {/* Primary Use-Cases */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Optimal Applications:
            </span>
            <ul className="grid grid-cols-1 gap-1 text-[9px] text-slate-300">
              {activeInfo.optimalApplications.map((app, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{app}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Specs Footer */}
          <div className="pt-1.5 border-t border-sky-500/15 flex items-center justify-between text-[9px] text-slate-500">
            <span>{activeInfo.frequencyBand}</span>
            <span>{activeInfo.sensor}</span>
          </div>
        </div>
      )}
    </div>
  );
}
