'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, CheckCircle2, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker & check for updates
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
            // Immediately check for newer versions
            registration.update();
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // 2. Check if already running in standalone mode (Native PWA)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Already installed and running as standalone app
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // 4. Capture BeforeInstallPrompt for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if dismissed previously within 24 hours
      const lastDismissed = localStorage.getItem('trace_pwa_dismissed');
      const now = Date.now();
      if (!lastDismissed || now - parseInt(lastDismissed, 10) > 24 * 60 * 60 * 1000) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Detect App Installed event
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
      console.log('[PWA] Application successfully installed.');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosGuide(false);
    localStorage.setItem('trace_pwa_dismissed', Date.now().toString());
  };

  // If already standalone, render nothing
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* SUCCESS TOAST AFTER INSTALLATION */}
      {installedSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md text-xs font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>TRACE FIELD App installed successfully!</span>
        </div>
      )}

      {/* NATIVE APP INSTALL FLOATING PROMPT */}
      {showBanner && (
        <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="relative overflow-hidden rounded-2xl bg-[#090D18]/95 border border-amber-500/40 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-xl">
            {/* Ambient amber top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="relative h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <img src="/icon.svg" alt="TRACE FIELD" className="h-8 w-8" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#090D18] animate-pulse" />
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    Install TRACE App
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      PWA
                    </span>
                  </h4>
                  <button
                    onClick={handleDismiss}
                    aria-label="Dismiss banner"
                    className="text-slate-400 hover:text-white p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Install on your device for full-screen radar telemetry and offline field observation.
                </p>

                {/* Action Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Install App</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-xs transition-colors cursor-pointer"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS INSTALL INSTRUCTIONS MODAL */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#090D18] border border-amber-500/30 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
                <Smartphone className="h-4 w-4 text-amber-400" />
                <span>Install on iPhone / iPad</span>
              </div>
              <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300 font-sans">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  In Safari, tap the <strong className="text-amber-300">Share</strong> button{' '}
                  <Share className="inline h-3.5 w-3.5 text-sky-400 -mt-0.5" /> in the browser bar.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>
                  Scroll down the share sheet and tap{' '}
                  <strong className="text-amber-300">"Add to Home Screen"</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  Tap <strong className="text-amber-300">"Add"</strong> in the top-right corner to launch TRACE FIELD as a standalone app!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full py-2 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-bold hover:bg-amber-400 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}
