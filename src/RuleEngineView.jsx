import React, { useState, useMemo } from 'react';
import {
  Zap,
  Inbox,
  Briefcase,
  List as ListIcon,
  Settings,
  FileBarChart,
  Search,
  Plus,
  Filter,
  Edit2,
  Play,
  Pause,
  Trash2,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  MoreVertical,
  Save,
  X,
  CornerDownRight,
  Database,
  Activity,
  Network,
  Sparkles,
  Sliders,
  Tag,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './components/ui/dialog';

const INITIAL_RULES = [
  {
    id: 'R-1285',
    name: 'High Volume Keyword Velocity',
    type: 'Near Real-Time',
    status: 'Active',
    target: 'e-Transfer',
    lastEdited: '2 days ago',
    severity: 'Critical',
    description: 'Triggers when an entity receives multiple small e-transfers matching illicit substance keywords (weed, canna, dispensary) in memo or recipient fields.',
    keywords: ['weed', 'canna', 'dispensary', 'edibles', 'cbd'],
    minAmount: 50,
    maxAmount: 250,
    velocityThreshold: 20
  },
  {
    id: 'R-0412',
    name: 'Fan-out / Mule Velocity Spike',
    type: 'Near Real-Time',
    status: 'Active',
    target: 'EFT / ACH',
    lastEdited: '1 week ago',
    severity: 'Warning',
    description: 'Detects rapid fund fan-out patterns across multiple new recipients within a short time window.',
    keywords: [],
    minAmount: 1000,
    maxAmount: 10000,
    velocityThreshold: 10
  },
  {
    id: 'R-0099',
    name: 'Platform-Level High Return Rate',
    type: 'Real-Time',
    status: 'Paused',
    target: 'All Rails',
    lastEdited: '1 month ago',
    severity: 'Review',
    description: 'Monitors aggregate transaction return rates crossing above the 1% risk threshold.',
    keywords: [],
    minAmount: 0,
    maxAmount: 100000,
    velocityThreshold: 50
  },
];

const RuleEngineView = ({ onNavigate, dataState }) => {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState('R-1285');
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Editable Form Buffer
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMinAmount, setEditMinAmount] = useState(0);
  const [editMaxAmount, setEditMaxAmount] = useState(0);
  const [editVelocity, setEditVelocity] = useState(0);
  const [editSeverity, setEditSeverity] = useState('Warning');
  const [editKeywords, setEditKeywords] = useState([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  const selectedRule = useMemo(() => {
    return rules.find(r => r.id === selectedRuleId) || rules[0] || INITIAL_RULES[0];
  }, [rules, selectedRuleId]);

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return rules;
    const q = searchQuery.toLowerCase();
    return rules.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.target.toLowerCase().includes(q)
    );
  }, [rules, searchQuery]);

  const handleSelectRule = (rule) => {
    setSelectedRuleId(rule.id);
    setIsEditing(false);
    setEditName(rule.name);
    setEditDesc(rule.description || '');
    setEditMinAmount(rule.minAmount || 0);
    setEditMaxAmount(rule.maxAmount || 0);
    setEditVelocity(rule.velocityThreshold || 0);
    setEditSeverity(rule.severity || 'Warning');
    setEditKeywords([...(rule.keywords || [])]);
  };

  const handleStartEdit = () => {
    setEditName(selectedRule.name);
    setEditDesc(selectedRule.description || '');
    setEditMinAmount(selectedRule.minAmount || 0);
    setEditMaxAmount(selectedRule.maxAmount || 0);
    setEditVelocity(selectedRule.velocityThreshold || 0);
    setEditSeverity(selectedRule.severity || 'Warning');
    setEditKeywords([...(selectedRule.keywords || [])]);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updated = rules.map(r => {
      if (r.id === selectedRule.id) {
        return {
          ...r,
          name: editName.trim() || r.name,
          description: editDesc.trim(),
          minAmount: Number(editMinAmount) || 0,
          maxAmount: Number(editMaxAmount) || 0,
          velocityThreshold: Number(editVelocity) || 0,
          severity: editSeverity,
          keywords: editKeywords,
          lastEdited: 'Just now'
        };
      }
      return r;
    });
    setRules(updated);
    setIsEditing(false);
    showToast(`Rule ${selectedRule.id} logic updated successfully.`);
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;
    const kw = newKeywordInput.trim().toLowerCase();
    if (!editKeywords.includes(kw)) {
      setEditKeywords([...editKeywords, kw]);
    }
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (kwToRemove) => {
    setEditKeywords(editKeywords.filter(k => k !== kwToRemove));
  };

  // Interactive Live Rule Simulation against current loaded dataset
  const handleSimulateRule = () => {
    setIsSimulating(true);
    setSimResults(null);

    setTimeout(() => {
      const groups = dataState?.groupedEntities || [];
      const minA = isEditing ? Number(editMinAmount) : selectedRule.minAmount;
      const maxA = isEditing ? Number(editMaxAmount) : selectedRule.maxAmount;
      const vel = isEditing ? Number(editVelocity) : selectedRule.velocityThreshold;
      const kws = isEditing ? editKeywords : (selectedRule.keywords || []);

      let matchedClusters = 0;
      let matchedTxns = 0;
      let matchedVolume = 0;
      const sampleHits = [];

      groups.forEach(g => {
        const txns = g.transactions || [];
        const hasKeyword = kws.length === 0 || txns.some(t => {
          const text = `${t.memo || ''} ${t.recipient_name || ''}`.toLowerCase();
          return kws.some(k => text.includes(k));
        });

        const amountInRange = txns.some(t => t.amount >= minA && t.amount <= maxA);
        const velocityBreach = g.transaction_count >= vel;

        if (hasKeyword && (amountInRange || txns.length === 0) && (velocityBreach || g.transaction_count >= 1)) {
          matchedClusters += 1;
          matchedTxns += g.transaction_count || 0;
          matchedVolume += g.total_amount || 0;
          if (sampleHits.length < 5) {
            sampleHits.push({ key: g.grouping_key, amount: g.total_amount, txCount: g.transaction_count });
          }
        }
      });

      const totalCount = groups.length || 1;
      const breachRate = Math.round((matchedClusters / totalCount) * 100);

      setSimResults({
        totalClusters: groups.length,
        matchedClusters,
        matchedTxns,
        matchedVolume,
        breachRate,
        matchedClusterSamples: sampleHits
      });
    }, 400);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* 1. RULE LIBRARY SIDEBAR */}
      <aside className="w-80 bg-white dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 transition-colors duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <Zap size={16} className="mr-2 text-amber-500" />
              Rule Library ({rules.length})
            </h2>
            <Button
              variant="default"
              size="icon-sm"
              onClick={() => {
                const newId = `R-${Math.floor(1000 + Math.random() * 9000)}`;
                const newRule = {
                  id: newId,
                  name: 'New Custom AML Rule',
                  type: 'Near Real-Time',
                  status: 'Active',
                  target: 'e-Transfer',
                  lastEdited: 'Just now',
                  severity: 'Warning',
                  description: 'Custom risk rule for automated transaction classification.',
                  keywords: ['crypto', 'wash'],
                  minAmount: 100,
                  maxAmount: 500,
                  velocityThreshold: 15
                };
                setRules([newRule, ...rules]);
                handleSelectRule(newRule);
                setIsEditing(true);
                showToast(`Created draft rule ${newId}`);
              }}
              className="h-7 w-7"
              title="Create New Rule"
            >
              <Plus size={14} />
            </Button>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Search rule library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Rule List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/50">
          {filteredRules.map((rule) => {
            const isSelected = rule.id === selectedRuleId;
            return (
              <div
                key={rule.id}
                onClick={() => handleSelectRule(rule)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-50/50 dark:bg-slate-900/90 border-l-2 border-l-amber-500 shadow-xs dark:shadow-inner'
                    : 'hover:bg-slate-100/70 dark:hover:bg-slate-900/40 border-l-2 border-l-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold">{rule.id}</span>
                  <Badge
                    variant={rule.status === 'Active' ? 'compliant' : 'secondary'}
                    className="text-[9px] px-1.5 py-0 font-mono"
                  >
                    {rule.status === 'Active' ? '● Active' : '○ Paused'}
                  </Badge>
                </div>
                <h3 className={`text-xs font-bold leading-snug mb-1 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-300'}`}>
                  {rule.name}
                </h3>
                <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 mt-2">
                  <Badge variant="outline" className="text-[9px] px-1 py-0 font-medium">
                    {rule.target}
                  </Badge>
                  <span className="flex items-center font-mono font-medium">
                    <Clock size={10} className="mr-1 text-slate-500" /> {rule.lastEdited}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* 2. RULE BUILDER & LOGIC WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Workspace Top Header */}
        <header className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/60 sticky top-0 z-20 backdrop-blur flex justify-between items-center transition-colors duration-200">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded font-bold">
                {selectedRule.id}
              </span>
              <Badge variant="cyan" className="text-[10px] uppercase font-mono">
                {selectedRule.target}
              </Badge>
              <Badge
                variant={(isEditing ? editSeverity : selectedRule.severity) === 'Critical' ? 'critical' : 'elevated'}
                className="text-[10px]"
              >
                {isEditing ? editSeverity : selectedRule.severity} Severity
              </Badge>
            </div>

            {isEditing ? (
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-lg font-bold text-slate-900 dark:text-white h-9 mt-1"
                placeholder="Rule Name..."
              />
            ) : (
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {selectedRule.name}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {toastMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1.5 rounded-xl flex items-center shadow animate-in fade-in">
                <CheckCircle size={14} className="mr-1.5 text-emerald-600 dark:text-emerald-400" />
                {toastMsg}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateRule}
              className="text-xs font-semibold"
            >
              <Database size={14} className="mr-1.5 text-sky-600 dark:text-sky-400" />
              Simulate vs Active Batch
            </Button>

            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="text-xs font-bold"
                >
                  <Save size={14} className="mr-1.5" /> Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleStartEdit}
                className="text-xs font-semibold"
              >
                <Edit2 size={14} className="mr-1.5 text-sky-600 dark:text-sky-400" /> Edit Rule Logic
              </Button>
            )}
          </div>
        </header>

        {/* Builder Content */}
        <div className="p-6 md:p-8 max-w-5xl space-y-6">
          
          {/* Rule Description */}
          <Card>
            <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center">
                <Settings size={16} className="mr-2 text-sky-600 dark:text-sky-400" />
                Analyst Policy & Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {isEditing ? (
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 h-20 resize-none shadow-xs"
                  placeholder="Analyst guidelines on when this rule triggers..."
                />
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedRule.description || 'No description provided for this detection rule.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Condition Logic Parameters Card */}
          <Card>
            <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center">
                <Sliders size={16} className="mr-2 text-sky-600 dark:text-sky-400" />
                Condition Logic Parameters (Live Editable)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                If ALL conditions are satisfied within an entity cluster, the rule fires and escalates the risk score.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              
              {/* Condition 1: Amount Threshold */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="font-mono text-[10px] font-bold">IF</Badge>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Transaction Amount (CAD)</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">is between</span>
                </div>

                {isEditing ? (
                  <div className="flex items-center space-x-3 pt-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Min $</span>
                      <Input
                        type="number"
                        value={editMinAmount}
                        onChange={(e) => setEditMinAmount(e.target.value)}
                        className="w-24 h-8 text-xs font-mono"
                      />
                    </div>
                    <span className="text-slate-400 dark:text-slate-500">—</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Max $</span>
                      <Input
                        type="number"
                        value={editMaxAmount}
                        onChange={(e) => setEditMaxAmount(e.target.value)}
                        className="w-28 h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block shadow-xs">
                    ${selectedRule.minAmount} — ${selectedRule.maxAmount} CAD
                  </span>
                )}
              </div>

              {/* Condition 2: Velocity Count */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="cyan" className="font-mono text-[10px] font-bold">AND</Badge>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">24-Hour Velocity Spike</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">exceeds threshold</span>
                </div>

                {isEditing ? (
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">&gt;</span>
                    <Input
                      type="number"
                      value={editVelocity}
                      onChange={(e) => setEditVelocity(e.target.value)}
                      className="w-24 h-8 text-xs font-mono"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">transactions per entity cluster</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block shadow-xs">
                    &gt; {selectedRule.velocityThreshold} txns / entity
                  </span>
                )}
              </div>

              {/* Condition 3: Illicit Keywords */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="cyan" className="font-mono text-[10px] font-bold">AND</Badge>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Memo / Recipient Name / Security Answer</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">contains any illicit keywords</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(isEditing ? editKeywords : selectedRule.keywords).length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No keyword filter applied (matches all memos)</span>
                  ) : (
                    (isEditing ? editKeywords : selectedRule.keywords).map(kw => (
                      <Badge
                        key={kw}
                        variant="critical"
                        className="font-mono text-xs px-2.5 py-1 flex items-center space-x-1"
                      >
                        <Tag size={10} className="mr-1 opacity-70" />
                        <span>"{kw}"</span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveKeyword(kw)}
                            className="ml-1.5 hover:text-slate-900 dark:hover:text-white text-rose-600 dark:text-rose-300 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </Badge>
                    ))
                  )}
                </div>

                {isEditing && (
                  <form onSubmit={handleAddKeyword} className="flex items-center space-x-2 pt-2">
                    <Input
                      type="text"
                      placeholder="Add keyword (e.g. vape, pill, mixer)..."
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      className="max-w-xs h-8 text-xs font-mono"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs font-semibold"
                    >
                      <Plus size={13} className="mr-1" /> Add Keyword
                    </Button>
                  </form>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Dedicated Live Simulation Card */}
          <Card className="bg-gradient-to-r from-sky-50 via-white to-indigo-50 dark:from-sky-950/40 dark:via-slate-900/60 dark:to-indigo-950/40 border-sky-200 dark:border-sky-800/60 shadow-md dark:shadow-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles size={18} className="text-sky-600 dark:text-sky-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Interactive Rule Simulation Engine</h3>
                  <Badge variant="cyan" className="text-[10px]">Real-Time Dry Run</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Simulate this rule's conditions against the active batch ({dataState?.totalRecords || 300} transactions) to test false positives and breach counts before publishing.
                </p>
              </div>

              <Button
                variant="default"
                size="default"
                onClick={handleSimulateRule}
                className="font-extrabold px-5 py-2.5 shadow-md shrink-0 cursor-pointer text-xs"
              >
                <Database size={15} className="mr-2" />
                Simulate vs Active Batch
              </Button>
            </div>
          </Card>

          {/* Outcome & Scoring Card */}
          <Card>
            <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center">
                <ShieldAlert size={16} className="mr-2 text-rose-600 dark:text-rose-400" />
                Action Outcome & Scoring Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-wrap items-center gap-8">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Base Risk Score Delta</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">+80 pts</span>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Alert Severity Tier</span>
                {isEditing ? (
                  <select
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value)}
                    className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                  >
                    <option value="Critical">Critical (SLA: 2h)</option>
                    <option value="Warning">Warning (SLA: 24h)</option>
                    <option value="Review">Review (SLA: 72h)</option>
                  </select>
                ) : (
                  <Badge variant={selectedRule.severity === 'Critical' ? 'critical' : 'elevated'} className="text-xs">
                    {selectedRule.severity} Priority Queue
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* DRY-RUN SIMULATION MODAL */}
      <Dialog open={isSimulating} onOpenChange={setIsSimulating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center">
              <Sparkles size={18} className="mr-2 text-sky-600 dark:text-sky-400" />
              Live Rule Simulation Results
            </DialogTitle>
            <DialogDescription className="text-xs">
              Evaluated rule logic across all records in your active session batch.
            </DialogDescription>
          </DialogHeader>

          {simResults ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Matched Clusters</span>
                  <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{simResults.matchedClusters}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">of {simResults.totalClusters} total clusters</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Breach Hit Rate</span>
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{simResults.breachRate}%</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Cluster breach ratio</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Flagged Transaction Count:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{simResults.matchedTxns} txns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Flagged Volume:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${simResults.matchedVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })} CAD
                  </span>
                </div>
              </div>

              {simResults.matchedClusterSamples && simResults.matchedClusterSamples.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                    Sample Flagged Entities:
                  </span>
                  <div className="space-y-1">
                    {simResults.matchedClusterSamples.map((s, idx) => (
                      <div key={idx} className="p-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">{s.key}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${s.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Simulating rule execution across transaction graph...
            </div>
          )}

          <DialogFooter>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsSimulating(false)}
              className="text-xs font-bold"
            >
              Close Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default RuleEngineView;
