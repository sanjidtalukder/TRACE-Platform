'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Volume2,
  VolumeX,
  Play,
  Square,
  AlertTriangle,
  Layers,
  Radar,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/lib/useHaptics';
import { fetchCases, fetchCaseDetail, type CaseDetailResponse, type CaseListItem } from '@/lib/api';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { CaseSelect } from '@/components/ui/CaseSelect';

interface FeelScreenProps {
  initialCaseId?: string | null;
  onNavigateToVerify?: () => void;
}

export function FeelScreen({ initialCaseId, onNavigateToVerify }: FeelScreenProps) {
  const {
    isPlaying,
    hapticsSupported,
    sensitivity,
    setSensitivity,
    isAudioMuted,
    setIsAudioMuted,
    feelDetails,
    startFeel,
    stopFeel,
  } = useHaptics();

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId || null);
  const [caseList, setCaseList] = useState<CaseListItem[]>([]);
  const [caseDetail, setCaseDetail] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load available cases
  useEffect(() => {
    fetchCases(1, 20)
      .then((res) => {
        if (res.items.length > 0) {
          setCaseList(res.items);
          if (!selectedCaseId) {
            setSelectedCaseId(res.items[0].case_id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch case detail when selectedCaseId changes
  useEffect(() => {
    if (!selectedCaseId) return;

    setLoading(true);
    fetchCaseDetail(selectedCaseId)
      .then((res) => {
        setCaseDetail(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [selectedCaseId]);

  const activeMeasurement = caseDetail?.nisar_measurements?.[0];
  const deltaValue = activeMeasurement?.delta_backscatter;

  const handleToggleFeel = () => {
    if (isPlaying) {
      stopFeel();
    } else if (deltaValue != null) {
      startFeel(deltaValue);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4">
      {/* SECTION 1: HEADER & CASE PICKER */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            Select Investigation to Feel
          </label>
          <span className="text-[9px] font-mono text-sky-400/80 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            HAPTIC SENSORY LINK
          </span>
        </div>

        {caseList.length > 0 && (
          <CaseSelect
            cases={caseList}
            selectedCaseId={selectedCaseId}
            onSelectCaseId={(id) => {
              stopFeel();
              setSelectedCaseId(id);
            }}
          />
        )}
      </div>

      {/* SECTION 2: HAPTICS SUPPORT NOTICE */}
      {!hapticsSupported && (
        <div className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-3 space-y-1 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-1.5 font-semibold font-mono text-[11px]">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            HAPTIC FEEDBACK UNAVAILABLE
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Browser/device does not support direct vibration API (e.g. iOS Safari). Audio pulse synthesizer is enabled.
          </p>
        </div>
      )}

      {/* SECTION 3: CORE FEEL DISPLAY */}
      {loading ? (
        <Card className="border-sky-500/20 bg-slate-950/60 backdrop-blur-md animate-pulse">
          <CardContent className="p-10 text-center space-y-3">
            <Radar className="h-10 w-10 text-sky-400 mx-auto animate-spin" />
            <p className="text-xs font-mono text-slate-400">CONNECTING SENSORY PIPELINE FROM TRACE BACKEND...</p>
          </CardContent>
        </Card>
      ) : caseDetail ? (
        <Card className="border-sky-500/25 bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* RADAR PULSE CANVAS / VISUALIZATION */}
          <div className="relative p-8 text-center border-b border-sky-500/20 bg-gradient-to-b from-sky-950/20 via-slate-950/40 to-transparent flex flex-col items-center justify-center min-h-[220px]">
            {/* Scientific Telemetry Corner Accents */}
            <div className="tech-corner-tl" />
            <div className="tech-corner-tr" />

            {/* Concentric Radar Waves & Central Sensor Core */}
            <div className="relative inline-flex items-center justify-center my-4">
              {/* Concentric expanding radar cyan/teal waves when triggered */}
              {isPlaying && (
                <>
                  <div className="absolute w-36 h-36 rounded-full border border-sky-400/80 pointer-events-none radar-wave-1" />
                  <div className="absolute w-36 h-36 rounded-full border border-cyan-400/80 pointer-events-none radar-wave-2" />
                  <div className="absolute w-36 h-36 rounded-full border border-teal-400/80 pointer-events-none radar-wave-3" />
                  <div className="absolute w-36 h-36 rounded-full border border-sky-300/80 pointer-events-none radar-wave-4" />
                </>
              )}

              {/* Ambient cyan glow background aura */}
              <div
                className={`absolute w-44 h-44 rounded-full transition-all duration-700 pointer-events-none ${
                  isPlaying
                    ? 'bg-sky-500/25 blur-xl opacity-100 scale-110'
                    : 'bg-sky-500/5 blur-md opacity-40 scale-90'
                }`}
              />

              {/* Concentric Radar Target Grid Circles */}
              <div className="relative w-36 h-36 rounded-full border border-sky-500/30 flex items-center justify-center bg-slate-950/80 shadow-[inset_0_0_30px_rgba(14,165,233,0.15)] overflow-hidden">
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 rounded-full border border-dashed border-sky-500/20" />
                <div className="absolute w-full h-[1px] bg-sky-500/20" />
                <div className="absolute h-full w-[1px] bg-sky-500/20" />

                {/* Rotating Radar Scanner Line Beam when active */}
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full overflow-hidden animate-radar-sweep pointer-events-none">
                    <div className="w-1/2 h-1/2 bg-gradient-to-br from-sky-400/35 to-transparent origin-bottom-right" />
                  </div>
                )}

                {/* Central Sensor Core */}
                <div
                  className={`relative z-10 w-20 h-20 rounded-full border flex items-center justify-center bg-slate-900/90 transition-all duration-300 ${
                    isPlaying
                      ? 'scale-105 shadow-[0_0_25px_rgba(56,189,248,0.5)] border-sky-400 bg-slate-900'
                      : 'shadow-[0_0_10px_rgba(56,189,248,0.15)] border-sky-500/40'
                  }`}
                >
                  <Activity
                    className={`h-9 w-9 text-sky-400 transition-transform duration-300 ${
                      isPlaying ? 'animate-pulse scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* CASE IDENTITY */}
            <div className="mt-3 space-y-1">
              <span className="text-[10px] font-mono font-extrabold text-sky-300 bg-sky-500/15 px-3 py-1 rounded-full border border-sky-400/30 tracking-widest shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                CASE // {caseDetail.case_id}
              </span>
              <h2 className="text-lg font-extrabold text-white capitalize mt-2 tracking-tight">
                {caseDetail.event_type}
              </h2>
            </div>
          </div>

          {/* MEASUREMENT METRICS */}
          <CardContent className="p-5 space-y-5">
            <div className="bg-slate-950/70 border border-sky-500/20 rounded-xl p-4 text-center space-y-1 shadow-inner relative">
              <div className="tech-corner-bl" />
              <div className="tech-corner-br" />

              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                Actual Backend NISAR Measurement
              </span>

              {deltaValue != null ? (
                <div className="space-y-0.5 pt-1">
                  <p className="text-3xl font-extrabold font-mono text-sky-300 tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                    {deltaValue > 0 ? '+' : ''}
                    {deltaValue.toFixed(2)} <span className="text-sm font-normal text-slate-400">dB</span>
                  </p>
                  {feelDetails && (
                    <p className="text-[11px] font-mono font-medium text-sky-400 pt-0.5">{feelDetails.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2 font-mono">
                  No scientific measurement recorded for this case.
                </p>
              )}
            </div>

            {/* CONTROLS (SENSITIVITY & AUDIO) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Sensitivity Control */}
              <div className="bg-slate-950/60 border border-sky-500/20 rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sliders className="h-3 w-3 text-sky-400" />
                  Haptic Scale
                </span>
                <div className="flex gap-1">
                  {[0.5, 1.0, 1.5, 2.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSensitivity(val)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                        sensitivity === val
                          ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {val}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Toggle */}
              <div className="bg-slate-950/60 border border-sky-500/20 rounded-xl p-3 space-y-2 flex flex-col justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  {isAudioMuted ? <VolumeX className="h-3 w-3 text-rose-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
                  Audio Pulse
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="h-7 text-[11px] font-mono w-full gap-1 border-sky-500/30 text-sky-300 hover:bg-sky-500/15"
                >
                  {isAudioMuted ? 'Unmute Audio' : 'Audio On'}
                </Button>
              </div>
            </div>

            {/* PRIMARY ACTION BUTTON */}
            <Button
              disabled={deltaValue == null}
              onClick={handleToggleFeel}
              className={`w-full h-12 text-xs font-mono font-bold uppercase tracking-wider gap-2 shadow-lg transition-all duration-300 ${
                isPlaying
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30 shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                  : 'bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.35)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="h-4 w-4 fill-current" />
                  Stop Physical Feedback
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Feel The Change
                </>
              )}
            </Button>

            {/* NEXT STEP ACTION: VERIFY */}
            {onNavigateToVerify && (
              <Button
                variant="outline"
                onClick={onNavigateToVerify}
                className="w-full h-9 text-xs font-mono gap-1.5 border-slate-800 text-slate-400 hover:text-white hover:border-sky-500/40 hover:bg-slate-900/60"
              >
                Proceed to VERIFY Ground Evidence
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-sky-500/20 text-center p-8 bg-slate-950/60 backdrop-blur-md">
          <p className="text-xs font-mono text-slate-400">Select a valid TRACE case to perceive feedback.</p>
        </Card>
      )}
    </div>
  );
}
