'use client';

import React from 'react';
import {
  MapPin,
  RefreshCw,
  Compass,
  Radar,
  BellRing,
  Share2,
  Check,
  Calendar,
  Activity,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
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
  onToggleInspector?: () => void;
  inspectorOpen?: boolean;
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
  onToggleInspector,
  inspectorOpen = false,
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

  const formattedCaseTitle = caseDetail ? formatCaseLabel(caseDetail) : 'Active Target';

  return (
    <div className="w-full flex flex-col space-y-3.5 relative">
      {/* 1. TOP COMMAND & CASE SELECTOR STRIP */}
      <div className="glass-panel border-amber-500/20 p-2 sm:p-2.5 rounded-xl shadow-lg flex items-center justify-between gap-2 shrink-0 z-20 relative">
        {/* Left: Case Selector */}
        <div className="flex-1 min-w-0">
          {cases.length > 0 && (
            <CaseSelect
              cases={cases}
              selectedCaseId={selectedCaseId}
              onSelectCaseId={onSelectCaseId}
            />
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Anomaly Alert Quick Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAlertModal}
            className={`h-8 px-2.5 text-[10px] font-mono gap-1 border-amber-500/30 ${
              hasTriggeredAlert
                ? 'border-amber-500/50 text-amber-300 bg-amber-500/20 animate-pulse font-bold'
                : 'text-slate-300 hover:text-white hover:bg-amber-500/15'
            }`}
            title="Configure Decibel Anomaly Alert"
          >
            <BellRing className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">{hasTriggeredAlert ? 'EXCEEDED' : 'Alert'}</span>
          </Button>

          {/* Share Case Quick Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onShareCase}
            className="h-8 px-2.5 text-[10px] font-mono gap-1 border-amber-500/30 text-slate-300 hover:text-white hover:bg-amber-500/15"
            title="Share Case Deep Link"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </Button>

          {/* Telemetry Inspector Toggle Button */}
          {onToggleInspector && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleInspector}
              className={`h-8 px-2.5 text-[10px] font-mono gap-1 border-amber-500/30 transition-all ${
                inspectorOpen
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-slate-900/90 text-amber-300 hover:bg-amber-500/15'
              }`}
              title="Toggle Detailed Telemetry Inspector Panel"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Telemetry</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. HERO OPTICAL VS SAR COMPARISON (VISUALLY PROMINENT) */}
      <div className="w-full relative shadow-2xl rounded-xl overflow-hidden">
        <OpticalSarSwipeComparison
          opticalUri={opticalUriCandidate}
          sarUri={sarUriCandidate}
          containerHeightClass="h-[280px] xs:h-[320px] sm:h-[400px] md:h-[460px] min-h-[240px]"
        />
      </div>

      {/* 3. RADAR METRICS & TARGET TELEMETRY GRID (2-COLUMN) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        {/* Metric 1: Backscatter Delta */}
        <div className="glass-panel border-amber-500/20 rounded-xl p-3 space-y-1 shadow-inner relative">
          <div className="tech-corner-tl" />
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="h-3 w-3 text-amber-400" />
            Radar Backscatter
          </span>

          {primaryNisarMeasurement?.delta_backscatter != null ? (
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="text-xl font-extrabold font-mono text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">
                {primaryNisarMeasurement.delta_backscatter > 0 ? '+' : ''}
                {primaryNisarMeasurement.delta_backscatter.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">dB</span>
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-400 italic pt-1">Evaluating</p>
          )}
        </div>

        {/* Metric 2: Distance to Target */}
        <div className="glass-panel border-amber-500/20 rounded-xl p-3 space-y-1 shadow-inner relative">
          <div className="tech-corner-tr" />
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Compass className="h-3 w-3 text-amber-400" />
            Field Distance
          </span>

          {distanceToUser != null ? (
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="text-xl font-extrabold font-mono text-slate-100">
                {distanceToUser.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">km</span>
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-400 italic pt-1">
              {locationStatus === 'granted' ? 'Centroid Unknown' : 'GPS Offline'}
            </p>
          )}
        </div>

        {/* Metric 3: Observation Location & Time */}
        <div className="col-span-2 sm:col-span-1 glass-panel border-amber-500/20 rounded-xl p-3 space-y-1 shadow-inner relative">
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="h-3 w-3 text-amber-400" />
            Target Region
          </span>
          <div className="pt-0.5">
            <p className="text-xs font-mono font-bold text-amber-200 truncate">
              {targetPlaceName || (selectedCentroid ? `${selectedCentroid.latitude.toFixed(2)}°, ${selectedCentroid.longitude.toFixed(2)}°` : 'Global Grid')}
            </p>
            {caseDetail && (
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3 text-amber-400" />
                {new Date(caseDetail.observation_start).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. QUICK FIELD ACTIONS (FEEL & VERIFY) */}
      <div className="grid grid-cols-2 gap-2">
        {onNavigateToFeel && (
          <Button
            variant="outline"
            onClick={onNavigateToFeel}
            className="h-10 text-xs font-mono font-bold gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:text-white shadow-sm"
          >
            <Activity className="h-4 w-4 text-amber-400" />
            FEEL Signal (Haptic/Audio)
          </Button>
        )}

        {onNavigateToVerify && (
          <Button
            variant="outline"
            onClick={onNavigateToVerify}
            className="h-10 text-xs font-mono font-bold gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:text-white shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            VERIFY Ground Truth
          </Button>
        )}
      </div>

      {/* 5. MULTI-MISSION SATELLITE SENSORS CAROUSEL */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            Active Satellite Payloads & Ground Sensors
          </span>
          <span className="text-[10px] font-mono text-amber-400/80">MULTI-MISSION FUSION</span>
        </div>
        <PayloadCarousel
          caseDetail={caseDetail}
          primaryNisarMeasurement={primaryNisarMeasurement}
          onSelectPayload={onSelectPayload}
        />
      </div>

      {/* 6. FULL INVESTIGATION DOSSIER BUTTON */}
      <Button
        className="w-full h-11 text-xs font-mono font-bold uppercase tracking-wider gap-2 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/40 rounded-xl cursor-pointer"
        onClick={onOpenDetailModal}
      >
        <Radar className="h-4 w-4" />
        Open Full Scientific Investigation Dossier
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
