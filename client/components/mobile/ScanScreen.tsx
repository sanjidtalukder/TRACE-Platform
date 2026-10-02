'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Radar,
  Calendar,
  Layers,
  Activity,
  Compass,
  CheckCircle2,
  X,
  Share2,
  ShieldCheck,
  Check,
  BellRing,
  Clock,
  Radio,
  Crosshair,
  SlidersHorizontal,
} from 'lucide-react';
import { ThresholdAlertModal } from '@/components/mobile/ThresholdAlertModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useGeolocation,
  calculateDistance,
  getGeometryCentroid,
} from '@/lib/useGeolocation';
import {
  fetchCases,
  fetchCaseDetail,
  fetchCaseTimeline,
  type CaseListItem,
  type CaseDetailResponse,
  type TimelineResponse,
} from '@/lib/api';
import { OverviewView } from '@/components/mobile/OverviewView';
import { SignalsView } from '@/components/mobile/SignalsView';
import { PayloadAuditView } from '@/components/mobile/PayloadAuditView';
import { TimelineView } from '@/components/mobile/TimelineView';
import { TelemetryInspectorPanel } from '@/components/mobile/TelemetryInspectorPanel';
import { HeroModuleHeader } from '@/components/mobile/HeroMissionHeader';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { FALLBACK_CASE_DETAILS } from '@/lib/apiFallbackData';
import { isBrowserRenderableImageUri } from '@/components/scientific/OpticalSarSwipeComparison';

export type MobileScanView = 'overview' | 'signals' | 'payloads' | 'timeline';

interface ScanScreenProps {
  overrideCaseId?: string | null;
  onNavigateToFeel?: () => void;
  onNavigateToVerify?: () => void;
  currentMobileView?: MobileScanView;
  onMobileViewChange?: (view: MobileScanView) => void;
  inspectorOpen?: boolean;
  onToggleInspector?: () => void;
}

