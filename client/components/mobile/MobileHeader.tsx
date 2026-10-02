'use client';

import React from 'react';
import {
  Radar,
  CloudOff,
  Crosshair,
  Globe,
  Anchor,
  Activity,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import type { LocationStatus, LocationCoordinates } from '@/lib/useGeolocation';
import { useOfflineSync } from '@/lib/useOfflineSync';
import type { MobileTab } from '@/components/mobile/MobileNav';

interface MobileHeaderProps {
  locationStatus: LocationStatus;
  location?: LocationCoordinates | null;
  onRequestLocation?: () => void;
  serverStatus: 'loading' | 'connected' | 'disconnected';
  activeTab?: MobileTab;
  onTabChange?: (tab: MobileTab) => void;
  inspectorOpen?: boolean;
  onToggleInspector?: () => void;
}

export const MISSION_MODULES: Array<{
  id: MobileTab;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: 'scan',
    title: 'SCAN',
    description: 'Detect environmental change',
    icon: Crosshair,
  },
  {
    id: 'pulse',
    title: 'PULSE',
    description: 'Explore satellite activity',
    icon: Globe,
  },
  {
    id: 'char',
    title: 'CHAR',
    description: 'Characterize the change',
    icon: Anchor,
  },
  {
    id: 'feel',
    title: 'FEEL',
    description: 'Experience the change',
    icon: Activity,
  },
  {
    id: 'verify',
    title: 'VERIFY',
    description: 'Validate the evidence',
    icon: ShieldCheck,
  },
];

export function MobileHeader({
  locationStatus,
  location,
  onRequestLocation,
  serverStatus,
  activeTab,
  onTabChange,
  inspectorOpen = false,
  onToggleInspector,
}: MobileHeaderProps) {
  const { pendingCount, isSyncing, syncPendingQueue } = useOfflineSync();

  // Determine active mission module
  const activeModuleId: MobileTab =
    activeTab === 'pulse'
      ? 'pulse'
      : activeTab === 'char'
      ? 'char'
      : activeTab === 'feel'
      ? 'feel'
      : activeTab === 'verify'
      ? 'verify'
      : 'scan';

  const handleSelectModule = (moduleId: MobileTab) => {
    if (onTabChange) {
      if (moduleId === 'scan') {
        onTabChange('overview');
      } else {
        onTabChange(moduleId);
      }
    }
  };

  return (
    <header className="h-12 w-full backdrop-blur-xl bg-[#0A0E18]/95 border-b border-[#1A2234] px-3 sm:px-4 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.6)] z-40 shrink-0 select-none">
      {/* LEFT: TRACE FIELD Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative flex items-center justify-center h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0">
          <Radar className="h-4 w-4 animate-pulse text-amber-400" />
          <div className="absolute inset-0 rounded-lg bg-amber-400/10 animate-ping pointer-events-none" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5 font-mono">
            TRACE{' '}
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              FIELD
            </span>
          </h1>
          <span className="hidden xl:inline text-[9px] text-slate-400 font-mono tracking-wider uppercase">
            • SENTINEL RADAR
          </span>
        </div>
      </div>

      {/* CENTER: Primary Mission Mode Navigation (Desktop / Tablet) */}
      <nav
        className="hidden md:flex items-center gap-1 bg-[#0C1220]/90 p-1 rounded-xl border border-[#1A2338] shadow-inner"
        aria-label="Mission Mode Switcher"
      >
        {MISSION_MODULES.map((m) => {
          const Icon = m.icon;
          const isActive = activeModuleId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectModule(m.id)}
              title={`${m.title} — ${m.description}`}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-950 stroke-[2.5px]' : 'text-slate-400 group-hover:text-amber-300'}`} />
              <span>{m.title}</span>
              <span
                className={`hidden lg:inline text-[10px] font-normal tracking-normal truncate max-w-[130px] ${
                  isActive ? 'text-slate-900/80 font-medium' : 'text-slate-500 group-hover:text-slate-400'
                }`}
              >
                {m.description.replace(/^(Detect|Explore|Characterize|Experience|Validate)\s+/, '')}
              </span>
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Streamlined Status Indicators & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* OFFLINE QUEUE PILL */}
        {pendingCount > 0 && (
          <button
            onClick={() => syncPendingQueue()}
            className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:bg-amber-500/20 transition-colors"
            title={`${pendingCount} offline observations pending sync. Click to sync now.`}
          >
            <CloudOff className="h-3 w-3 text-amber-400 animate-pulse" />
            <span>{pendingCount}</span>
            <span className="hidden sm:inline">QUEUED</span>
          </button>
        )}

        {/* GPS Status Indicator */}
        <button
          type="button"
          onClick={onRequestLocation}
          className={`flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border shadow-sm transition-colors cursor-pointer ${
            locationStatus === 'granted'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
              : locationStatus === 'loading'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-amber-500/30'
          }`}
          title={
            location
              ? `GPS Lock Active: ${location.placeName || `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`} (±${Math.round(location.accuracy || 0)}m). Click to refresh.`
              : 'Click to sync GPS location'
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              locationStatus === 'granted'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse'
                : locationStatus === 'loading'
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-500'
            }`}
          />
          <span className="hidden sm:inline">
            {location?.placeName ? (
              <span className="truncate max-w-[120px] inline-block align-bottom">{location.placeName}</span>
            ) : locationStatus === 'granted' ? (
              'GPS ACTIVE'
            ) : locationStatus === 'loading' ? (
              'LOCATING'
            ) : (
              'GPS OFFLINE'
            )}
          </span>
        </button>

        {/* Backend Status Dot */}
        <div
          className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full border bg-slate-900/80 border-slate-800 text-slate-400 shadow-sm"
          title={`Backend Link: ${serverStatus.toUpperCase()}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              serverStatus === 'connected'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : serverStatus === 'loading'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <span className="hidden xl:inline text-[9px] uppercase font-mono">
            {serverStatus === 'connected' ? 'ONLINE' : serverStatus}
          </span>
        </div>

        {/* INSPECTOR / TELEMETRY TOGGLE BUTTON (SCAN module) */}
        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            aria-label="Toggle Telemetry Inspector"
            title={inspectorOpen ? 'Hide Telemetry Inspector' : 'Show Telemetry Inspector'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
              inspectorOpen
                ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-amber-500/40'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline text-[11px]">Telemetry</span>
          </button>
        )}
      </div>
    </header>
  );
}
