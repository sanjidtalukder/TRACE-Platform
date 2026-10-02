'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Radar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Filter,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { fetchGlobalEvents, fetchCaseDetail, type GlobalEventItem, type CaseDetailResponse } from '@/lib/api';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { HeroModuleHeader } from '@/components/mobile/HeroMissionHeader';

const PlanetaryRealMap = dynamic(
  () => import('@/components/scientific/PlanetaryRealMap').then((mod) => mod.PlanetaryRealMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[380px] md:h-[420px] bg-[#050914] flex flex-col items-center justify-center p-6 text-center space-y-2 font-mono">
        <Radar className="w-6 h-6 text-amber-400 animate-spin" />
        <span className="text-xs text-slate-300">INITIALIZING PLANETARY GEOGRAPHIC BASEMAP...</span>
      </div>
    ),
  }
);

const EVENT_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Event Types' },
  { value: 'WILDFIRE', label: 'Wildfire' },
  { value: 'FLOOD', label: 'Flood' },
  { value: 'EARTHQUAKE', label: 'Earthquake' },
  { value: 'DEFORESTATION', label: 'Deforestation' },
  { value: 'CHAR', label: 'Char River Change' },
];

const AUDIT_VERDICT_OPTIONS = [
  { value: 'ALL', label: 'All Verdicts' },
  { value: 'SUPPORTED', label: 'SUPPORTED' },
  { value: 'INCONCLUSIVE', label: 'INCONCLUSIVE' },
  { value: 'REJECTED', label: 'REJECTED' },
];

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
}

function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-[#080d1a] border border-amber-500/30 rounded-lg pl-3 pr-8 py-1.5 text-amber-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 cursor-pointer shadow-inner hover:border-amber-400/60 transition-colors flex items-center justify-between gap-1.5 text-left"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-amber-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-amber-300' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-full w-max max-w-[240px] bg-[#0A0E18] border border-amber-500/40 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(245,158,11,0.15)] py-1 font-mono text-xs overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? 'bg-amber-500/25 text-amber-200 font-semibold border-l-2 border-amber-400'
                    : 'text-slate-200 hover:bg-amber-500/15 hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface GlobalPulseViewProps {
  onSelectCase?: (caseId: string) => void;
}

