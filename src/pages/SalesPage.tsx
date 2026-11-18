import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  DollarSign,
  Package,
  TrendingUp,
  Award,
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { CATALOG_SUMMARY } from '../data/products';
import { DAILY_PERFORMANCE_30D } from '../data/timeseries';
import type { Product, ProductCategory } from '../types';
import { KpiCard } from '../components/ui/KpiCard';
import { Card, SectionHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { BookCover } from '../components/ui/BookCover';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getCoverageDays,
  getDateRangeLabel,
  getDateRangeMultiplier,
  getInventoryStatus,
} from '../utilities/format';
import { exportToCsv } from '../utilities/csv';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Sports Medicine',
  'Lifestyle Medicine',
  'Exercise Science',
  'Clinical Reference',
  'Preventive Health',
  'Rehabilitation',
];

const CATEGORY_COLORS = ['#18382E', '#244B3D', '#557F64', '#82988A', '#B89B68', '#6B7D72'];

export const SalesPage: React.FC = () => {
  const { products, purchaseOrders, dateRange, settings, addToast, addActivityLog, activeRole } =
    useAppState();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'revenue' | 'unitsSold' | 'growthPercent' | 'title'>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const pageSize = 8;
  const mult = getDateRangeMultiplier(dateRange);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
        if (
          q &&
          !p.title.toLowerCase().includes(q) &&
          !p.isbn.toLowerCase().includes(q) &&
          !p.category.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'title') return a.title.localeCompare(b.title) * dir;
        return (a[sortBy] - b[sortBy]) * dir;
      });
  }, [products, search, categoryFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginated = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.category, (map.get(p.category) ?? 0) + Math.round(p.revenue * mult));
    });
    return Array.from(map.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [products, mult]);

  const top10Titles = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((p) => ({
          name: p.title.length > 22 ? `${p.title.slice(0, 21)}…` : p.title,
          revenue: Math.round(p.revenue * mult),
        })),
    [products, mult]
  );

  const grossRevenue = Math.round(CATALOG_SUMMARY.monthlyRevenue * mult);
  const totalUnits = Math.round(CATALOG_SUMMARY.monthlyUnits * mult);
  const avgRevPerUnit = totalUnits > 0 ? grossRevenue / totalUnits : 0;
  const topTitle = [...products].sort((a, b) => b.revenue - a.revenue)[0];

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const handleExportCsv = () => {
    exportToCsv(
      `healthy-learning-sales-${dateRange}.csv`,
      ['Book Title', 'ISBN', 'Category', 'Units Sold', 'Revenue (USD)', 'Previous Period (USD)', 'Growth %', 'Performance'],
      filteredProducts.map((p) => [
        p.title,
        p.isbn,
        p.category,
        Math.round(p.unitsSold * mult),
        Math.round(p.revenue * mult),
        Math.round(p.previousRevenue * mult),
        `${p.growthPercent}%`,
        p.performanceTier,
      ])
    );
    addActivityLog({
      actor: activeRole,
      action: 'Exported sales intelligence CSV',
      module: 'Sales',
      resource: `${filteredProducts.length} Book Records`,
      status: 'Completed',
      details: `Exported filtered sales table for ${getDateRangeLabel(dateRange)}.`,
    });
    addToast({
      title: 'Sales CSV exported',
      description: `Downloaded ${filteredProducts.length} records from demonstration dataset.`,
      tone: 'success',
    });
  };

  const relatedPOs = useMemo(() => {
    if (!selectedProduct) return [];
    return purchaseOrders.filter((po) =>
      po.items.some((item) => item.productId === selectedProduct.id)
    );
  }, [selectedProduct, purchaseOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Sales Intelligence
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Title-level revenue, unit velocity, and publishing category analysis · {getDateRangeLabel(dateRange)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Gross Revenue"
          value={formatCurrency(grossRevenue)}
          delta="+12.8%"
          deltaPositive
          comparison="vs. prior period"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          label="Units Sold"
          value={formatNumber(totalUnits)}
          delta="+8.4%"
          deltaPositive
          comparison="across 248 titles"
          icon={<Package className="w-4 h-4" />}
        />
        <KpiCard
          label="Avg. Revenue per Unit"
          value={formatCurrency(avgRevPerUnit, 2)}
          delta="+4.1%"
          deltaPositive
          comparison="wholesale avg"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          label="Top Performing Title"
          value={formatCurrency(Math.round(topTitle.revenue * mult))}
          delta={`+${topTitle.growthPercent}%`}
          deltaPositive
          comparison="Sports Medicine Hbk"
          icon={<Award className="w-4 h-4" />}
          onClick={() => setSelectedProduct(topTitle)}
        />
      </div>

      {/* Charts Grid (4 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <SectionHeader title="Revenue Over Time" subtitle="Daily wholesale revenue across reporting window" />
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dateRange === '7d' ? DAILY_PERFORMANCE_30D.slice(-7) : DAILY_PERFORMANCE_30D} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#244B3D" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#244B3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis dataKey="shortDate" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={22} />
                <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#244B3D" strokeWidth={2} fill="url(#salesRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Units Sold Over Time" subtitle="Daily unit sell-through velocity" />
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateRange === '7d' ? DAILY_PERFORMANCE_30D.slice(-7) : DAILY_PERFORMANCE_30D} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis dataKey="shortDate" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={22} />
                <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [formatNumber(v), 'Units Sold']} />
                <Bar dataKey="units" fill="#557F64" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Revenue by Category" subtitle="Distribution across Healthy Learning publishing imprints" />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" width={130} tick={{ fill: '#202923', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Category Revenue']} />
                <Bar dataKey="revenue" radius={[0, 5, 5, 0]} barSize={20}>
                  {categoryBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Top 10 Performing Titles" subtitle="Highest revenue contributors in featured catalog" />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10Titles} margin={{ top: 6, right: 8, left: -12, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#748078', fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#244B3D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Product Sales Table */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-[15.5px] font-semibold text-[#202923]">Title Sales Performance</h3>
            <p className="text-[12.5px] text-[#748078]">
              Click any title row to inspect historical performance, inventory, and AI insights
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by title or ISBN..."
                className="h-9 pl-8 pr-3 rounded-lg border border-[#E6EAE5] bg-[#F7F8F6] text-[13px] focus:bg-white focus:border-[#244B3D] focus:outline-none w-52"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as 'All' | ProductCategory);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px] text-[#202923] focus:border-[#244B3D] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">
                  <button type="button" onClick={() => handleSort('title')} className="inline-flex items-center gap-1 hover:text-[#202923]">
                    Book Title <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">ISBN</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">
                  <button type="button" onClick={() => handleSort('unitsSold')} className="inline-flex items-center gap-1 hover:text-[#202923]">
                    Units Sold <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button type="button" onClick={() => handleSort('revenue')} className="inline-flex items-center gap-1 hover:text-[#202923]">
                    Revenue <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Previous Period</th>
                <th className="py-3 px-4 text-right">
                  <button type="button" onClick={() => handleSort('growthPercent')} className="inline-flex items-center gap-1 hover:text-[#202923]">
                    Growth <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-5">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#748078]">
                    No titles match your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="hover:bg-[#F7F9F7] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-[#202923]">
                      <div className="flex items-center gap-3">
                        <BookCover product={p} size="sm" />
                        <div className="min-w-0">
                          <div className="font-medium text-[#202923] truncate max-w-[230px]">{p.title}</div>
                          <div className="text-[11.5px] text-[#748078]">{p.edition}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#5C6860]">{p.isbn}</td>
                    <td className="py-3.5 px-4 text-[#5C6860]">{p.category}</td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-medium">
                      {formatNumber(Math.round(p.unitsSold * mult))}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-[#18382E]">
                      {formatCurrency(Math.round(p.revenue * mult))}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-[#748078]">
                      {formatCurrency(Math.round(p.previousRevenue * mult))}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right tabular-nums font-medium ${
                        p.growthPercent >= 0 ? 'text-[#557F64]' : 'text-[#B66A65]'
                      }`}
                    >
                      {formatPercent(p.growthPercent, true)}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge
                        variant={
                          p.performanceTier === 'Top Performer'
                            ? 'forest'
                            : p.performanceTier === 'Strong'
                              ? 'success'
                              : p.performanceTier === 'Watch'
                                ? 'warning'
                                : 'neutral'
                        }
                      >
                        {p.performanceTier}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-[#E6EAE5] flex items-center justify-between text-[12.5px] text-[#748078]">
          <span>
            Showing {filteredProducts.length === 0 ? 0 : (page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length} featured titles
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Product Performance Drawer */}
      <Drawer
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.title ?? ''}
        subtitle={selectedProduct ? `ISBN ${selectedProduct.isbn} · ${selectedProduct.category}` : ''}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <BookCover product={selectedProduct} size="lg" />
              <div className="min-w-0 flex-1">
                <Badge variant="forest">{selectedProduct.performanceTier}</Badge>
                <p className="mt-2 text-[13.5px] text-[#4F5B53] leading-snug">
                  {selectedProduct.subtitle}
                </p>
                <p className="mt-1 text-[12px] text-[#748078]">
                  {selectedProduct.author} · {selectedProduct.edition} ({selectedProduct.publishYear})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#E6EAE5] bg-[#FAFBFA] p-3">
                <div className="text-[11px] text-[#748078]">Period Revenue</div>
                <div className="text-[17px] font-semibold text-[#18382E] tabular-nums mt-0.5">
                  {formatCurrency(Math.round(selectedProduct.revenue * mult))}
                </div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] bg-[#FAFBFA] p-3">
                <div className="text-[11px] text-[#748078]">Units Sold</div>
                <div className="text-[17px] font-semibold text-[#202923] tabular-nums mt-0.5">
                  {formatNumber(Math.round(selectedProduct.unitsSold * mult))}
                </div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] bg-[#FAFBFA] p-3">
                <div className="text-[11px] text-[#748078]">Growth</div>
                <div
                  className={`text-[17px] font-semibold tabular-nums mt-0.5 ${
                    selectedProduct.growthPercent >= 0 ? 'text-[#557F64]' : 'text-[#B66A65]'
                  }`}
                >
                  {formatPercent(selectedProduct.growthPercent, true)}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-[#202923] mb-2">6-Month Revenue History</h4>
              <div className="h-[180px] rounded-xl border border-[#E6EAE5] p-3 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedProduct.monthlyHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#244B3D" strokeWidth={2} fill="#E6EDE7" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-[#E6EAE5] p-4 bg-[#FAFBFA]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-[#202923]">Inventory Snapshot</span>
                <Badge
                  variant={
                    getInventoryStatus(selectedProduct, settings.lowStockThresholdDays, settings.criticalStockThresholdDays) === 'Healthy'
                      ? 'success'
                      : getInventoryStatus(selectedProduct, settings.lowStockThresholdDays, settings.criticalStockThresholdDays) === 'Out of Stock'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {getInventoryStatus(selectedProduct, settings.lowStockThresholdDays, settings.criticalStockThresholdDays)}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[12.5px]">
                <div>
                  <span className="text-[#748078]">Available:</span>{' '}
                  <strong className="tabular-nums">{formatNumber(selectedProduct.availableUnits)}</strong>
                </div>
                <div>
                  <span className="text-[#748078]">Inbound:</span>{' '}
                  <strong className="tabular-nums">{formatNumber(selectedProduct.inboundUnits)}</strong>
                </div>
                <div>
                  <span className="text-[#748078]">Coverage:</span>{' '}
                  <strong className="tabular-nums">{getCoverageDays(selectedProduct)}d</strong>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-[#202923] mb-2">
                Related Purchase Orders ({relatedPOs.length})
              </h4>
              {relatedPOs.length === 0 ? (
                <p className="text-[12.5px] text-[#748078]">No active featured POs contain this title.</p>
              ) : (
                <div className="space-y-2">
                  {relatedPOs.map((po) => (
                    <div
                      key={po.id}
                      className="rounded-lg border border-[#E6EAE5] px-3.5 py-2.5 flex items-center justify-between text-[12.5px]"
                    >
                      <div>
                        <span className="font-mono font-medium text-[#18382E]">{po.poNumber}</span>
                        <span className="text-[#748078] ml-2">ETA {po.expectedDelivery}</span>
                      </div>
                      <Badge variant="neutral">{po.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#D4DFD6] bg-[#F2F6F3] p-4">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#18382E] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#244B3D]" />
                AI Title Insight (Simulated)
              </div>
              <p className="text-[13px] leading-relaxed text-[#36443B]">{selectedProduct.aiNote}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SalesPage;
