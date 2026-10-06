---
name: leon-dashboard-builder
description: >
  Design and build new analytical dashboards matching the LEON / DC Bank design system.
  Covers KPI cards, Chart.js widgets, data tables, module launchpads, and empty-state screens.
  Use whenever creating a new view, adding a new dashboard page, or extending an existing one.
---

# LEON Dashboard Builder

## Overview

LEON uses a premium financial-intelligence design language built on:
- **React + JSX** (or TSX for typed views)
- **Tailwind CSS v4** with semantic CSS custom properties (never hardcoded colors)
- **Chart.js 4** for data visualisations via a shared `chartTheme.js`
- **Lucide React** for all icons
- **shadcn-style UI primitives** in `src/components/ui/` (`Card`, `Badge`, `Button`, etc.)

---

## 1. Design Tokens (Never Use Raw Colors)

All colors come from CSS variables bridged into Tailwind utilities.

### Semantic Tailwind Utilities

| Utility | Purpose |
|---|---|
| `bg-background` | Page background (`#F8FAFC` light / `#0B132B` dark) |
| `bg-card` | Card / panel surface (`#FFF` light / `#10182E` dark) |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Subdued labels (`#64748B` light / `#94A3B8` dark) |
| `text-primary` | Brand blue (`#1E50D9` light / `#2356EC` dark) |
| `bg-muted` | Subtle fill for inner panels / stat rows (`#F1F5F9` / `#142247`) |
| `bg-accent` | Hover fills and active icon backgrounds (`#EEF2FF` / `#142247`) |
| `text-accent-foreground` | Text on accent (`#1E50D9` / `#60A5FA`) |
| `border-border` | Universal border color (`#E2E8F0` / `#1E2B4D`) |
| `text-destructive` | Risk-critical alert color |

### Typography

```
Font Sans:  'Plus Jakarta Sans' (via Google Fonts)
Font Mono:  'JetBrains Mono'
```

Use `font-mono` and `tabular-nums` on all numeric KPIs for stable layout.

---

## 2. Page Wrapper Pattern

Every dashboard view uses this outer container:

```jsx
<div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full font-sans transition-colors duration-200">
  {/* Page Header */}
  {/* KPI Cards Row */}
  {/* Chart Rows */}
  {/* Data Tables / Breakdown Sections */}
  {/* Module Launchpad (optional) */}
</div>
```

---

## 3. Page Header

Always a single `<h1>` (SEO) with an optional subtitle:

```jsx
<div className="pb-1">
  <h1 className="text-xl font-semibold text-foreground tracking-tight">
    Dashboard Title
  </h1>
  <p className="text-xs text-muted-foreground mt-1">
    System version · Rail or context descriptor
  </p>
</div>
```

---

## 4. KPI Stat Cards

Use a `grid grid-cols-1 md:grid-cols-3 gap-4` row. Each card follows this template:

```jsx
<Card className="p-5 flex flex-col justify-between">
  {/* Header row: label + icon */}
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-muted-foreground">
      Metric Group Label
    </span>
    <IconComponent size={15} className="text-muted-foreground" />
  </div>

  {/* Primary KPI Value */}
  <div className="mt-4">
    <span className="text-3xl font-semibold text-foreground tracking-tight tabular-nums">
      {formattedValue}
    </span>
    <div className="text-xs text-muted-foreground mt-1">
      Supporting context sentence
    </div>
  </div>

  {/* Sub-metrics strip */}
  <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3 text-xs">
    <div>
      <div className="text-muted-foreground text-[11px]">Sub-label</div>
      <div className="font-medium text-foreground tabular-nums mt-0.5">value</div>
    </div>
    <div>
      <div className="text-muted-foreground text-[11px]">Sub-label</div>
      <div className="font-medium text-primary tabular-nums mt-0.5">value</div>
    </div>
  </div>
</Card>
```

**Rules:**
- Use `text-rose-600 dark:text-rose-400` for negative/alert primary values
- Use `text-primary` to highlight an important sub-metric
- Always `tabular-nums` on numbers for column alignment
- Sub-metrics strip uses `grid-cols-2` for 2 sub-items, `grid-cols-3` for 3

---

## 5. Tri-Chart Intelligence Row

Three equal Chart.js cards in a `grid grid-cols-1 lg:grid-cols-3 gap-6` row:

```jsx
<Card className="flex flex-col justify-between">
  <CardHeader className="p-5 pb-4 border-b border-border">
    <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
      <Icon size={15} className="text-muted-foreground" />
      Chart Title
    </CardTitle>
    <CardDescription className="text-xs text-muted-foreground mt-1">
      One-line description of what the chart reveals.
    </CardDescription>
  </CardHeader>
  <CardContent className="p-5 flex-1 flex flex-col justify-between">
    <ChartComponent {...props} />
  </CardContent>
</Card>
```

