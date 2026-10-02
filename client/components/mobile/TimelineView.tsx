'use client';

import React from 'react';
import { Calendar, Clock, ShieldCheck, ChevronRight, CheckCircle2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type TimelineResponse, type TimelineEventItem } from '@/lib/api';

interface TimelineViewProps {
  timeline: TimelineResponse | null;
  observationStart?: string;
  observationEnd?: string;
  onNavigateToVerify?: () => void;
}

export function TimelineView({
  timeline,
  observationStart,
  observationEnd,
  onNavigateToVerify,
}: TimelineViewProps) {
  const events = timeline?.events || [];

  const getPhaseBadge = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case 'before':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            BEFORE BASELINE
          </span>
        );
      case 'change':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            SAR DETECTION
          </span>
        );
      case 'after':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            VERIFICATION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {phase?.toUpperCase() || 'EVENT'}
          </span>
        );
    }
  };

  const formatDetailLabel = (key: string): string => {
    const map: Record<string, string> = {
      delta_backscatter: 'Change',
      affected_area: 'Affected Area',
      affected_area_sq_km: 'Affected Area',
      observation_time: 'Timestamp',
      observation_start: 'Start Window',
      observation_end: 'Close Window',
      product_id: 'Product ID',
      polarization: 'Polarization',
      orbit_pass: 'Pass Direction',
      confidence: 'Confidence',
      status: 'Status',
    };
    if (map[key]) return map[key];
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDetailValue = (key: string, val: any): string => {
    if (val == null) return 'N/A';
    if (typeof val === 'number') {
      if (key.includes('backscatter') || key.includes('change')) {
        return `${val > 0 ? '+' : ''}${val.toFixed(2)} dB`;
      }
      if (key.includes('area')) {
        return `${val.toFixed(1)} sq km`;
      }
      return val.toString();
    }
    if (typeof val === 'string' && (key.includes('time') || key.includes('date'))) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        return parsed.toUTCString();
      }
    }
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className="space-y-4 pb-6">
      <Card className="glass-panel border-amber-500/20 shadow-xl relative overflow-hidden bg-[#080d1a]/85">
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />

        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              Chronological Satellite Activity
            </CardTitle>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
              <Clock className="h-3 w-3" /> UTC SEQUENCE
            </span>
          </div>
          <CardDescription className="text-[11px] text-slate-400">
            Observation timeline from baseline reference through radar acquisition passes.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-1">
          {events.length > 0 ? (
            <div className="relative border-l-2 border-amber-500/40 ml-2.5 pl-4 sm:pl-5 space-y-4 my-2 pb-1">
              {events.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  {/* Step Circular Indicator */}
                  <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#080d1a] border-2 border-amber-400 flex items-center justify-center ring-4 ring-[#080d1a] shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                    <div className="w-1 h-1 rounded-full bg-amber-400" />
                  </div>

                  {/* Event Card */}
                  <div className="p-3 rounded-xl bg-slate-950/75 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-inner space-y-2">
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                      <span className="font-mono font-bold text-xs text-slate-100 leading-snug">
                        {item.title}
                      </span>
                      <div className="shrink-0">{getPhaseBadge(item.phase)}</div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{new Date(item.timestamp).toUTCString()}</span>
                    </div>

                    {/* Clean Readable Label/Value Cards (replacing raw JSON) */}
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-amber-500/15">
                        {Object.entries(item.details).map(([k, v]) => (
                          <div
                            key={k}
                            className="bg-slate-900/80 p-2 rounded-lg border border-amber-500/10 space-y-0.5"
                          >
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block truncate">
                              {formatDetailLabel(k)}
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-300 block truncate">
                              {formatDetailValue(k, v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-2 font-mono shadow-inner text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Declared Observation Window:</span>
                <span className="font-bold text-amber-300">
                  {observationStart ? new Date(observationStart).toLocaleDateString() : 'N/A'} –{' '}
                  {observationEnd ? new Date(observationEnd).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Timeline compiled from satellite granule acquisition timestamps. No simulated events.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 11. VERIFICATION REPORT CTA */}
      {onNavigateToVerify && (
        <Card className="glass-panel border-emerald-500/30 p-4 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="tech-corner-tl" />
          <div className="tech-corner-tr" />
          <div className="tech-corner-bl" />
          <div className="tech-corner-br" />

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTION // STEP 4
              </span>
              <h3 className="text-sm font-extrabold text-white font-mono mt-1">
                Close Loop With Ground Verification
              </h3>
              <p className="text-[11px] text-slate-400 font-sans leading-normal">
                Compare satellite radar readings with on-the-ground observations and submit a field audit report.
              </p>
            </div>

            <Button
              onClick={onNavigateToVerify}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 gap-2 flex items-center justify-center rounded-xl transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              Submit Verification Report
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
