'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Database,
  Layers,
  Sparkles,
  GitBranch,
  Bot,
  Play,
  Compass,
  Radio,
  Flame,
  CloudRain,
  Eye,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  evaluateCaseEvidence,
  evaluateSelfAudit,
  simulateScenario,
  runSentinelAgents,
  type EvidenceFusionResponse,
  type SelfAuditResponse,
  type ScenarioSimulationResponse,
  type SentinelWorkflowResponse,
} from '@/lib/api';

interface EvidenceConfidenceWallProps {
  caseId: string;
  initialEvidence?: EvidenceFusionResponse | null;
  initialAudit?: SelfAuditResponse | null;
}

export function EvidenceConfidenceWall({ caseId, initialEvidence, initialAudit }: EvidenceConfidenceWallProps) {
  const [evidenceData, setEvidenceData] = useState<EvidenceFusionResponse | null>(initialEvidence || null);
  const [auditData, setAuditData] = useState<SelfAuditResponse | null>(initialAudit || null);
  const [scenarioData, setScenarioData] = useState<ScenarioSimulationResponse | null>(null);
  const [sentinelData, setSentinelData] = useState<SentinelWorkflowResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingScenario, setLoadingScenario] = useState<boolean>(false);
  const [loadingAgents, setLoadingAgents] = useState<boolean>(false);
  const [waterOffset, setWaterOffset] = useState<number>(1.0);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'MEASURED' | 'DERIVED' | 'INTERPRETATION' | 'SIMULATION'>('ALL');

  const handleRunEvaluation = async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const [evRes, auditRes] = await Promise.all([
        evaluateCaseEvidence(caseId).catch((err) => {
          console.warn('evaluateCaseEvidence failed:', err);
          return null;
        }),
        evaluateSelfAudit(caseId).catch((err) => {
          console.warn('evaluateSelfAudit failed:', err);
          return null;
        }),
      ]);
      if (evRes) setEvidenceData(evRes);
      if (auditRes) setAuditData(auditRes);
    } catch (err) {
      console.error('Evidence wall evaluation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) {
      handleRunEvaluation();
    }
  }, [caseId]);

  const handleRunScenario = async (offset: number) => {
    setWaterOffset(offset);
    setLoadingScenario(true);
    try {
      const res = await simulateScenario(caseId, offset);
      setScenarioData(res);
    } catch (err) {
      console.error('Scenario simulation failed:', err);
    } finally {
      setLoadingScenario(false);
    }
  };

  const handleRunAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await runSentinelAgents(caseId);
      setSentinelData(res);
    } catch (err) {
      console.error('Sentinel agents execution failed:', err);
    } finally {
      setLoadingAgents(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || 'UNAVAILABLE';

    if (
      s === 'SUPPORTED' ||
      s === 'CONFIRMED_MULTIMISSION' ||
      s === 'PASS' ||
      s === 'SUPPORTING' ||
      s === 'VERIFIED' ||
      s === 'HIGH CONFIDENCE' ||
      s === 'DATA AVAILABLE'
    ) {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.15)]"
          role="status"
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{status}</span>
        </span>
      );
    }

    if (
      s === 'PARTIALLY_SUPPORTED' ||
      s === 'WARNING' ||
      s === 'NEUTRAL' ||
      s === 'PROCESSING' ||
      s === 'MODERATE'
    ) {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
          role="status"
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{status}</span>
        </span>
      );
    }

    if (
      s === 'REJECTED' ||
      s === 'CONTRADICTED' ||
      s === 'FAIL' ||
      s === 'LOW CONFIDENCE'
    ) {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
          role="status"
        >
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{status}</span>
        </span>
      );
    }

    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-slate-800 text-slate-400 border border-slate-700 shrink-0"
        role="status"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{status || 'UNAVAILABLE'}</span>
      </span>
    );
  };

  /**
   * Structured Evidence Row conforming to:
   * Evidence → Source → Signal → Confidence → Validation state
   */
  const EvidenceItemRow = ({
    evidence,
    source,
    signal,
    confidence,
    validationStatus,
    description,
    icon: Icon = Database,
    sourceBadge = 'NASA EVIDENCE',
  }: {
    evidence: string;
    source: string;
    signal?: string | React.ReactNode;
    confidence?: string | number;
    validationStatus: string;
    description?: string;
    icon?: React.ElementType;
    sourceBadge?: string;
  }) => {
    return (
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/30 transition-all space-y-2">
        {/* Top: Evidence Name, Source, Validation Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-400 shrink-0 mt-0.5">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-100 text-xs sm:text-sm font-sans">{evidence}</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-400/20 uppercase tracking-wider">
                  {sourceBadge}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono pt-0.5 flex items-center gap-1.5">
                <span className="text-slate-500">Source:</span>
                <span>{source}</span>
              </div>
            </div>
          </div>

          <div className="self-start sm:self-center">
            {getStatusBadge(validationStatus)}
          </div>
        </div>

        {/* Middle: Signal & Confidence Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-xs font-mono">
          {signal && (
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase">Signal:</span>
              <span className="text-amber-300 font-bold truncate ml-2">{signal}</span>
            </div>
          )}

          {confidence && (
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase">Confidence:</span>
              <span className="text-emerald-300 font-bold ml-2">
                {typeof confidence === 'number' ? `${(confidence * 100).toFixed(0)}%` : confidence}
              </span>
            </div>
          )}
        </div>

        {/* Bottom: Description if available */}
        {description && (
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-0.5">
            {description}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" role="region" aria-label="Evidence and Confidence Wall">
      {/* Header & Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 border-amber-500/20 relative overflow-hidden shadow-lg bg-[#080d1a]/85">
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)] mt-0.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 animate-pulse" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight font-mono">
                Evidence & Self-Audit Matrix
              </h2>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Autonomous Verification
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-0.5 leading-relaxed">
              Multi-mission Earth observation evidence, deterministic rule validation, synthetic scenario simulations, and autonomous sentinel agents.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              onClick={handleRunEvaluation}
              disabled={loading}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-amber-500/25 transition-all justify-center cursor-pointer"
            >
              {loading ? (
                <Activity className="w-3.5 h-3.5 animate-spin mr-1.5" aria-hidden="true" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              )}
              {loading ? 'Evaluating...' : 'Re-Evaluate Audit'}
            </Button>

            <Button
              onClick={handleRunAgents}
              disabled={loadingAgents}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto border-amber-500/30 text-amber-300 hover:bg-amber-500/15 font-mono font-bold text-xs transition-all justify-center cursor-pointer"
            >
              {loadingAgents ? (
                <Activity className="w-3.5 h-3.5 animate-spin mr-1.5 text-amber-400" aria-hidden="true" />
              ) : (
                <Bot className="w-3.5 h-3.5 mr-1.5 text-amber-400" aria-hidden="true" />
              )}
              {loadingAgents ? 'Running...' : 'Run Agents'}
            </Button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 bg-slate-950/80 p-1 px-2.5 rounded-lg border border-amber-500/20 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Simulate Offset:</span>
            <div className="flex items-center gap-1">
              {[0.5, 1.0, 2.0].map((offset) => (
                <Button
                  key={offset}
                  onClick={() => handleRunScenario(offset)}
                  disabled={loadingScenario}
                  size="sm"
                  variant="outline"
                  className={`h-6 text-[10px] px-2 font-mono ${
                    waterOffset === offset && scenarioData
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                      : 'text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  +{offset}m
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Summary Banner */}
      {auditData && (
        <div className="glass-panel border-amber-500/30 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-semibold">
                DETERMINISTIC VERDICT
              </span>
              <h3 className="text-sm sm:text-base font-mono font-bold text-slate-100 uppercase tracking-wide">
                Overall Self-Audit State
              </h3>
            </div>
            {getStatusBadge(auditData.overall_audit_state)}
          </div>

          {/* Visual Progress Meter Bar */}
          <div className="space-y-1.5 bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/20 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono font-semibold">Deterministic Confidence Score</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {(auditData.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  auditData.confidence_score >= 0.75
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : auditData.confidence_score >= 0.5
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, auditData.confidence_score * 100))}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
            {auditData.summary_explanation}
          </p>
        </div>
      )}

      {/* Classification Filters */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
        role="tablist"
        aria-label="Evidence Data Classifications"
      >
        {[
          { id: 'ALL', label: 'All Evidence' },
          { id: 'MEASURED', label: '1. Measured Data' },
          { id: 'DERIVED', label: '2. Derived Evidence' },
          { id: 'INTERPRETATION', label: '3. Interpretation' },
          { id: 'SIMULATION', label: '4. Simulation Reference' },
        ].map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.4)] font-bold'
                : 'bg-slate-950/70 text-slate-400 border border-amber-500/20 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Classified Data Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CATEGORY 1: MEASURED DATA */}
        {(activeCategory === 'ALL' || activeCategory === 'MEASURED') && (
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                  MEASURED DATA & GROUND TRUTH
                </h3>
                <p className="text-[11px] text-slate-400">
                  Separated remote sensing satellite payloads and verified ground truth observations.
                </p>
              </div>
            </div>

            {/* Sub-group: Remote Sensing Evidence */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                REMOTE SENSING SATELLITE EVIDENCE
              </div>

              {/* NISAR SAR Evidence */}
              <EvidenceItemRow
                evidence="NISAR L-band SAR Radar"
                source="NASA / JPL NISAR Earth Observation"
                signal={evidenceData?.sar_anomaly_status ? `SAR Anomaly: ${evidenceData.sar_anomaly_status}` : 'Pending NISAR InSAR Acquisition'}
                confidence={evidenceData?.sar_anomaly_status === 'DETECTED' ? 'High Confidence (Phase Coherence)' : 'Nominal Flux'}
                validationStatus={evidenceData?.sar_anomaly_status === 'DETECTED' ? 'PASS' : 'WARNING'}
                description="Primary Synthetic Aperture Radar Earth-observation backscatter payload."
                icon={Radio}
                sourceBadge="NASA SAR"
              />

              {/* NASA FIRMS Thermal Evidence */}
              <EvidenceItemRow
                evidence="NASA FIRMS Active Fire Radiance"
                source="MODIS / VIIRS Terra & Aqua Constellation"
                signal={evidenceData?.sensor_evaluations?.FIRMS?.summary_text || 'Thermal radiance observation'}
                confidence="Multi-Sensor Radiance Check"
                validationStatus={evidenceData?.sensor_evaluations?.FIRMS?.status || 'UNAVAILABLE'}
                description="Moderate resolution thermal anomaly detection for thermal/fire activity."
                icon={Flame}
                sourceBadge="NASA FIRMS"
              />

              {/* NASA GPM IMERG Rain Evidence */}
              <EvidenceItemRow
                evidence="NASA GPM IMERG Precipitation"
                source="GPM Core Observatory (Dual Radar / Passive Microwave)"
                signal={evidenceData?.sensor_evaluations?.GPM?.summary_text || 'Microwave precipitation measurements'}
                confidence="Multi-Satellite Calibrated"
                validationStatus={evidenceData?.sensor_evaluations?.GPM?.status || 'UNAVAILABLE'}
                description="Global precipitation measurement baseline identifying flood trigger rainfall."
                icon={CloudRain}
                sourceBadge="NASA GPM"
              />
            </div>

            {/* Sub-group: Community Ground Truth */}
            <div className="space-y-3 pt-2">
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                COMMUNITY SENTINEL OBSERVATION
              </div>

              <EvidenceItemRow
                evidence="Community Sentinel Field Corroboration"
                source="TRACE Ground Sentinels & Field Observers"
                signal="Cross-referenced ground truth consistency check"
                confidence="Ground Observations Recorded"
                validationStatus={auditData?.checks?.find((c) => c.check_type === 'GROUND_TRUTH_CONSISTENCY_CHECK')?.status || 'NOT_EVALUATED'}
                description="Ground reports provide local context. Evaluated by self-audit and never override satellite calculations."
                icon={Eye}
                sourceBadge="GROUND TRUTH"
              />
            </div>
          </div>
        )}

        {/* CATEGORY 2: DERIVED EVIDENCE */}
        {(activeCategory === 'ALL' || activeCategory === 'DERIVED') && (
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                  DERIVED EVIDENCE & CORRELATION CHECKS
                </h3>
                <p className="text-[11px] text-slate-400">
                  Deterministic spatiotemporal correlation checks and mathematical consistency rules.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {auditData?.checks && auditData.checks.length > 0 ? (
                auditData.checks.map((check, idx) => (
                  <EvidenceItemRow
                    key={idx}
                    evidence={check.rule_name}
                    source={check.source || 'TRACE Deterministic Engine'}
                    signal={check.value ? `Observed: ${check.value}` : 'Spatiotemporal Correlation Check'}
                    confidence={check.threshold ? `Threshold: ${check.threshold}` : undefined}
                    validationStatus={check.status}
                    description={check.rationale}
                    icon={ShieldCheck}
                    sourceBadge="AUDIT RULE"
                  />
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs italic">
                  Run evaluation to generate spatiotemporal correlation checks.
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORY 3: INTERPRETATION */}
        {(activeCategory === 'ALL' || activeCategory === 'INTERPRETATION') && (
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                  SCIENTIFIC INTERPRETATION
                </h3>
                <p className="text-[11px] text-slate-400">
                  Non-causal hypothesis synthesis backed by multi-sensor evidence.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-950/25 border border-indigo-800/40 space-y-1.5">
                <div className="font-semibold text-indigo-300 font-mono uppercase text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Scientific Narrative
                </div>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {evidenceData?.hypothesis_narrative || 'Evidence fusion pending evaluation.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-300 font-mono uppercase text-[11px]">
                  Non-Causal Correlation Statement
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {evidenceData?.non_causal_statement || 'Correlation phrasing strictly enforced upon evaluation.'}
                </p>
              </div>

              {/* Sentinel Agents Execution Log */}
              {sentinelData && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5 font-mono text-xs">
                      <Bot className="w-4 h-4" />
                      Sentinel Agents Autonomous Log
                    </span>
                    {getStatusBadge(sentinelData.final_verdict)}
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {sentinelData.execution_log.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-slate-300 border-b border-purple-900/30 pb-1.5"
                      >
                        <span className="font-mono font-bold text-amber-300">{step.agent_name}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{step.summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORY 4: SIMULATION REFERENCE */}
        {(activeCategory === 'ALL' || activeCategory === 'SIMULATION') && (
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
              <GitBranch className="w-4 h-4 text-purple-400 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                  SIMULATION REFERENCE BASELINE
                </h3>
                <p className="text-[11px] text-slate-400">
                  Synthetic reference baselines & hydrological offset models.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {scenarioData && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                  <div className="flex justify-between items-center font-semibold text-amber-300 font-mono text-xs">
                    <span>Water Level Offset: +{scenarioData.water_level_offset_m}m</span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">{scenarioData.disclaimer}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Area:</span>
                      <span className="font-bold text-white text-xs">
                        {scenarioData.affected_area_sq_km ? `${scenarioData.affected_area_sq_km.toFixed(1)} km²` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Population:</span>
                      <span className="font-bold text-slate-200 text-xs truncate block">{scenarioData.affected_population_text}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Schools:</span>
                      <span className="text-slate-300 text-xs truncate block">{scenarioData.affected_schools_text}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Facilities:</span>
                      <span className="text-slate-300 text-xs truncate block">{scenarioData.affected_health_facilities_text}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-slate-200 font-mono text-xs">
                  <span>Pre-Event Baseline Context</span>
                  <span className="text-[10px] text-purple-400 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    CMR Historical
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Reference surface reflectance and radar backscatter baselines constructed from 30-day prior satellite acquisitions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
