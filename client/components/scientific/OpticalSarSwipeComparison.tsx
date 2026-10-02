'use client';

import React, { useState } from 'react';
import { Layers, Sliders, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * Utility to validate whether a URL string is browser-renderable inside an HTML <img> element.
 * Rejects null, undefined, empty strings, non-HTTP/HTTPS schemes (like s3://), and raw GeoTIFF files (.tif, .tiff).
 */
export function isBrowserRenderableImageUri(uri?: string | null): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const cleanUri = uri.trim().toLowerCase();

  // Must be an http://, https://, root-relative (/), or data:image/ URL
  if (
    !cleanUri.startsWith('http://') &&
    !cleanUri.startsWith('https://') &&
    !cleanUri.startsWith('/') &&
    !cleanUri.startsWith('data:image/')
  ) {
    return false;
  }

  // Reject raw raster/archive extensions that browsers cannot render natively in <img>
  if (cleanUri.endsWith('.tif') || cleanUri.endsWith('.tiff')) {
    return false;
  }

  return true;
}

interface OpticalSarSwipeComparisonProps {
  opticalUri?: string | null;
  sarUri?: string | null;
  opticalTitle?: string;
  sarTitle?: string;
  containerHeightClass?: string;
}

export function OpticalSarSwipeComparison({
  opticalUri,
  sarUri,
  opticalTitle = 'Optical Context Surface Imagery',
  sarTitle = 'NISAR L-band SAR Penetration Map',
  containerHeightClass = 'h-64 md:h-80',
}: OpticalSarSwipeComparisonProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [opticalFailed, setOpticalFailed] = useState<boolean>(false);
  const [sarFailed, setSarFailed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const isOpticalValid = isBrowserRenderableImageUri(opticalUri) && !opticalFailed;
  const isSarValid = isBrowserRenderableImageUri(sarUri) && !sarFailed;

  const hasOptical = Boolean(isOpticalValid);
  const hasSar = Boolean(isSarValid);

  const updatePositionFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setSliderPos(pct);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
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

  return (
    <Card
      className="glass-panel border-sky-500/20 shadow-xl relative overflow-hidden"
      role="region"
      aria-label="Optical vs SAR Swipe Comparison"
    >
      <div className="tech-corner-tl" />
      <div className="tech-corner-tr" />

      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" aria-hidden="true" />
              Optical vs. SAR X-Ray Multi-Sensor Comparison
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-400">
              Cross-examine visible ground reflectance with cloud-penetrating synthetic aperture radar backscatter.
            </CardDescription>
          </div>

          {/* Quick Preset Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-sky-500/20 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setSliderPos(100)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                sliderPos >= 90
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Optical Only
            </button>
            <button
              onClick={() => setSliderPos(50)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                sliderPos > 10 && sliderPos < 90
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              50/50 Split
            </button>
            <button
              onClick={() => setSliderPos(0)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                sliderPos <= 10
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SAR Radar Only
            </button>
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
          className={`relative w-full ${containerHeightClass} rounded-xl overflow-hidden border border-sky-500/20 bg-slate-950 flex items-center justify-center select-none shadow-inner cursor-ew-resize touch-none`}
        >
          {/* Base Layer: SAR Radar X-Ray */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            {hasSar ? (
              <img
                src={sarUri!}
                alt={sarTitle}
                onError={() => setSarFailed(true)}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2 font-mono">
                <Layers className="w-8 h-8 text-sky-400/80 animate-pulse" aria-hidden="true" />
                <div className="font-bold text-xs text-slate-200">{sarTitle}</div>
                <div className="text-[10px] text-slate-400">Real NISAR L-band SAR Backscatter Raster Payload</div>
              </div>
            )}

            {/* Persistent Right Badge: SAR Indicator */}
            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#060b17]/85 text-sky-300 border border-sky-400/30 backdrop-blur-md shadow-md">
                <Layers className="w-3 h-3 text-sky-400" />
                SAR PENETRATION • NISAR L-BAND
              </span>
            </div>
          </div>

          {/* Top Layer: Optical Surface View (Clipped by sliderPos) */}
          <div
            className="absolute inset-0 overflow-hidden border-r-2 border-sky-400 shadow-2xl bg-slate-950 flex items-center justify-center pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            {hasOptical ? (
              <img
                src={opticalUri!}
                alt={opticalTitle}
                onError={() => setOpticalFailed(true)}
                className="absolute inset-0 w-full h-full object-cover object-center max-w-none pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2 bg-slate-950/90 w-full h-full font-mono">
                <ImageIcon className="w-8 h-8 text-cyan-400/80" aria-hidden="true" />
                <div className="font-bold text-xs text-slate-200">{opticalTitle}</div>
                <div className="text-[10px] text-slate-400">Ground Field Photo / MODIS Surface Context</div>
              </div>
            )}

            {/* Persistent Left Badge: Optical Indicator */}
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#060b17]/85 text-cyan-300 border border-cyan-400/30 backdrop-blur-md shadow-md">
                <ImageIcon className="w-3 h-3 text-cyan-400" />
                OPTICAL SURFACE • MODIS / PHOTO
              </span>
            </div>
          </div>

          {/* Center Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.9)] pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center shadow-lg shadow-sky-500/50 cursor-ew-resize">
              <Sliders className="w-4 h-4 text-slate-950 stroke-[2.5px]" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Interactive Slider Input & Coordinate Readout */}
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-cyan-300 font-semibold">
              <ImageIcon className="w-3 h-3 text-cyan-400" aria-hidden="true" /> Optical View ({sliderPos}%)
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Drag image or slider to swipe
            </span>
            <span className="flex items-center gap-1 text-sky-300 font-semibold">
              <Layers className="w-3 h-3 text-sky-400" aria-hidden="true" /> SAR Penetration ({100 - sliderPos}%)
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            aria-label="Optical vs SAR swipe slider position"
            className="w-full h-2 bg-slate-950 border border-sky-500/20 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          />
        </div>

        {!hasOptical && !hasSar && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>No fabricated imagery used. Displaying default scientific dataset reference layers.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
