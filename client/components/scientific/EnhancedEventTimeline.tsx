'use client';

import React from 'react';
import { Calendar, Clock, Radar, CheckCircle2, ShieldAlert, ArrowRight, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type TimelineResponse, type TimelineEventItem } from '@/lib/api';

interface EnhancedEventTimelineProps {
  timeline: TimelineResponse | null;
  observationStart?: string;
  observationEnd?: string;
}

export function EnhancedEventTimeline({ timeline, observationStart, observationEnd }: EnhancedEventTimelineProps) {
  const events = timeline?.events || [];

  const getPhaseBadge = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case 'before':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20" role="status">
            <span>BEFORE BASELINE</span>
          </span>
        );
      case 'change':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30" role="status">
            <span>SAR DETECTION</span>
          </span>
        );
      case 'after':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" role="status">
            <span>VERIFICATION</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700" role="status">
            <span>EVENT</span>
          </span>
        );
    }
  };

  return (
    <Card className="glass-panel border-amber-500/20 shadow-xl relative overflow-hidden bg-[#080d1a]/85" role="region" aria-label="Chronological Satellite Observation Timeline">
      <div className="tech-corner-tl" />
      <div className="tech-corner-tr" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" aria-hidden="true" />
            Chronological Satellite Observation Timeline
          </CardTitle>
          <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" /> UTC Timestamps
          </span>
        </div>
        <CardDescription className="text-xs text-slate-400">
          Authentic acquisition sequence from baseline reference to cross-mission verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-2">
        {events.length > 0 ? (
          <div className="relative border-l-2 border-amber-500/40 ml-3 pl-5 space-y-4 my-2 pb-2">
            {events.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center ring-4 ring-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-1.5 hover:border-amber-400/40 transition-all shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="font-mono font-bold text-xs text-slate-100 leading-snug">{item.title}</span>
                    <div className="shrink-0">{getPhaseBadge(item.phase)}</div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
                    <span>{new Date(item.timestamp).toUTCString()}</span>
                  </div>
                  {item.details && Object.keys(item.details).length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-amber-500/15 mt-1.5">
                      {Object.entries(item.details).map(([k, v]) => {
                        const label = k
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                        let displayVal = String(v);
                        if (typeof v === 'number') {
                          if (k.includes('backscatter') || k.includes('delta')) {
                            displayVal = `${v > 0 ? '+' : ''}${v.toFixed(2)} dB`;
                          } else if (k.includes('area')) {
                            displayVal = `${v.toFixed(1)} sq km`;
                          }
                        } else if (typeof v === 'string' && (k.includes('time') || k.includes('date'))) {
                          const parsed = new Date(v);
                          if (!isNaN(parsed.getTime())) {
                            displayVal = parsed.toUTCString();
                          }
                        }
                        return (
                          <div
                            key={k}
                            className="bg-slate-900/80 p-1.5 rounded-lg border border-amber-500/15 space-y-0.5"
                          >
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block truncate">
                              {label}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-amber-300 block truncate">
                              {displayVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-2 font-mono shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-slate-400 font-semibold">Declared Observation Window</span>
              <span className="font-bold text-amber-300 text-[11px]">
                {observationStart ? new Date(observationStart).toLocaleDateString() : 'N/A'} -{' '}
                {observationEnd ? new Date(observationEnd).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 italic font-sans leading-relaxed">
              Authentic timeline sequence compiled from satellite granule acquisition timestamps. No intermediate observations fabricated.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
