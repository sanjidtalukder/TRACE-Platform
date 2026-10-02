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
  Sparkles,
  Zap,
} from 'lucide-react';

export default function Option2PreviewPage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedTone, setSelectedTone] = useState<'sine' | 'microwave' | 'radar'>('microwave');

  return (
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* AMBIENT BACKGROUND TEXTURE - LINEAR SUBTLE GLOW */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(99, 102, 241, 0.12), transparent 70%), linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      />

      {/* TOP OPTION SWITCHER BAR */}
      <div className="bg-[#0B0E17] border-b border-[#1A1F2C] py-2 px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-slate-400 font-bold uppercase mr-1 text-[11px]">Compare Options:</span>
            <Link
              href="/preview-sar-gold"
              className="px-3 py-1 rounded-md bg-[#121624] text-slate-400 hover:text-white border border-[#1E2538] transition-all"
            >
              Option 1: SAR Gold
            </Link>
            <span className="px-3 py-1 rounded-md bg-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)] border border-indigo-400/40">
              Option 2: Space-Tech (Active)
            </span>
            <Link
              href="/preview-option-3"
              className="px-3 py-1 rounded-md bg-[#121624] text-slate-400 hover:text-white border border-[#1E2538] transition-all"
            >
              Option 3: Earth Observation
            </Link>
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
        <div className="bg-[#0B0E17] border border-[#1F2637] rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Option 2: Silicon Valley Space-Tech (Linear / Vercel Pro Style)
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Precision Minimalism & High-Tech Obsidian
              </h1>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                SpaceX, Linear ও Vercel-এর মতো চরম মার্জিত মিনিমালিস্ট ডিজাইন। নিওন ব্লু-এর বদলে এতে রয়েছে ডিপ অবসিডিয়ান ব্ল্যাক, আল্ট্রা-রিফাইন্ড মাইক্রো-বর্ডার এবং ইলেকট্রিক ভায়োলেট ও পিওর হোয়াইট টাইপোগ্রাফির মেলবন্ধন।
              </p>
            </div>
            <div className="shrink-0">
              <span className="bg-[#141824] border border-[#232B3E] text-indigo-300 text-xs px-3 py-1.5 rounded-lg font-mono">
                Palette: Obsidian + Violet
              </span>
            </div>
          </div>
        </div>

        {/* 3-COLUMN DEMO INTERFACE SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARD 1: RADAR SENSORY DISPLAY (FEEL MODULE MOCKUP) */}
          <div className="md:col-span-2 bg-[#0A0D15] border border-[#1C2232] rounded-xl overflow-hidden shadow-2xl">
            {/* CARD HEADER */}
            <div className="px-5 py-3.5 border-b border-[#181E2C] bg-[#0E121D]/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  Radar Sonification Oscilloscope
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25 font-semibold">
                FREQUENCY: 172 Hz
              </span>
            </div>

            {/* VIOLET-INDIGO OSCILLOSCOPE SCREEN */}
            <div className="p-5 space-y-4">
              <div className="relative rounded-lg border border-[#1E2536] bg-[#05070B] p-4 overflow-hidden shadow-inner">
                {/* Micro Grid */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #818cf8 1px, transparent 1px), linear-gradient(to bottom, #818cf8 1px, transparent 1px)',
                    backgroundSize: '28px 24px',
                  }}
                />

                {/* Oscilloscope Header */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1 text-indigo-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    TRANSMITTING // TIME-DOMAIN
                  </span>
                  <span>5ms / DIV • 44.1 kHz</span>
                </div>

                {/* SVG Electric Violet Waveform */}
                <div className="h-24 w-full flex items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#818cf8" strokeOpacity="0.2" strokeDasharray="3 3" />
                    <path
                      d="M0,40 Q25,10 50,40 T100,40 T150,40 T200,40 T250,40 T300,40 T350,40 T400,40"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_0_10px_rgba(129,140,248,0.7)]"
                    />
                  </svg>
                </div>

                {/* Telemetry Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-[#161B28]">
                  <span>PULSE INTERVAL: <strong className="text-indigo-300">98ms</strong></span>
                  <span>CARRIER: <strong className="text-indigo-300">SINE MODULATED</strong></span>
                  <span>STATUS: <strong className="text-emerald-400">CALIBRATED</strong></span>
                </div>
              </div>

              {/* TONE SELECTION BUTTONS */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Tone Modulation Mode</span>
                  <span className="text-indigo-400/80">3 Precision Presets</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sine', label: 'Pure Sine', desc: 'Hydrology Hum' },
                    { id: 'microwave', label: 'Microwave', desc: 'Electric Harmonic' },
                    { id: 'radar', label: 'Tactical Beep', desc: 'Anomaly Alert' },
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id as any)}
                      className={`p-2.5 rounded-lg text-left transition-all border ${
                        selectedTone === tone.id
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                          : 'bg-[#0E121B] border-[#1C2333] text-slate-400 hover:text-white hover:border-[#283248]'
                      }`}
                    >
                      <span className="block text-xs font-mono font-bold text-indigo-300">{tone.label}</span>
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
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]'
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
                    Feel The Change (Space-Tech)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CARD 2: SCIENTIFIC TELEMETRY CARD */}
          <div className="space-y-4">
            {/* BACKSCATTER DELTA CARD */}
            <div className="bg-[#0A0D15] border border-[#1C2232] rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#181E2C] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Sentinel-1 / NISAR
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  PASS CONFIRMED
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block">Backscatter Variance (ΔdB)</span>
                <p className="text-3xl font-mono font-black text-indigo-400 tracking-tight mt-1">
                  -3.42 <span className="text-sm font-normal text-slate-400">dB</span>
                </p>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  Deep water absorption indicating sudden flood inundation in char region.
                </p>
              </div>

              {/* METRIC PILLS */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                <div className="bg-[#0F131E] p-2.5 rounded-lg border border-[#1B2232]">
                  <span className="text-[9px] text-slate-400 uppercase block">Polarization</span>
                  <span className="font-bold text-indigo-300">VH / VV Cross</span>
                </div>
                <div className="bg-[#0F131E] p-2.5 rounded-lg border border-[#1B2232]">
                  <span className="text-[9px] text-slate-400 uppercase block">Confidence</span>
                  <span className="font-bold text-emerald-400">99.8% Ground</span>
                </div>
              </div>
            </div>

            {/* COLOR PALETTE REFERENCE SWATCHES */}
            <div className="bg-[#0A0D15] border border-[#1C2232] rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Palette Swatches
              </span>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#6366F1] shadow-[0_0_8px_#6366f1] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Electric Indigo (#6366F1)</span>
                    <span className="text-[10px] text-slate-400">Linear style primary action & highlight</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#07090E] border border-[#1C2232] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Obsidian Slate (#07090E)</span>
                    <span className="text-[10px] text-slate-400">Pure precision matte background</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#A5B4FC] shadow-[0_0_8px_#a5b4fc] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Icy Violet (#A5B4FC)</span>
                    <span className="text-[10px] text-slate-400">Subtle telemetry & waveform highlights</span>
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
