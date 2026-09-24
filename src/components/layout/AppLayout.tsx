import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Network,
  Zap,
  FileBarChart,
  List as ListIcon,
  ShieldCheck,
  Upload,
  Database,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Sliders,
  Sun,
  Moon,
  CreditCard,
  Layers
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useTheme } from '../../utils/useTheme';
import { useTriageStore } from '../../store/useTriageStore';
import { PaymentRail } from '../../types/rails';

interface AppLayoutProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView: propView,
  onNavigate: propNavigate,
  children
}) => {
  const { effectiveTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Zustand Store
  const {
    dataState,
    activeRail,
    setActiveRail,
    currentUser,
    loadSampleDataForRail
  } = useTriageStore();

  const groups = dataState?.groupedEntities || [];
  const totalVolume = groups.reduce((acc, g) => acc + (g.total_amount || 0), 0);
  const totalTxns = dataState?.totalRecords || groups.reduce((acc, g) => acc + (g.transaction_count || 0), 0);
  const criticalCount = groups.filter(g => g.risk_level === 'Critical').length;

  // Determine active view from URL or prop
  const currentPath = location.pathname;
  const isViewActive = (path: string, viewKey: string): boolean => {
    if (propView) return propView === viewKey;
    if (path === '/' && viewKey === 'home') return true;
    return path.startsWith(`/${viewKey}`);
  };

  const handleNav = (path: string, viewKey: string) => {
    if (propNavigate) propNavigate(viewKey);
    navigate(path);
  };

  const navItems = [
    {
      id: 'home',
      path: '/',
      label: 'Executive Command Center',
      icon: Activity,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'explorer',
      path: '/explorer',
      label: 'Cluster & Entity Explorer',
      icon: Network,
      badge: groups.length > 0 ? groups.length : null,
      badgeVariant: undefined
    },
    {
      id: 'triage',
      path: '/triage',
      label: 'Entity Triage & Investigation',
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeVariant: 'critical' as const,
    },
    {
      id: 'rules',
      path: '/rules',
      label: 'Rule Engine & Automation',
      icon: Zap,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'reports',
      path: '/reports',
      label: 'Reports & STR Filings',
      icon: FileBarChart,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'watchlists',
      path: '/watchlists',
      label: 'Watchlists & Blacklists',
      icon: ListIcon,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'settings',
      path: '/settings',
      label: 'Field Mapping & Configuration',
      icon: Sliders,
      badge: null,
      badgeVariant: undefined
    },
  ];

  const handleRailSwitch = (newRail: PaymentRail) => {
    setActiveRail(newRail);
    loadSampleDataForRail(newRail, 200);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen bg-slate-100 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
        
        {/* ========================================================================= */}
        {/* 1. PERSISTENT GLOBAL LEFT NAVIGATION RAIL                                  */}
        {/* ========================================================================= */}
        <aside className="w-20 bg-white dark:bg-[#10141E] border-r border-slate-200 dark:border-slate-800/80 flex flex-col items-center py-4 shrink-0 z-40 shadow-md dark:shadow-2xl transition-colors duration-200">
          
          {/* BRAND ICON / LOGO */}
          <button
            onClick={() => handleNav('/', 'home')}
            className="w-12 h-12 bg-gradient-to-br from-sky-500 via-indigo-600 to-indigo-800 rounded-2xl flex flex-col items-center justify-center text-white font-extrabold mb-7 shadow-lg shadow-sky-500/20 hover:scale-105 transition-all cursor-pointer border border-sky-400/30 group"
            title="LEON - Command Center Home"
          >
            <span className="text-[11px] tracking-tighter leading-none text-sky-200 font-black group-hover:text-white">
              LEON
            </span>
            <span className="text-[7px] tracking-widest text-sky-300 uppercase font-mono mt-0.5">
              AML
            </span>
          </button>

          {/* NAV ICONS */}
          <div className="flex flex-col space-y-4 w-full items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isViewActive(currentPath, item.id);

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleNav(item.path, item.id)}
                      className={`flex justify-center w-full group relative cursor-pointer py-1 ${
                        isActive
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-sky-500 dark:bg-sky-400 rounded-r-md shadow-sm shadow-sky-500/50" />
                      )}

                      <div
                        className={`p-2.5 rounded-xl transition-all duration-200 relative ${
                          isActive
                            ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 shadow-sm dark:shadow-inner'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <Icon size={19} />
                        {item.badge && (
                          <span
                            className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono border ${
                              item.badgeVariant === 'critical'
                                ? 'bg-rose-600 text-white border-rose-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* BOTTOM CONTROLS (THEME TOGGLE & AVATAR) */}
          <div className="mt-auto flex flex-col items-center space-y-4">
            {/* Quick Theme Switcher */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-amber-300 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer shadow-sm hover:scale-105"
                  aria-label="Toggle Theme"
                >
                  {effectiveTheme === 'dark' ? (
                    <Sun size={17} className="text-amber-400" />
                  ) : (
                    <Moon size={17} className="text-slate-700" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold text-xs">
                Switch to {effectiveTheme === 'dark' ? 'Light' : 'Dark'} Mode
              </TooltipContent>
            </Tooltip>

            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="System Live & Operational" />
            
            {/* Analyst Avatar with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 flex items-center justify-center text-xs font-bold text-sky-700 dark:text-sky-300 shadow cursor-default">
                  {currentUser.initials}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold text-xs">
                {currentUser.name} ({currentUser.role})
              </TooltipContent>
            </Tooltip>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. MAIN CONTAINER & TOP GLOBAL TELEMETRY BAR                              */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-200">
          
          {/* TOP APP BAR */}
          <header className="h-14 bg-white dark:bg-[#10141E] border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-30 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">LEON</span>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {currentPath === '/' && 'Executive Command Center'}
                  {currentPath.startsWith('/explorer') && 'Cluster & Entity Explorer'}
                  {currentPath.startsWith('/triage') && 'Entity Triage & Investigation'}
                  {currentPath.startsWith('/rules') && 'Rule Management Engine'}
                  {currentPath.startsWith('/reports') && 'Reports & Compliance Hub'}
                  {currentPath.startsWith('/watchlists') && 'Watchlists & Entity Registry'}
                  {currentPath.startsWith('/settings') && 'Field Mapping & Configuration'}
                </span>
              </div>

              {/* Dynamic Payment Rail Selector */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs font-mono">
                <button
                  onClick={() => handleRailSwitch('ETRANSFER')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    activeRail === 'ETRANSFER'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Interac e-Transfer
                </button>
                <button
                  onClick={() => handleRailSwitch('CARD')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    activeRail === 'CARD'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Card Rail
                </button>
              </div>
            </div>

            {/* TELEMETRY & QUICK ACTIONS */}
            <div className="flex items-center space-x-3">
              {groups.length > 0 ? (
                <div className="flex items-center space-x-2 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                    <Database size={13} className="text-sky-600 dark:text-sky-400" />
                    <span>Batch:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">{totalTxns.toLocaleString()} txns</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                    <span>Vol:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  {criticalCount > 0 && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span className="flex items-center text-rose-600 dark:text-rose-400 font-bold font-mono">
                        🔴 {criticalCount} Critical
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 hidden md:flex items-center">
                  No active dataset loaded
                </div>
              )}

              {/* Sample Data Fast-Track Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSampleDataForRail(activeRail, 250)}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:border-sky-400 cursor-pointer"
              >
                <Sparkles size={13} className="mr-1.5 text-sky-600 dark:text-sky-400" />
                {groups.length > 0 ? 'Reload Sample' : 'Load Demo Batch'}
              </Button>
            </div>
          </header>

          {/* VIEW WORKSPACE */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-100/50 dark:bg-[#0B0E14]">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AppLayout;
