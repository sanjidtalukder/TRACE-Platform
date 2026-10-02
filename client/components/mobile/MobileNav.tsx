'use client';

import React from 'react';
import { Crosshair, Globe, Anchor, Activity, ShieldCheck } from 'lucide-react';

export type MobileTab =
  | 'scan'
  | 'overview'
  | 'signals'
  | 'payloads'
  | 'timeline'
  | 'feel'
  | 'verify'
  | 'pulse'
  | 'char';

interface MobileNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const isScan =
    activeTab === 'scan' ||
    activeTab === 'overview' ||
    activeTab === 'signals' ||
    activeTab === 'payloads' ||
    activeTab === 'timeline';
  const isPulse = activeTab === 'pulse';
  const isChar = activeTab === 'char';
  const isFeel = activeTab === 'feel';
  const isVerify = activeTab === 'verify';

  const items = [
    {
      id: 'scan' as MobileTab,
      label: 'SCAN',
      icon: Crosshair,
      isActive: isScan,
      targetTab: 'overview' as MobileTab,
    },
    {
      id: 'pulse' as MobileTab,
      label: 'PULSE',
      icon: Globe,
      isActive: isPulse,
      targetTab: 'pulse' as MobileTab,
    },
    {
      id: 'char' as MobileTab,
      label: 'CHAR',
      icon: Anchor,
      isActive: isChar,
      targetTab: 'char' as MobileTab,
    },
    {
      id: 'feel' as MobileTab,
      label: 'FEEL',
      icon: Activity,
      isActive: isFeel,
      targetTab: 'feel' as MobileTab,
    },
    {
      id: 'verify' as MobileTab,
      label: 'VERIFY',
      icon: ShieldCheck,
      isActive: isVerify,
      targetTab: 'verify' as MobileTab,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060b17]/95 backdrop-blur-xl border-t border-sky-500/25 shadow-[0_-4px_25px_rgba(0,0,0,0.8)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mission Modules Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-14 px-1 sm:px-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.targetTab)}
              aria-current={item.isActive ? 'page' : undefined}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-all duration-200 select-none ${
                item.isActive
                  ? 'text-sky-300 font-extrabold bg-sky-500/20 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] ring-1 ring-sky-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
              aria-label={`${item.label} Module`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-transform ${item.isActive ? 'stroke-[2.5px] text-sky-400 scale-105' : 'text-slate-400'}`} />
              <span className="text-[9px] mt-0.5 tracking-wider font-mono font-bold leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
