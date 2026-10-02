'use client';

import React, { useEffect, useState } from 'react';
import { fetchHealthStatus } from '@/lib/api';
import { useGeolocation } from '@/lib/useGeolocation';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileNav, type MobileTab } from '@/components/mobile/MobileNav';
import { ScanScreen, type MobileScanView } from '@/components/mobile/ScanScreen';
import { FeelScreen } from '@/components/mobile/FeelScreen';
import { VerifyScreen } from '@/components/mobile/VerifyScreen';
import { GlobalPulseView } from '@/components/scientific/GlobalPulseView';
import { CharGuardianView } from '@/components/scientific/CharGuardianView';

export default function HomePage() {
  const { location, status: locationStatus, requestLocation } = useGeolocation();
  const [serverStatus, setServerStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [activeTab, setActiveTab] = useState<MobileTab>('overview');
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);

  useEffect(() => {
    if (window.innerWidth >= 1280) {
      setInspectorOpen(true);
    }
  }, []);

  const handleSelectCaseFromPulse = (caseId: string) => {
    setCurrentCaseId(caseId);
    setActiveTab('overview');
  };

  useEffect(() => {
    let isMounted = true;

    fetchHealthStatus()
      .then(() => {
        if (isMounted) {
          setServerStatus('connected');
        }
      })
      .catch(() => {
        if (isMounted) {
          setServerStatus('disconnected');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isScanScreenView =
    activeTab === 'scan' ||
    activeTab === 'overview' ||
    activeTab === 'signals' ||
    activeTab === 'payloads' ||
    activeTab === 'timeline';

  const currentMobileScanView: MobileScanView =
    activeTab === 'signals' || activeTab === 'payloads' || activeTab === 'timeline'
      ? activeTab
      : 'overview';

  return (
    <div className="h-screen w-screen bg-[#060911] text-foreground flex flex-col antialiased selection:bg-primary/20 overflow-hidden">
      {/* 1. COMPACT APP HEADER */}
      <MobileHeader
        locationStatus={locationStatus}
        location={location}
        onRequestLocation={requestLocation}
        serverStatus={serverStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen((prev) => !prev)}
      />

      {/* 2. MAIN FULL-VIEWPORT CANVAS & WORKSPACE */}
      <main className="flex-1 h-[calc(100vh-48px)] overflow-hidden relative flex flex-col pb-14 md:pb-0">
        {isScanScreenView && (
          <ScanScreen
            overrideCaseId={currentCaseId}
            currentMobileView={currentMobileScanView}
            onMobileViewChange={(v) => setActiveTab(v)}
            onNavigateToFeel={() => setActiveTab('feel')}
            onNavigateToVerify={() => setActiveTab('verify')}
            inspectorOpen={inspectorOpen}
            onToggleInspector={() => setInspectorOpen((prev) => !prev)}
          />
        )}

        {activeTab === 'pulse' && (
          <div className="h-full w-full overflow-y-auto custom-scrollbar p-2 sm:p-3 pb-24">
            <GlobalPulseView onSelectCase={handleSelectCaseFromPulse} />
          </div>
        )}

        {activeTab === 'char' && (
          <div className="h-full w-full overflow-y-auto custom-scrollbar p-2 sm:p-3 pb-24">
            <CharGuardianView
              initialCaseId={currentCaseId}
              onNavigateToFeel={() => setActiveTab('feel')}
              onNavigateToVerify={() => setActiveTab('verify')}
            />
          </div>
        )}

        {activeTab === 'feel' && (
          <div className="h-full w-full overflow-y-auto custom-scrollbar p-2 sm:p-3 pb-24">
            <FeelScreen
              initialCaseId={currentCaseId}
              onNavigateToVerify={() => setActiveTab('verify')}
            />
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="h-full w-full overflow-y-auto custom-scrollbar p-2 sm:p-3">
            <VerifyScreen
              initialCaseId={currentCaseId}
              onSuccess={() => setActiveTab('overview')}
            />
          </div>
        )}
      </main>

      {/* 3. MOBILE NAVIGATION DOCK (< md) */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
