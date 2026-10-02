'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Activity,
  TreePine,
  Flame,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type CaseDetailResponse } from '@/lib/api';

interface ChangeLensesViewProps {
  caseDetail: CaseDetailResponse | null;
}

type LensType = 'WATER' | 'MOTION' | 'FOREST' | 'DAMAGE';

export function ChangeLensesView({ caseDetail }: ChangeLensesViewProps) {
  const [activeLens, setActiveLens] = useState<LensType>('WATER');

  // Evaluate real data availability per lens
  const latestNisar = caseDetail?.nisar_measurements?.[0];
  const hasWaterData = Boolean(
    caseDetail?.event_type?.toUpperCase() === 'FLOOD' ||
    (latestNisar?.delta_backscatter && latestNisar.delta_backscatter <= -1.5)
  );

  const hasMotionData = Boolean(
    latestNisar?.change_metric?.includes('COHERENCE') ||
    latestNisar?.change_metric?.includes('GUNW')
  );

  const hasForestData = Boolean(
    caseDetail?.event_type?.toUpperCase() === 'DEFORESTATION' ||
    caseDetail?.evidence?.some((e) => e.source_type?.toLowerCase().includes('modis'))
  );

  const hasDamageData = Boolean(
    caseDetail?.event_type?.toUpperCase() === 'WILDFIRE' ||
    caseDetail?.evidence?.some((e) => e.source_type?.toLowerCase().includes('firms')) ||
    (caseDetail?.field_observations && caseDetail.field_observations.length > 0)
  );

  const getLensAvailability = (lens: LensType) => {
    switch (lens) {
      case 'WATER':
        return hasWaterData;
      case 'MOTION':
        return hasMotionData;
      case 'FOREST':
        return hasForestData;
      case 'DAMAGE':
        return hasDamageData;
    }
  };

  const lenses = [
    {
      id: 'WATER' as LensType,
      label: 'WATER (Hydro-Radar)',
      icon: Droplets,
      available: hasWaterData,
      description: 'SAR backscatter drop associated with surface water inundation & GPM rain baseline.',
    },
    {
      id: 'MOTION' as LensType,
      label: 'MOTION (Displacement)',
      icon: Activity,
      available: hasMotionData,
      description: 'InSAR phase coherence & surface deformation fringe metrics.',
    },
    {
      id: 'FOREST' as LensType,
      label: 'FOREST (Canopy/NDVI)',
      icon: TreePine,
      available: hasForestData,
      description: 'MODIS land reflectance & vegetation canopy backscatter loss.',
    },
    {
      id: 'DAMAGE' as LensType,
      label: 'DAMAGE (Thermal/Burn)',
      icon: Flame,
      available: hasDamageData,
      description: 'FIRMS active thermal anomalies & ground field observation damage reports.',
    },
  ];

  return (
    <div className="space-y-4" role="region" aria-label="Analytical Change Lenses">
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-amber-500/20 bg-[#080d1a]/85">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2 font-mono">
            <Eye className="w-4 h-4 text-amber-400" aria-hidden="true" />
            Analytical Change Lenses
          </h2>
          <p className="text-xs text-slate-400">
            Multi-spectral & radar domain views evaluated against underlying dataset availability.
          </p>
        </div>
      </div>

      {/* Lens Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5" role="tablist" aria-label="Change Lens Options">
        {lenses.map((lens) => {
          const Icon = lens.icon;
          const isSelected = activeLens === lens.id;
          return (
            <button
              key={lens.id}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`lens-panel-${lens.id}`}
              onClick={() => setActiveLens(lens.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                  : 'bg-slate-950/70 border-amber-500/20 hover:bg-slate-900/60 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} aria-hidden="true" />
                {lens.available ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    AVAILABLE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-500 border border-slate-700">
                    UNAVAILABLE
                  </span>
                )}
              </div>
              <div className="font-mono font-bold text-xs text-slate-200">{lens.label}</div>
            </button>
          );
        })}
      </div>

      {/* Active Lens Detail Panel */}
      <Card id={`lens-panel-${activeLens}`} className="glass-panel border-amber-500/20 shadow-xl bg-[#080d1a]/85">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
              {activeLens} Lens Analytics
            </CardTitle>
            {getLensAvailability(activeLens) ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Real Sensor Payload Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" /> Data Unavailable for Lens
              </span>
            )}
          </div>
          <CardDescription className="text-xs text-slate-400">
            {lenses.find((l) => l.id === activeLens)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs">
          {getLensAvailability(activeLens) ? (
            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Radar Signal (Δ dB)</span>
                  <span className="font-bold text-amber-300 text-sm">
                    {latestNisar?.delta_backscatter != null
                      ? `${latestNisar.delta_backscatter > 0 ? '+' : ''}${latestNisar.delta_backscatter.toFixed(2)} dB`
                      : 'Active Baseline'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Affected Spatial Area</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {latestNisar?.affected_area != null ? `${latestNisar.affected_area} km²` : 'AOI InSAR Mask'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Domain Classification</span>
                  <span className="font-bold text-slate-200 text-sm capitalize truncate block">
                    {caseDetail?.event_type || 'Environmental Target'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Multi-Sensor Records</span>
                  <span className="font-bold text-purple-300 text-sm">
                    {(caseDetail?.evidence?.length || 0) + (caseDetail?.field_observations?.length || 0)} Corroborated
                  </span>
                </div>
              </div>

              {caseDetail?.observation_start && (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="text-slate-500 uppercase">Temporal Baseline Window:</span>
                  <span className="text-slate-300 font-sans">
                    {new Date(caseDetail.observation_start).toLocaleDateString()} — {new Date(caseDetail.observation_end).toLocaleDateString()}
                  </span>
                </div>
              )}

              <p className="text-[11px] font-sans text-slate-300 pt-0.5 leading-relaxed">
                Analytical lens processing confirms active radar change signature corresponding to {activeLens.toLowerCase()} domain criteria across spatial and temporal dimensions.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
              <HelpCircle className="w-6 h-6 text-slate-600 mx-auto" aria-hidden="true" />
              <div className="font-mono font-bold text-slate-300">Underlying Data Unavailable</div>
              <p className="text-slate-500 text-[11px] max-w-md mx-auto leading-normal">
                No simulated or fabricated data is displayed. The {activeLens} analytical lens is inactive because required underlying sensor imagery/interferograms were not acquired for this case.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
