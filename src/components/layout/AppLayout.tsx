import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Network,
  Zap,
  FileBarChart,
  List as ListIcon,
  Upload,
  RefreshCw,
  Sparkles,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useTheme } from '../../utils/useTheme';
import { useTriageStore } from '../../store/useTriageStore';
import { PaymentRail } from '../../types/rails';
import { parseExcelFile } from '../../utils/excelDataLoader';

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
  const [isProcessing, setIsProcessing] = useState(false);

  // Zustand Store
  const {
    dataState,
    setDataState,
    activeRail,
    setActiveRail,
    currentUser,
    loadSampleDataForRail
  } = useTriageStore();

  const handleGlobalFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await parseExcelFile(buffer);
      setDataState(result);
    } catch (err: any) {
      alert(err.message || 'Error processing Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const groups = dataState?.groupedEntities || [];

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
      label: 'Overview',
      icon: Activity,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'explorer',
      path: '/explorer',
      label: 'Cluster explorer',
      icon: Network,
      badge: groups.length > 0 ? groups.length : null,
      badgeVariant: undefined
    },
    {
      id: 'rules',
      path: '/rules',
      label: 'Rule engine',
      icon: Zap,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'reports',
      path: '/reports',
      label: 'Reports',
      icon: FileBarChart,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'watchlists',
      path: '/watchlists',
      label: 'Watchlists',
      icon: ListIcon,
      badge: null,
      badgeVariant: undefined
    },
    {
      id: 'settings',
      path: '/settings',
      label: 'Settings',
      icon: Sliders,
      badge: null,
      badgeVariant: undefined
    },
  ];

  const handleRailSwitch = (newRail: PaymentRail) => {
    setActiveRail(newRail);
    loadSampleDataForRail(newRail, 250);
  };

  const getViewTitle = (path: string): string => {
    if (path === '/') return 'Overview';
    if (path.startsWith('/explorer')) return 'Cluster explorer';
    if (path.startsWith('/triage')) return 'Triage & investigation';
    if (path.startsWith('/rules')) return 'Rule engine';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/watchlists')) return 'Watchlists';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Command Center';
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-200">
        
        {/* ========================================================================= */}
        {/* 1. PERSISTENT GLOBAL LEFT NAVIGATION RAIL                                  */}
        {/* ========================================================================= */}
        <aside className="w-20 bg-card border-r border-border flex flex-col items-center py-4 shrink-0 z-40 transition-colors duration-200">
          
          {/* BRAND ICON / LOGO (DC Bank Inspired Cut-Bars Monogram) */}
          <button
            onClick={() => handleNav('/', 'home')}
            className="w-11 h-11 bg-[#0D1733] hover:bg-[#142247] rounded-xl flex flex-col items-center justify-center text-white mb-6 shadow-sm group relative overflow-hidden cursor-pointer transition-all"
            title="LEON - Digital Commerce Bank AML Engine"
            aria-label="LEON DC Bank Home"
          >
            {/* DC Bank styled bar pattern */}
            <div className="flex flex-col gap-0.5 items-center w-6">
              <div className="h-0.5 w-full bg-[#1E50D9] rounded-full group-hover:bg-blue-400 transition-colors" />
              <div className="h-0.5 w-4/5 bg-white/90 rounded-full group-hover:bg-white transition-colors self-start" />
              <div className="h-0.5 w-full bg-[#1E50D9] rounded-full group-hover:bg-blue-400 transition-colors" />
              <div className="h-0.5 w-3/5 bg-white/80 rounded-full group-hover:bg-white transition-colors self-start" />
            </div>
            <span className="text-[8px] font-mono tracking-widest text-blue-200 uppercase font-bold mt-1">
              DCB
            </span>
          </button>

          {/* NAV ICONS */}
          <div className="flex flex-col space-y-2 w-full items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isViewActive(currentPath, item.id);

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleNav(item.path, item.id)}
                      className={`flex justify-center w-full group relative cursor-pointer py-1.5 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-lg transition-all duration-150 relative ${
                          isActive
                            ? 'bg-accent'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Icon size={19} />
                        {item.badge && (
                          <span
                            className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold font-mono border ${
                              item.badgeVariant === 'critical'
                                ? 'bg-destructive text-destructive-foreground border-transparent'
                                : 'bg-primary text-primary-foreground border-transparent'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium text-xs bg-popover text-popover-foreground border-border">
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
                  className="p-2.5 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {effectiveTheme === 'dark' ? (
                    <Sun size={17} className="text-amber-400" />
                  ) : (
                    <Moon size={17} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium text-xs">
                Switch to {effectiveTheme === 'dark' ? 'Light' : 'Dark'} Mode
              </TooltipContent>
            </Tooltip>

            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="System Live & Operational" />
            
            {/* Analyst Avatar with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-9 h-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold cursor-default">
                  {currentUser.initials}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium text-xs">
                {currentUser.name} ({currentUser.role})
              </TooltipContent>
            </Tooltip>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. MAIN CONTAINER & TOP GLOBAL TELEMETRY BAR                              */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background transition-colors duration-200">
          
          {/* TOP APP BAR */}
          <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 z-30 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-foreground text-sm tracking-tight flex items-center gap-1.5">
                  LEON
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                    DC Bank
                  </span>
                </span>
                <span className="text-border">/</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {getViewTitle(currentPath)}
                </span>
              </div>

              {/* Dynamic Payment Rail Selector */}
              <div className="flex items-center bg-muted border border-border rounded-md p-0.5 text-xs font-medium ml-2">
                <button
                  onClick={() => handleRailSwitch('ETRANSFER')}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-all cursor-pointer border ${
                    activeRail === 'ETRANSFER'
                      ? 'bg-card text-foreground border-border shadow-sm'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  Interac e-Transfer
                </button>
                <button
                  onClick={() => handleRailSwitch('CARD')}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-all cursor-pointer border ${
                    activeRail === 'CARD'
                      ? 'bg-card text-foreground border-border shadow-sm'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  Card Rail
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center space-x-2">
              {/* Ingest Excel File Button */}
              <input
                type="file"
                id="global-excel-file-input"
                accept=".xlsx,.xls"
                className="hidden"
                disabled={isProcessing}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleGlobalFileUpload(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
              />
              <label
                htmlFor="global-excel-file-input"
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer select-none ${
                  isProcessing
                    ? 'border-border text-muted-foreground cursor-not-allowed'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                {isProcessing ? (
                  <RefreshCw size={13} className="animate-spin text-primary" />
                ) : (
                  <Upload size={13} className="text-muted-foreground" />
                )}
                <span>{isProcessing ? 'Processing…' : 'Ingest .xlsx'}</span>
              </label>

              {/* Sample Data Fast-Track Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => loadSampleDataForRail(activeRail, 250)}
              >
                <Sparkles size={13} className="mr-1.5" />
                {groups.length > 0 ? 'Reload sample' : 'Load demo batch'}
              </Button>
            </div>
          </header>

          {/* VIEW WORKSPACE */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-background">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AppLayout;

