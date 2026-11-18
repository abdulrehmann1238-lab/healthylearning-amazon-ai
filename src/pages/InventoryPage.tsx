import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Boxes, CheckCircle2, AlertTriangle, XCircle, SlidersHorizontal, Sparkles, ArrowRight } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { BACKLIST_AGGREGATE } from '../data/products';
import { INVENTORY_TREND_SERIES } from '../data/timeseries';
import type { InventoryStatus, Product } from '../types';
import { KpiCard } from '../components/ui/KpiCard';
import { Card, SectionHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';
import { BookCover } from '../components/ui/BookCover';
import { formatNumber, getCoverageDays, getInventoryStatus } from '../utilities/format';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, settings, updateSettings } = useAppState();
  const [statusFilter, setStatusFilter] = useState<'All' | InventoryStatus>('All');
  const [selected, setSelected] = useState<Product | null>(null);

  const enriched = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        coverageDays: getCoverageDays(p),
        status: getInventoryStatus(p, settings.lowStockThresholdDays, settings.criticalStockThresholdDays),
      })),
    [products, settings.lowStockThresholdDays, settings.criticalStockThresholdDays]
  );

  const counts = useMemo(() => {
    const featuredAvail = enriched.reduce((s, p) => s + p.availableUnits, 0);
    const featuredRes = enriched.reduce((s, p) => s + p.reservedUnits, 0);
    const featuredInb = enriched.reduce((s, p) => s + p.inboundUnits, 0);
    const totalUnits =
      featuredAvail +
      featuredRes +
      featuredInb +
      BACKLIST_AGGREGATE.availableUnits +
      BACKLIST_AGGREGATE.reservedUnits +
      BACKLIST_AGGREGATE.inboundUnits;
    const availableUnits = featuredAvail + BACKLIST_AGGREGATE.availableUnits;
    const lowStock = enriched.filter((p) => p.status === 'Low Stock' || p.status === 'Critical').length;
    const outOfStock = enriched.filter((p) => p.status === 'Out of Stock').length;
    const healthy = enriched.filter((p) => p.status === 'Healthy').length;
    const critical = enriched.filter((p) => p.status === 'Critical').length;
    const lowOnly = enriched.filter((p) => p.status === 'Low Stock').length;

    return { totalUnits, availableUnits, lowStock, outOfStock, healthy, critical, lowOnly };
  }, [enriched]);

  const distributionData = useMemo(
    () => [
      { label: 'Healthy', count: counts.healthy, color: '#557F64' },
      { label: 'Low Stock', count: counts.lowOnly, color: '#B58B4F' },
      { label: 'Critical', count: counts.critical, color: '#C27C4E' },
      { label: 'Out of Stock', count: counts.outOfStock, color: '#B66A65' },
    ],
    [counts]
  );

  const filtered = useMemo(
    () => (statusFilter === 'All' ? enriched : enriched.filter((p) => p.status === statusFilter)),
    [enriched, statusFilter]
  );

  const badgeVariant = (st: InventoryStatus) =>
    st === 'Healthy' ? 'success' : st === 'Out of Stock' ? 'error' : 'warning';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
          Inventory Intelligence
        </h2>
        <p className="text-[13.5px] text-[#748078] mt-0.5">
          Stock health, coverage days, inbound replenishment, and configurable alert thresholds
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Inventory Units"
          value={formatNumber(counts.totalUnits)}
          comparison="avail + res + inbound"
          icon={<Boxes className="w-4 h-4" />}
          onClick={() => setStatusFilter('All')}
          active={statusFilter === 'All'}
        />
        <KpiCard
          label="Available Inventory"
          value={formatNumber(counts.availableUnits)}
          delta="94.2%"
          deltaPositive
          comparison="availability"
          icon={<CheckCircle2 className="w-4 h-4" />}
          onClick={() => setStatusFilter('Healthy')}
          active={statusFilter === 'Healthy'}
        />
        <KpiCard
          label="Low / Critical Titles"
          value={String(counts.lowStock)}
          delta={`≤ ${settings.lowStockThresholdDays}d cover`}
          deltaPositive={counts.lowStock === 0}
          icon={<AlertTriangle className="w-4 h-4" />}
          onClick={() => setStatusFilter('Low Stock')}
          active={statusFilter === 'Low Stock'}
        />
        <KpiCard
          label="Out-of-Stock Titles"
          value={String(counts.outOfStock)}
          delta={counts.outOfStock > 0 ? 'Inbound PO active' : 'None'}
          deltaPositive={counts.outOfStock === 0}
          icon={<XCircle className="w-4 h-4" />}
          onClick={() => setStatusFilter('Out of Stock')}
          active={statusFilter === 'Out of Stock'}
        />
      </div>

      {/* Charts & Right AI / Threshold Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <SectionHeader title="Inventory Trend" subtitle="Weekly available vs. inbound units" />
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={INVENTORY_TREND_SERIES} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                    <Area type="monotone" dataKey="available" name="Available" stroke="#244B3D" strokeWidth={2} fill="#E6EDE7" />
                    <Area type="monotone" dataKey="inbound" name="Inbound" stroke="#B89B68" strokeWidth={1.8} fill="#F5EFE3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <SectionHeader title="Stock Health Distribution" subtitle="Featured catalog status by threshold" />
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#5C6860', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Titles" radius={[5, 5, 0, 0]} barSize={34}>
                      {distributionData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card padded={false}>
            <div className="p-5 border-b border-[#E6EAE5] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[15.5px] font-semibold text-[#202923]">Title Inventory Position</h3>
                <p className="text-[12.5px] text-[#748078]">
                  Click any product row to open stock coverage and replenishment details
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Healthy', 'Low Stock', 'Critical', 'Out of Stock'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-[#244B3D] text-white'
                        : 'bg-[#F0F3EF] text-[#525E56] hover:bg-[#E6EDE7]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[740px]">
                <thead>
                  <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                    <th className="py-3 px-5">Book Title</th>
                    <th className="py-3 px-3">ISBN</th>
                    <th className="py-3 px-3 text-right">Available</th>
                    <th className="py-3 px-3 text-right">Reserved</th>
                    <th className="py-3 px-3 text-right">Inbound</th>
                    <th className="py-3 px-3 text-right">Est. Coverage</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="hover:bg-[#F7F9F7] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 font-medium text-[#202923]">{p.title}</td>
                      <td className="py-3.5 px-3 font-mono text-[12px] text-[#748078]">{p.isbn}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums font-semibold">
                        {formatNumber(p.availableUnits)}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-[#5C6860]">
                        {formatNumber(p.reservedUnits)}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-[#244B3D] font-medium">
                        {formatNumber(p.inboundUnits)}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums">
                        {p.coverageDays} days
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant={badgeVariant(p.status)} dot>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: AI Inventory Insights + Live Threshold Configurator */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="bg-[#F2F6F3] border-[#D4DFD6]">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#18382E] mb-2">
              <Sparkles className="w-4 h-4 text-[#244B3D]" />
              AI Inventory Insights
            </div>
            <p className="text-[13.5px] leading-relaxed text-[#2C3A32]">
              Found <strong>{counts.lowStock} titles</strong> with declining inventory coverage (≤{settings.lowStockThresholdDays} days) and <strong>{counts.outOfStock} out-of-stock title</strong>. Consider reviewing replenishment requirements and confirming inbound Vendor Central PO delivery dates.
            </p>
            <div className="mt-4 space-y-2">
              {enriched
                .filter((p) => p.status !== 'Healthy')
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p)}
                    className="w-full text-left rounded-lg bg-white border border-[#DCE3DB] px-3 py-2.5 hover:border-[#244B3D] transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-[#202923] truncate">{p.title}</div>
                      <div className="text-[11.5px] text-[#748078]">
                        {p.coverageDays}d cover · {formatNumber(p.inboundUnits)} inbound
                      </div>
                    </div>
                    <Badge variant={badgeVariant(p.status)}>{p.status}</Badge>
                  </button>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#D4DFD6]">
              <Button size="sm" className="w-full" onClick={() => navigate('/purchase-orders')}>
                Review Inbound Purchase Orders
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>

          {/* Interactive Threshold Configuration Panel */}
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="w-4 h-4 text-[#244B3D]" />
              <h3 className="text-[15px] font-semibold text-[#202923]">Alert Threshold Configuration</h3>
            </div>
            <p className="text-[12px] text-[#748078] mb-4">
              Adjust local demonstration coverage thresholds to see status badges and charts recalculate immediately.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <label htmlFor="low-threshold" className="font-medium text-[#202923]">
                    Low Stock Threshold
                  </label>
                  <span className="font-semibold text-[#244B3D] tabular-nums">
                    {settings.lowStockThresholdDays} days
                  </span>
                </div>
                <input
                  id="low-threshold"
                  type="range"
                  min={8}
                  max={45}
                  value={settings.lowStockThresholdDays}
                  onChange={(e) => {
                    const nextLow = Number(e.target.value);
                    updateSettings(
                      {
                        lowStockThresholdDays: nextLow,
                        criticalStockThresholdDays: Math.min(settings.criticalStockThresholdDays, nextLow - 2),
                      },
                      true
                    );
                  }}
                  className="w-full accent-[#244B3D]"
                />
                <div className="flex justify-between text-[11px] text-[#748078]">
                  <span>8 days</span>
                  <span>45 days</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <label htmlFor="critical-threshold" className="font-medium text-[#202923]">
                    Critical Coverage Threshold
                  </label>
                  <span className="font-semibold text-[#B58B4F] tabular-nums">
                    {settings.criticalStockThresholdDays} days
                  </span>
                </div>
                <input
                  id="critical-threshold"
                  type="range"
                  min={3}
                  max={Math.max(4, settings.lowStockThresholdDays - 1)}
                  value={settings.criticalStockThresholdDays}
                  onChange={(e) =>
                    updateSettings({ criticalStockThresholdDays: Number(e.target.value) }, true)
                  }
                  className="w-full accent-[#B58B4F]"
                />
                <div className="flex justify-between text-[11px] text-[#748078]">
                  <span>3 days</span>
                  <span>{Math.max(4, settings.lowStockThresholdDays - 1)} days</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  updateSettings({ lowStockThresholdDays: 14, criticalStockThresholdDays: 7 })
                }
              >
                Reset to Default (14d / 7d)
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory Detail Drawer */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        subtitle={selected ? `ISBN ${selected.isbn} · Daily Velocity ${selected.dailyVelocity.toFixed(1)} units/day` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <BookCover product={selected} size="md" />
              <div>
                <Badge
                  variant={badgeVariant(
                    getInventoryStatus(selected, settings.lowStockThresholdDays, settings.criticalStockThresholdDays)
                  )}
                  dot
                >
                  {getInventoryStatus(selected, settings.lowStockThresholdDays, settings.criticalStockThresholdDays)}
                </Badge>
                <p className="text-[13px] text-[#5C6860] mt-2 leading-relaxed">{selected.aiNote}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#E6EAE5] p-3.5 bg-[#FAFBFA]">
                <div className="text-[11.5px] text-[#748078]">Available On-Hand</div>
                <div className="text-[20px] font-semibold tabular-nums mt-0.5">
                  {formatNumber(selected.availableUnits)}
                </div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3.5 bg-[#FAFBFA]">
                <div className="text-[11.5px] text-[#748078]">Estimated Coverage</div>
                <div className="text-[20px] font-semibold tabular-nums mt-0.5">
                  {getCoverageDays(selected)} days
                </div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3.5 bg-[#FAFBFA]">
                <div className="text-[11.5px] text-[#748078]">Reserved Units</div>
                <div className="text-[20px] font-semibold tabular-nums mt-0.5">
                  {formatNumber(selected.reservedUnits)}
                </div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3.5 bg-[#FAFBFA]">
                <div className="text-[11.5px] text-[#748078]">Inbound Replenishment</div>
                <div className="text-[20px] font-semibold text-[#244B3D] tabular-nums mt-0.5">
                  {formatNumber(selected.inboundUnits)}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <Button size="sm" onClick={() => navigate('/purchase-orders')}>
                View Related Purchase Orders
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/ai-assistant')}>
                Ask AI About Restocking
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default InventoryPage;
