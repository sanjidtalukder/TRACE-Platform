'use client';

import React, { useState, useEffect } from 'react';
import {
  Anchor,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Activity,
  BellRing,
  FileText,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  fetchCases,
  fetchCharHistory,
  type CaseListItem,
  type CharHistoryResponse,
} from '@/lib/api';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { CaseSelect } from '@/components/ui/CaseSelect';
import { EvidenceConfidenceWall } from '@/components/scientific/EvidenceConfidenceWall';
import { ChangeLensesView } from '@/components/scientific/ChangeLensesView';
import { EnhancedEventTimeline } from '@/components/scientific/EnhancedEventTimeline';
import { HeroModuleHeader } from '@/components/mobile/HeroMissionHeader';

interface CharGuardianViewProps {
  initialCaseId?: string | null;
  onNavigateToVerify?: () => void;
}

export function CharGuardianView({ initialCaseId, onNavigateToVerify }: CharGuardianViewProps) {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId || null);
  const [charHistory, setCharHistory] = useState<CharHistoryResponse | null>(null);

  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaseList = async () => {
    setLoadingCases(true);
    setError(null);
    try {
      const res = await fetchCases(1, 50);
      setCases(res.items);
      if (res.items.length > 0) {
        const exists = selectedCaseId && res.items.some((c) => c.case_id === selectedCaseId);
        if (!selectedCaseId || !exists) {
          const charCase = res.items.find((c) =>
            ['CHAR', 'RIVER', 'FLOOD', 'WATER', 'LAND'].some((k) => c.event_type.toUpperCase().includes(k))
          ) || res.items[0];
          setSelectedCaseId(charCase.case_id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch TRACE cases.');
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    loadCaseList();
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;

    let isMounted = true;
    setLoadingHistory(true);
    setError(null);

    fetchCharHistory(selectedCaseId)
      .then((res) => {
        if (isMounted) {
          setCharHistory(res);
          setLoadingHistory(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.warn(`Char history fetch notice for ${selectedCaseId}:`, err);
          setLoadingHistory(false);
          // Fallback to first available case if selected target ID is invalid / 404
          if (cases.length > 0 && selectedCaseId !== cases[0].case_id) {
            setSelectedCaseId(cases[0].case_id);
          } else {
            setError(`Char Guardian history unavailable for selected case ID '${selectedCaseId}'.`);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCaseId, cases]);

  const getChangeStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OBSERVED CHANGE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Activity className="w-3.5 h-3.5" />
            Observed SAR Change
          </span>
        );
      case 'POTENTIAL CHANGE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Potential Surface Change
          </span>
        );
      case 'INCONCLUSIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            Inconclusive Evidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            {status || 'UNAVAILABLE'}
          </span>
        );
    }
  };

  const selectedCaseItem = cases.find((c) => c.case_id === selectedCaseId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 pb-28 sm:pb-24">
      {/* MODULE ORIENTATION HERO HEADER */}
      <HeroModuleHeader
        module="char"
        targetCaseLabel={selectedCaseItem ? formatCaseLabel(selectedCaseItem) : selectedCaseId ? `CASE // ${selectedCaseId}` : null}
        statusBadge={
          charHistory ? (
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
              {charHistory.historical_observations?.length || 0} SAR ACQUISITIONS
            </span>
          ) : null
        }
        rightAction={
          cases.length > 0 ? (
            <div className="w-full sm:w-auto sm:min-w-[300px] shrink-0">
              <CaseSelect
                cases={cases}
                selectedCaseId={selectedCaseId}
                onSelectCaseId={setSelectedCaseId}
              />
            </div>
          ) : null
        }
      />

      {loadingHistory && (
        <Card className="glass-panel border-sky-500/20">
          <CardContent className="p-10 min-h-[160px] flex flex-col items-center justify-center gap-3 text-center text-xs font-mono text-slate-400">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            <span>Loading Char Guardian Earth-Observation Data...</span>
          </CardContent>
        </Card>
      )}

      {!loadingHistory && charHistory && (
        <>
          {/* SECTION 1: CHAR OVERVIEW & SAR CHANGE METRICS */}
          <Card className="glass-panel border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="tech-corner-tl" />
            <div className="tech-corner-tr" />

            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-extrabold text-emerald-300 uppercase tracking-widest bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-400/30 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                  CHAR // {charHistory.char_name_or_id}
                </span>
                {getChangeStatusBadge(charHistory.change_status)}
              </div>

              <CardTitle className="text-base font-extrabold text-white capitalize mt-2 flex items-center gap-2 font-mono tracking-tight">
                {charHistory.event_type} — Char Island AOI
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                Observation Period: {new Date(charHistory.observation_start).toLocaleDateString()} to{' '}
                {new Date(charHistory.observation_end).toLocaleDateString()}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-4 text-xs">
              {/* BOUNDARY & COORDINATE DISPLAY */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono shadow-inner">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="break-all font-semibold">
                    Centroid:{' '}
                    {charHistory.latitude != null && charHistory.longitude != null
                      ? `${charHistory.latitude.toFixed(4)}°, ${charHistory.longitude.toFixed(4)}°`
                      : 'Unavailable'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-sky-400/80 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {charHistory.geometry ? 'Polygon Geometry Active' : 'Boundary unavailable.'}
                </span>
              </div>

              {/* PRIMARY SAR MEASUREMENTS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Backscatter Change</span>
                  <p className="text-sm font-extrabold font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                    {charHistory.latest_delta_backscatter != null
                      ? `${charHistory.latest_delta_backscatter.toFixed(2)} dB`
                      : 'Unavailable'}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Affected Area</span>
                  <p className="text-sm font-extrabold font-mono text-white">
                    {charHistory.latest_affected_area != null
                      ? `${charHistory.latest_affected_area.toFixed(1)} km²`
                      : 'Unavailable'}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Evidence State</span>
                  <p className="text-xs font-mono font-bold text-slate-200 truncate mt-1">{charHistory.evidence_status}</p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-500/20 space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Self-Audit Verdict</span>
                  <p className="text-xs font-mono font-bold text-sky-300 truncate mt-1">{charHistory.audit_verdict}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: GROUND TRUTH REPORTS AGGREGATION */}
          <Card className="glass-panel border-sky-500/20 shadow-lg">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Ground Truth Verification Aggregation
                </CardTitle>
                {onNavigateToVerify && (
                  <Button
                    onClick={onNavigateToVerify}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-mono border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:text-white shrink-0"
                  >
                    Submit Ground Observation
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs text-slate-400 font-sans">
                Aggregated field verification reports submitted by ground observers.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-500/20 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-medium block">Total Reports</span>
                  <p className="text-lg font-mono font-extrabold text-white mt-0.5">{charHistory.ground_truth.total_reports}</p>
                </div>

                <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30 shadow-inner">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-medium block">Confirmed</span>
                  <p className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">{charHistory.ground_truth.confirmed_reports}</p>
                </div>

                <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-500/30 shadow-inner">
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-medium block">Denied</span>
                  <p className="text-lg font-mono font-extrabold text-rose-400 mt-0.5">{charHistory.ground_truth.denied_reports}</p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-500/20 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-medium block">Pending</span>
                  <p className="text-lg font-mono font-extrabold text-slate-300 mt-0.5">{charHistory.ground_truth.pending_reports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: THRESHOLD ALERT FOUNDATION */}
          {charHistory.alerts && charHistory.alerts.length > 0 && (
            <Card className="glass-panel border-sky-500/20">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                  Configured Anomaly Threshold Alert Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-2 space-y-2.5 text-xs">
                {charHistory.alerts.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
                    <div className="min-w-0 flex-1">
                      <span className="font-mono font-bold text-slate-200">
                        {a.metric_name} ({a.comparison} {a.threshold_value})
                      </span>
                      <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                        {a.triggered_state === 'TRIGGERED'
                          ? 'Observed change exceeded the configured threshold.'
                          : 'Alert configured and active.'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center ${
                        a.triggered_state === 'TRIGGERED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {a.triggered_state}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SECTION 4: HISTORICAL TIMELINE */}
          <Card className="glass-panel border-sky-500/20">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                Chronological Observation History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2 text-xs">
              {charHistory.historical_observations.length > 0 ? (
                <div className="space-y-3 border-l-2 border-sky-500/30 ml-2 pl-4">
                  {charHistory.historical_observations.map((evt) => (
                    <div key={evt.id} className="relative space-y-0.5">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-sky-400 ring-4 ring-slate-950" />
                      <p className="font-mono font-bold text-white leading-snug">{evt.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleString()} ({evt.phase.toUpperCase()})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic font-mono">Historical observation data unavailable.</p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: PROVENANCE LINEAGE */}
          {charHistory.provenance_records && charHistory.provenance_records.length > 0 && (
            <Card className="glass-panel border-sky-500/20">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  Lineage & Provenance Metadata ({charHistory.provenance_records.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-2 space-y-2 text-xs">
                {charHistory.provenance_records.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-sky-500/20 space-y-1 font-mono text-[11px] break-words shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-bold text-sky-300">
                      <span className="break-all">{p.product_id || p.collection_id || 'NASA Data'}</span>
                      <span className="text-slate-400 text-[10px] font-normal">{p.processing_method}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Calculation: {p.calculation_method || 'SPATIAL_TEMPORAL_CROSS_CORRELATION'} — Ref: {p.source_reference || 'NASA CMR'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* REUSE PHASE 4 CONFIDENCE WALL & CHANGE LENSES */}
          <div className="pt-2 space-y-6">
            <EvidenceConfidenceWall caseId={charHistory.case_id} />
          </div>
        </>
      )}
    </div>
  );
}
