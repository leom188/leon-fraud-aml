/**
 * Shared visual language for all Chart.js widgets.
 *
 * Keep every chart, toggle and legend on the same accent palette:
 *  - primary blue  -> "in / retained / recurring" series
 *  - secondary sky -> "out / dispersed / one-off" series
 *  - amber & red   -> reserved for risk signal (never for UI chrome)
 */
export const CHART_COLORS = {
  primary: '#1E50D9',
  primaryDark: '#1842B8',
  secondary: '#38BDF8',
  secondaryDark: '#0EA5E9',
  warning: '#F59E0B',
  warningDark: '#D97706',
  danger: '#EF4444',
  dangerDark: '#DC2626'
};

export const TOOLTIP = {
  backgroundColor: '#0f172a',
  titleFont: { size: 12, weight: 'bold' },
  bodyFont: { size: 11 },
  padding: 10,
  cornerRadius: 8
};

/** Segmented control container shared by every chart toggle. */
export const toggleGroup =
  'inline-flex items-center gap-1 bg-muted border border-border p-0.5 rounded-lg text-xs';

/** Segmented control button; pass whether it is the active option. */
export const toggleButton = (active) =>
  `inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer border ${
    active
      ? 'bg-card text-primary border-border shadow-sm'
      : 'text-muted-foreground hover:text-foreground border-transparent'
  }`;
