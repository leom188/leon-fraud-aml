import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '../../components/ui/dialog';
import {
  Brain,
  ShieldAlert,
  Copy,
  Check,
  Users,
  TrendingUp,
  Building2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Key,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { GroupedEntity } from '../../types/rails';
import {
  analyzeEntityWithJev,
  getOpenRouterApiKey,
  setOpenRouterApiKey,
  getJevModel,
  setJevModel,
  JevDossierAnalysis
} from '../../services/ai/jevService';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: GroupedEntity | null;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  entity
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawNarrative, setShowRawNarrative] = useState(false);
  const [showRawState, setShowRawState] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // API Key & Model State
  const [apiKey, setApiKeyState] = useState('');
  const [model, setModelState] = useState('typesafe/jev-1.13');

  // Execution & Results State
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JevDossierAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load key & run analysis on open
  useEffect(() => {
    if (isOpen && entity) {
      const savedKey = getOpenRouterApiKey();
      const savedModel = getJevModel();
      setApiKeyState(savedKey);
      setModelState(savedModel);
      
      // Automatically run Jev decision call
      handleRunAnalysis(savedKey);
    } else {
      setAnalysis(null);
      setErrorMsg(null);
    }
  }, [isOpen, entity?.id]);

  const handleRunAnalysis = async (keyToUse?: string) => {
    if (!entity) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const activeKey = keyToUse !== undefined ? keyToUse : apiKey;
      const res = await analyzeEntityWithJev(entity, activeKey);
      setAnalysis(res);
    } catch (err: any) {
      console.error('Failed to run Jev decision call:', err);
      setErrorMsg(err.message || 'Failed to communicate with OpenRouter');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    setOpenRouterApiKey(apiKey);
    setJevModel(model);
    setShowKeyConfig(false);
    handleRunAnalysis(apiKey);
  };

  if (!entity) return null;

  const isCritical = entity.risk_level === 'Critical';
  const isHigh = entity.risk_level === 'High';

  const riskScore = entity.risk_score;
  const riskPct = Math.min((riskScore / 100) * 100, 100);
  const riskColor = isCritical
    ? 'bg-rose-500'
    : isHigh
    ? 'bg-amber-500'
    : 'bg-yellow-400';
  const riskTextColor = isCritical
    ? 'text-rose-600 dark:text-rose-400'
    : isHigh
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-yellow-600 dark:text-yellow-400';
  const riskBgColor = isCritical
    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60'
    : isHigh
    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60'
    : 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800/60';

  const findings = [
    {
      icon: Users,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      label: 'Counterparty Dispersion',
      value: `${entity.distinct_emails_count} distinct counterparties (fan-out: ${entity.fan_out_ratio})`,
      severity: entity.distinct_emails_count > 20 ? 'high' : 'medium',
    },
    {
      icon: AlertTriangle,
      color: entity.contains_keyword ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400',
      bg: entity.contains_keyword ? 'bg-rose-50 dark:bg-rose-950/60' : 'bg-slate-50 dark:bg-slate-900/60',
      label: 'Keyword Detection',
      value: entity.contains_keyword
        ? 'Illicit substance keywords detected (weed / canna / vape / dispensary)'
        : 'No overt drug keywords detected in memo parameters',
      severity: entity.contains_keyword ? 'critical' : 'clear',
    },
    {
      icon: TrendingUp,
      color: entity.volume_spike_pct > 25 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      bg: entity.volume_spike_pct > 25 ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-emerald-50 dark:bg-emerald-950/60',
      label: 'Velocity Surge',
      value: `${entity.volume_spike_pct}% volume increase relative to baseline`,
      severity: entity.volume_spike_pct > 25 ? 'high' : 'medium',
    },
    {
      icon: Building2,
      color: entity.interbank_pct > 70 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400',
      bg: entity.interbank_pct > 70 ? 'bg-purple-50 dark:bg-purple-950/60' : 'bg-slate-50 dark:bg-slate-900/60',
      label: 'Interbank Dispersal',
      value: `${entity.interbank_pct}% of transactions routed across external banking operators`,
      severity: entity.interbank_pct > 70 ? 'high' : 'medium',
    },
  ];

  const severityBadge = (s: string) => {
    const map: Record<string, string> = {
      critical: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
      high: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
      medium: 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300',
      clear: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    };
    return map[s] || map.medium;
  };

  const handleCopy = () => {
    if (analysis?.forensicNarrative) {
      navigator.clipboard.writeText(analysis.forensicNarrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-popover border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-0 gap-0 shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-200 dark:border-slate-800 pr-12 bg-white dark:bg-slate-950/50">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-500 shrink-0 mt-0.5">
              <Brain size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  AI Typology Dossier
                </h2>
                {analysis?.isLiveApi ? (
                  <Badge variant="cyan" className="text-[10px] font-mono flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Jev-1.13</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    System-One Calibrated Engine
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono truncate max-w-md">
                Subject: {entity.grouping_key} · {entity.client_name}
              </p>
            </div>
          </div>

          {/* Top Actions: Settings & Refresh */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyConfig(v => !v)}
              className="h-8 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <Key size={13} className={apiKey ? 'text-emerald-500' : 'text-slate-400'} />
              <span>{apiKey ? 'OpenRouter Connected' : 'Set API Key'}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              disabled={loading}
              onClick={() => handleRunAnalysis()}
              className="h-8 text-xs font-bold bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-sky-500 cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Evaluating...' : 'Re-evaluate'}</span>
            </Button>
          </div>
        </div>

        {/* ── API Key Configuration Bar (Collapsible) ── */}
        {showKeyConfig && (
          <div className="p-4 bg-slate-900 border-b border-slate-800 text-white space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Key size={14} className="text-sky-400" />
                <span>OpenRouter API Key &amp; Jev Decision Model Configuration</span>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:underline flex items-center space-x-1 font-medium"
              >
                <span>Get OpenRouter API Key</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  OpenRouter API Key (sk-or-v1-...)
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
                  className="h-8 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Decision Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModelState(e.target.value)}
                  className="h-8 w-full bg-slate-950 border border-slate-700 rounded-lg text-xs px-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="typesafe/jev-1.13">typesafe/jev-1.13 (Default)</option>
                  <option value="typesafe/jev-router">typesafe/jev-router</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyConfig(false)}
                className="h-7 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveApiKey}
                className="h-7 text-xs font-bold bg-sky-500 text-slate-950 hover:bg-sky-400"
              >
                Save &amp; Run Jev Analysis
              </Button>
            </div>
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Loading Indicator */}
          {loading && (
            <div className="p-6 rounded-2xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-sky-500/10 rounded-full text-sky-500">
                <RefreshCw size={24} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Querying TypeSafe Jev Decision Engine...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Evaluating counterparty graph, dispersion fan-out, and regulatory thresholds on OpenRouter.
                </p>
              </div>
            </div>
          )}

          {/* Main Jev Decision Results */}
          {!loading && analysis && (
            <>
              {/* 1. JEV DECISION PRIMITIVES MATRIX */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* 1A. Typology Classification (Choice Primitive) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Choice Primitive
                    </span>
                    <Badge variant="cyan" className="text-[10px] font-mono">
                      {Math.round(analysis.typology.confidence * 100)}% Conf
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block">Classified Typology</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5 leading-snug">
                      {analysis.typology.winningLabel}
                    </span>
                  </div>
                  {/* Probability Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span>Probability Density</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {Math.round(analysis.typology.confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${Math.round(analysis.typology.confidence * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 1B. STR Escalation (Noul Primitive - Calibrated Probability) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Noul Primitive (Yes/No)
                    </span>
                    <Badge
                      className={`text-[10px] font-mono font-bold ${
                        analysis.strEscalation.required
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {analysis.strEscalation.required ? 'STR Required' : 'Review Only'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block">FINTRAC Escalation</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                      {analysis.strEscalation.required ? 'Immediate SAR/STR Warranted' : 'Low Suspicion Threshold'}
                    </span>
                  </div>
                  {/* Calibrated Probability Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span>Calibrated Probability</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {(analysis.strEscalation.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${analysis.strEscalation.required ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(analysis.strEscalation.probability * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 1C. Risk Score Rubric (Score Primitive) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Score Primitive
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Tier {analysis.riskSeverity.scoreValue} / 4
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block">Risk Rubric Severity</span>
                    <span className={`text-sm font-bold block mt-0.5 ${riskTextColor}`}>
                      {analysis.riskSeverity.tier}
                    </span>
                  </div>
                  {/* 4-Level Step Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span>Assigned Risk Level</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{entity.risk_score} / 100</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((tier) => (
                        <div
                          key={tier}
                          className={`h-1.5 rounded-full ${
                            tier <= analysis.riskSeverity.scoreValue
                              ? tier === 4
                                ? 'bg-rose-500'
                                : tier === 3
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. RECOMMENDED ACTION DIRECTIVE */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono flex items-center space-x-1.5">
                  <Zap size={12} />
                  <span>Jev Prescribed Remediation Directive</span>
                </div>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                  {analysis.recommendedAction.action}
                </h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  {analysis.recommendedAction.description}
                </p>
              </div>

              {/* 3. FORENSIC INDICATORS & BEHAVIORAL TRIGGERS */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                  Forensic Indicators &amp; Behavioral Triggers
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {findings.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl"
                    >
                      <div className={`p-1.5 rounded-lg ${f.bg} shrink-0 mt-0.5`}>
                        <f.icon size={13} className={f.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{f.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${severityBadge(f.severity)}`}>
                            {f.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. RAW DOSSIER NARRATIVE (COLLAPSIBLE) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowRawNarrative(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <FileText size={13} />
                    <span>Formatted Case Dossier Narrative (for FINTRAC Export)</span>
                  </span>
                  {showRawNarrative ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showRawNarrative && (
                  <div className="relative">
                    <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-[10.5px] leading-relaxed overflow-x-auto whitespace-pre-wrap border-t border-slate-800">
                      {analysis.forensicNarrative}
                    </pre>
                    <button
                      onClick={handleCopy}
                      className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer shadow-sm transition-colors"
                    >
                      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 5. JEV PROMPT STATE AUDIT (COLLAPSIBLE) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowRawState(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/40 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Activity size={12} />
                    <span>View Jev System-One Input State Payload</span>
                  </span>
                  {showRawState ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {showRawState && (
                  <pre className="p-4 bg-slate-950 text-sky-300/80 font-mono text-[10px] leading-relaxed overflow-x-auto whitespace-pre-wrap border-t border-slate-800 max-h-48">
                    {analysis.rawState}
                  </pre>
                )}
              </div>
            </>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
            <Sparkles size={12} className="text-sky-500" />
            <span>TypeSafe Jev · OpenRouter Decisions API</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!analysis}
              className="text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check size={12} className="mr-1.5 text-emerald-500" /> : <Copy size={12} className="mr-1.5" />}
              {copied ? 'Copied!' : 'Copy Dossier'}
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="text-xs font-bold cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AiAnalysisModal;
