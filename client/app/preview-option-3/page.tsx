'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Layers,
  Radar,
  Radio,
  Sliders,
  CheckCircle2,
  Play,
  Square,
  ArrowRight,
  Globe2,
  TreePine,
} from 'lucide-react';

export default function Option3PreviewPage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedTone, setSelectedTone] = useState<'sine' | 'microwave' | 'radar'>('microwave');

  return (
    <div className="min-h-screen bg-[#050A10] text-[#E2E8F0] selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* AMBIENT BACKGROUND TEXTURE - EARTH GRID */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(16, 185, 129, 0.1), transparent 70%), linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* TOP OPTION SWITCHER BAR */}
      <div className="bg-[#08101A] border-b border-[#132230] py-2 px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-slate-400 font-bold uppercase mr-1 text-[11px]">Compare Options:</span>
            <Link
              href="/preview-sar-gold"
              className="px-3 py-1 rounded-md bg-[#0D1824] text-slate-400 hover:text-white border border-[#16273A] transition-all"
            >
              Option 1: SAR Gold
            </Link>
            <Link
              href="/preview-option-2"
              className="px-3 py-1 rounded-md bg-[#0D1824] text-slate-400 hover:text-white border border-[#16273A] transition-all"
            >
              Option 2: Space-Tech
            </Link>
            <span className="px-3 py-1 rounded-md bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400/40">
              Option 3: Earth Observation (Active)
            </span>
          </div>
          <Link
            href="/"
            className="text-[11px] text-slate-400 hover:text-white transition-all flex items-center gap-1"
          >
            Back to App <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 relative">
        {/* BANNER: DESIGN COMPARISON EXPLANATION */}
        <div className="bg-[#08121C] border border-emerald-500/25 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
                Option 3: Earth Observation Dual-Contrast (Copernicus / UNEP Style)
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Vibrant Ecological Emerald & Radar Topaz
              </h1>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                জলবায়ু বিজ্ঞান ও ভূ-উপগ্রহ পর্যবেক্ষণের আসল রঙের ছোঁয়া। নিরাপদ চর ও বনায়নের জন্য ভাইব্রেন্ট আর্থ-এমারেল্ড এবং বন্যা ও প্লাবনের রাডার সিগন্যালের জন্য সতর্কতামূলক সানসেট টোপাজ/কমলা অ্যাকসেন্ট।
              </p>
            </div>
            <div className="shrink-0">
              <span className="bg-[#0E1E2C] border border-[#1A334A] text-emerald-300 text-xs px-3 py-1.5 rounded-lg font-mono">
                Palette: Emerald + Topaz
              </span>
            </div>
          </div>
        </div>

        {/* 3-COLUMN DEMO INTERFACE SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARD 1: RADAR SENSORY DISPLAY (FEEL MODULE MOCKUP) */}
          <div className="md:col-span-2 bg-[#071018] border border-[#122230] rounded-xl overflow-hidden shadow-2xl">
            {/* CARD HEADER */}
            <div className="px-5 py-3.5 border-b border-[#122230] bg-[#0A1622]/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  Radar Sonification Oscilloscope
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                FREQUENCY: 172 Hz
              </span>
            </div>

            {/* EMERALD OSCILLOSCOPE SCREEN */}
            <div className="p-5 space-y-4">
              <div className="relative rounded-lg border border-[#14283A] bg-[#04080D] p-4 overflow-hidden shadow-inner">
                {/* Earth Radar Grid */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
                    backgroundSize: '30px 24px',
                  }}
                />

                {/* Oscilloscope Header */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    TRANSMITTING // TIME-DOMAIN
                  </span>
                  <span>5ms / DIV • 44.1 kHz</span>
                </div>

                {/* SVG Vibrant Emerald Waveform */}
                <div className="h-24 w-full flex items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#10b981" strokeOpacity="0.2" strokeDasharray="3 3" />
                    <path
                      d="M0,40 Q25,10 50,40 T100,40 T150,40 T200,40 T250,40 T300,40 T350,40 T400,40"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                    />
                  </svg>
                </div>

                {/* Telemetry Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-[#10202E]">
                  <span>PULSE INTERVAL: <strong className="text-emerald-300">98ms</strong></span>
                  <span>CARRIER: <strong className="text-emerald-300">BIO-ACOUSTIC SINE</strong></span>
                  <span>STATUS: <strong className="text-emerald-400">CALIBRATED</strong></span>
                </div>
              </div>

              {/* TONE SELECTION BUTTONS */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Tone Modulation Mode</span>
                  <span className="text-emerald-400/80">3 Ecological Presets</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sine', label: 'Hydrology Sine', desc: 'River Basin' },
                    { id: 'microwave', label: 'L-Band Radar', desc: 'Vegetation Canopy' },
                    { id: 'radar', label: 'Flood Alert', desc: 'Tactical Topaz' },
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id as any)}
                      className={`p-2.5 rounded-lg text-left transition-all border ${
                        selectedTone === tone.id
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-[#0B1520] border-[#142636] text-slate-400 hover:text-white hover:border-[#1E384E]'
                      }`}
                    >
                      <span className="block text-xs font-mono font-bold text-emerald-300">{tone.label}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{tone.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION TOGGLE */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-full py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
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
                    Feel The Change (Earth Eco)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CARD 2: SCIENTIFIC TELEMETRY CARD */}
          <div className="space-y-4">
            {/* BACKSCATTER DELTA CARD (DUAL CONTRAST: TOPAZ ORANGE FOR RADAR ANOMALY) */}
            <div className="bg-[#071018] border border-[#122230] rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#122230] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Sentinel-1 / NISAR
                </span>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  RADAR ANOMALY
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block">Backscatter Variance (ΔdB)</span>
                {/* DUAL CONTRAST: TOPAZ / ORANGE FOR FLOOD */}
                <p className="text-3xl font-mono font-black text-amber-400 tracking-tight mt-1">
                  -3.42 <span className="text-sm font-normal text-slate-400">dB</span>
                </p>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  Deep water absorption indicating sudden flood inundation in char region.
                </p>
              </div>

              {/* METRIC PILLS */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                <div className="bg-[#0A1622] p-2.5 rounded-lg border border-[#132636]">
                  <span className="text-[9px] text-slate-400 uppercase block">Land Biomass</span>
                  <span className="font-bold text-emerald-400">Dense Canopy</span>
                </div>
                <div className="bg-[#0A1622] p-2.5 rounded-lg border border-[#132636]">
                  <span className="text-[9px] text-slate-400 uppercase block">Soil Saturation</span>
                  <span className="font-bold text-amber-400">High Moisture</span>
                </div>
              </div>
            </div>

            {/* COLOR PALETTE REFERENCE SWATCHES */}
            <div className="bg-[#071018] border border-[#122230] rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Palette Swatches
              </span>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#10B981] shadow-[0_0_8px_#10b981] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Earth Emerald (#10B981)</span>
                    <span className="text-[10px] text-slate-400">Primary nature & vegetation biomass</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#F59E0B] shadow-[0_0_8px_#f59e0b] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Radar Topaz (#F59E0B)</span>
                    <span className="text-[10px] text-slate-400">Active radar variance & flood alerts</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#050A10] border border-[#122230] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Deep Forest Slate (#050A10)</span>
                    <span className="text-[10px] text-slate-400">Subtle oceanic night backdrop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
