'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  fetchCaseAlerts,
  createCaseAlert,
  updateCaseAlert,
  type ThresholdAlertResponse,
} from '@/lib/api';

interface ThresholdAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string | null;
  currentDeltaBackscatter?: number | null;
  currentAffectedArea?: number | null;
  onAlertSaved?: () => void;
}

export function ThresholdAlertModal({
  isOpen,
  onClose,
  caseId,
  currentDeltaBackscatter,
  currentAffectedArea,
  onAlertSaved,
}: ThresholdAlertModalProps) {
  const [metricName, setMetricName] = useState<'delta_backscatter' | 'affected_area'>('delta_backscatter');
  const [thresholdValue, setThresholdValue] = useState<number>(-2.0);
  const [comparison, setComparison] = useState<'less_than' | 'greater_than' | 'abs_greater_than'>('less_than');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [existingAlert, setExistingAlert] = useState<ThresholdAlertResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine current active measurement value based on selected metric
  const currentVal = metricName === 'delta_backscatter' ? currentDeltaBackscatter : currentAffectedArea;

  useEffect(() => {
    if (!isOpen || !caseId) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    fetchCaseAlerts(caseId)
      .then((alerts) => {
        if (alerts.length > 0) {
          const match = alerts.find((a) => a.metric_name === metricName) || alerts[0];
          setExistingAlert(match);
          setMetricName((match.metric_name as any) || 'delta_backscatter');
          setThresholdValue(match.threshold_value);
          setComparison((match.comparison as any) || 'less_than');
          setIsActive(match.is_active);
        } else {
          setExistingAlert(null);
          if (metricName === 'delta_backscatter') {
            setThresholdValue(-2.0);
            setComparison('less_than');
          } else {
            setThresholdValue(50.0);
            setComparison('greater_than');
          }
        }
      })
      .catch((err) => {
        logger_fallback(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, caseId, metricName]);

  if (!isOpen) return null;

  const logger_fallback = (err: any) => {
    setErrorMessage(err.message || 'Unable to load alert state.');
  };

  const handleMetricChange = (metric: 'delta_backscatter' | 'affected_area') => {
    setMetricName(metric);
    if (metric === 'delta_backscatter') {
      setThresholdValue(-2.0);
      setComparison('less_than');
    } else {
      setThresholdValue(50.0);
      setComparison('greater_than');
    }
  };

  const handlePresetSelect = (val: number) => {
    setThresholdValue(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        metric_name: metricName,
        threshold_value: Number(thresholdValue),
        comparison,
        is_active: isActive,
      };

      const res = await createCaseAlert(caseId, payload);
      setExistingAlert(res);
      setSuccessMessage('Threshold alert configured & armed.');

      if (onAlertSaved) {
        onAlertSaved();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save threshold alert.');
    } finally {
      setSaving(false);
    }
  };

  const isTriggered = existingAlert?.triggered_state === 'TRIGGERED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-3 sm:p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md max-h-[88vh] flex flex-col glass-panel border-amber-500/30 shadow-2xl overflow-hidden relative bg-[#080d1a]/95">
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1.5 rounded-lg border border-amber-500/20 bg-slate-900/60 transition-colors"
          aria-label="Close Modal"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="p-4 pb-2 space-y-1 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              <BellRing className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-white font-mono">
                Satellite Anomaly Threshold Alert
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 font-mono">
                CASE // {caseId || 'SELECT CASE'} — Real NISAR Pass Evaluation
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
          {/* TRIGGERED / ARMED ALERT STATUS BANNER */}
          {existingAlert && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 shadow-inner ${
                isTriggered
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isTriggered ? (
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-400 animate-pulse" />
              ) : (
                <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
              )}
              <div className="space-y-0.5 text-left">
                <div className="font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>{isTriggered ? 'Threshold Exceeded' : 'Alert Armed & Active'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-amber-500/20">
                    {existingAlert.triggered_state}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isTriggered
                    ? `Unusual NISAR measurement detected: current value (${existingAlert.last_evaluated_val ?? currentVal ?? 'N/A'}) crossed threshold (${existingAlert.threshold_value}).`
                    : `Monitoring satellite observations. Alert triggers if measurement crosses ${existingAlert.threshold_value}.`}
                </p>
                {existingAlert.last_triggered_at && (
                  <p className="text-[10px] font-mono text-slate-400 pt-1">
                    Triggered at: {new Date(existingAlert.last_triggered_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* METRIC SELECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-amber-400" />
                  Target NISAR Measurement
                </span>
                {currentVal !== undefined && currentVal !== null && (
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    Current: {currentVal} {metricName === 'delta_backscatter' ? 'dB' : 'ha'}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMetricChange('delta_backscatter')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    metricName === 'delta_backscatter'
                      ? 'border-amber-400 bg-amber-500/15 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'border-amber-500/20 bg-slate-950/60 text-slate-400 hover:border-amber-500/40'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-200">Backscatter Change</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">delta_backscatter (dB)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleMetricChange('affected_area')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    metricName === 'affected_area'
                      ? 'border-amber-400 bg-amber-500/15 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'border-amber-500/20 bg-slate-950/60 text-slate-400 hover:border-amber-500/40'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-200">Affected Inundation Area</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">affected_area (ha)</div>
                </button>
              </div>
            </div>

            {/* THRESHOLD VALUE & PRESETS */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-amber-400" />
                  Anomaly Threshold Limit
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {comparison === 'less_than' ? 'Trigger if ≤ value' : 'Trigger if ≥ value'}
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
                  placeholder="e.g. -2.0"
                />
                <span className="text-xs font-mono font-bold text-slate-300 shrink-0 w-12 text-center">
                  {metricName === 'delta_backscatter' ? 'dB' : 'ha'}
                </span>
              </div>

              {/* QUICK PRESETS */}
              <div className="flex items-center gap-1.5 pt-1 font-mono">
                <span className="text-[10px] font-semibold text-slate-400">Presets:</span>
                {metricName === 'delta_backscatter' ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(-1.5)}
                      className="h-6 text-[10px] font-mono px-2 py-0 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      -1.5 dB
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(-2.0)}
                      className="h-6 text-[10px] font-mono px-2 py-0 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      -2.0 dB
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(-2.5)}
                      className="h-6 text-[10px] font-mono px-2 py-0 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      -2.5 dB
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(30.0)}
                      className="h-6 text-[10px] font-mono px-2 py-0 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      30 ha
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(50.0)}
                      className="h-6 text-[10px] font-mono px-2 py-0 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      50 ha
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(100.0)}
                      className="h-6 text-[10px] font-mono px-2 py-0 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      100 ha
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* ALERT ACTIVE TOGGLE */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-slate-950/70 shadow-inner">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-amber-400" />
                Alert Subscription Enabled
              </span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  isActive ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SUCCESS / ERROR TOAST MESSAGES */}
            {successMessage && (
              <div className="text-xs font-mono text-emerald-300 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="text-xs font-mono text-rose-300 bg-rose-950/20 border border-rose-500/30 rounded-xl p-2.5 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SAFETY DISCLAIMER */}
            <p className="text-[10px] text-slate-400 leading-tight italic">
              Observational anomaly alert evaluated against satellite data. Does not constitute an emergency prediction or forecast.
            </p>

            {/* SAVE BUTTON */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/3 h-10 text-xs font-mono border-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !caseId || loading}
                className="w-2/3 h-10 text-xs font-mono font-bold uppercase tracking-wider gap-2 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BellRing className="h-3.5 w-3.5" />
                    Save Subscription
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
