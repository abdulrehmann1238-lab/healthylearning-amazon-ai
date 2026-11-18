import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  DollarSign,
  PackageCheck,
  ClipboardList,
  Boxes,
  Megaphone,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { CATALOG_SUMMARY } from '../data/products';
import { DAILY_PERFORMANCE_30D } from '../data/timeseries';
import { KpiCard } from '../components/ui/KpiCard';
import { Card, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getDateRangeLabel,
  getDateRangeMultiplier,
  getInventoryStatus,
} from '../utilities/format';
import { exportToCsv } from '../utilities/csv';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    dateRange,
    setDateRange,
    products,
    campaigns,
    activityLogs,
    settings,
    addToast,
    addActivityLog,
    activeRole,
  } = useAppState();

  const multiplier = getDateRangeMultiplier(dateRange);
  const totalAdSpendBase = useMemo(() => campaigns.reduce((s, c) => s + c.spend, 0), [campaigns]);

  const metrics = useMemo(() => {
    const revenue = Math.round(CATALOG_SUMMARY.monthlyRevenue * multiplier);
    const units = Math.round(CATALOG_SUMMARY.monthlyUnits * multiplier);
    const pos = Math.max(12, Math.round(CATALOG_SUMMARY.totalPurchaseOrders * multiplier));
    const adSpend = Math.round(totalAdSpendBase * multiplier);
    return { revenue, units, pos, adSpend };
  }, [multiplier, totalAdSpendBase]);

  const chartSeries = useMemo(() => {
    const slice = dateRange === '7d' ? DAILY_PERFORMANCE_30D.slice(-7) : DAILY_PERFORMANCE_30D;
    const scale = dateRange === '90d' ? 2.88 : dateRange === 'ytd' ? 9.65 : 1;
    return slice.map((d) => ({
      ...d,
      revenueScaled: Math.round(d.revenue * (dateRange === '7d' ? 1 : scale / (dateRange === '30d' ? 1 : 3))),
      previousScaled: Math.round(d.previousRevenue * (dateRange === '7d' ? 1 : scale / (dateRange === '30d' ? 1 : 3))),
    }));
  }, [dateRange]);

  const topTitlesData = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.title,
          shortName: p.title.length > 28 ? `${p.title.slice(0, 27)}…` : p.title,
          revenue: Math.round(p.revenue * multiplier),
        })),
    [products, multiplier]
  );

  const attentionCount = useMemo(
    () =>
      products.filter((p) => {
        const s = getInventoryStatus(p, settings.lowStockThresholdDays, settings.criticalStockThresholdDays);
        return s !== 'Healthy';
      }).length,
    [products, settings.lowStockThresholdDays, settings.criticalStockThresholdDays]
  );

  const handleExportReport = () => {
    exportToCsv(
      `healthy-learning-overview-${dateRange}.csv`,
      ['Metric', 'Period', 'Value', 'Delta'],
      [
        ['Total Revenue', getDateRangeLabel(dateRange), metrics.revenue, '+12.8%'],
        ['Units Sold', getDateRangeLabel(dateRange), metrics.units, '+8.4%'],
        ['Purchase Orders', getDateRangeLabel(dateRange), metrics.pos, '+6.2%'],
        ['Inventory Availability', getDateRangeLabel(dateRange), `${CATALOG_SUMMARY.inventoryAvailability}%`, '+2.1%'],
        ['Advertising Spend', getDateRangeLabel(dateRange), metrics.adSpend, '-4.6%'],
      ]
    );
    addActivityLog({
      actor: activeRole,
      action: 'Exported executive overview CSV report',
      module: 'Sales',
      resource: `Overview (${getDateRangeLabel(dateRange)})`,
      status: 'Completed',
      details: 'Generated downloadable CSV summary from local demonstration dataset.',
    });
    addToast({
      title: 'Overview report exported',
      description: `Downloaded healthy-learning-overview-${dateRange}.csv`,
      tone: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Business Overview
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Your publishing business at a glance · {getDateRangeLabel(dateRange)} (Illustrative Data)
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex rounded-lg border border-[#E6EAE5] bg-white p-0.5">
            {(['7d', '30d', '90d', 'ytd'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-colors ${
                  dateRange === r
                    ? 'bg-[#244B3D] text-white'
                    : 'text-[#647068] hover:text-[#202923]'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="w-3.5 h-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* 5 Clickable KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(metrics.revenue)}
          delta="+12.8%"
          deltaPositive
          comparison="vs. prev"
          icon={<DollarSign className="w-4 h-4" />}
          sparkline={[54, 58, 61, 59, 64, 67, 70]}
          onClick={() => navigate('/sales')}
        />
        <KpiCard
          label="Units Sold"
          value={formatNumber(metrics.units)}
          delta="+8.4%"
          deltaPositive
          comparison="vs. prev"
          icon={<PackageCheck className="w-4 h-4" />}
          sparkline={[250, 265, 278, 272, 295, 310, 314]}
          onClick={() => navigate('/sales')}
        />
        <KpiCard
          label="Purchase Orders"
          value={formatNumber(metrics.pos)}
          delta="+6.2%"
          deltaPositive
          comparison="vs. prev"
          icon={<ClipboardList className="w-4 h-4" />}
          sparkline={[18, 22, 21, 25, 24, 28, 30]}
          onClick={() => navigate('/purchase-orders')}
        />
        <KpiCard
          label="Inventory Availability"
          value={`${CATALOG_SUMMARY.inventoryAvailability}%`}
          delta="+2.1%"
          deltaPositive
          comparison={`${attentionCount} flagged`}
          icon={<Boxes className="w-4 h-4" />}
          sparkline={[91.8, 92.2, 92.9, 93.1, 93.6, 94.0, 94.2]}
          onClick={() => navigate('/inventory')}
        />
        <KpiCard
          label="Advertising Spend"
          value={formatCurrency(metrics.adSpend)}
          delta="-4.6%"
          deltaPositive
          comparison="efficient"
          icon={<Megaphone className="w-4 h-4" />}
          sparkline={[455, 448, 442, 438, 434, 428, 424]}
          onClick={() => navigate('/advertising')}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Performance Chart */}
        <Card className="lg:col-span-8">
          <SectionHeader
            title="Revenue Performance"
            subtitle="Daily wholesale revenue compared against prior reporting period"
            action={
              <div className="flex items-center gap-4 text-[12px] text-[#748078]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#244B3D]" />
                  Current Period
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C3CFC5]" />
                  Previous Period
                </span>
              </div>
            }
          />
          <div className="h-[290px] w-full" aria-label="Revenue performance area chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#244B3D" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#244B3D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fill: '#748078', fontSize: 11.5 }}
                  axisLine={{ stroke: '#E6EAE5' }}
                  tickLine={false}
                  minTickGap={22}
                />
                <YAxis
                  tick={{ fill: '#748078', fontSize: 11.5 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#DCE3DB',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    boxShadow: '0 8px 24px rgba(24,56,46,0.08)',
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'revenueScaled' ? 'Current Period' : 'Previous Period',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="previousScaled"
                  stroke="#B8C5BA"
                  strokeWidth={1.6}
                  strokeDasharray="4 4"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="revenueScaled"
                  stroke="#244B3D"
                  strokeWidth={2.2}
                  fill="url(#revArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Business Health Panel + AI Executive Insight */}
        <div className="lg:col-span-4 space-y-5 flex flex-col">
          <Card>
            <SectionHeader title="Business Health" subtitle="Operational posture across core modules" />
            <div className="space-y-2.5">
              {[
                { label: 'Sales Performance', status: 'Healthy', variant: 'success' as const, to: '/sales' },
                {
                  label: 'Inventory Position',
                  status: attentionCount > 0 ? 'Attention Required' : 'Healthy',
                  variant: attentionCount > 0 ? ('warning' as const) : ('success' as const),
                  to: '/inventory',
                },
                { label: 'Advertising Efficiency', status: 'Healthy', variant: 'success' as const, to: '/advertising' },
                { label: 'Purchase Order Activity', status: 'Normal', variant: 'forest' as const, to: '/purchase-orders' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#ECEFEA] bg-[#FAFBFA] hover:bg-[#F2F6F3] hover:border-[#D5E0D7] transition-colors text-left"
                >
                  <span className="text-[13px] font-medium text-[#202923]">{item.label}</span>
                  <Badge variant={item.variant} dot>
                    {item.status}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-[#18382E] border-[#18382E] text-white flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#C8B082]">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Executive Insight
                </span>
                <span className="text-[10.5px] text-[#9FB3A7]">Simulated</span>
              </div>
              <p className="text-[13.5px] leading-[1.6] text-[#E8EFEA]">
                Revenue is trending upward (+12.8%), with the strongest contribution coming from Sports Medicine and Lifestyle Medicine titles. {attentionCount} monitored titles show declining inventory coverage, while advertising expenditure remains controlled at 6.9% of gross revenue.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-white text-[#18382E] border-white hover:bg-[#F0F3EF]"
                onClick={() => navigate('/recommendations')}
              >
                View Full Analysis
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-[#E6EDE7] hover:bg-[#244B3D] hover:text-white border border-[#2D5849]"
                onClick={() => navigate('/ai-assistant')}
              >
                Ask AI About This
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Top Performing Titles + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <SectionHeader
            title="Revenue by Product"
            subtitle="Top-performing Healthy Learning titles in the selected period"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/sales')}>
                View All Titles
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <div className="h-[260px] w-full" aria-label="Horizontal bar chart of top performing book titles">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTitlesData}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#748078', fontSize: 11.5 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={185}
                  tick={{ fill: '#202923', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F4F7F4' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#DCE3DB',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={24}>
                  {topTitlesData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={idx === 0 ? '#18382E' : idx === 1 ? '#244B3D' : '#557F64'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <SectionHeader
            title="Recent Activity"
            subtitle="Latest operational & AI events"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>
                Full Log
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <ul className="divide-y divide-[#F0F3EF]">
            {activityLogs.slice(0, 6).map((item) => (
              <li key={item.id} className="py-2.5 flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  {item.status === 'Warning' ? (
                    <AlertTriangle className="w-4 h-4 text-[#B58B4F]" />
                  ) : item.status === 'Completed' || item.status === 'Approved' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#557F64]" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#82988A]" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-[#202923] leading-snug">
                    {item.action}
                  </div>
                  <div className="text-[11.5px] text-[#748078] truncate mt-0.5">
                    {item.resource} · {item.module}
                  </div>
                </div>
                <span className="text-[11px] text-[#82988A] whitespace-nowrap shrink-0 tabular-nums">
                  {item.timestamp.replace('2026-', '')}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default OverviewPage;
