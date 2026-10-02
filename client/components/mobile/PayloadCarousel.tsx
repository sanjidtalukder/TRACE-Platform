'use client';

import React from 'react';
import { Layers, Activity, Flame, Droplets, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { type CaseDetailResponse, type NisarMeasurementResponse } from '@/lib/api';

interface PayloadCarouselProps {
  caseDetail: CaseDetailResponse | null;
  primaryNisarMeasurement: NisarMeasurementResponse | null | undefined;
  onSelectPayload?: (payloadId: string) => void;
}

export function PayloadCarousel({
  caseDetail,
  primaryNisarMeasurement,
  onSelectPayload,
}: PayloadCarouselProps) {
  const hasFirmsEvidence = Boolean(
    caseDetail?.evidence?.some((e) => e.source_type?.toLowerCase().includes('firms')) ||
    caseDetail?.event_type?.toUpperCase() === 'WILDFIRE'
  );

  const hasGpmEvidence = Boolean(
    caseDetail?.evidence?.some((e) => e.source_type?.toLowerCase().includes('gpm')) ||
    caseDetail?.event_type?.toUpperCase() === 'FLOOD'
  );

  const hasOpticalEvidence = Boolean(
    caseDetail?.evidence?.some(
      (e) =>
        e.role === 'optical' ||
        ['modis', 'landsat', 'sentinel-2', 'optical', 'viirs'].includes(e.source_type?.toLowerCase() || '')
    ) || (caseDetail?.field_observations && caseDetail.field_observations.length > 0)
  );

  const fieldObsCount = caseDetail?.field_observations?.length || 0;

  const payloads = [
    {
      id: 'nisar',
      name: 'NISAR L-SAR',
      role: 'Primary Radar Payload',
      icon: Activity,
      iconColor: 'text-amber-400',
      status: primaryNisarMeasurement ? 'PASS' : 'STANDBY',
      statusColor: primaryNisarMeasurement
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : 'bg-slate-800 text-slate-400 border-slate-700',
      metricLabel: 'Backscatter Delta',
      metricValue:
        primaryNisarMeasurement?.delta_backscatter != null
          ? `${primaryNisarMeasurement.delta_backscatter > 0 ? '+' : ''}${primaryNisarMeasurement.delta_backscatter.toFixed(2)} dB`
          : 'Standby',
    },
    {
      id: 'firms',
      name: 'NASA FIRMS',
      role: 'Thermal Radiance',
      icon: Flame,
      iconColor: 'text-orange-400',
      status: hasFirmsEvidence ? 'DETECTED' : 'MONITORING',
      statusColor: hasFirmsEvidence
        ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
        : 'bg-slate-800 text-slate-400 border-slate-700',
      metricLabel: 'Thermal Radiance',
      metricValue: hasFirmsEvidence ? 'Active Anomalies' : 'Baseline Norm',
    },
    {
      id: 'gpm',
      name: 'NASA GPM',
      role: 'Microwave Rain',
      icon: Droplets,
      iconColor: 'text-blue-400',
      status: hasGpmEvidence ? 'ACTIVE' : 'MONITORING',
      statusColor: hasGpmEvidence
        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        : 'bg-slate-800 text-slate-400 border-slate-700',
      metricLabel: 'Precipitation',
      metricValue: hasGpmEvidence ? 'IMERG Baseline' : 'Nominal Flux',
    },
    {
      id: 'optical',
      name: 'OPTICAL VIEW',
      role: 'Reflectance & Context',
      icon: ImageIcon,
      iconColor: 'text-emerald-400',
      status: hasOpticalEvidence ? 'ACQUIRED' : 'PENDING',
      statusColor: hasOpticalEvidence
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : 'bg-slate-800 text-slate-400 border-slate-700',
      metricLabel: 'Surface Visual',
      metricValue: hasOpticalEvidence ? 'Multi-spectral' : 'In Orbit Queue',
    },
    {
      id: 'ground',
      name: 'SENTINEL NET',
      role: 'Ground Truth Field',
      icon: ShieldCheck,
      iconColor: 'text-emerald-300',
      status: fieldObsCount > 0 ? 'CONFIRMED' : 'STANDBY',
      statusColor:
        fieldObsCount > 0
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : 'bg-slate-800 text-slate-400 border-slate-700',
      metricLabel: 'Field Reports',
      metricValue: `${fieldObsCount} Recorded`,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-amber-400" />
          Sensor Payload Status
        </span>
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <span>Swipe</span>
          <span className="text-amber-400">→</span>
        </span>
      </div>

      {/* HORIZONTAL CAROUSEL CONTAINER */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 snap-x snap-mandatory scrollbar-none -mx-1 px-1 touch-pan-x">
        {payloads.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPayload?.(p.id)}
              className="flex-shrink-0 w-44 snap-start p-3 rounded-xl bg-slate-950/85 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-inner relative overflow-hidden group cursor-pointer"
            >
              <div className="tech-corner-tl" />
              <div className="tech-corner-tr" />

              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-amber-500/30 transition-colors">
                  <Icon className={`h-3.5 w-3.5 ${p.iconColor}`} />
                </div>
                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${p.statusColor}`}
                >
                  {p.status}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="font-mono font-extrabold text-xs text-white tracking-tight">
                  {p.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {p.role}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-amber-500/10 flex items-center justify-between font-mono">
                <span className="text-[9px] text-slate-400 uppercase">
                  {p.metricLabel}
                </span>
                <span className="text-[11px] font-bold text-amber-300">
                  {p.metricValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
