'use client';

import React from 'react';
import {
  SlidersHorizontal,
  X,
  Activity,
  Compass,
  BellRing,
  Share2,
  Check,
  Calendar,
  Layers,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ExternalLink,
  Radar,
  Radio,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PayloadCarousel } from '@/components/mobile/PayloadCarousel';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import type {
  CaseDetailResponse,
  NisarMeasurementResponse,
} from '@/lib/api';

export interface TelemetryInspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  caseDetail: CaseDetailResponse | null;
  primaryNisarMeasurement: NisarMeasurementResponse | null | undefined;
  selectedCentroid: { latitude: number; longitude: number } | null;
  targetPlaceName?: string | null;
  distanceToUser: number | null;
  hasTriggeredAlert: boolean;
  onOpenAlertModal: () => void;
  onShareCase: () => void;
  copiedLink: boolean;
  onOpenDetailModal: () => void;
  onSelectPayload?: (payloadId: string) => void;
  onNavigateToFeel?: () => void;
  onNavigateToVerify?: () => void;
}

export function TelemetryInspectorPanel({
  isOpen,
  onClose,
  caseDetail,
  primaryNisarMeasurement,
  selectedCentroid,
  targetPlaceName,
  distanceToUser,
  hasTriggeredAlert,
  onOpenAlertModal,
  onShareCase,
  copiedLink,
  onOpenDetailModal,
  onSelectPayload,
  onNavigateToFeel,
  onNavigateToVerify,
}: TelemetryInspectorPanelProps) {
  if (!isOpen || !caseDetail) return null;

  const formattedTitle = formatCaseLabel(caseDetail);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        onClick={onClose}
        className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Container */}
      <aside
        className="fixed lg:static top-0 right-0 bottom-0 z-50 lg:z-20 w-full sm:w-[380px] lg:w-[380px] shrink-0 h-full bg-[#080C14]/95 lg:bg-[#0A0E18]/90 backdrop-blur-2xl border-l border-[#1A2234] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.8)] lg:shadow-none transition-all duration-300 overflow-hidden"
        role="region"
        aria-label="Investigation Telemetry Inspector"
      >
        {/* Top Header */}
        <div className="p-3.5 px-4 border-b border-[#1A2234] bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                <span>INSPECTOR</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-mono truncate">{caseDetail.case_id}</span>
              </span>
              <h3 className="text-xs font-bold text-slate-100 font-sans truncate" title={formattedTitle}>
                {formattedTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onShareCase}
              className="h-7 px-2 text-[10px] font-mono border-amber-500/30 text-amber-300 hover:bg-amber-500/15"
              title="Share Deep Link"
            >
              {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3 text-amber-400" />}
              <span className="hidden sm:inline ml-1">{copiedLink ? 'Copied' : 'Share'}</span>
            </Button>

            <button
              onClick={onClose}
              aria-label="Close Inspector"
              className="h-7 w-7 rounded-lg border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-white hover:bg-amber-500/15 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Inspector Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-4">
          {/* SECTION 1: HIGH-CONTRAST BITE-SIZED STAT CARDS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Radar className="h-3 w-3 text-amber-400" />
                Key Telemetry
              </span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                caseDetail.status === 'active'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                ● {caseDetail.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Backscatter Stat Card */}
              <div className="glass-panel border-amber-500/20 p-2.5 rounded-xl space-y-1 shadow-inner relative overflow-hidden">
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-amber-400" />
                  SAR Backscatter
                </span>
                {primaryNisarMeasurement?.delta_backscatter != null ? (
                  <p className="text-base font-extrabold font-mono text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                    {primaryNisarMeasurement.delta_backscatter > 0 ? '+' : ''}
                    {primaryNisarMeasurement.delta_backscatter.toFixed(2)} dB
                  </p>
                ) : (
                  <p className="text-xs font-mono text-slate-400 italic">Unavailable</p>
                )}
                <span className="text-[9px] text-slate-400 font-sans block truncate">
                  NISAR L-band Delta
                </span>
              </div>

              {/* Distance Stat Card */}
              <div className="glass-panel border-amber-500/20 p-2.5 rounded-xl space-y-1 shadow-inner relative overflow-hidden">
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Compass className="h-3 w-3 text-amber-400" />
                  Proximity
                </span>
                {distanceToUser != null ? (
                  <p className="text-base font-extrabold font-mono text-slate-100">
                    {distanceToUser} km
                  </p>
                ) : (
                  <p className="text-xs font-mono text-slate-400 italic">GPS Offline</p>
                )}
                <span className="text-[9px] text-slate-400 font-sans block truncate">
                  Haversine Distance
                </span>
              </div>

              {/* Anomaly Alert Stat Card */}
              <div
                onClick={onOpenAlertModal}
                className="glass-panel border-amber-500/20 hover:border-amber-500/40 p-2.5 rounded-xl space-y-1 shadow-inner relative overflow-hidden cursor-pointer transition-colors group"
                title="Configure Anomaly Alert"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <BellRing className="h-3 w-3 text-amber-400" />
                    Anomaly Alert
                  </span>
                  <span className="text-[8px] font-mono text-amber-400 group-hover:underline">Edit</span>
                </div>
                <p className={`text-sm font-bold font-mono ${hasTriggeredAlert ? 'text-amber-300 animate-pulse' : 'text-slate-200'}`}>
                  {hasTriggeredAlert ? 'EXCEEDED' : 'ARMED'}
                </p>
                <span className="text-[9px] text-slate-400 font-sans block truncate">
                  Threshold Notification
                </span>
              </div>

              {/* Detection Window Stat Card */}
              <div className="glass-panel border-amber-500/20 p-2.5 rounded-xl space-y-1 shadow-inner relative overflow-hidden">
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-amber-400" />
                  Observed
                </span>
                <p className="text-xs font-bold font-mono text-slate-200 mt-1 truncate">
                  {new Date(caseDetail.observation_start).toLocaleDateString()}
                </p>
                <span className="text-[9px] text-slate-400 font-sans block truncate">
                  Detection Window
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: MULTI-MISSION SATELLITE EVIDENCE CAROUSEL */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="h-3 w-3 text-amber-400" />
                Cross-Mission Evidence
              </span>
              <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {caseDetail.evidence.length} SOURCES
              </span>
            </div>
            <PayloadCarousel
              caseDetail={caseDetail}
              primaryNisarMeasurement={primaryNisarMeasurement}
              onSelectPayload={onSelectPayload}
            />
          </div>

          {/* SECTION 3: GEOGRAPHIC TARGET LOCATION */}
          {selectedCentroid && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  Target Centroid
                </span>
                {targetPlaceName && (
                  <span className="text-amber-300 font-sans font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    {targetPlaceName}
                  </span>
                )}
              </div>
              <p className="text-slate-200 font-bold">
                {selectedCentroid.latitude.toFixed(4)}°N, {selectedCentroid.longitude.toFixed(4)}°E
              </p>
            </div>
          )}

          {/* SECTION 4: GROUND SENTINEL OBSERVATIONS PREVIEW */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase">
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ground Observations
              </span>
              <span className="text-slate-400">
                {caseDetail.field_observations.length} Recorded
              </span>
            </div>

            {caseDetail.field_observations.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                {caseDetail.field_observations.slice(0, 3).map((fo) => (
                  <div
                    key={fo.id}
                    className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] font-sans text-slate-300 space-y-0.5"
                  >
                    <p className="font-medium text-slate-200 truncate">{fo.note}</p>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {new Date(fo.observed_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                No ground observations logged yet for this target.
              </p>
            )}
          </div>

          {/* SECTION 5: QUICK ACTIONS FOR FIELD WORKERS */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {onNavigateToFeel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToFeel}
                className="h-8 text-xs font-mono font-bold gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-white"
              >
                <Activity className="h-3 w-3 text-amber-400" />
                Feel Signal
              </Button>
            )}

            {onNavigateToVerify && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToVerify}
                className="h-8 text-xs font-mono font-bold gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-white"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Verify Ground
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-t border-[#1A2234] bg-slate-950/80 shrink-0">
          <Button
            onClick={onOpenDetailModal}
            className="w-full h-8 text-xs font-mono font-bold uppercase tracking-wider gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-950/30 rounded-xl"
          >
            <span>Open Full Investigation State</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </aside>
    </>
  );
}
