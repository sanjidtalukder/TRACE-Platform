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
  Volume2,
  VolumeX,
  Play,
  Square,
  ShieldCheck,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Globe,
  Satellite,
} from 'lucide-react';

export default function SarGoldPreviewPage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedTone, setSelectedTone] = useState<'sine' | 'microwave' | 'radar'>('microwave');
  const [sensitivity, setSensitivity] = useState<number>(1.0);

  return (
    <div className="min-h-screen bg-[#080C14] text-[#E2E8F0] selection:bg-amber-500/30 selection:text-amber-200">
      {/* AMBIENT BACKGROUND TEXTURE - AEROSPACE GRID */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.08), transparent 70%), linear-gradient(to right, rgba(245, 158, 11, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* TOP OPTION SWITCHER BAR */}
      <div className="bg-[#0B0E17] border-b border-[#1A1F2C] py-2 px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-slate-400 font-bold uppercase mr-1 text-[11px]">Compare Options:</span>
            <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-400/40">
              Option 1: SAR Gold (Active)
            </span>
            <Link
              href="/preview-option-2"
              className="px-3 py-1 rounded-md bg-[#121624] text-slate-400 hover:text-white border border-[#1E2538] transition-all"
            >
              Option 2: Space-Tech
            </Link>
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
        <div className="bg-[#0E1422] border border-amber-500/25 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Satellite className="h-3.5 w-3.5" />
                NASA Mission Control & SAR Gold Palette
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Authentic Earth Observation & Radar Architecture
              </h1>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                এটি কোনো জেনেরিক AI সায়ান/ব্লু টেমপ্লেট নয়। এই ডিজাইনটি সরাসরি বাস্তব NASA NISAR স্যাটেলাইটের গোল্ডেন রাডার অ্যান্টেনা, L-Band মাইক্রোওয়েভ স্পেকট্রাম এবং JPL মিশন কন্ট্রোল ড্যাশবোর্ডের রঙ ও টাইপোগ্রাফি অনুযায়ী তৈরি।
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="bg-[#151D30] border border-[#232F4D] text-slate-300 text-xs px-3 py-1.5 rounded-lg font-mono">
                Palette: Basalt + SAR Gold
              </span>
            </div>
          </div>
        </div>

        {/* 3-COLUMN DEMO INTERFACE SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARD 1: RADAR SENSORY DISPLAY (FEEL MODULE MOCKUP) */}
          <div className="md:col-span-2 bg-[#0C111E] border border-[#1A2338] rounded-xl overflow-hidden shadow-xl">
            {/* CARD HEADER */}
            <div className="px-5 py-3.5 border-b border-[#1A2338] bg-[#0F1626]/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  Radar Sonification Oscilloscope
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                FREQUENCY: 172 Hz
              </span>
            </div>

            {/* GOLDEN OSCILLOSCOPE SCREEN */}
            <div className="p-5 space-y-4">
              <div className="relative rounded-lg border border-amber-500/20 bg-[#060910] p-4 overflow-hidden">
                {/* CRT Grid */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)',
                    backgroundSize: '32px 24px',
                  }}
                />

                {/* Oscilloscope Header */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    TRANSMITTING // TIME-DOMAIN
                  </span>
                  <span>5ms / DIV • 44.1 kHz</span>
                </div>

                {/* SVG Golden Waveform */}
                <div className="h-24 w-full flex items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                    {/* Zero-reference line */}
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#f59e0b" strokeOpacity="0.2" strokeDasharray="4 4" />
                    {/* Golden SAR Microwave Waveform */}
                    <path
                      d="M0,40 Q25,10 50,40 T100,40 T150,40 T200,40 T250,40 T300,40 T350,40 T400,40"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    />
                  </svg>
                </div>

                {/* Telemetry Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-[#1A2338]">
                  <span>PULSE INTERVAL: <strong className="text-amber-300">98ms</strong></span>
                  <span>CARRIER: <strong className="text-amber-300">L-BAND SINE</strong></span>
                  <span>STATUS: <strong className="text-emerald-400">CALIBRATED</strong></span>
                </div>
              </div>

              {/* TONE SELECTION BUTTONS */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Tone Modulation Mode</span>
                  <span className="text-amber-400/80">3 Scientific Presets</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sine', label: 'Pure Sine', desc: 'Hydrology Hum' },
                    { id: 'microwave', label: 'L-Band SAR', desc: 'Golden Harmonic' },
                    { id: 'radar', label: 'Tactical Beep', desc: 'Anomaly Alert' },
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id as any)}
                      className={`p-2.5 rounded-lg text-left transition-all border ${
                        selectedTone === tone.id
                          ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-[#101626] border-[#1C263D] text-slate-400 hover:text-white hover:border-[#2A395C]'
                      }`}
                    >
                      <span className="block text-xs font-mono font-bold text-amber-300">{tone.label}</span>
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
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/40'
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
              </button>
            </div>
          </div>

          {/* CARD 2: SCIENTIFIC TELEMETRY CARD */}
          <div className="space-y-4">
            {/* BACKSCATTER DELTA CARD */}
            <div className="bg-[#0C111E] border border-[#1A2338] rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Sentinel-1 / NISAR
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  PASS CONFIRMED
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block">Backscatter Variance (ΔdB)</span>
                <p className="text-3xl font-mono font-black text-amber-400 tracking-tight mt-1">
                  -3.42 <span className="text-sm font-normal text-slate-400">dB</span>
                </p>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  Deep water absorption indicating sudden flood inundation in char region.
                </p>
              </div>

              {/* METRIC PILLS */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                <div className="bg-[#101728] p-2.5 rounded-lg border border-[#1C263D]">
                  <span className="text-[9px] text-slate-400 uppercase block">Polarization</span>
                  <span className="font-bold text-amber-300">VH / VV Cross</span>
                </div>
                <div className="bg-[#101728] p-2.5 rounded-lg border border-[#1C263D]">
                  <span className="text-[9px] text-slate-400 uppercase block">Confidence</span>
                  <span className="font-bold text-emerald-400">99.8% Ground</span>
                </div>
              </div>
            </div>

            {/* COLOR PALETTE REFERENCE SWATCHES */}
            <div className="bg-[#0C111E] border border-[#1A2338] rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Palette Swatches
              </span>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#F59E0B] shadow-[0_0_8px_#f59e0b] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">SAR Radar Amber (#F59E0B)</span>
                    <span className="text-[10px] text-slate-400">Primary accent, waveforms, telemetry</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#080C14] border border-[#1A2338] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Deep Basalt (#080C14)</span>
                    <span className="text-[10px] text-slate-400">Matte space canvas, zero eye strain</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#10B981] shadow-[0_0_8px_#10b981] shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono font-bold text-white block">Earth Emerald (#10B981)</span>
                    <span className="text-[10px] text-slate-400">Ground truth verified vegetation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION / VERDICT */}
        <div className="bg-[#0C111E] border border-amber-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white font-sans">
              এই কালার ও স্টাইলটি আপনার কেমন লাগছে?
            </h3>
            <p className="text-xs text-slate-400">
              আপনি অনুমোদন দিলে আমরা পুরো অ্যাপের (Scan, Pulse, Char, Feel, Verify) সবগুলো স্ক্রিন এই বিশ্বমানের নাসা প্যালেটে রূপান্তর করে দেব।
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-md transition-all"
            >
              Back to Main
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
