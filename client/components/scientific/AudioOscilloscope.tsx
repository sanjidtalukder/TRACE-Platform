'use client';

import React, { useEffect, useRef } from 'react';
import type { ToneType } from '@/lib/useHaptics';

interface AudioOscilloscopeProps {
  isPlaying: boolean;
  frequencyHz?: number;
  pulseMs?: number;
  pauseMs?: number;
  toneType?: ToneType;
  analyserRef?: React.MutableRefObject<AnalyserNode | null>;
  className?: string;
}

export function AudioOscilloscope({
  isPlaying,
  frequencyHz = 220,
  pulseMs = 120,
  pauseMs = 240,
  toneType = 'sine',
  analyserRef,
  className = '',
}: AudioOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Dark CRT Oscilloscope Screen Background
      ctx.fillStyle = '#060910';
      ctx.fillRect(0, 0, width, height);

      // 2. Oscilloscope Grid Divisions (Subtle Golden Grid)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';

      const gridCols = 8;
      const colStep = width / gridCols;
      for (let i = 1; i < gridCols; i++) {
        const x = Math.round(i * colStep) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const gridRows = 4;
      const rowStep = height / gridRows;
      for (let j = 1; j < gridRows; j++) {
        const y = Math.round(j * rowStep) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Center Zero-Axis Baseline
      const centerY = height / 2;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // 4. Amplitude & Voltage Labels
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.font = '9px monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('+1.0V', 6, 4);
      ctx.textBaseline = 'middle';
      ctx.fillText(' 0.0V', 6, centerY);
      ctx.textBaseline = 'bottom';
      ctx.fillText('-1.0V', 6, height - 4);

      // 5. Draw Waveform
      const analyser = analyserRef?.current;
      let hasRealAudio = false;

      if (isPlaying && analyser) {
        try {
          analyser.getByteTimeDomainData(dataArray);
          // Check if data is non-flat (has audio amplitude variance)
          let variance = 0;
          for (let i = 0; i < bufferLength; i += 4) {
            variance += Math.abs(dataArray[i] - 128);
          }
          if (variance > 10) {
            hasRealAudio = true;
          }
        } catch (e) {
          hasRealAudio = false;
        }
      }

      // Waveform Stroke Styling - SAR Gold / Microwave / Tactical
      ctx.shadowBlur = isPlaying ? 10 : 3;
      ctx.shadowColor = isPlaying
        ? toneType === 'square'
          ? '#f43f5e'
          : toneType === 'triangle'
          ? '#fbbf24'
          : '#f59e0b'
        : '#d97706';

      ctx.strokeStyle = isPlaying
        ? toneType === 'square'
          ? '#fb7185'
          : toneType === 'triangle'
          ? '#fde68a'
          : '#fbbf24'
        : 'rgba(245, 158, 11, 0.45)';

      ctx.lineWidth = isPlaying ? 2.4 : 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      if (hasRealAudio && isPlaying) {
        // Real-Time Web Audio Time-Domain Rendering
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // 0 to 2, 1 is center
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
      } else if (isPlaying) {
        // High-Precision Synthetic Waveform Model
        const cyclesOnScreen = Math.max(1.5, Math.min(6, frequencyHz / 80));
        phaseRef.current += (frequencyHz / 450) * 0.12;

        const points = 120;
        const amplitude = (height / 2) * 0.65;

        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const t = (i / points) * cyclesOnScreen * Math.PI * 2 + phaseRef.current;

          let waveVal = 0;
          if (toneType === 'sine') {
            waveVal = Math.sin(t);
          } else if (toneType === 'triangle') {
            waveVal = (2 / Math.PI) * Math.asin(Math.sin(t));
          } else if (toneType === 'square') {
            waveVal = Math.tanh(Math.sin(t) * 8);
          }

          const y = centerY - waveVal * amplitude;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      } else {
        // Standby Mode: Low-amplitude analog baseline jitter
        phaseRef.current += 0.03;
        const points = 60;
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const jitter = Math.sin(i * 0.4 + phaseRef.current) * 1.5;
          const y = centerY + jitter;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      ctx.stroke();
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, frequencyHz, toneType, analyserRef]);

  return (
    <div
      className={`relative rounded-xl border border-amber-500/25 bg-[#0C111E] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* Corner Bracket Accents */}
      <div className="tech-corner-tl" />
      <div className="tech-corner-tr" />
      <div className="tech-corner-bl" />
      <div className="tech-corner-br" />

      {/* Top Telemetry Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1A2338] bg-gradient-to-r from-amber-950/30 via-slate-950/60 to-amber-950/30 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isPlaying
                ? 'bg-amber-400 animate-ping shadow-[0_0_8px_#f59e0b]'
                : 'bg-slate-600'
            }`}
          />
          <span className="font-bold tracking-wider text-slate-300">
            {isPlaying ? 'LIVE OSCILLOSCOPE' : 'OSCILLOSCOPE STANDBY'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-400/90">
          <span className="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[9px] uppercase tracking-wider text-amber-300">
            {toneType} WAVE
          </span>
          <span className="font-bold text-amber-300">{frequencyHz} Hz</span>
        </div>
      </div>

      {/* Oscilloscope Canvas Screen */}
      <div className="relative w-full h-24">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Scanline CRT Glass Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Beam Sweep Phosphor Flash when active */}
        {isPlaying && (
          <div
            className="absolute inset-y-0 w-12 pointer-events-none bg-gradient-to-r from-transparent via-amber-400/15 to-transparent animate-pulse"
            style={{ left: '50%' }}
          />
        )}
      </div>

      {/* Bottom Telemetry Footer Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-[#1A2338] bg-slate-950/70 text-[9px] font-mono text-slate-400">
        <span className="tracking-wider">TIME BASE: 2.5ms/DIV</span>
        <span className="text-amber-300/90 font-medium">
          {isPlaying
            ? `PULSE: ${pulseMs}ms • GAP: ${pauseMs}ms`
            : 'SENSORY BUS: IDLE'}
        </span>
        <span className="tracking-wider uppercase">
          {isPlaying ? 'CARRIER LOCK' : 'CALIBRATED'}
        </span>
      </div>
    </div>
  );
}