export function ScanScreen({
  overrideCaseId,
  onNavigateToFeel,
  onNavigateToVerify,
  currentMobileView,
  onMobileViewChange,
  inspectorOpen,
  onToggleInspector,
}: ScanScreenProps) {
  const { location, status: locationStatus, error: locationError, requestLocation } = useGeolocation();

  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(overrideCaseId || null);
  const [caseDetail, setCaseDetail] = useState<CaseDetailResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);

  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fallback inspector state if not passed from header
  const [localInspectorOpen, setLocalInspectorOpen] = useState<boolean>(false);

  useEffect(() => {
    if (window.innerWidth >= 1280) {
      setLocalInspectorOpen(true);
    }
  }, []);

  const isInspectorActive = inspectorOpen !== undefined ? inspectorOpen : localInspectorOpen;
  const handleToggleInspector = onToggleInspector || (() => setLocalInspectorOpen((prev) => !prev));

  // Local segmented tab state (defaults to 'overview')
  const [localActiveView, setLocalActiveView] = useState<MobileScanView>('overview');

  const activeView = currentMobileView || localActiveView;

  const handleViewChange = (view: MobileScanView) => {
    setLocalActiveView(view);
    onMobileViewChange?.(view);
  };

  // 1. Fetch case list on mount
  const loadCaseList = async () => {
    setLoadingCases(true);
    setApiError(null);
    try {
      const res = await fetchCases(1, 50);
      setCases(res.items);
      if (res.items.length > 0) {
        setSelectedCaseId((prev) => overrideCaseId || prev || res.items[0].case_id);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to connect to TRACE backend server.');
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    loadCaseList();
  }, [overrideCaseId]);

  // 2. Automatically pick nearest case if user location is available and no override provided
  useEffect(() => {
    if (location && cases.length > 0 && !overrideCaseId) {
      let nearestId = cases[0].case_id;
      let minDistance = Infinity;

      for (const item of cases) {
        const centroid = getGeometryCentroid(item.geometry);
        if (centroid) {
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            centroid.latitude,
            centroid.longitude
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearestId = item.case_id;
          }
        }
      }

      if (nearestId) {
        setSelectedCaseId(nearestId);
      }
    }
  }, [location, cases, overrideCaseId]);

  // 3. Fetch case detail & timeline whenever selectedCaseId changes
  useEffect(() => {
    if (!selectedCaseId) return;

    let isMounted = true;
    setLoadingDetail(true);

    Promise.all([
      fetchCaseDetail(selectedCaseId),
      fetchCaseTimeline(selectedCaseId),
    ])
      .then(([detailRes, timelineRes]) => {
        if (isMounted) {
          setCaseDetail(detailRes || FALLBACK_CASE_DETAILS[selectedCaseId] || FALLBACK_CASE_DETAILS['TRACE-CHAR-01']);
          setTimeline(timelineRes);
          setLoadingDetail(false);
        }
      })
      .catch((err) => {
        console.warn('Fallback applied for case detail:', err);
        if (isMounted) {
          setCaseDetail(FALLBACK_CASE_DETAILS[selectedCaseId] || FALLBACK_CASE_DETAILS['TRACE-CHAR-01']);
          setLoadingDetail(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCaseId]);

  // Calculate distance to selected case centroid
  const selectedCentroid = useMemo(() => {
    if (!caseDetail) return null;
    return getGeometryCentroid(caseDetail.geometry);
  }, [caseDetail]);

  const distanceToUser = useMemo(() => {
    if (!location || !selectedCentroid) return null;
    return calculateDistance(
      location.latitude,
      location.longitude,
      selectedCentroid.latitude,
      selectedCentroid.longitude
    );
  }, [location, selectedCentroid]);

  // Primary NISAR measurement
  const primaryNisarMeasurement = useMemo(() => {
    if (!caseDetail || !caseDetail.nisar_measurements || caseDetail.nisar_measurements.length === 0) {
      return null;
    }
    return caseDetail.nisar_measurements[0];
  }, [caseDetail]);

  // Curated NASA Earth Observation & SAR Radar Imagery Mapping per Case Study
  const CASE_IMAGERY_MAP: Record<string, { optical: string; sar: string }> = {
    'TRACE-CHAR-01': {
      optical: '/imagery/char_optical.jpg',
      sar: '/imagery/char_sar.jpg',
    },
    'CASE-017': {
      optical: '/imagery/flood_optical.jpg',
      sar: '/imagery/flood_sar.jpg',
    },
    'TRACE-2026-001': {
      optical: '/imagery/flood_optical.jpg',
      sar: '/imagery/flood_sar.jpg',
    },
    'TRACE-WILD-01': {
      optical: '/imagery/wildfire_optical.jpg',
      sar: '/imagery/wildfire_sar.jpg',
    },
    'TRACE-QUAKE-01': {
      optical: '/imagery/char_optical.jpg',
      sar: '/imagery/char_sar.jpg',
    },
    'TRACE-DEFOR-01': {
      optical: '/imagery/flood_optical.jpg',
      sar: '/imagery/flood_sar.jpg',
    },
  };

  // Data-aware Optical Image Candidate from backend API records with curated fallback
  const opticalUriCandidate = useMemo(() => {
    if (!caseDetail) return '/imagery/char_optical.jpg';

    if (caseDetail.field_observations && caseDetail.field_observations.length > 0) {
      const photoObs = caseDetail.field_observations.find((fo) => isBrowserRenderableImageUri(fo.photo_reference));
      if (photoObs?.photo_reference) return photoObs.photo_reference;
    }

    if (caseDetail.evidence && caseDetail.evidence.length > 0) {
      const opticalEv = caseDetail.evidence.find(
        (e) =>
          isBrowserRenderableImageUri(e.visualization_uri) &&
          (e.role === 'optical' || ['modis', 'landsat', 'sentinel-2', 'optical', 'viirs'].includes(e.source_type?.toLowerCase() || ''))
      );
      if (opticalEv?.visualization_uri) return opticalEv.visualization_uri;

      const anyValidEv = caseDetail.evidence.find((e) => isBrowserRenderableImageUri(e.visualization_uri));
      if (anyValidEv?.visualization_uri) return anyValidEv.visualization_uri;
    }

    return CASE_IMAGERY_MAP[caseDetail.case_id]?.optical || '/imagery/char_optical.jpg';
  }, [caseDetail]);

  // Data-aware SAR Image Candidate from backend API records with curated fallback
  const sarUriCandidate = useMemo(() => {
    if (!caseDetail) return '/imagery/char_sar.jpg';

    if (primaryNisarMeasurement?.raster_reference && isBrowserRenderableImageUri(primaryNisarMeasurement.raster_reference)) {
      return primaryNisarMeasurement.raster_reference;
    }

    if (caseDetail.evidence && caseDetail.evidence.length > 0) {
      const sarEv = caseDetail.evidence.find(
        (e) =>
          isBrowserRenderableImageUri(e.visualization_uri) &&
          (e.role === 'sar' || ['nisar', 'sentinel-1', 'sar'].includes(e.source_type?.toLowerCase() || ''))
      );
      if (sarEv?.visualization_uri) return sarEv.visualization_uri;
    }

    return CASE_IMAGERY_MAP[caseDetail.case_id]?.sar || '/imagery/char_sar.jpg';
  }, [caseDetail, primaryNisarMeasurement]);

  const hasTriggeredAlert = useMemo(() => {
    return caseDetail?.threshold_alerts?.some((a) => a.is_active && a.triggered_state === 'TRIGGERED') || false;
  }, [caseDetail]);

  const handleShareCaseLink = () => {
    if (!selectedCaseId) return;
    const deepLinkUrl = `${window.location.origin}/field/case/${encodeURIComponent(selectedCaseId)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(deepLinkUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const navSegments: Array<{ id: MobileScanView; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'OVERVIEW', icon: Crosshair },
    { id: 'signals', label: 'SIGNALS', icon: Activity },
    { id: 'payloads', label: 'EVIDENCE', icon: Layers },
    { id: 'timeline', label: 'TIMELINE', icon: Calendar },
  ];

  return (
    <div className="h-full w-full flex flex-col lg:flex-row overflow-hidden relative select-none">
      {/* ==================== LEFT / MAIN CANVAS STAGE ==================== */}
      <div className="flex-1 h-full min-w-0 flex flex-col overflow-hidden relative">
        {/* MODULE ORIENTATION HERO HEADER */}
        <div className="px-2 pt-2 sm:px-3 sm:pt-2.5 shrink-0 z-20">
          <HeroModuleHeader
            module="scan"
            targetCaseLabel={caseDetail ? formatCaseLabel(caseDetail) : 'Active Target'}
            compact
            statusBadge={
              primaryNisarMeasurement?.delta_backscatter != null ? (
                <span className="text-[10px] font-mono text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-400/30">
                  Δ {primaryNisarMeasurement.delta_backscatter > 0 ? '+' : ''}{primaryNisarMeasurement.delta_backscatter.toFixed(2)} dB
                </span>
              ) : null
            }
          />
        </div>

        {/* SECONDARY NAVIGATION DOCK (OVERVIEW | SIGNALS | EVIDENCE | TIMELINE) */}
        <div className="px-2 pt-1.5 sm:px-3 shrink-0 mb-1 z-20">
          <div className="flex items-center justify-between gap-1.5 p-1 bg-[#070e1c]/85 border border-sky-500/20 rounded-xl backdrop-blur-md shadow-sm">
            <div className="grid grid-cols-4 gap-1 flex-1 sm:flex sm:items-center sm:gap-1.5" role="tablist" aria-label="SCAN Sub-modules">
              {navSegments.map((seg) => {
                const Icon = seg.icon;
                const isActive = activeView === seg.id;
                return (
                  <button
                    key={seg.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleViewChange(seg.id)}
                    className={`min-h-[38px] sm:min-h-[36px] py-1 sm:py-1.5 px-0.5 sm:px-3 rounded-lg text-center font-mono text-[9px] xs:text-[10px] sm:text-[11px] tracking-tight uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 min-w-0 cursor-pointer select-none ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 font-bold shadow-[0_0_8px_rgba(56,189,248,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent font-medium'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-sky-300 stroke-[2.2px]' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{seg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Inspector Toggle Button (Desktop/Tablet) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleInspector}
              className={`hidden sm:inline-flex h-8 px-2.5 text-[10px] font-mono gap-1 border-sky-500/30 shrink-0 transition-all ${
                isInspectorActive
                  ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-sm'
                  : 'bg-slate-900/90 text-sky-300 hover:bg-sky-500/15'
              }`}
              title={isInspectorActive ? 'Collapse Telemetry Inspector' : 'Open Telemetry Inspector'}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
              <span>Telemetry</span>
            </Button>
          </div>
        </div>

        {/* API ERROR / RETRY */}
        {apiError && (
          <Card className="border-rose-500/30 bg-rose-950/20 backdrop-blur-md shrink-0 mb-2">
            <CardContent className="p-3 text-center space-y-2">
              <AlertTriangle className="h-6 w-6 text-rose-400 mx-auto" />
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold font-mono text-rose-300 uppercase">Backend Server Link Degradation</h3>
                <p className="text-[11px] text-slate-400">{apiError}</p>
              </div>
              <Button size="sm" variant="outline" onClick={loadCaseList} className="h-7 text-xs font-mono border-rose-500/40 text-rose-300">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LOADING SKELETON */}
        {(loadingCases || (loadingDetail && !caseDetail)) && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-sky-400 p-8">
            <Radar className="w-10 h-10 animate-spin text-sky-400" />
            <span className="tracking-widest uppercase font-bold text-center">
              {loadingCases ? 'INITIALIZING SATELLITE CANVAS...' : 'SYNCHRONIZING NISAR DATA & SATELLITE EVIDENCE...'}
            </span>
            <p className="text-[11px] text-slate-400 font-sans max-w-xs text-center">
              Acquiring cloud-penetrating L-band radar backscatter and multi-mission verification.
            </p>
          </div>
        )}

        {/* NO CASES FOUND EMPTY STATE */}
        {!loadingCases && !loadingDetail && !apiError && cases.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 font-mono">
            <Radar className="h-10 w-10 text-sky-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-200 uppercase">No TRACE Investigation Nearby</h3>
            <p className="text-xs text-slate-400 max-w-sm">No active satellite investigation targets discovered in backend storage.</p>
          </div>
        )}

        {/* CANVAS VIEWS */}
        {caseDetail && (
          <div className="flex-1 h-full min-h-0 overflow-y-auto custom-scrollbar relative px-2 pb-28 sm:pb-8 sm:px-3">
            {activeView === 'overview' && (
              <OverviewView
                location={location}
                locationStatus={locationStatus}
                locationError={locationError}
                requestLocation={requestLocation}
                cases={cases}
                selectedCaseId={selectedCaseId}
                onSelectCaseId={setSelectedCaseId}
                caseDetail={caseDetail}
                primaryNisarMeasurement={primaryNisarMeasurement}
                selectedCentroid={selectedCentroid}
                distanceToUser={distanceToUser}
                hasTriggeredAlert={hasTriggeredAlert}
                onOpenAlertModal={() => setIsAlertModalOpen(true)}
                onShareCase={handleShareCaseLink}
                copiedLink={copiedLink}
                opticalUriCandidate={opticalUriCandidate}
                sarUriCandidate={sarUriCandidate}
                onNavigateToFeel={onNavigateToFeel}
                onNavigateToVerify={onNavigateToVerify}
                onOpenDetailModal={() => setIsModalOpen(true)}
                onSelectPayload={() => handleViewChange('payloads')}
                onToggleInspector={handleToggleInspector}
                inspectorOpen={isInspectorActive}
              />
            )}

            {activeView === 'signals' && (
              <SignalsView
                caseDetail={caseDetail}
                primaryNisarMeasurement={primaryNisarMeasurement}
                onNavigateToFeel={onNavigateToFeel}
              />
            )}

            {activeView === 'payloads' && (
              <PayloadAuditView
                caseId={selectedCaseId || ''}
                caseDetail={caseDetail}
              />
            )}

            {activeView === 'timeline' && (
              <TimelineView
                timeline={timeline}
                observationStart={caseDetail?.observation_start}
                observationEnd={caseDetail?.observation_end}
                onNavigateToVerify={onNavigateToVerify}
              />
            )}
          </div>
        )}
      </div>

      {/* ==================== RIGHT INSPECTOR PANEL ==================== */}
      <TelemetryInspectorPanel
        isOpen={isInspectorActive}
        onClose={handleToggleInspector}
        caseDetail={caseDetail}
        primaryNisarMeasurement={primaryNisarMeasurement}
        selectedCentroid={selectedCentroid}
        distanceToUser={distanceToUser}
        hasTriggeredAlert={hasTriggeredAlert}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        onShareCase={handleShareCaseLink}
        copiedLink={copiedLink}
        onOpenDetailModal={() => setIsModalOpen(true)}
        onSelectPayload={() => handleViewChange('payloads')}
        onNavigateToFeel={onNavigateToFeel}
        onNavigateToVerify={onNavigateToVerify}
      />

      {/* ==================== MODALS ==================== */}
      {/* FULL STATE DETAIL MODAL */}
      {isModalOpen && caseDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col justify-end sm:justify-center p-4">
          <div className="glass-panel border-sky-500/30 rounded-2xl max-w-md w-full mx-auto max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="tech-corner-tl" />
            <div className="tech-corner-tr" />

            <div className="p-4 border-b border-sky-500/20 flex items-center justify-between bg-slate-900/60">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-widest bg-sky-500/15 px-2 py-0.5 rounded border border-sky-400/30">
                  CASE // {caseDetail.case_id}
                </span>
                <h2 className="text-base font-extrabold text-white mt-1 font-mono">
                  {formatCaseLabel(caseDetail)}
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 p-0 rounded-full border-sky-500/30 text-sky-300 hover:bg-sky-500/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3 text-sky-400" />
                  Investigation Overview
                </h4>
                <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg border border-border/40">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Status</span>
                    <p className="font-semibold capitalize">{caseDetail.status}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Field Observations</span>
                    <p className="font-semibold">{caseDetail.field_observations.length} Recorded</p>
                  </div>
                </div>
              </div>

              {caseDetail.nisar_measurements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3 text-sky-400" />
                    Backend NISAR Measurements
                  </h4>
                  {caseDetail.nisar_measurements.map((m) => (
                    <div
                      key={m.id}
                      className="bg-card border border-border/60 p-3 rounded-lg space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex justify-between font-semibold">
                        <span>{m.product_id}</span>
                        <span className="text-sky-400">
                          {m.delta_backscatter != null ? `${m.delta_backscatter} dB` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-sans">
                        Observed: {new Date(m.observation_time).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {caseDetail.field_observations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold uppercase tracking-wider text-[10px] text-emerald-500 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Human Ground Observations ({caseDetail.field_observations.length})
                  </h4>
                  {caseDetail.field_observations.map((fo) => (
                    <div
                      key={fo.id}
                      className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg space-y-1 text-[11px]"
                    >
                      <p className="font-semibold text-foreground">{fo.note}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Ref: {fo.photo_reference || 'Ground Observation'} — {new Date(fo.observed_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/20">
              <Button
                variant="outline"
                className="w-full h-9 text-xs"
                onClick={() => setIsModalOpen(false)}
              >
                Close Investigation View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* THRESHOLD ALERT MODAL */}
      <ThresholdAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        caseId={selectedCaseId}
        currentDeltaBackscatter={primaryNisarMeasurement?.delta_backscatter}
        currentAffectedArea={primaryNisarMeasurement?.affected_area}
        onAlertSaved={() => {
          if (selectedCaseId) {
            fetchCaseDetail(selectedCaseId).then(setCaseDetail).catch(() => null);
          }
        }}
      />
    </div>
  );
}
