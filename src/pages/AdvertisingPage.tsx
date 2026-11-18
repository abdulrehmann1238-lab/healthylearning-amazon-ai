import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Megaphone,
  DollarSign,
  TrendingUp,
  Percent,
  Eye,
  MousePointerClick,
  Search,
  Sparkles,
  Pause,
  Play,
  SlidersHorizontal,
  Plus,
  Ban,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { DAILY_PERFORMANCE_30D } from '../data/timeseries';
import type { AdCampaign, AdKeyword } from '../types';
import { KpiCard } from '../components/ui/KpiCard';
import { Card, SectionHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatNumber, formatPercent, formatRoas } from '../utilities/format';

type ModalAction =
  | { type: 'budget'; campaign: AdCampaign }
  | { type: 'toggle'; campaign: AdCampaign }
  | { type: 'bid'; keyword: AdKeyword }
  | { type: 'add-keyword'; isNegative: boolean }
  | null;

export const AdvertisingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    campaigns,
    keywords,
    updateCampaignBudget,
    toggleCampaignStatus,
    updateKeywordBid,
    addKeyword,
  } = useAppState();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [kwSearch, setKwSearch] = useState('');
  const [kwMatchFilter, setKwMatchFilter] = useState<'All' | 'Exact' | 'Phrase' | 'Broad'>('All');
  const [kwCampaignFilter, setKwCampaignFilter] = useState<string>('All');

  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [bidInput, setBidInput] = useState('');
  const [newKwText, setNewKwText] = useState('');
  const [newKwMatch, setNewKwMatch] = useState<'Exact' | 'Phrase' | 'Broad'>('Exact');
  const [newKwBid, setNewKwBid] = useState('0.75');
  const [newKwCampaignId, setNewKwCampaignId] = useState('camp-01');

  const insightsHighlighted = searchParams.get('view') === 'insights';

  useEffect(() => {
    const sel = searchParams.get('selected');
    if (sel && campaigns.some((c) => c.id === sel)) {
      setSelectedCampaignId(sel);
    }
  }, [searchParams, campaigns]);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId]
  );

  const totals = useMemo(() => {
    const spend = campaigns.reduce((s, c) => s + c.spend, 0);
    const sales = campaigns.reduce((s, c) => s + c.attributedSales, 0);
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const roas = spend > 0 ? sales / spend : 0;
    const acos = sales > 0 ? (spend / sales) * 100 : 0;
    return { spend, sales, impressions, clicks, roas, acos };
  }, [campaigns]);

  const filteredKeywords = useMemo(() => {
    const q = kwSearch.trim().toLowerCase();
    return keywords.filter((k) => {
      if (kwMatchFilter !== 'All' && k.matchType !== kwMatchFilter) return false;
      if (kwCampaignFilter !== 'All' && k.campaignId !== kwCampaignFilter) return false;
      if (q && !k.keyword.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [keywords, kwSearch, kwMatchFilter, kwCampaignFilter]);

  const openBudgetModal = (campaign: AdCampaign) => {
    setBudgetInput(String(campaign.dailyBudget));
    setModalAction({ type: 'budget', campaign });
  };

  const openBidModal = (keyword: AdKeyword) => {
    setBidInput(keyword.bid.toFixed(2));
    setModalAction({ type: 'bid', keyword });
  };

  const openAddKeywordModal = (isNegative: boolean) => {
    setNewKwText('');
    setNewKwMatch('Exact');
    setNewKwBid('0.75');
    setNewKwCampaignId(selectedCampaign?.id ?? campaigns[0]?.id ?? 'camp-01');
    setModalAction({ type: 'add-keyword', isNegative });
  };

  const handleConfirmModal = () => {
    if (!modalAction) return;
    if (modalAction.type === 'budget') {
      const val = Number(budgetInput);
      if (!Number.isFinite(val) || val < 10) return;
      updateCampaignBudget(modalAction.campaign.id, Math.round(val));
    } else if (modalAction.type === 'toggle') {
      toggleCampaignStatus(modalAction.campaign.id);
    } else if (modalAction.type === 'bid') {
      const val = Number(bidInput);
      if (!Number.isFinite(val) || val < 0.05) return;
      updateKeywordBid(modalAction.keyword.id, val);
    } else if (modalAction.type === 'add-keyword') {
      if (!newKwText.trim()) return;
      addKeyword(newKwCampaignId, newKwText, newKwMatch, Number(newKwBid) || 0.75, modalAction.isNegative);
    }
    setModalAction(null);
  };

  const closeDrawer = () => {
    setSelectedCampaignId(null);
    if (searchParams.has('selected')) {
      searchParams.delete('selected');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const campaignKeywords = useMemo(
    () => (selectedCampaign ? keywords.filter((k) => k.campaignId === selectedCampaign.id) : []),
    [keywords, selectedCampaign]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Amazon Advertising Intelligence
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Campaign ROAS, keyword efficiency, and simulated Phase 2 controlled optimization
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openAddKeywordModal(false)}>
            <Plus className="w-3.5 h-3.5" />
            Add Keyword
          </Button>
          <Button variant="outline" size="sm" onClick={() => openAddKeywordModal(true)}>
            <Ban className="w-3.5 h-3.5" />
            Add Negative Keyword
          </Button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KpiCard
          label="Total Ad Spend"
          value={formatCurrency(totals.spend)}
          delta="-4.6%"
          deltaPositive
          icon={<Megaphone className="w-4 h-4" />}
        />
        <KpiCard
          label="Attributed Sales"
          value={formatCurrency(totals.sales)}
          delta="+11.2%"
          deltaPositive
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          label="Advertising ROAS"
          value={formatRoas(totals.roas)}
          delta="+0.42x"
          deltaPositive
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          label="Blended ACOS"
          value={formatPercent(totals.acos)}
          delta="-2.1%"
          deltaPositive
          icon={<Percent className="w-4 h-4" />}
        />
        <KpiCard
          label="Impressions"
          value={formatNumber(totals.impressions)}
          delta="+6.4%"
          deltaPositive
          icon={<Eye className="w-4 h-4" />}
        />
        <KpiCard
          label="Clicks"
          value={formatNumber(totals.clicks)}
          delta="1.75% CTR"
          deltaPositive
          icon={<MousePointerClick className="w-4 h-4" />}
        />
      </div>

      {/* AI Advertising Optimization Panel (Prominent when ?view=insights) */}
      <Card
        className={`border-[#CFE0D4] ${
          insightsHighlighted ? 'bg-[#EDF4EF] ring-2 ring-[#244B3D]/25' : 'bg-[#F4F8F5]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#18382E]">
                <Sparkles className="w-4 h-4 text-[#244B3D]" />
                AI Advertising Optimization Insight (Simulated)
              </span>
              <Badge variant="success">Low Risk</Badge>
            </div>
            <p className="text-[14px] text-[#202923] leading-relaxed">
              Campaign analysis identified an opportunity to improve budget allocation. Two campaigns (<strong>Sports Medicine Handbook</strong> at 5.50x ROAS and <strong>Lifestyle Medicine Collection</strong> at 5.10x ROAS) generate substantially stronger attributed sales relative to spend than the 4.34x account average, while <strong>Musculoskeletal Health — Sponsored Brands</strong> sits at 41.7% ACOS.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[12px]">
              <div className="rounded-lg bg-white border border-[#DCE3DB] px-3 py-2">
                <span className="text-[#748078] block">Current Performance</span>
                <strong className="text-[#202923]">5.50x vs. 2.40x ROAS spread</strong>
              </div>
              <div className="rounded-lg bg-white border border-[#DCE3DB] px-3 py-2">
                <span className="text-[#748078] block">Suggested Adjustment</span>
                <strong className="text-[#244B3D]">Shift +$30/d to Sports Medicine</strong>
              </div>
              <div className="rounded-lg bg-white border border-[#DCE3DB] px-3 py-2">
                <span className="text-[#748078] block">Expected Reasoning</span>
                <strong className="text-[#202923]">Higher exact-match conversion</strong>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button size="md" onClick={() => navigate('/approvals')}>
              Review Recommendation
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <SectionHeader title="Spend vs. Attributed Sales" subtitle="Daily 30-day comparison" />
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={DAILY_PERFORMANCE_30D} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis dataKey="shortDate" tick={{ fill: '#748078', fontSize: 10.5 }} axisLine={false} tickLine={false} minTickGap={22} />
                <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="attributedSales" name="Attributed Sales" fill="#DCE6DE" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="adSpend" name="Ad Spend" stroke="#244B3D" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="ROAS & ACOS Trends" subtitle="Efficiency trajectory over 30 days" />
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAILY_PERFORMANCE_30D} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis dataKey="shortDate" tick={{ fill: '#748078', fontSize: 10.5 }} axisLine={false} tickLine={false} minTickGap={22} />
                <YAxis yAxisId="left" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} domain={[3.5, 5]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} domain={[18, 28]} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="roas" name="ROAS (x)" stroke="#244B3D" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="acos" name="ACOS (%)" stroke="#B89B68" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Campaign Comparison" subtitle="Attributed sales by campaign" />
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campaigns.map((c) => ({
                  name: c.name.split('—')[0].trim().slice(0, 15),
                  sales: c.attributedSales,
                  spend: c.spend,
                }))}
                margin={{ top: 6, right: 8, left: -14, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#748078', fontSize: 10 }} angle={-15} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="sales" name="Attributed Sales" fill="#244B3D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spend" name="Spend" fill="#B89B68" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Campaign Table */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-[15.5px] font-semibold text-[#202923]">Advertising Campaigns</h3>
            <p className="text-[12.5px] text-[#748078]">
              Click any campaign row for details, or adjust simulated budget and status directly
            </p>
          </div>
          <Badge variant="gold">Simulated Controls · Local Only</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">Campaign Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Daily Budget</th>
                <th className="py-3 px-3 text-right">Spend</th>
                <th className="py-3 px-3 text-right">Sales</th>
                <th className="py-3 px-3 text-right">ROAS</th>
                <th className="py-3 px-3 text-right">ACOS</th>
                <th className="py-3 px-5 text-right">Demo Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCampaignId(c.id)}
                  className="hover:bg-[#F7F9F7] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 font-medium text-[#202923]">{c.name}</td>
                  <td className="py-3.5 px-3 text-[#5C6860] text-[12px]">{c.type}</td>
                  <td className="py-3.5 px-3">
                    <Badge
                      variant={
                        c.status === 'Active' ? 'success' : c.status === 'Paused' ? 'neutral' : 'warning'
                      }
                      dot
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums font-medium">
                    {formatCurrency(c.dailyBudget)}/d
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums">{formatCurrency(c.spend)}</td>
                  <td className="py-3.5 px-3 text-right tabular-nums font-semibold text-[#18382E]">
                    {formatCurrency(c.attributedSales)}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums font-medium text-[#244B3D]">
                    {formatRoas(c.roas)}
                  </td>
                  <td
                    className={`py-3.5 px-3 text-right tabular-nums font-medium ${
                      c.acos > 30 ? 'text-[#B66A65]' : 'text-[#557F64]'
                    }`}
                  >
                    {formatPercent(c.acos)}
                  </td>
                  <td
                    className="py-3.5 px-5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => openBudgetModal(c)}>
                        <SlidersHorizontal className="w-3 h-3" />
                        Budget
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setModalAction({ type: 'toggle', campaign: c })}
                        title={c.status === 'Paused' ? 'Enable campaign' : 'Pause campaign'}
                      >
                        {c.status === 'Paused' ? (
                          <Play className="w-3.5 h-3.5 text-[#557F64]" />
                        ) : (
                          <Pause className="w-3.5 h-3.5 text-[#748078]" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Keyword Intelligence Table */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-[15.5px] font-semibold text-[#202923]">Keyword Intelligence</h3>
            <p className="text-[12.5px] text-[#748078]">
              Search terms, match types, bid efficiency, and simulated CPC bid adjustments
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={kwSearch}
                onChange={(e) => setKwSearch(e.target.value)}
                placeholder="Search keywords..."
                className="h-9 pl-8 pr-3 rounded-lg border border-[#E6EAE5] bg-[#F7F8F6] text-[13px] focus:bg-white focus:border-[#244B3D] focus:outline-none w-48"
              />
            </div>
            <select
              value={kwMatchFilter}
              onChange={(e) => setKwMatchFilter(e.target.value as 'All' | 'Exact' | 'Phrase' | 'Broad')}
              aria-label="Filter keywords by match type"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="All">All Match Types</option>
              <option value="Exact">Exact</option>
              <option value="Phrase">Phrase</option>
              <option value="Broad">Broad</option>
            </select>
            <select
              value={kwCampaignFilter}
              onChange={(e) => setKwCampaignFilter(e.target.value)}
              aria-label="Filter keywords by campaign"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px] max-w-[200px]"
            >
              <option value="All">All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.split('—')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">Keyword</th>
                <th className="py-3 px-3">Match Type</th>
                <th className="py-3 px-3 text-right">Max Bid</th>
                <th className="py-3 px-3 text-right">Impressions</th>
                <th className="py-3 px-3 text-right">Clicks</th>
                <th className="py-3 px-3 text-right">Spend</th>
                <th className="py-3 px-3 text-right">Attributed Sales</th>
                <th className="py-3 px-3 text-right">ACOS</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {filteredKeywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-[#F7F9F7] transition-colors">
                  <td className="py-3 px-5 font-medium text-[#202923]">
                    <div className="flex items-center gap-2">
                      <span>{kw.keyword}</span>
                      {kw.isNegative && <Badge variant="error">Negative</Badge>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="neutral">{kw.matchType}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {kw.isNegative ? '—' : formatCurrency(kw.bid, 2)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#5C6860]">
                    {formatNumber(kw.impressions)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#5C6860]">
                    {formatNumber(kw.clicks)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatCurrency(kw.spend)}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-medium text-[#18382E]">
                    {formatCurrency(kw.attributedSales)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right tabular-nums font-medium ${
                      kw.acos >= 35 ? 'text-[#B66A65]' : kw.acos > 0 ? 'text-[#557F64]' : 'text-[#748078]'
                    }`}
                  >
                    {kw.acos > 0 ? formatPercent(kw.acos) : '—'}
                  </td>
                  <td className="py-3 px-5 text-right">
                    {!kw.isNegative && (
                      <Button variant="outline" size="sm" onClick={() => openBidModal(kw)}>
                        Adjust Bid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Campaign Detail Drawer */}
      <Drawer
        open={Boolean(selectedCampaign)}
        onClose={closeDrawer}
        title={selectedCampaign?.name ?? ''}
        subtitle={selectedCampaign ? `${selectedCampaign.type} · Daily Budget $${selectedCampaign.dailyBudget}/day` : ''}
        width="max-w-2xl"
      >
        {selectedCampaign && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge
                variant={
                  selectedCampaign.status === 'Active'
                    ? 'success'
                    : selectedCampaign.status === 'Paused'
                      ? 'neutral'
                      : 'warning'
                }
                dot
              >
                {selectedCampaign.status}
              </Badge>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openBudgetModal(selectedCampaign)}>
                  Edit Daily Budget
                </Button>
                <Button
                  variant={selectedCampaign.status === 'Paused' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setModalAction({ type: 'toggle', campaign: selectedCampaign })}
                >
                  {selectedCampaign.status === 'Paused' ? 'Enable Campaign' : 'Pause Campaign'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">30d Spend</div>
                <div className="text-[16px] font-semibold tabular-nums">{formatCurrency(selectedCampaign.spend)}</div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">Attributed Sales</div>
                <div className="text-[16px] font-semibold text-[#18382E] tabular-nums">
                  {formatCurrency(selectedCampaign.attributedSales)}
                </div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">ROAS</div>
                <div className="text-[16px] font-semibold text-[#244B3D] tabular-nums">
                  {formatRoas(selectedCampaign.roas)}
                </div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">ACOS</div>
                <div className="text-[16px] font-semibold tabular-nums">
                  {formatPercent(selectedCampaign.acos)}
                </div>
              </div>
            </div>

            {/* Budget Utilization */}
            <div className="rounded-xl border border-[#E6EAE5] p-4">
              <div className="flex justify-between text-[12.5px] mb-1.5">
                <span className="font-medium text-[#202923]">Average Daily Budget Utilization</span>
                <span className="font-semibold text-[#244B3D] tabular-nums">
                  {Math.min(100, Math.round((selectedCampaign.spend / 30 / selectedCampaign.dailyBudget) * 100))}% of ${selectedCampaign.dailyBudget}/day
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#E6EAE5] overflow-hidden">
                <div
                  className="h-full bg-[#244B3D] rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((selectedCampaign.spend / 30 / selectedCampaign.dailyBudget) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* 7-day Performance Chart */}
            <div>
              <h4 className="text-[13.5px] font-semibold text-[#202923] mb-2">Trailing 7-Day Spend vs. Sales</h4>
              <div className="h-[190px] rounded-xl border border-[#E6EAE5] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedCampaign.dailyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#748078', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="sales" name="Attributed Sales" fill="#244B3D" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="spend" name="Spend" fill="#B89B68" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="rounded-xl border border-[#D4DFD6] bg-[#F2F6F3] p-4">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#18382E] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#244B3D]" />
                Advertising Recommendation
              </div>
              <p className="text-[13px] text-[#36443B] leading-relaxed">
                {selectedCampaign.aiRecommendation}
              </p>
            </div>

            {/* Campaign Keywords */}
            <div>
              <h4 className="text-[13.5px] font-semibold text-[#202923] mb-2">
                Assigned Keywords ({campaignKeywords.length})
              </h4>
              <div className="space-y-2">
                {campaignKeywords.map((kw) => (
                  <div
                    key={kw.id}
                    className="rounded-lg border border-[#E6EAE5] px-3.5 py-2.5 flex items-center justify-between gap-2 text-[12.5px]"
                  >
                    <div>
                      <span className="font-medium text-[#202923]">{kw.keyword}</span>
                      <span className="text-[#748078] ml-2">({kw.matchType})</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span>Bid {formatCurrency(kw.bid, 2)}</span>
                      <span className={kw.acos >= 35 ? 'text-[#B66A65] font-semibold' : 'text-[#557F64] font-semibold'}>
                        {kw.acos > 0 ? `${kw.acos}% ACOS` : 'Negative'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirmation Modal for all Simulated Advertising Actions */}
      <Modal
        open={Boolean(modalAction)}
        onClose={() => setModalAction(null)}
        title={
          modalAction?.type === 'budget'
            ? 'Edit Daily Campaign Budget'
            : modalAction?.type === 'toggle'
              ? modalAction.campaign.status === 'Paused'
                ? 'Enable Campaign'
                : 'Pause Campaign'
              : modalAction?.type === 'bid'
                ? 'Adjust Keyword Max CPC Bid'
                : modalAction?.type === 'add-keyword'
                  ? modalAction.isNegative
                    ? 'Add Negative Keyword'
                    : 'Add Target Keyword'
                  : ''
        }
        subtitle="Simulated advertising control — requires explicit confirmation"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmModal}>
              Confirm Simulated Change
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E8D8BC] bg-[#FAF6EE] p-3 flex items-start gap-2.5 text-[12px] text-[#7D6031]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#B58B4F]" />
            <span>
              <strong>Demo Mode Disclosure:</strong> Confirming this action updates local demonstration state and writes a simulated record to Activity Logs. No live Amazon Advertising API call or real budget change is made.
            </span>
          </div>

          {modalAction?.type === 'budget' && (
            <div className="space-y-3">
              <div className="text-[13px] text-[#4F5B53]">
                Campaign: <strong className="text-[#202923]">{modalAction.campaign.name}</strong>
              </div>
              <div>
                <label htmlFor="daily-budget-input" className="block text-[12.5px] font-medium text-[#202923] mb-1">
                  New Daily Budget (USD)
                </label>
                <input
                  id="daily-budget-input"
                  type="number"
                  min={10}
                  max={2000}
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[14px] tabular-nums focus:border-[#244B3D] focus:outline-none"
                />
                <p className="text-[11.5px] text-[#748078] mt-1">
                  Current daily budget: ${modalAction.campaign.dailyBudget}/day
                </p>
              </div>
            </div>
          )}

          {modalAction?.type === 'toggle' && (
            <p className="text-[13.5px] text-[#4F5B53] leading-relaxed">
              You are about to{' '}
              <strong>{modalAction.campaign.status === 'Paused' ? 'enable' : 'pause'}</strong>{' '}
              <strong className="text-[#202923]">{modalAction.campaign.name}</strong> in the local demonstration environment.
            </p>
          )}

          {modalAction?.type === 'bid' && (
            <div className="space-y-3">
              <div className="text-[13px] text-[#4F5B53]">
                Keyword: <strong className="text-[#202923]">"{modalAction.keyword.keyword}"</strong> ({modalAction.keyword.matchType})
              </div>
              <div>
                <label htmlFor="kw-bid-input" className="block text-[12.5px] font-medium text-[#202923] mb-1">
                  New Max CPC Bid (USD)
                </label>
                <input
                  id="kw-bid-input"
                  type="number"
                  step="0.02"
                  min="0.10"
                  max="10.00"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[14px] tabular-nums focus:border-[#244B3D] focus:outline-none"
                />
                <p className="text-[11.5px] text-[#748078] mt-1">
                  Current bid: ${modalAction.keyword.bid.toFixed(2)} · Current ACOS: {modalAction.keyword.acos}%
                </p>
              </div>
            </div>
          )}

          {modalAction?.type === 'add-keyword' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="new-kw-camp" className="block text-[12.5px] font-medium text-[#202923] mb-1">
                  Target Campaign
                </label>
                <select
                  id="new-kw-camp"
                  value={newKwCampaignId}
                  onChange={(e) => setNewKwCampaignId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13px] bg-white"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="new-kw-text" className="block text-[12.5px] font-medium text-[#202923] mb-1">
                  Keyword Phrase
                </label>
                <input
                  id="new-kw-text"
                  type="text"
                  value={newKwText}
                  onChange={(e) => setNewKwText(e.target.value)}
                  placeholder={modalAction.isNegative ? 'e.g. free workout pdf' : 'e.g. clinical sports nutrition book'}
                  className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] focus:border-[#244B3D] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-kw-match" className="block text-[12.5px] font-medium text-[#202923] mb-1">
                    Match Type
                  </label>
                  <select
                    id="new-kw-match"
                    value={newKwMatch}
                    onChange={(e) => setNewKwMatch(e.target.value as 'Exact' | 'Phrase' | 'Broad')}
                    className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13px] bg-white"
                  >
                    <option value="Exact">Exact</option>
                    <option value="Phrase">Phrase</option>
                    <option value="Broad">Broad</option>
                  </select>
                </div>
                {!modalAction.isNegative && (
                  <div>
                    <label htmlFor="new-kw-bid" className="block text-[12.5px] font-medium text-[#202923] mb-1">
                      Initial Bid (USD)
                    </label>
                    <input
                      id="new-kw-bid"
                      type="number"
                      step="0.05"
                      min="0.10"
                      value={newKwBid}
                      onChange={(e) => setNewKwBid(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] tabular-nums"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdvertisingPage;
