'use client';

import React from 'react';
import {
  MapPin,
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Radar,
  BellRing,
  Share2,
  Check,
  Calendar,
  Activity,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OpticalSarSwipeComparison } from '@/components/scientific/OpticalSarSwipeComparison';
import { PayloadCarousel } from '@/components/mobile/PayloadCarousel';
import type { LocationStatus, LocationCoordinates } from '@/lib/useGeolocation';
import { fetchPlaceName } from '@/lib/useGeolocation';
import type {
  CaseListItem,
  CaseDetailResponse,
  NisarMeasurementResponse,
} from '@/lib/api';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { CaseSelect } from '@/components/ui/CaseSelect';

interface OverviewViewProps {
  location: LocationCoordinates | null;
  locationStatus: LocationStatus;
  locationError: string | null;
  requestLocation: () => void;
  cases: CaseListItem[];
  selectedCaseId: string | null;
  onSelectCaseId: (id: string) => void;
  caseDetail: CaseDetailResponse | null;
  primaryNisarMeasurement: NisarMeasurementResponse | null | undefined;
  selectedCentroid: { latitude: number; longitude: number } | null;
  distanceToUser: number | null;
  hasTriggeredAlert: boolean;
  onOpenAlertModal: () => void;
  onShareCase: () => void;
  copiedLink: boolean;
  opticalUriCandidate: string | null;
  sarUriCandidate: string | null;
  onNavigateToFeel?: () => void;
  onNavigateToVerify?: () => void;
  onOpenDetailModal: () => void;
  onSelectPayload?: (payloadId: string) => void;
}

