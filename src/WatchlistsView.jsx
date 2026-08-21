import React, { useState } from 'react';
import {
  List as ListIcon,
  Plus,
  Trash2,
  Search,
  Activity,
  Network,
  Zap,
  FileBarChart,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from './components/ui/table';
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

const INITIAL_WATCHLISTS = [
  { id: 1, email: 'send@bytex.ca', type: 'Illicit Merchant (Unlicensed Dispensary)', addedBy: 'LEON AML Engine', date: '2026-08-10', risk: 'Critical' },
  { id: 2, email: 'transact@bytex.ca', type: 'Illicit Merchant Linked Cluster', addedBy: 'Leo.moncada', date: '2026-08-11', risk: 'Critical' },
  { id: 3, email: 'orders@vapegoods.ca', type: 'High Velocity Recipient', addedBy: 'Leo.moncada', date: '2026-08-12', risk: 'Elevated' },
  { id: 4, email: 'sales@pvpay.ca', type: 'Shell Merchant Sub-Entity', addedBy: 'LEON AML Engine', date: '2026-08-15', risk: 'Critical' },
  { id: 5, email: 'crypto.wash@protonmail.com', type: 'Sanctioned / Crypto Mixer', addedBy: 'Compliance Ops', date: '2026-08-18', risk: 'Critical' }
];

const WatchlistsView = ({ onNavigate, dataState }) => {
  const [watchlists, setWatchlists] = useState(INITIAL_WATCHLISTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('Illicit Merchant');
  const [newRisk, setNewRisk] = useState('Critical');

  const filteredWatchlists = watchlists.filter(w =>
    w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const entry = {
      id: Date.now(),
      email: newEmail.trim(),
      type: newType,
      addedBy: 'Leo.moncada (Lead Analyst)',
      date: new Date().toISOString().slice(0, 10),
      risk: newRisk
    };

    setWatchlists(prev => [entry, ...prev]);
    setNewEmail('');
    setIsAddOpen(false);
    showToast(`Added ${entry.email} to active AML Watchlist`);
  };

  const handleDelete = (id, email) => {
    setWatchlists(prev => prev.filter(w => w.id !== id));
    showToast(`Removed ${email} from Watchlist`);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full font-sans transition-colors duration-200">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Watchlists & Entity Blacklists</h1>
            <Badge variant="critical" className="font-mono text-xs uppercase">FINTRAC Registry</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain high-risk recipient emails, blacklisted merchant domains, and flagged Interac accounts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {toastMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center shadow-lg animate-in fade-in">
              <CheckCircle size={14} className="mr-1.5 text-emerald-600 dark:text-emerald-400" />
              {toastMsg}
            </div>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-bold"
          >
            <Plus size={15} className="mr-1.5" />
            Add Watchlist Entry
          </Button>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card className="shadow-sm dark:shadow-2xl">
        <CardHeader className="p-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center">
              <ListIcon size={18} className="mr-2 text-sky-600 dark:text-sky-400" />
              Flagged Watchlist Entities ({filteredWatchlists.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active triggers auto-tag any batch containing these identifiers with high risk.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Filter watchlist emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-950/80">
              <TableRow className="border-slate-200 dark:border-slate-800/80">
                <TableHead>Identifier / Email</TableHead>
                <TableHead>Watchlist Category</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Risk Severity</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWatchlists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No watchlist entries match the search filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWatchlists.map((w) => (
                  <TableRow key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800/60">
                    <TableCell className="font-mono text-slate-900 dark:text-white font-semibold py-3 text-xs">
                      {w.email}
                    </TableCell>
                    <TableCell className="text-slate-800 dark:text-slate-300 py-3 text-xs font-medium">
                      {w.type}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 py-3 text-xs font-medium">
                      {w.addedBy}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 dark:text-slate-400 py-3 text-xs">
                      {w.date}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant={w.risk === 'Critical' ? 'critical' : 'elevated'}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {w.risk}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(w.id, w.email)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 h-7 w-7"
                        title="Remove from watchlist"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD ENTRY MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center">
              <ShieldAlert size={18} className="mr-2 text-rose-600 dark:text-rose-400" />
              Add Watchlist Entry
            </DialogTitle>
            <DialogDescription className="text-xs">
              Transactions containing this identifier will be automatically flagged as high risk across all ingested batches.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddEntry} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email / Identifier / Handle
              </label>
              <Input
                type="text"
                placeholder="e.g. merchant@illicitshop.ca"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Watchlist Category
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="Illicit Merchant (Unlicensed Dispensary)">Illicit Merchant (Unlicensed Dispensary)</option>
                <option value="Crypto Mixer / Wash Account">Crypto Mixer / Wash Account</option>
                <option value="High Velocity Mule Account">High Velocity Mule Account</option>
                <option value="Sanctioned Entity">Sanctioned Entity</option>
                <option value="Internal Fraud Watch">Internal Fraud Watch</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Risk Severity
              </label>
              <div className="flex gap-3">
                <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="risk"
                    value="Critical"
                    checked={newRisk === 'Critical'}
                    onChange={() => setNewRisk('Critical')}
                    className="accent-rose-500"
                  />
                  <span>Critical (Auto Block)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="risk"
                    value="Elevated"
                    checked={newRisk === 'Elevated'}
                    onChange={() => setNewRisk('Elevated')}
                    className="accent-amber-500"
                  />
                  <span>Elevated (Flag for Review)</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="text-xs font-bold"
              >
                Add to Watchlist
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default WatchlistsView;
