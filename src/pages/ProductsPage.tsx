import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BookOpen, CheckCircle2, DollarSign, AlertTriangle, Search, Sparkles } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { CATALOG_SUMMARY } from '../data/products';
import type { InventoryStatus, Product, ProductCategory } from '../types';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { BookCover } from '../components/ui/BookCover';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRoas,
  getCoverageDays,
  getInventoryStatus,
} from '../utilities/format';

type ProfileTab = 'Overview' | 'Sales' | 'Inventory' | 'Purchase Orders' | 'Advertising';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, purchaseOrders, campaigns, settings } = useAppState();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | ProductCategory>('All');
  const [tier, setTier] = useState<'All' | Product['performanceTier']>('All');
  const [invStatus, setInvStatus] = useState<'All' | InventoryStatus>('All');
  const [selected, setSelected] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview');

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      const match = products.find((p) => p.id === selectedId);
      if (match) {
        setSelected(match);
        setActiveTab('Overview');
      }
    }
  }, [searchParams, products]);

  const closeDrawer = () => {
    setSelected(null);
    if (searchParams.has('selected')) {
      searchParams.delete('selected');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const attentionCount = useMemo(
    () =>
      products.filter(
        (p) => getInventoryStatus(p, settings.lowStockThresholdDays, settings.criticalStockThresholdDays) !== 'Healthy'
      ).length,
    [products, settings.lowStockThresholdDays, settings.criticalStockThresholdDays]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (tier !== 'All' && p.performanceTier !== tier) return false;
      const st = getInventoryStatus(p, settings.lowStockThresholdDays, settings.criticalStockThresholdDays);
      if (invStatus !== 'All' && st !== invStatus) return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.isbn.toLowerCase().includes(q) &&
        !p.asin.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [products, search, category, tier, invStatus, settings.lowStockThresholdDays, settings.criticalStockThresholdDays]);

  const statusBadgeVariant = (st: InventoryStatus) =>
    st === 'Healthy' ? 'success' : st === 'Out of Stock' ? 'error' : 'warning';

  const productPOs = useMemo(() => {
    if (!selected) return [];
    return purchaseOrders.filter((po) => po.items.some((i) => i.productId === selected.id));
  }, [selected, purchaseOrders]);

  const productCampaigns = useMemo(() => {
    if (!selected) return [];
    return campaigns.filter((c) => c.primaryProductIds.includes(selected.id));
  }, [selected, campaigns]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
          Product Catalog
        </h2>
        <p className="text-[13.5px] text-[#748078] mt-0.5">
          Healthy Learning publishing catalog across Vendor Central ASINs and ISBN-13 identifiers
        </p>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Titles"
          value={formatNumber(CATALOG_SUMMARY.totalActiveTitles)}
          comparison="12 featured in demo table"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <KpiCard
          label="Active Titles"
          value={formatNumber(CATALOG_SUMMARY.totalActiveTitles)}
          delta="100%"
          deltaPositive
          comparison="catalog listed"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <KpiCard
          label="Titles Generating Revenue"
          value={formatNumber(CATALOG_SUMMARY.revenueGeneratingTitles)}
          delta="93.1%"
          deltaPositive
          comparison="active sell-through"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          label="Titles Requiring Attention"
          value={String(attentionCount)}
          delta={attentionCount > 0 ? 'Replenishment' : 'Clear'}
          deltaPositive={attentionCount === 0}
          comparison="stock thresholds"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Filters & Table */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, ISBN, or ASIN..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-[#E6EAE5] bg-[#F7F8F6] text-[13px] focus:bg-white focus:border-[#244B3D] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'All' | ProductCategory)}
              aria-label="Filter by category"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="All">All Categories</option>
              <option value="Sports Medicine">Sports Medicine</option>
              <option value="Lifestyle Medicine">Lifestyle Medicine</option>
              <option value="Exercise Science">Exercise Science</option>
              <option value="Clinical Reference">Clinical Reference</option>
              <option value="Preventive Health">Preventive Health</option>
              <option value="Rehabilitation">Rehabilitation</option>
            </select>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as 'All' | Product['performanceTier'])}
              aria-label="Filter by performance tier"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="All">All Performance</option>
              <option value="Top Performer">Top Performer</option>
              <option value="Strong">Strong</option>
              <option value="Steady">Steady</option>
              <option value="Watch">Watch</option>
            </select>
            <select
              value={invStatus}
              onChange={(e) => setInvStatus(e.target.value as 'All' | InventoryStatus)}
              aria-label="Filter by inventory status"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="All">All Inventory Status</option>
              <option value="Healthy">Healthy</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">Product Title</th>
                <th className="py-3 px-4">ISBN</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">ASIN</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-5">Inventory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#748078]">
                    No catalog products match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const st = getInventoryStatus(p, settings.lowStockThresholdDays, settings.criticalStockThresholdDays);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setSelected(p);
                        setActiveTab('Overview');
                      }}
                      className="hover:bg-[#F7F9F7] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <BookCover product={p} size="sm" />
                          <div>
                            <div className="font-medium text-[#202923]">{p.title}</div>
                            <div className="text-[11.5px] text-[#748078]">{p.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#5C6860]">{p.isbn}</td>
                      <td className="py-3.5 px-4 text-[#5C6860]">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#748078]">{p.asin}</td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-medium">{formatNumber(p.unitsSold)}</td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-[#18382E]">
                        {formatCurrency(p.revenue)}
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant={statusBadgeVariant(st)} dot>
                          {st}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Product Profile Drawer with 5 Tabs */}
      <Drawer
        open={Boolean(selected)}
        onClose={closeDrawer}
        title={selected?.title ?? ''}
        subtitle={selected ? `ASIN ${selected.asin} · ISBN ${selected.isbn}` : ''}
        width="max-w-2xl"
      >
        {selected && (
          <div className="space-y-5">
            {/* Header identity */}
            <div className="flex items-start gap-4 pb-4 border-b border-[#E6EAE5]">
              <BookCover product={selected} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="forest">{selected.category}</Badge>
                  <Badge variant={statusBadgeVariant(getInventoryStatus(selected, settings.lowStockThresholdDays, settings.criticalStockThresholdDays))} dot>
                    {getInventoryStatus(selected, settings.lowStockThresholdDays, settings.criticalStockThresholdDays)}
                  </Badge>
                </div>
                <p className="mt-2 text-[13.5px] text-[#4C5850]">{selected.subtitle}</p>
                <p className="mt-1 text-[12px] text-[#748078]">
                  {selected.author} · {selected.edition} · Published {selected.publishYear}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-4 text-[12px] text-[#5C6860]">
                  <span>List Price: <strong className="text-[#202923]">{formatCurrency(selected.listPrice, 2)}</strong></span>
                  <span>Wholesale Cost: <strong className="text-[#202923]">{formatCurrency(selected.wholesalePrice, 2)}</strong></span>
                </div>
              </div>
            </div>

            {/* 5 Working Profile Tabs */}
            <div className="flex items-center gap-1 border-b border-[#E6EAE5] overflow-x-auto">
              {(['Overview', 'Sales', 'Inventory', 'Purchase Orders', 'Advertising'] as ProfileTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-[#244B3D] text-[#18382E]'
                      : 'border-transparent text-[#748078] hover:text-[#202923]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                    <div className="text-[11px] text-[#748078]">Monthly Revenue</div>
                    <div className="text-[16px] font-semibold text-[#18382E] tabular-nums mt-0.5">
                      {formatCurrency(selected.revenue)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                    <div className="text-[11px] text-[#748078]">Units Sold</div>
                    <div className="text-[16px] font-semibold text-[#202923] tabular-nums mt-0.5">
                      {formatNumber(selected.unitsSold)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                    <div className="text-[11px] text-[#748078]">Available Stock</div>
                    <div className="text-[16px] font-semibold text-[#202923] tabular-nums mt-0.5">
                      {formatNumber(selected.availableUnits)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                    <div className="text-[11px] text-[#748078]">Est. Coverage</div>
                    <div className="text-[16px] font-semibold text-[#202923] tabular-nums mt-0.5">
                      {getCoverageDays(selected)} days
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#D4DFD6] bg-[#F2F6F3] p-4">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#18382E] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#244B3D]" />
                    AI Product Intelligence
                  </div>
                  <p className="text-[13px] text-[#36443B] leading-relaxed">{selected.aiNote}</p>
                </div>
              </div>
            )}

            {activeTab === 'Sales' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[#E6EAE5] p-3">
                    <div className="text-[11px] text-[#748078]">Current Period</div>
                    <div className="text-[16px] font-semibold text-[#18382E] tabular-nums">{formatCurrency(selected.revenue)}</div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3">
                    <div className="text-[11px] text-[#748078]">Previous Period</div>
                    <div className="text-[16px] font-semibold text-[#4F5B53] tabular-nums">{formatCurrency(selected.previousRevenue)}</div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3">
                    <div className="text-[11px] text-[#748078]">Growth</div>
                    <div className={`text-[16px] font-semibold tabular-nums ${selected.growthPercent >= 0 ? 'text-[#557F64]' : 'text-[#B66A65]'}`}>
                      {formatPercent(selected.growthPercent, true)}
                    </div>
                  </div>
                </div>
                <div className="h-[210px] rounded-xl border border-[#E6EAE5] p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selected.monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#748078', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#748078', fontSize: 11.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#244B3D" strokeWidth={2} fill="#E6EDE7" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'Inventory' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-[#E6EAE5] p-3">
                    <div className="text-[11px] text-[#748078]">Available</div>
                    <div className="text-[17px] font-semibold tabular-nums">{formatNumber(selected.availableUnits)}</div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3">
                    <div className="text-[11px] text-[#748078]">Reserved</div>
                    <div className="text-[17px] font-semibold tabular-nums">{formatNumber(selected.reservedUnits)}</div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3">
                    <div className="text-[11px] text-[#748078]">Inbound</div>
                    <div className="text-[17px] font-semibold text-[#244B3D] tabular-nums">{formatNumber(selected.inboundUnits)}</div>
                  </div>
                  <div className="rounded-lg border border-[#E6EAE5] p-3">
                    <div className="text-[11px] text-[#748078]">Daily Velocity</div>
                    <div className="text-[17px] font-semibold tabular-nums">{selected.dailyVelocity.toFixed(1)}/d</div>
                  </div>
                </div>
                <p className="text-[13px] text-[#5C6860] leading-relaxed">
                  At current trailing velocity ({selected.dailyVelocity.toFixed(1)} units/day), available stock covers approximately{' '}
                  <strong className="text-[#202923]">{getCoverageDays(selected)} days</strong>. Current workspace thresholds flag Low Stock at ≤{settings.lowStockThresholdDays} days and Critical at ≤{settings.criticalStockThresholdDays} days.
                </p>
              </div>
            )}

            {activeTab === 'Purchase Orders' && (
              <div className="space-y-3">
                {productPOs.length === 0 ? (
                  <p className="text-[13px] text-[#748078] py-4">No active featured purchase orders reference this title.</p>
                ) : (
                  productPOs.map((po) => {
                    const line = po.items.find((i) => i.productId === selected.id);
                    return (
                      <div key={po.id} className="rounded-xl border border-[#E6EAE5] p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-mono text-[13px] font-semibold text-[#18382E]">{po.poNumber}</div>
                          <div className="text-[12px] text-[#748078] mt-0.5">
                            {po.fulfillmentCenter} · Ordered {po.orderDate} · ETA {po.expectedDelivery}
                          </div>
                          {line && (
                            <div className="text-[12.5px] text-[#202923] mt-1">
                              {formatNumber(line.quantity)} units @ {formatCurrency(line.unitCost, 2)} ({formatCurrency(line.quantity * line.unitCost)})
                            </div>
                          )}
                        </div>
                        <Badge variant="forest">{po.status}</Badge>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'Advertising' && (
              <div className="space-y-3">
                {productCampaigns.length === 0 ? (
                  <p className="text-[13px] text-[#748078] py-4">
                    This title is not currently assigned as a primary advertised ASIN in the 5 featured campaigns.
                  </p>
                ) : (
                  productCampaigns.map((c) => (
                    <div key={c.id} className="rounded-xl border border-[#E6EAE5] p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13.5px] font-semibold text-[#202923]">{c.name}</span>
                        <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Paused' ? 'neutral' : 'warning'}>
                          {c.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[12px] pt-1">
                        <div>
                          <span className="text-[#748078] block">Spend</span>
                          <strong className="tabular-nums">{formatCurrency(c.spend)}</strong>
                        </div>
                        <div>
                          <span className="text-[#748078] block">Attr. Sales</span>
                          <strong className="tabular-nums">{formatCurrency(c.attributedSales)}</strong>
                        </div>
                        <div>
                          <span className="text-[#748078] block">ROAS</span>
                          <strong className="tabular-nums text-[#244B3D]">{formatRoas(c.roas)}</strong>
                        </div>
                        <div>
                          <span className="text-[#748078] block">ACOS</span>
                          <strong className="tabular-nums">{formatPercent(c.acos)}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProductsPage;
