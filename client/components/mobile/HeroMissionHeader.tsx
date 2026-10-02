'use client';

import React from 'react';
import {
  Crosshair,
  Globe,
  Anchor,
  Activity,
  ShieldCheck,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import type { MobileTab } from '@/components/mobile/MobileNav';

export interface ModuleMeta {
  id: MobileTab;
  title: string;
  tagline: string;
  guidance: string;
  badge: string;
  icon: LucideIcon;
}

export const MODULE_DEFINITIONS: Record<string, ModuleMeta> = {
  scan: {
    id: 'scan',
    title: 'SCAN',
    tagline: 'Detect environmental change',
    guidance: 'Detect temporal radar anomalies, inspect backscatter deltas, and examine optical vs. SAR evidence.',
    badge: 'RADAR SURVEILLANCE',
    icon: Crosshair,
  },
  pulse: {
    id: 'pulse',
    title: 'PULSE',
    tagline: 'Explore satellite activity',
    guidance: 'Explore global surveillance cases, filter planetary hazard categories, and track satellite coverage.',
    badge: 'PLANETARY MATRIX',
    icon: Globe,
  },
  char: {
    id: 'char',
    title: 'CHAR',
    tagline: 'Characterize the change',
    guidance: 'Characterize river-island dynamics, morphological erosion, and land deposition with radar baselines.',
    badge: 'RIVER-ISLAND ENGINE',
    icon: Anchor,
  },
  feel: {
    id: 'feel',
    title: 'FEEL',
    tagline: 'Experience the change',
    guidance: 'Experience radar backscatter shifts as tactile haptic pulses and synthesized acoustic frequencies.',
    badge: 'HAPTIC SENSORY LINK',
    icon: Activity,
  },
  verify: {
    id: 'verify',
    title: 'VERIFY',
    tagline: 'Validate the evidence',
    guidance: 'Validate satellite observations with offline-first field reports, geotagged photos, and closed-loop ground truth.',
    badge: 'CLOSED-LOOP TRUTH',
    icon: ShieldCheck,
  },
};

interface HeroModuleHeaderProps {
  module: 'scan' | 'pulse' | 'char' | 'feel' | 'verify';
  targetCaseLabel?: string | null;
  statusBadge?: React.ReactNode;
  rightAction?: React.ReactNode;
  compact?: boolean;
}

export function HeroModuleHeader({
  module,
  targetCaseLabel,
  statusBadge,
  rightAction,
  compact = false,
}: HeroModuleHeaderProps) {
  const meta = MODULE_DEFINITIONS[module] || MODULE_DEFINITIONS.scan;
  const Icon = meta.icon;

  return (
    <div
      className={`glass-panel border-sky-500/25 rounded-2xl relative overflow-hidden shadow-lg transition-all ${
        compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'
      }`}
      role="region"
      aria-label={`${meta.title} Module Orientation`}
    >
      <div className="tech-corner-tl" />
      <div className="tech-corner-tr" />

      {/* Subtle top cyan ambient glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Module Title, Tagline, Guidance */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 sm:p-2.5 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.2)] mt-0.5">
            <Icon className="h-5 w-5 animate-pulse text-sky-400" aria-hidden="true" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-mono flex items-center gap-2">
                {meta.title}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-widest shadow-sm">
                  {meta.badge}
                </span>
              </h2>

              {statusBadge}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-sky-300 font-sans tracking-tight">
              {meta.tagline}
            </p>

            <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed line-clamp-2 sm:line-clamp-none pt-0.5">
              {meta.guidance}
            </p>

            {targetCaseLabel && (
              <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                <span className="text-slate-400 font-semibold uppercase">ACTIVE TARGET:</span>
                <span className="text-sky-300 font-bold truncate">{targetCaseLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions / Controls */}
        {rightAction && (
          <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
}

interface HeroMissionHeaderProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function HeroMissionHeader({ activeTab, onTabChange }: HeroMissionHeaderProps) {
  const modulesList = Object.values(MODULE_DEFINITIONS);

  return (
    <div className="w-full max-w-md sm:max-w-4xl mx-auto px-4 pt-2 pb-2 space-y-3">
      {/* HERO EXPLANATION & GUIDANCE GLASS PANEL */}
      <div className="glass-panel border-sky-500/25 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        {/* Subtle Ambient Top Illumination */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5">
          {/* Main Hero Header Title */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono flex items-center gap-2">
                TRACE <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-widest shadow-[0_0_10px_rgba(56,189,248,0.2)]">FIELD</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-sky-400/90 font-mono tracking-wider uppercase flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Satellite Environmental Mission Control
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-sky-500/20">
              <Sparkles className="h-3 w-3 text-sky-400" />
              <span>MISSION CONTROL v2.0</span>
            </div>
          </div>

          {/* Concise Explanatory Sentence */}
          <p className="text-xs sm:text-sm text-slate-200 font-sans font-medium leading-relaxed">
            Trace environmental changes across time and location using satellite-based evidence.
          </p>

          {/* Short User Guidance Line */}
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono flex items-start sm:items-center gap-1.5 leading-normal">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1 sm:mt-0 shrink-0" />
            <span>Select a mission module below to detect change, explore activity, characterize change, experience change, or validate evidence.</span>
          </p>
        </div>

        {/* 5 MISSION MODULE CARDS */}
        <div className="mt-4 pt-3 border-t border-sky-500/15">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
            {modulesList.map((m) => {
              const Icon = m.icon;
              const isActive = activeTab === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => onTabChange(m.id)}
                  className={`group relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/15 border-sky-400/40 text-white shadow-[0_0_15px_rgba(56,189,248,0.25)] -translate-y-0.5'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-sky-500/30 hover:bg-slate-900/80 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Top Edge Illumination when active */}
                  {isActive && (
                    <div className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
                  )}

                  {/* Icon & Title */}
                  <div className="flex items-center gap-1.5 w-full">
                    <div
                      className={`p-1 rounded-md transition-colors ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                          : 'bg-slate-900 text-slate-400 group-hover:text-sky-300 group-hover:bg-sky-500/10'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-100">
                      {m.title}
                    </span>
                  </div>

                  {/* Tagline */}
                  <span
                    className={`text-[10px] font-sans font-medium mt-1 leading-tight transition-colors ${
                      isActive ? 'text-sky-300 font-semibold' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {m.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
