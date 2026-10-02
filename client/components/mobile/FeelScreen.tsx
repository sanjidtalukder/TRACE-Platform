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
  Radio,
  Waves,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHaptics, type ToneType } from '@/lib/useHaptics';
import { computeFeelMapping } from '@/lib/feelMapping';
import { fetchCases, fetchCaseDetail, type CaseDetailResponse, type CaseListItem } from '@/lib/api';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { CaseSelect } from '@/components/ui/CaseSelect';
import { HeroModuleHeader } from '@/components/mobile/HeroMissionHeader';
import { AudioOscilloscope } from '@/components/scientific/AudioOscilloscope';

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
    toneType,
    setToneType,
    feelDetails,
    analyserRef,
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

  // Active deterministic details (computed live even when standby)
  const activeDetails =
    feelDetails ||
    (deltaValue != null ? computeFeelMapping(deltaValue, sensitivity) : null);

  const handleToggleFeel = () => {
    if (isPlaying) {
      stopFeel();
    } else if (deltaValue != null) {
      startFeel(deltaValue);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4">
      {/* MODULE ORIENTATION HERO HEADER */}
      <HeroModuleHeader
        module="feel"
        targetCaseLabel={caseDetail ? formatCaseLabel(caseDetail) : null}
        statusBadge={
          deltaValue != null ? (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/30">
              SIGNAL: {deltaValue > 0 ? '+' : ''}{deltaValue.toFixed(2)} dB
            </span>
          ) : null
        }
        compact
      />

      {/* SECTION 1: HEADER & CASE PICKER */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            Select Investigation Target
          </label>
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
            Browser/device does not support direct vibration API (e.g. iOS Safari). Audio pulse synthesizer & live visual oscilloscope are fully enabled.
          </p>
        </div>
      )}

      {/* SECTION 3: CORE FEEL DISPLAY */}
      {loading ? (
        <Card className="border-amber-500/20 bg-slate-950/60 backdrop-blur-md animate-pulse">
          <CardContent className="p-10 text-center space-y-3">
            <Radar className="h-10 w-10 text-amber-400 mx-auto animate-spin" />
            <p className="text-xs font-mono text-slate-400">CONNECTING SENSORY PIPELINE FROM TRACE BACKEND...</p>
          </CardContent>
        </Card>
      ) : caseDetail ? (
        <Card className="border-[#1A2338] bg-gradient-to-b from-[#0F1626]/90 to-[#0A0E18]/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* RADAR PULSE CANVAS / VISUALIZATION */}
          <div className="relative p-6 text-center border-b border-[#1A2338] bg-gradient-to-b from-amber-950/20 via-slate-950/40 to-transparent flex flex-col items-center justify-center min-h-[200px]">
            {/* Scientific Telemetry Corner Accents */}
            <div className="tech-corner-tl" />
            <div className="tech-corner-tr" />

            {/* Concentric Radar Waves & Central Sensor Core */}
            <div className="relative inline-flex items-center justify-center my-3">
              {/* Concentric expanding golden radar waves when triggered */}
              {isPlaying && (
                <>
                  <div className="absolute w-36 h-36 rounded-full border border-amber-400/80 pointer-events-none radar-wave-1" />
                  <div className="absolute w-36 h-36 rounded-full border border-yellow-500/80 pointer-events-none radar-wave-2" />
                  <div className="absolute w-36 h-36 rounded-full border border-amber-300/80 pointer-events-none radar-wave-3" />
                  <div className="absolute w-36 h-36 rounded-full border border-yellow-300/80 pointer-events-none radar-wave-4" />
                </>
              )}

              {/* Ambient amber glow background aura */}
              <div
                className={`absolute w-44 h-44 rounded-full transition-all duration-700 pointer-events-none ${
                  isPlaying
                    ? 'bg-amber-500/20 blur-xl opacity-100 scale-110'
                    : 'bg-amber-500/5 blur-md opacity-40 scale-90'
                }`}
              />

              {/* Concentric Radar Target Grid Circles */}
              <div className="relative w-36 h-36 rounded-full border border-amber-500/30 flex items-center justify-center bg-slate-950/80 shadow-[inset_0_0_30px_rgba(245,158,11,0.15)] overflow-hidden">
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/20" />
                <div className="absolute w-full h-[1px] bg-amber-500/20" />
                <div className="absolute h-full w-[1px] bg-amber-500/20" />

                {/* Rotating Radar Scanner Line Beam when active */}
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full overflow-hidden animate-radar-sweep pointer-events-none">
                    <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-400/35 to-transparent origin-bottom-right" />
                  </div>
                )}

                {/* Central Sensor Core */}
                <div
                  className={`relative z-10 w-20 h-20 rounded-full border flex items-center justify-center bg-slate-900/90 transition-all duration-300 ${
                    isPlaying
                      ? 'scale-105 shadow-[0_0_25px_rgba(245,158,11,0.5)] border-amber-400 bg-slate-900'
                      : 'shadow-[0_0_10px_rgba(245,158,11,0.15)] border-amber-500/40'
                  }`}
                >
                  <Activity
                    className={`h-9 w-9 text-amber-400 transition-transform duration-300 ${
                      isPlaying ? 'animate-pulse scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* CASE IDENTITY */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-mono font-extrabold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                CASE // {caseDetail.case_id}
              </span>
              <h2 className="text-base font-extrabold text-white mt-1.5 tracking-tight">
                {formatCaseLabel(caseDetail)}
              </h2>
            </div>
          </div>

          {/* MEASUREMENT METRICS & SENSORY LAB CONTROLS */}
          <CardContent className="p-5 space-y-4">
            {/* LIVE AUDIO OSCILLOSCOPE WAVEFORM VISUALIZER */}
            <AudioOscilloscope
              isPlaying={isPlaying}
              frequencyHz={activeDetails?.frequencyHz || 220}
              pulseMs={activeDetails?.pulseMs || 120}
              pauseMs={activeDetails?.pauseMs || 240}
              toneType={toneType}
              analyserRef={analyserRef}
            />

            {/* LIVE SONIFICATION TELEMETRY READOUT */}
            {activeDetails && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Radio className={`h-3.5 w-3.5 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                    Real-Time Sonification Readout
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                      isPlaying
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {isPlaying ? '● LIVE SYNTH ACTIVE' : '○ STANDBY'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/15 space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Audio Frequency
                    </span>
                    <p className="text-base font-extrabold text-amber-300 flex items-baseline gap-1">
                      {activeDetails.frequencyHz}{' '}
                      <span className="text-[11px] text-slate-400 font-normal">Hz</span>
                    </p>
                    <span className="text-[9px] text-amber-400/90 font-medium block">
                      {toneType === 'sine'
                        ? 'Pure Sine Tone'
                        : toneType === 'triangle'
                        ? 'L-Band Microwave'
                        : 'Radar Tactical Pulse'}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/15 space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Haptic Rhythm
                    </span>
                    <p className="text-base font-extrabold text-amber-400">
                      {activeDetails.pulseMs}ms{' '}
                      <span className="text-[10px] text-slate-400 font-normal">Pulse</span>
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium block">
                      Gap: {activeDetails.pauseMs}ms Pause
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>NISAR ΔdB: {deltaValue != null ? `${deltaValue > 0 ? '+' : ''}${deltaValue.toFixed(2)} dB` : 'N/A'}</span>
                  <span className="text-amber-400">PULSE MAG: {(activeDetails.normalizedMagnitude * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}

            {/* SOUND TYPE SELECTOR (TONE MODULATION) */}
            <div className="bg-slate-950/60 border border-[#1A2338] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5 text-amber-400" />
                  Tone Modulation (Waveform)
                </span>
                <span className="text-[9px] text-slate-500">Acoustic Mode</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'sine', label: 'Pure Sine', desc: 'Smooth Hum' },
                  { id: 'triangle', label: 'Microwave', desc: 'L-Band Harmonic' },
                  { id: 'square', label: 'Radar Beep', desc: 'Tactical Alert' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setToneType(tone.id as ToneType)}
                    className={`py-2 px-1 rounded-lg text-center transition-all ${
                      toneType === tone.id
                        ? 'bg-amber-500/15 border border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="block text-[11px] font-mono font-bold leading-tight text-amber-300">
                      {tone.label}
                    </span>
                    <span className="block text-[9px] text-slate-400 leading-tight mt-0.5">
                      {tone.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CONTROLS (SENSITIVITY & AUDIO) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Sensitivity Control */}
              <div className="bg-slate-950/60 border border-[#1A2338] rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sliders className="h-3 w-3 text-amber-400" />
                  Haptic Scale
                </span>
                <div className="flex gap-1">
                  {[0.5, 1.0, 1.5, 2.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSensitivity(val)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                        sensitivity === val
                          ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {val}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Toggle */}
              <div className="bg-slate-950/60 border border-[#1A2338] rounded-xl p-3 space-y-2 flex flex-col justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  {isAudioMuted ? <VolumeX className="h-3 w-3 text-rose-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
                  Audio Pulse
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="h-7 text-[11px] font-mono w-full gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/15"
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
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
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
                  Feel The Change (SAR Gold)
                </>
              )}
            </Button>

            {/* NEXT STEP ACTION: VERIFY */}
            {onNavigateToVerify && (
              <Button
                variant="outline"
                onClick={onNavigateToVerify}
                className="w-full h-9 text-xs font-mono gap-1.5 border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/40 hover:bg-slate-900/60"
              >
                Proceed to VERIFY Ground Evidence
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/20 text-center p-8 bg-slate-950/60 backdrop-blur-md">
          <p className="text-xs font-mono text-slate-400">Select a valid TRACE case to perceive feedback.</p>
        </Card>
      )}
    </div>
  );
}