export function GlobalPulseView({ onSelectCase }: GlobalPulseViewProps) {
  const [events, setEvents] = useState<GlobalEventItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterEventType, setFilterEventType] = useState<string>('ALL');
  const [filterAuditVerdict, setFilterAuditVerdict] = useState<string>('ALL');

  const loadGlobalEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = filterEventType === 'ALL' ? undefined : filterEventType;
      const auditParam = filterAuditVerdict === 'ALL' ? undefined : filterAuditVerdict;
      const res = await fetchGlobalEvents(typeParam, auditParam);
      setEvents(res.items);
      if (res.items.length > 0) {
        if (!selectedCaseId || !res.items.some((e) => e.case_id === selectedCaseId)) {
          setSelectedCaseId(res.items[0].case_id);
        }
      } else {
        setSelectedCaseId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch global pulse events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalEvents();
  }, [filterEventType, filterAuditVerdict]);

  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedCaseDetail(null);
      return;
    }

    let isMounted = true;
    fetchCaseDetail(selectedCaseId)
      .then((res) => {
        if (isMounted) setSelectedCaseDetail(res);
      })
      .catch(() => {
        if (isMounted) setSelectedCaseDetail(null);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCaseId]);

  const selectedEvent = events.find((e) => e.case_id === selectedCaseId) || events[0] || null;

  const isFiltered = filterEventType !== 'ALL' || filterAuditVerdict !== 'ALL';

  const resetFilters = () => {
    setFilterEventType('ALL');
    setFilterAuditVerdict('ALL');
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case 'SUPPORTED':
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            SUPPORTED
          </span>
        );
      case 'REJECTED':
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            REJECTED
          </span>
        );
      case 'INCONCLUSIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            INCONCLUSIVE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20">
            <HelpCircle className="w-3 h-3" />
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 pb-28 sm:pb-24">
      {/* MODULE ORIENTATION HERO HEADER */}
      <HeroModuleHeader
        module="pulse"
        statusBadge={
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
            {events.length} ACTIVE SURVEILLANCE EVENTS
          </span>
        }
        rightAction={
          <Button
            onClick={loadGlobalEvents}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-8 text-xs font-mono border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-white shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Pulse
          </Button>
        }
      />

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 sm:p-4 rounded-xl border border-amber-500/25 text-xs shadow-inner">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono font-medium text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" />
              Event Type:
            </span>
            <FilterSelect
              value={filterEventType}
              onChange={setFilterEventType}
              options={EVENT_TYPE_OPTIONS}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono font-medium text-[11px] uppercase tracking-wider">
              Audit Verdict:
            </span>
            <FilterSelect
              value={filterAuditVerdict}
              onChange={setFilterAuditVerdict}
              options={AUDIT_VERDICT_OPTIONS}
            />
          </div>

          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2 text-[10px] font-mono gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/15"
              title="Reset Filters to Default"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              Reset Filters
            </Button>
          )}
        </div>

        <span className="text-[11px] font-mono text-amber-400 shrink-0 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-bold self-start sm:self-center">
          {events.length} ACTIVE EVENT{events.length === 1 ? '' : 'S'}
        </span>
      </div>

      {/* ZERO RESULTS EMPTY STATE */}
      {!loading && events.length === 0 && (
        <Card className="glass-panel border-amber-500/30 shadow-xl p-6 text-center space-y-3 font-mono bg-[#080d1a]/85">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              No Surveillance Events Match Current Filters
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No active planetary cases found for {filterEventType !== 'ALL' ? `Type: ${filterEventType}` : ''}
              {filterEventType !== 'ALL' && filterAuditVerdict !== 'ALL' ? ' and ' : ''}
              {filterAuditVerdict !== 'ALL' ? `Verdict: ${filterAuditVerdict}` : ''}.
            </p>
          </div>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="h-8 text-xs font-mono border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset All Filters
          </Button>
        </Card>
      )}

      {/* PLANETARY REAL INTERACTIVE GEOGRAPHIC MAP */}
      <Card className="bg-slate-950/80 border-amber-500/25 overflow-hidden shadow-2xl relative">
        <CardHeader className="p-4 sm:p-5 pb-2 border-b border-amber-500/20 flex flex-row items-center justify-between bg-slate-900/40">
          <CardTitle className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Radar className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            Planetary Interactive Projection
          </CardTitle>
          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-400/30 shrink-0">
            WGS84 Equirectangular Grid
          </span>
        </CardHeader>
        <CardContent className="p-0 relative">
          <PlanetaryRealMap
            events={events}
            selectedCaseId={selectedCaseId}
            onSelectCase={(caseId) => setSelectedCaseId(caseId)}
            caseGeometry={selectedCaseDetail?.geometry}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* SELECTED CASE METADATA DRAWER / PANEL */}
      {selectedEvent && (
        <Card className="glass-panel border-amber-500/30 shadow-xl relative overflow-hidden bg-[#080d1a]/85">
          <div className="tech-corner-bl" />
          <div className="tech-corner-br" />

          <CardHeader className="p-4 sm:p-5 pb-2 flex flex-row items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-400/30">
                CASE // {selectedEvent.case_id}
              </span>
              <CardTitle className="text-base font-extrabold text-white mt-1.5 tracking-tight font-mono">
                {formatCaseLabel(selectedEvent)}
              </CardTitle>
            </div>
            {getVerdictBadge(selectedEvent.audit_verdict)}
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-2 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/20">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Coordinates</span>
                <p className="font-mono text-amber-300 font-semibold truncate mt-1">
                  {selectedEvent.latitude != null && selectedEvent.longitude != null
                    ? `${selectedEvent.latitude.toFixed(4)}°, ${selectedEvent.longitude.toFixed(4)}°`
                    : 'Unavailable'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Detection Window</span>
                <p className="font-mono text-slate-200 font-semibold truncate mt-1">
                  {new Date(selectedEvent.observation_start).toLocaleDateString()}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Ground Truth</span>
                <p className="font-mono text-slate-200 font-semibold mt-1">{selectedEvent.ground_truth_count} Reports</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Provenance</span>
                <p className="font-mono text-slate-200 font-semibold mt-1">{selectedEvent.provenance_count} Records</p>
              </div>
            </div>

            {onSelectCase && (
              <Button
                onClick={() => onSelectCase(selectedEvent.case_id)}
                className="w-full h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold uppercase tracking-wider gap-2 shadow-lg shadow-amber-500/25"
              >
                Open Mission Control
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
