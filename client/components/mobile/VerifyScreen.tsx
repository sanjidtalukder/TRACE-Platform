'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  FileText,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/lib/useGeolocation';
import {
  fetchCases,
  createFieldObservation,
  type FieldObservationResponse,
  type CaseListItem,
} from '@/lib/api';
import { formatCaseLabel } from '@/lib/formatCaseLabel';
import { CaseSelect } from '@/components/ui/CaseSelect';

import { useOfflineSync } from '@/lib/useOfflineSync';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';

interface VerifyScreenProps {
  initialCaseId?: string | null;
  onSuccess?: () => void;
}

export function VerifyScreen({ initialCaseId, onSuccess }: VerifyScreenProps) {
  const { location, status: locationStatus, error: locationError, requestLocation } = useGeolocation();
  const { isOnline, pendingCount, isSyncing, enqueueAndSync, syncPendingQueue } = useOfflineSync();

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId || null);
  const [caseList, setCaseList] = useState<CaseListItem[]>([]);

  const [note, setNote] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<FieldObservationResponse | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Handle photo file selection or camera capture
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit.');
      return;
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'image/jpg'];
    if (!validMimeTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      setErrorMessage('Invalid file type. Please select or capture a valid image.');
      return;
    }

    setPhotoFile(file);
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ONE-TAP RESPONSE SUBMISSION (OFFLINE-SAFE)
  const handleOneTapSubmit = async (answer: 'YES' | 'NO') => {
    if (!selectedCaseId) {
      setErrorMessage('Please select an active TRACE investigation case.');
      return;
    }
    if (!location) {
      setErrorMessage('GPS location is required for ground verification.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setOfflineNotice(null);

    const noteText = answer === 'YES'
      ? 'One-tap ground truth: Change present in target area'
      : 'One-tap ground truth: No damage observed, false positive';

    try {
      const payload = {
        photo_reference: photoName || (photoPreview ? 'photo_captured.jpg' : null),
        note: noteText,
        observed_at: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const { observation, pendingItem } = await enqueueAndSync(selectedCaseId, payload, photoFile);
      
      if (observation) {
        setSubmitSuccess(observation);
      } else {
        setOfflineNotice('Observation saved locally offline. Will automatically sync when connection recovers.');
      }

      setNote('');
      handleRemovePhoto();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to capture ground observation.');
    } finally {
      setSubmitting(false);
    }
  };

  // FULL FORM SUBMISSION (OFFLINE-SAFE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) {
      setErrorMessage('Please select an active TRACE investigation case.');
      return;
    }

    if (!location) {
      setErrorMessage('GPS location is required to submit a ground observation.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setOfflineNotice(null);

    try {
      const payload = {
        photo_reference: photoName || (photoPreview ? 'photo_captured.jpg' : null),
        note: note.trim() || 'Ground observation verified in field.',
        observed_at: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const { observation, pendingItem } = await enqueueAndSync(selectedCaseId, payload, photoFile);

      if (observation) {
        setSubmitSuccess(observation);
      } else {
        setOfflineNotice('Observation saved locally offline. Will automatically sync when connection recovers.');
      }

      setNote('');
      handleRemovePhoto();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit ground observation.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCase = caseList.find((c) => c.case_id === selectedCaseId);

  return (
    <div className="space-y-4 pb-safe-content max-w-md mx-auto px-4" role="region" aria-label="Ground Truth Closed-Loop System">
      {/* OFFLINE QUEUE STATUS BANNER */}
      {pendingCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-mono font-bold">{pendingCount} observation{pendingCount > 1 ? 's' : ''} queued offline</span>
              <p className="text-[10px] text-amber-400/80 font-mono">
                {isOnline ? (isSyncing ? 'Synchronizing with server...' : 'Ready to sync') : 'Waiting for network connection'}
              </p>
            </div>
          </div>
          {isOnline && !isSyncing && (
            <Button
              onClick={() => syncPendingQueue()}
              size="sm"
              variant="outline"
              className="h-7 text-[11px] font-mono border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
            >
              Sync Now
            </Button>
          )}
        </div>
      )}

      {/* OFFLINE LOCAL SAVED NOTICE */}
      {offlineNotice && (
        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{offlineNotice}</span>
        </div>
      )}

      {/* SECTION 1: CASE PICKER */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            Active Investigation Target
          </label>
        </div>

        {caseList.length > 0 && (
          <CaseSelect
            cases={caseList}
            selectedCaseId={selectedCaseId}
            onSelectCaseId={(id) => {
              setSelectedCaseId(id);
              setSubmitSuccess(null);
            }}
          />
        )}
      </div>

      {/* SECTION 2: ONE-TAP GROUND-TRUTH VERIFICATION CARD */}
      <Card className="glass-panel border-sky-500/30 shadow-xl relative overflow-hidden">
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />

        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-widest bg-sky-500/15 px-2.5 py-0.5 rounded border border-sky-400/30 shadow-[0_0_8px_rgba(56,189,248,0.2)]">
              Closed-Loop One-Tap
            </span>
            {location ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                <MapPin className="h-2.5 w-2.5" /> GPS Lock Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <AlertTriangle className="h-2.5 w-2.5" /> GPS Required
              </span>
            )}
          </div>
          <CardTitle className="text-sm font-extrabold text-white mt-2 font-mono">
            Is the detected {selectedCase?.event_type || 'SAR change'} present at your location?
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 leading-relaxed">
            One-tap response automatically updates multi-sensor evidence fusion & self-audit verification state.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <Button
              type="button"
              disabled={submitting || !selectedCaseId || !location}
              onClick={() => handleOneTapSubmit('YES')}
              className="h-12 px-2 sm:px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-normal"
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                  <ThumbsUp className="h-4 w-4 shrink-0 text-white" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-extrabold tracking-wide">YES</span>
                    <span className="text-[10px] text-emerald-100 font-sans font-medium whitespace-nowrap">Confirmed</span>
                  </div>
                </div>
              )}
            </Button>

            <Button
              type="button"
              disabled={submitting || !selectedCaseId || !location}
              onClick={() => handleOneTapSubmit('NO')}
              className="h-12 px-2 sm:px-3 bg-rose-600 hover:bg-rose-500 text-white font-mono shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-normal"
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                  <ThumbsDown className="h-4 w-4 shrink-0 text-white" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-extrabold tracking-wide">NO</span>
                    <span className="text-[10px] text-rose-100 font-sans font-medium whitespace-nowrap">False Positive</span>
                  </div>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SUCCESS CARD */}
      {submitSuccess && (
        <Card className="border-emerald-500/40 bg-emerald-950/20 backdrop-blur-md">
          <CardContent className="p-4 space-y-2 text-xs text-center font-mono">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h3 className="font-extrabold text-emerald-300 uppercase">Ground-Truth Evidence Recorded</h3>
            <p className="text-[11px] text-slate-400">
              Observation ID: {submitSuccess.id} attached to {submitSuccess.case_id}
            </p>
            <p className="text-[11px] text-slate-200 font-medium">
              Note: {submitSuccess.note}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitSuccess(null)}
              className="h-7 text-xs font-mono border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 mt-2"
            >
              Submit Another Observation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DETAILED FORM CARD */}
      <Card className="glass-panel border-sky-500/20 shadow-lg">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-white flex items-center justify-between font-mono">
            <span>Detailed Field Observation Report</span>
            <span className="text-[10px] font-mono font-extrabold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-400/30">
              {selectedCaseId || 'SELECT CASE'}
            </span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Optional photo upload, custom notes, and detailed coordinates.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PHOTO CAPTURE & PREVIEW */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Camera className="h-3.5 w-3.5 text-sky-400" />
                Field Photo (Optional)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
                id="photo-upload-input"
              />

              {photoPreview ? (
                <div className="relative rounded-xl border border-sky-500/30 overflow-hidden bg-slate-950/80 text-center">
                  <img
                    src={photoPreview}
                    alt="Field observation preview"
                    className="max-h-48 w-full object-cover"
                  />
                  <div className="p-2.5 bg-slate-900/90 backdrop-blur-md border-t border-sky-500/20 flex items-center justify-between">
                    <span className="text-[11px] font-mono truncate max-w-[200px] text-slate-300">
                      {photoName || 'Captured Photo'}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-7 px-2.5 text-[11px] font-mono gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="photo-upload-input"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-sky-500/30 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-500/10 transition-all bg-slate-950/40"
                >
                  <Camera className="h-7 w-7 text-sky-400 mb-1.5 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white">Take Photo / Select Image</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">Supports camera capture & file upload</span>
                </label>
              )}
            </div>

            {/* FIELD OBSERVATION NOTE */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-sky-400" />
                Observation Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Standing surface water observed along road boundary."
                rows={3}
                className="w-full bg-slate-950/80 border border-sky-500/30 rounded-xl p-3 text-xs font-sans text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none shadow-inner"
              />
            </div>

            {/* GPS LOCATION CAPTURE */}
            <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-sky-500/20 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  Captured Coordinates
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={requestLocation}
                  disabled={locationStatus === 'loading'}
                  className="h-6 text-[10px] font-mono px-2 gap-1 border-sky-500/30 text-sky-300"
                >
                  <RefreshCw className={`h-2.5 w-2.5 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
                  Refresh GPS
                </Button>
              </div>

              {location ? (
                <p className="text-xs font-mono font-bold text-sky-300">
                  {location.latitude.toFixed(5)}°, {location.longitude.toFixed(5)}° (±{Math.round(location.accuracy || 0)}m)
                </p>
              ) : (
                <p className="text-xs font-mono text-amber-400 font-medium">
                  {locationError || 'GPS location required for field submission.'}
                </p>
              )}
            </div>

            {/* TIMESTAMP */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3 text-sky-400" />
              Timestamp: {new Date().toLocaleString()}
            </div>

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="text-xs font-mono text-rose-300 bg-rose-950/20 border border-rose-500/30 rounded-lg p-2.5 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={submitting || !selectedCaseId || !location}
              className="w-full h-11 text-xs font-mono font-bold uppercase tracking-wider gap-2 shadow-lg bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sky-500/20"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Submitting Evidence...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Submit Detailed Ground Evidence
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