---

## 6. Chart.js Widget Pattern

All Chart.js components live in `src/components/charts/`. Follow this anatomy:

```jsx
import { useEffect, useRef, useState } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { CHART_COLORS, TOOLTIP, toggleGroup, toggleButton } from './chartTheme';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

export const MyChart = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [mode, setMode] = useState('volume'); // optional toggle

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'doughnut', // or 'bar', 'line'
      data: { /* datasets */ },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: TOOLTIP,
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [mode, data]);

  return (
    <div className="space-y-4">
      {/* Optional mode toggle */}
      <div className={toggleGroup}>
        <button className={toggleButton(mode === 'volume')} onClick={() => setMode('volume')}>
          Volume
        </button>
        <button className={toggleButton(mode === 'count')} onClick={() => setMode('count')}>
          Count
        </button>
      </div>
      <div className="relative h-44">
        <canvas ref={canvasRef} />
      </div>
      {/* Legend rows below chart */}
    </div>
  );
};
```

### Chart Color Palette (`chartTheme.js`)

| Key | Color | Meaning |
|---|---|---|
| `CHART_COLORS.primary` | `#1E50D9` | Incoming / retained / positive |
| `CHART_COLORS.secondary` | `#38BDF8` | Outgoing / dispersed / neutral |
| `CHART_COLORS.warning` | `#F59E0B` | Amber risk signal |
| `CHART_COLORS.danger` | `#EF4444` | Red critical signal |

> **Rule:** Amber and red are reserved **only** for risk signals. Never use them for UI chrome.

---

## 7. Data Breakdown / Portfolio Grid

For entity-level or group-level breakdowns (2/3 + 1/3 split layout):

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* Wide panel: 4-column mini-card grid */}
  <Card className="lg:col-span-2 flex flex-col justify-between">
    <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-border">
      <div>
        <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
          <Icon size={15} className="text-muted-foreground" /> Section Title
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">Description</CardDescription>
      </div>
      <Badge variant="outline" className="font-mono text-[10px]">FIELD_KEY</Badge>
    </CardHeader>
    <CardContent className="p-5 flex-1 overflow-y-auto max-h-[350px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-muted/50 border border-border p-3.5 rounded-lg space-y-1.5 hover:border-muted-foreground/30 transition-colors"
          >
            <div className="text-xs font-medium text-foreground truncate">{item.name}</div>
            <div className="text-base font-semibold text-foreground tabular-nums">{item.primary}</div>
            <div className="text-[11px] text-muted-foreground flex justify-between pt-1 border-t border-border">
              <span>{item.sub1}</span>
              <span className="tabular-nums">{item.sub2}</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Narrow panel: ranked row list */}
  <Card className="flex flex-col justify-between">
    <CardHeader className="p-5 pb-4 border-b border-border">
      <div className="flex justify-between items-start">
        <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
          <Icon size={15} className="text-muted-foreground" /> List Title
        </CardTitle>
        <Badge variant="outline" className="text-[10px]">Context Tag</Badge>
      </div>
      <CardDescription className="text-xs text-muted-foreground mt-1">Description</CardDescription>
    </CardHeader>
    <CardContent className="p-5 flex-1 overflow-y-auto max-h-[300px] space-y-2">
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="bg-muted/50 border border-border p-3 rounded-lg hover:border-muted-foreground/30 transition-colors flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-medium text-foreground">{item.label}</span>
              <Badge variant="compliant" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>
            </div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">{item.sub}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-foreground tabular-nums">{item.primary}</div>
            <div className="text-[11px] text-muted-foreground tabular-nums">{item.secondary}</div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>