export function OverviewView({
  location,
  locationStatus,
  locationError,
  requestLocation,
  cases,
  selectedCaseId,
  onSelectCaseId,
  caseDetail,
  primaryNisarMeasurement,
  selectedCentroid,
  distanceToUser,
  hasTriggeredAlert,
  onOpenAlertModal,
  onShareCase,
  copiedLink,
  opticalUriCandidate,
  sarUriCandidate,
  onNavigateToFeel,
  onNavigateToVerify,
  onOpenDetailModal,
  onSelectPayload,
}: OverviewViewProps) {
  const [targetPlaceName, setTargetPlaceName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedCentroid) {
      fetchPlaceName(selectedCentroid.latitude, selectedCentroid.longitude)
        .then(setTargetPlaceName)
        .catch(() => setTargetPlaceName(null));
    } else {
      setTargetPlaceName(null);
    }
  }, [selectedCentroid]);

  return (
    <div className="space-y-3.5">
      {/* 7.1 COMPACT LOCATION & DEVICE LOCK STRIP */}
      <div className="glass-panel border-sky-500/20 p-2.5 rounded-xl shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-400 shrink-0">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
                GPS LOCK:
              </span>
              {locationStatus === 'granted' && location ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {location.placeName && (
                    <span className="text-[11px] font-mono font-extrabold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.25)]">
                      {location.placeName}
                    </span>
                  )}
                  <span className="text-[11px] font-mono font-bold text-sky-300 truncate">
                    {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    (±{Math.round(location.accuracy || 0)}m)
                  </span>
                </div>
              ) : locationStatus === 'loading' ? (
                <span className="text-[10px] font-mono text-amber-400 animate-pulse flex items-center gap-1">
                  <Compass className="h-3 w-3 animate-spin" /> ACQUIRING...
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">
                  {locationStatus === 'denied' ? 'OFFLINE (DENIED)' : 'UNAVAILABLE'}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={requestLocation}
          disabled={locationStatus === 'loading'}
          className="h-7 text-[10px] font-mono border-sky-500/30 text-sky-300 hover:bg-sky-500/15 px-2 gap-1 shrink-0"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </Button>
      </div>

      {/* 7.1 TARGET SELECTION & SUMMARY */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Radar className="h-3 w-3 text-sky-400" />
            Investigation Target
          </label>
          <span className="text-[9px] font-mono text-sky-400/90 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            {cases.length} DETECTED
          </span>
        </div>

        {cases.length > 0 && (
          <CaseSelect
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCaseId={onSelectCaseId}
          />
        )}
      </div>

      {/* ACTIVE CASE HEADER BADGE & EVENT CONTEXT */}
      {caseDetail && (
        <Card className="glass-panel border-sky-500/25 shadow-xl relative overflow-hidden">
          <div className="tech-corner-tl" />
          <div className="tech-corner-tr" />

          <CardHeader className="p-3.5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold text-sky-300 bg-sky-500/15 px-2.5 py-0.5 rounded border border-sky-400/30 uppercase tracking-widest shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                CASE // {caseDetail.case_id}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenAlertModal}
                  className={`h-6 text-[10px] font-mono px-2 gap-1 border-sky-500/30 ${
                    hasTriggeredAlert
                      ? 'border-amber-500/50 text-amber-300 bg-amber-500/20 animate-pulse font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-sky-500/15'
                  }`}
                  title="Configure Anomaly Alert"
                >
                  <BellRing className="h-3 w-3" />
                  {hasTriggeredAlert ? 'EXCEEDED' : 'Alert'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShareCase}
                  className="h-6 text-[10px] font-mono px-2 gap-1 border-sky-500/30 text-slate-300 hover:text-white hover:bg-sky-500/15"
                  title="Share Case Link"
                >
                  {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3 text-sky-400" />}
                  {copiedLink ? 'Copied' : 'Share'}
                </Button>

                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    caseDetail.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  ● {caseDetail.status}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <CardTitle className="text-base font-extrabold text-white capitalize font-mono tracking-tight">
                {caseDetail.event_type}
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3 text-sky-400" />
                Start: {new Date(caseDetail.observation_start).toLocaleDateString()}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* 7.2 OPTICAL VS SAR COMPARISON (VISUALLY PROMINENT) */}
      <OpticalSarSwipeComparison
        opticalUri={opticalUriCandidate}
        sarUri={sarUriCandidate}
      />

      {/* 7.3 RADAR METRICS (COMPACT 2-COLUMN GRID) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Backscatter */}
        <div className="glass-panel border-sky-500/20 rounded-xl p-3 space-y-1 shadow-inner relative">
          <div className="tech-corner-tl" />
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="h-3 w-3 text-sky-400" />
            Backscatter
          </span>

          {primaryNisarMeasurement?.delta_backscatter != null ? (
            <p className="text-base font-extrabold font-mono text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
              {primaryNisarMeasurement.delta_backscatter > 0 ? '+' : ''}
              {primaryNisarMeasurement.delta_backscatter.toFixed(2)} dB
            </p>
          ) : (
            <p className="text-xs font-mono text-slate-400 italic">
              Unavailable
            </p>
          )}
        </div>

        {/* Distance */}
        <div className="glass-panel border-sky-500/20 rounded-xl p-3 space-y-1 shadow-inner relative">
          <div className="tech-corner-tr" />
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Compass className="h-3 w-3 text-sky-400" />
            Distance
          </span>

          {distanceToUser != null ? (
            <p className="text-base font-extrabold font-mono text-slate-200">
              {distanceToUser} km
            </p>
          ) : (
            <p className="text-xs font-mono text-slate-400 italic">
              {locationStatus === 'granted' ? 'Centroid unknown' : 'GPS off'}
            </p>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS FOR FEEL & VERIFY */}
      <div className="grid grid-cols-2 gap-2">
        {onNavigateToFeel && (
          <Button
            variant="outline"
            onClick={onNavigateToFeel}
            className="h-9 text-xs font-mono font-bold gap-1.5 border-sky-500/40 text-sky-300 hover:bg-sky-500/20 hover:text-white shadow-sm"
          >
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            FEEL Signal
          </Button>
        )}

        {onNavigateToVerify && (
          <Button
            variant="outline"
            onClick={onNavigateToVerify}
            className="h-9 text-xs font-mono font-bold gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:text-white shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            VERIFY Ground
          </Button>
        )}
      </div>

      {/* 7.4 PAYLOAD STATUS HORIZONTAL CAROUSEL */}
      <PayloadCarousel
        caseDetail={caseDetail}
        primaryNisarMeasurement={primaryNisarMeasurement}
        onSelectPayload={onSelectPayload}
      />

      {/* AOI Centroid & Full State Button */}
      {selectedCentroid && (
        <div className="text-[11px] flex items-center justify-between border-t border-sky-500/15 pt-2 text-slate-400 font-mono px-1 gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-sky-400" />
            Target Area:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {targetPlaceName && (
              <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                {targetPlaceName}
              </span>
            )}
            <span className="font-bold text-slate-200">
              {selectedCentroid.latitude.toFixed(4)}°, {selectedCentroid.longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      )}

      <Button
        className="w-full h-9 text-xs font-mono font-bold uppercase tracking-wider gap-2 shadow-lg bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sky-500/20 rounded-xl"
        onClick={onOpenDetailModal}
      >
        Open Full Investigation State
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
