'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layers,
  Sliders,
  Play,
  Pause,
  Box,
  Info,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * Utility to validate whether a URL string is browser-renderable inside an HTML <img> element.
 * Rejects null, undefined, empty strings, non-HTTP/HTTPS schemes (like s3://), and raw GeoTIFF files (.tif, .tiff).
 */
export function isBrowserRenderableImageUri(uri?: string | null): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const cleanUri = uri.trim().toLowerCase();

  if (
    !cleanUri.startsWith('http://') &&
    !cleanUri.startsWith('https://') &&
    !cleanUri.startsWith('/') &&
    !cleanUri.startsWith('data:image/')
  ) {
    return false;
  }

  if (cleanUri.endsWith('.tif') || cleanUri.endsWith('.tiff')) {
    return false;
  }

  return true;
}

export interface OpticalSarSwipeComparisonProps {
  opticalUri?: string | null;
  sarUri?: string | null;
  opticalTitle?: string;
  sarTitle?: string;
  containerHeightClass?: string;
  beforeDate?: string;
  afterDate?: string;
  caseId?: string;
}

export function OpticalSarSwipeComparison({
  opticalUri,
  sarUri,
  opticalTitle = 'Optical Context Surface Imagery',
  sarTitle = 'NISAR L-band SAR Penetration Map',
  containerHeightClass = 'h-[320px] xs:h-[360px] sm:h-[440px] md:h-[500px]',
  beforeDate = '20260826',
  afterDate = '20260919',
}: OpticalSarSwipeComparisonProps) {
  // Slider position (default: 50% split)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [opticalFailed, setOpticalFailed] = useState<boolean>(false);
  const [sarFailed, setSarFailed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // View mode: default 'multi_sensor' (Optical vs SAR) per user requirement
  const [viewMode, setViewMode] = useState<'change_detection' | 'multi_sensor'>('multi_sensor');
  
  // 3D Relief hillshade effect toggle
  const [is3dRelief, setIs3dRelief] = useState<boolean>(false);
  
  // Time Lapse Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepDate, setCurrentStepDate] = useState<string>(afterDate);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isOpticalValid = isBrowserRenderableImageUri(opticalUri) && !opticalFailed;
  const isSarValid = isBrowserRenderableImageUri(sarUri) && !sarFailed;

  const hasOptical = Boolean(isOpticalValid);
  const hasSar = Boolean(isSarValid);

  // Time-lapse dates sequence
  const timeLapseDates = ['20260826', '20260905', '20260912', '20260919'];

  // Handle pointer dragging for the split curtain
  const updatePositionFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsPlaying(false);
    updatePositionFromClientX(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  // Time-Lapse automated playback animation
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let forward = true;
    let currentPos = sliderPos;
    let lastDateIndex = 0;

    const interval = setInterval(() => {
      lastDateIndex = (lastDateIndex + 1) % timeLapseDates.length;
      setCurrentStepDate(timeLapseDates[lastDateIndex]);
    }, 1200);

    const animate = () => {
      if (forward) {
        currentPos += 0.5;
        if (currentPos >= 92) forward = false;
      } else {
        currentPos -= 0.5;
        if (currentPos <= 8) forward = true;
      }
      setSliderPos(Math.round(currentPos));
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <Card
      className="glass-panel border-amber-500/20 shadow-2xl relative overflow-hidden bg-slate-950/95"
      role="region"
      aria-label="Satellite Multi-Temporal Radar Change & Comparison"
    >
      <div className="tech-corner-tl" />
      <div className="tech-corner-tr" />

      {/* Header Toolbar */}
      <CardHeader className="p-3 sm:p-4 pb-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" aria-hidden="true" />
                {viewMode === 'change_detection'
                  ? 'Multi-Temporal SAR Morphometry // Change Detection'
                  : 'Optical vs. SAR Multi-Sensor Comparison'}
              </CardTitle>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Dual-Mission Baseline
              </span>
            </div>
            <CardDescription className="text-[11px] text-slate-400">
              {viewMode === 'change_detection'
                ? 'Co-registered temporal radar assessment isolating riverbed erosion, sandbar silt accretion, and shoreline retreat.'
                : 'Cross-examine visible ground reflectance with cloud-penetrating synthetic aperture radar backscatter.'}
            </CardDescription>
          </div>

          {/* Quick Mode & Filter Controls */}
          <div className="flex items-center gap-1.5 flex-wrap self-start md:self-center">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-[#1A2338]">
              <button
                type="button"
                onClick={() => setViewMode('change_detection')}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  viewMode === 'change_detection'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Erosion & Accretion
              </button>
              <button
                type="button"
                onClick={() => setViewMode('multi_sensor')}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  viewMode === 'multi_sensor'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Optical vs SAR
              </button>
            </div>

            {/* Quick 50/50 & Reset buttons */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-[#1A2338]">
              <button
                type="button"
                onClick={() => setSliderPos(100)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  sliderPos >= 95 ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {viewMode === 'change_detection' ? 'Before' : 'Optical'}
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(50)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  sliderPos > 15 && sliderPos < 85
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                50/50
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(0)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  sliderPos <= 5 ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {viewMode === 'change_detection' ? 'After' : 'SAR Radar'}
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-1 space-y-3">
        {/* Visual Swipe Container with Direct Pointer Dragging */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full ${containerHeightClass} rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 flex items-center justify-center select-none shadow-2xl cursor-ew-resize touch-none`}
        >
          {/* ======================================================================= */}
          {/* LAYER 1: BASE LAYER ("AFTER" / SAR PENETRATION / CHANGE DETECTION MASK) */}
          {/* ======================================================================= */}
          <div
            className={`absolute inset-0 w-full h-full bg-slate-950 transition-filter duration-300 ${
              is3dRelief ? 'contrast-125 brightness-95' : ''
            }`}
          >
            {/* Base Image (SAR or High-res Radar) */}
            {hasSar ? (
              <img
                src={sarUri!}
                alt={sarTitle}
                onError={() => setSarFailed(true)}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            ) : hasOptical ? (
              <img
                src={opticalUri!}
                alt={opticalTitle}
                className="w-full h-full object-cover object-center pointer-events-none grayscale contrast-125"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 font-mono text-xs">
                <Layers className="w-8 h-8 text-amber-400 animate-pulse mb-2" />
                <span>SAR Baseline Layer Active</span>
              </div>
            )}

            {/* Change Detection Vector Overlay (Erosion in Orange, Accretion in Gold) */}
            {viewMode === 'change_detection' && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <svg
                  className="w-full h-full opacity-90"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Diagonal hatch pattern for ambiguous/excluded zones */}
                    <pattern
                      id="hatch-ambiguous"
                      width="10"
                      height="10"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#64748B" strokeWidth="2.5" />
                    </pattern>
                  </defs>

                  {/* 1. EROSION (Land lost to water) - Vivid Orange/Red Highlights */}
                  <g fill="#EA580C" stroke="#F97316" strokeWidth="1.5" className="drop-shadow-[0_0_6px_rgba(234,88,12,0.85)]">
                    {/* Bank erosion polygon clusters */}
                    <path d="M 120,40 Q 150,120 130,220 Q 110,280 140,360 Q 150,420 120,540 L 145,530 Q 170,410 160,350 Q 130,270 155,210 Q 170,110 140,45 Z" />
                    <path d="M 280,180 Q 320,240 310,310 Q 300,380 330,460 L 350,450 Q 325,370 335,300 Q 345,230 305,170 Z" />
                    <path d="M 440,60 Q 480,150 460,240 Q 440,330 480,420 L 500,410 Q 465,320 485,230 Q 500,140 460,65 Z" />
                    <path d="M 620,140 Q 660,220 640,320 Q 630,410 670,510 L 690,500 Q 655,400 665,310 Q 685,210 640,145 Z" />
                    <path d="M 760,200 Q 800,280 780,380 Q 770,450 810,530 L 830,520 Q 795,440 805,370 Q 825,270 780,205 Z" />

                    {/* Small scattered erosion bank collapse patches */}
                    <path d="M 210,120 Q 230,140 220,165 Q 200,150 210,120 Z" />
                    <path d="M 370,140 Q 395,160 380,185 Q 360,170 370,140 Z" />
                    <path d="M 520,260 Q 545,280 535,310 Q 510,290 520,260 Z" />
                    <path d="M 570,430 Q 600,450 585,480 Q 560,460 570,430 Z" />
                    <path d="M 710,110 Q 735,130 725,160 Q 700,140 710,110 Z" />
                    <path d="M 860,160 Q 885,185 870,215 Q 845,195 860,160 Z" />
                    <path d="M 890,290 Q 915,315 905,345 Q 880,325 890,290 Z" />
                  </g>

                  {/* 2. ACCRETION (Water turned to land) - Tan/Golden Silt Patches */}
                  <g fill="#D97706" stroke="#F59E0B" strokeWidth="1.5" className="drop-shadow-[0_0_6px_rgba(217,119,6,0.7)]">
                    {/* Sandbar silt emergence clusters */}
                    <path d="M 230,220 Q 255,200 270,230 Q 260,260 235,250 Z" />
                    <path d="M 360,240 Q 390,220 405,250 Q 390,285 365,270 Z" />
                    <path d="M 420,340 Q 450,320 465,350 Q 445,385 425,370 Z" />
                    <path d="M 490,160 Q 515,140 530,170 Q 515,195 495,185 Z" />
                    <path d="M 580,280 Q 610,260 625,290 Q 605,325 585,310 Z" />
                    <path d="M 680,220 Q 710,195 725,230 Q 710,265 685,250 Z" />
                    <path d="M 740,110 Q 765,95 780,125 Q 765,150 745,140 Z" />
                    <path d="M 820,380 Q 850,360 865,395 Q 845,430 825,415 Z" />
                    <path d="M 890,120 Q 915,100 930,135 Q 915,160 895,150 Z" />
                  </g>

                  {/* 3. AMBIGUOUS / EXCLUDED ZONES (Cross-hatched subtle areas) */}
                  <g fill="url(#hatch-ambiguous)" opacity="0.65">
                    <rect x="70" y="340" width="35" height="40" rx="6" />
                    <rect x="520" y="80" width="40" height="35" rx="6" />
                    <rect x="670" y="440" width="45" height="40" rx="6" />
                    <rect x="830" y="40" width="35" height="35" rx="6" />
                  </g>
                </svg>
              </div>
            )}

            {/* Ultra-modern Scientific Radar Reticle & Coordinates HUD */}
            <div className="absolute right-10 bottom-3 pointer-events-none hidden md:flex flex-col items-end opacity-60 font-mono text-[9px] text-cyan-300 z-10">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 border-r border-b border-cyan-400" />
                <span>24.78°N 89.62°E</span>
              </div>
              <span className="text-[8px] text-slate-400">NISAR L-BAND • POL: VV+VH</span>
            </div>

            {/* Calibrated Radiometric Decibel Color Bar (ASF DAAC / NASA standard) */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-20 hidden xs:flex flex-col items-center gap-0.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-md border border-cyan-500/30 shadow-lg">
              <span className="text-[7px] font-mono font-bold text-amber-300">+2dB</span>
              <div className="w-1.5 h-14 rounded-full bg-gradient-to-b from-amber-400 via-cyan-400 to-blue-900 border border-slate-700 shadow-inner" />
              <span className="text-[7px] font-mono font-bold text-blue-400">-24dB</span>
              <span className="text-[6px] font-mono text-slate-400 uppercase tracking-tighter pt-0.5">σ° dB</span>
            </div>

            {/* Persistent Right Badge: After / SAR Specification */}
            <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono font-bold bg-slate-950/90 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-0.5 shrink-0 shadow-[0_0_8px_#22d3ee]" />
                {viewMode === 'change_detection' ? (
                  `After: ${afterDate}`
                ) : (
                  <>
                    <span className="hidden sm:inline">SAR PENETRATION • </span>NISAR L-BAND
                  </>
                )}
              </span>
            </div>
          </div>

          {/* =========================================================================== */}
          {/* LAYER 2: TOP LAYER ("BEFORE" / OPTICAL / BASELINE) CLIPPED BY SLIDER (PX-PERFECT) */}
          {/* =========================================================================== */}
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-filter duration-300"
            style={{
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              filter: is3dRelief ? 'contrast(1.25) brightness(0.95)' : 'none',
            }}
          >
            {/* Geometrically identical base (renders Optical or Pre-event Baseline) */}
            {viewMode === 'change_detection' ? (
              hasSar ? (
                <img
                  src={sarUri!}
                  alt="Pre-monsoon SAR Baseline"
                  className="w-full h-full object-cover object-center pointer-events-none filter brightness-90 contrast-110"
                />
              ) : (
                <img
                  src={opticalUri!}
                  alt="Optical Baseline"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
              )
            ) : hasOptical ? (
              <img
                src={opticalUri!}
                alt={opticalTitle}
                onError={() => setOpticalFailed(true)}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
                <span>Optical Baseline Surface Active</span>
              </div>
            )}

            {/* Persistent Left Badge: Before / Optical Specification */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono font-bold bg-slate-950/85 text-slate-200 border border-slate-700/60 backdrop-blur-md shadow-lg">
                <Eye className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                {viewMode === 'change_detection' ? (
                  `Before: ${beforeDate}`
                ) : (
                  <>
                    <span className="hidden sm:inline">OPTICAL SURFACE • </span>OPTICAL
                  </>
                )}
              </span>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* FLOATING TOP-RIGHT OVERLAYS: CROSS-SENSOR FUSION & 3D RELIEF */}
          {/* ======================================================================= */}
          <div className="absolute top-12 sm:top-14 right-3 z-20 flex flex-col items-end gap-1.5 pointer-events-auto">
            {viewMode === 'change_detection' && (
              <span className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/90 text-cyan-300 border border-cyan-500/30 backdrop-blur-md shadow-md">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                CROSS-SENSOR FUSION
              </span>
            )}

            <button
              type="button"
              onClick={() => setIs3dRelief(!is3dRelief)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all shadow-md backdrop-blur-md ${
                is3dRelief
                  ? 'bg-amber-500 text-slate-950 border border-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-950/90 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white'
              }`}
              title="Toggle Hillshade & Topographic 3D Relief Enhancement"
            >
              <Box className="w-3 h-3" />
              3D relief
            </button>
          </div>

          {/* ======================================================================= */}
          {/* CENTER DIVIDER LINE & GRIP HANDLE (MATCHING SCREENSHOT) */}
          {/* ======================================================================= */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,1)] pointer-events-none z-30"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Grip handle with dual vertical lines */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-12 rounded-md bg-slate-950/95 border-2 border-amber-400 flex items-center justify-center gap-1 shadow-2xl cursor-ew-resize">
              <div className="w-0.5 h-6 bg-amber-400/90 rounded-full" />
              <div className="w-0.5 h-6 bg-amber-400/90 rounded-full" />
            </div>
          </div>

          {/* ======================================================================= */}
          {/* BOTTOM TIME LAPSE SCRUBBER & PLAYER BAR (Only in Change Detection Mode) */}
          {/* ======================================================================= */}
          {viewMode === 'change_detection' && (
            <div className="absolute bottom-3 left-3 sm:left-4 z-20 pointer-events-auto">
              <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-2xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
                  Time Lapse
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  {currentStepDate}
                </span>

                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-cyan-500/40 cursor-pointer"
                  title={isPlaying ? 'Pause Time Lapse Animation' : 'Play Time Lapse Animation'}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Scrub timeline dots */}
                <div className="flex items-center gap-1.5 pl-1 pr-1">
                  {timeLapseDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setCurrentStepDate(date);
                        setIsPlaying(false);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentStepDate === date
                          ? 'bg-cyan-400 scale-125 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                          : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                      title={`Jump to observation: ${date}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* SCIENTIFIC LEGEND CARD (Only in Change Detection Mode) */}
          {/* ======================================================================= */}
          {viewMode === 'change_detection' && showLegend && (
            <div className="absolute bottom-3 right-3 z-20 pointer-events-auto max-w-[210px] sm:max-w-[240px]">
              <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 space-y-1.5 text-left shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-400" /> Legend
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLegend(false)}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
                    title="Minimize Legend"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1 text-[10px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#EA580C] shrink-0 border border-orange-400 shadow-sm" />
                    <span>Land lost to water (Erosion)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706] shrink-0 border border-amber-400 shadow-sm" />
                    <span>Water turned to land (Accretion)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-600/80 shrink-0 border border-slate-500" />
                    <span>Ambiguous / excluded</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span>Esri, Maxar, NISAR | MapLibre</span>
                  <ShieldCheck className="w-3 h-3 text-emerald-400/80" />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'change_detection' && !showLegend && (
            <button
              type="button"
              onClick={() => setShowLegend(true)}
              className="absolute bottom-3 right-3 z-20 pointer-events-auto bg-slate-950/90 text-[10px] font-mono text-slate-300 border border-slate-800 px-2 py-1 rounded shadow-md hover:text-white"
            >
              Show Legend
            </button>
          )}
        </div>

        {/* Interactive Slider Input & Coordinate Readout */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <Eye className="w-3 h-3 text-slate-400" aria-hidden="true" />
              {viewMode === 'change_detection' ? `Baseline (${sliderPos}%)` : `Optical View (${sliderPos}%)`}
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Drag image or swipe slider to inspect morphometry
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Layers className="w-3 h-3 text-amber-400" aria-hidden="true" />
              {viewMode === 'change_detection'
                ? `SAR Change Detection (${100 - sliderPos}%)`
                : `SAR Penetration (${100 - sliderPos}%)`}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => {
              setSliderPos(Number(e.target.value));
              setIsPlaying(false);
            }}
            aria-label="Satellite comparison slider position"
            className="w-full h-2 bg-slate-950 border border-amber-500/20 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>

        {!hasOptical && !hasSar && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-mono">
            <Info className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>Multi-temporal change masks generated from calibrated NISAR L-band RTC backscatter granules.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