</div>
```

---

## 8. Module Launchpad (Action Cards Grid)

Used at the bottom of overview dashboards to link to sub-views:

```jsx
<div className="space-y-4">
  <h2 className="text-xs font-medium text-muted-foreground">Platform modules</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {modules.map(mod => (
      <Card
        key={mod.id}
        onClick={() => onNavigate(mod.route)}
        className="p-5 transition-all group cursor-pointer flex flex-col justify-between hover:border-primary/40 hover:bg-muted/40"
      >
        <div>
          <div className="p-2.5 bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground rounded-lg w-fit mb-4 transition-colors">
            <mod.icon size={18} />
          </div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {mod.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {mod.description}
          </p>
        </div>
        <div className="mt-5 text-xs font-medium text-primary flex items-center">
          <span>{mod.cta}</span>
          <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    ))}
  </div>
</div>
```

---

## 9. Empty State Pattern

When no data is loaded yet:

```jsx
{groups.length === 0 && (
  <div className="p-6 bg-muted/50 border border-border rounded-xl text-center text-sm text-muted-foreground space-y-2">
    <Icon size={24} className="mx-auto text-muted-foreground/40" />
    <p className="font-medium">No data in this section yet</p>
    <p className="text-xs">Load a sample batch or ingest an .xlsx file to populate this widget.</p>
  </div>
)}
```

---

## 10. Inline Error Banner

```jsx
{error && (
  <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center">
    <AlertTriangle size={16} className="mr-2 shrink-0 text-rose-500 dark:text-rose-400" />
    <span>{error}</span>
  </div>
)}
```

---

## 11. Badge Variants Reference

| Variant | Color | Use case |
|---|---|---|
| `outline` | Muted border | Neutral field/context tag |
| `critical` | Rose | Critical risk entities |
| `elevated` | Amber | Elevated risk |
| `compliant` | Emerald | Low-risk / positive signals |
| `cyan` | Sky | Outgoing / neutral context |
| `purple` | Purple | Review required |
| `secondary` | Muted | Default fallback |

---

## 12. Data Aggregation Patterns

Always use `useMemo` for derived data:

```jsx
// Group by a dimension
const statsByDimension = useMemo(() => {
  const map = new Map();
  groups.forEach(g => {
    const key = g.some_field || 'Unknown';
    if (!map.has(key)) map.set(key, { name: key, volume: 0, count: 0, entities: 0 });
    const item = map.get(key);
    item.volume += g.total_amount || 0;
    item.count += g.transaction_count || 0;
    item.entities += 1;
  });
  return Array.from(map.values()).sort((a, b) => b.volume - a.volume);
}, [groups]);

// Flatten all transactions
const allTransactions = useMemo(() => {
  if (dataState?.normalizedRecords) return dataState.normalizedRecords;
  return dataState?.groupedEntities?.flatMap(g => g.transactions || []) ?? [];
}, [dataState]);
```

---

## 13. Store Access Pattern

Pull data from the Zustand store for routed views:

```jsx
import { useTriageStore } from '../../store/useTriageStore';

const { dataState, activeRail, currentUser } = useTriageStore();
const groups = dataState?.groupedEntities || [];
const totalVolume = groups.reduce((acc, g) => acc + (g.total_amount || 0), 0);
const totalTxns = dataState?.totalRecords || groups.reduce((acc, g) => acc + (g.transaction_count || 0), 0);
```

---

## 14. Navigation Integration Checklist

When wiring a new dashboard into the app:

- [ ] Add `<Route path="/your-path" element={<YourView />} />` in `src/App.jsx`
- [ ] Add entry to `navItems` array in `src/components/layout/AppLayout.tsx` (only if direct nav is appropriate)
- [ ] Add a case to `getViewTitle(path)` in `AppLayout.tsx` for the breadcrumb
- [ ] Add a module card to the homescreen launchpad if it's a major section

---

## 15. New Dashboard Quality Checklist

- [ ] Outer wrapper: `p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full font-sans transition-colors duration-200`
- [ ] Single `<h1>` on the page
- [ ] Only semantic CSS tokens — no raw hex in JSX
- [ ] `tabular-nums` on every numeric value
- [ ] All data derivations wrapped in `useMemo`
- [ ] Empty state for every data-dependent panel
- [ ] Chart `useEffect` includes `return () => chartRef.current?.destroy()` cleanup
- [ ] All chart colors sourced from `chartTheme.js`
- [ ] Manually tested in light mode and dark mode
- [ ] `transition-colors duration-200` on theme-sensitive containers

---

## 16. File Locations Reference

```
src/
├── EtransferHomeView.jsx           ← Reference dashboard (homescreen)
├── components/
│   ├── ui/
│   │   ├── card.jsx                ← Card, CardHeader, CardTitle, CardDescription, CardContent
│   │   ├── badge.jsx               ← Badge (all variants)
│   │   ├── button.jsx              ← Button (variant, size)
│   │   └── ...
│   ├── charts/
│   │   ├── chartTheme.js           ← CHART_COLORS, TOOLTIP, toggleGroup, toggleButton
│   │   ├── DirectionalFlowChart.jsx
│   │   ├── CounterpartyVelocityChart.jsx
│   │   ├── PassThroughFunnelChart.jsx
│   │   └── LegendCard.jsx
│   └── layout/
│       └── AppLayout.tsx           ← Global nav, breadcrumb, rail selector
├── store/
│   └── useTriageStore.ts           ← Zustand store (dataState, activeRail, currentUser)
├── utils/
│   └── alertUtils.ts              ← isOpenAlert(), hasAlert()
└── index.css                      ← Design tokens (:root + .dark CSS custom properties)
```

