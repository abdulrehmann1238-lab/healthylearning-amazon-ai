import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  Landmark,
  Receipt,
  Megaphone,
  TrendingUp,
  Search,
  Download,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { MONTHLY_FINANCIAL_SERIES } from '../data/timeseries';
import type { FinancialCategory } from '../types';
import { KpiCard } from '../components/ui/KpiCard';
import { Card, SectionHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utilities/format';
import { exportToCsv } from '../utilities/csv';

const BREAKDOWN_DATA = [
  { name: 'Net Contribution', value: 151025, color: '#244B3D' },
  { name: 'Advertising Expense', value: 12840, color: '#B89B68' },
  { name: 'Estimated Deductions', value: 12680, color: '#82988A' },
  { name: 'Other & Adjustments', value: 9875, color: '#CBD4CC' },
];

export const FinancialsPage: React.FC = () => {
  const { financials, campaigns, addToast, addActivityLog, activeRole } = useAppState();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | FinancialCategory>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'nov' | 'oct'>('all');

  const currentAdSpend = useMemo(() => campaigns.reduce((s, c) => s + c.spend, 0), [campaigns]);
  const adRatio = ((currentAdSpend / 186420) * 100).toFixed(1);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return financials.filter((r) => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (dateFilter === 'nov' && !r.date.startsWith('2026-11')) return false;
      if (dateFilter === 'oct' && !r.date.startsWith('2026-10')) return false;
      if (
        q &&
        !r.reference.toLowerCase().includes(q) &&
        !r.description.toLowerCase().includes(q) &&
        !r.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [financials, search, categoryFilter, dateFilter]);

  const handleExport = () => {
    exportToCsv(
      'healthy-learning-financial-ledger-demo.csv',
      ['Date', 'Reference', 'Description', 'Category', 'Amount (USD)', 'Status'],
      filteredRecords.map((r) => [r.date, r.reference, r.description, r.category, r.amount, r.status])
    );
    addActivityLog({
      actor: activeRole,
      action: 'Exported financial ledger CSV',
      module: 'Sales',
      resource: `${filteredRecords.length} Financial Records`,
      status: 'Completed',
      details: 'Exported illustrative demonstration financial records.',
    });
    addToast({
      title: 'Financial CSV exported',
      description: `Downloaded ${filteredRecords.length} illustrative records.`,
      tone: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Financial Intelligence
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Illustrative revenue, advertising expense, and deduction overview from demonstration dataset
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Honest Vendor Central API disclosure */}
      <div className="rounded-xl border border-[#DCE3DB] bg-white px-4 py-3 flex items-start gap-3 text-[12.5px] text-[#4F5B53]">
        <Info className="w-4 h-4 text-[#244B3D] shrink-0 mt-0.5" />
        <span>
          <strong>Illustrative Financial Model:</strong> Figures shown below represent the demonstration dataset. In a live Amazon Vendor Central implementation, specific financial, remittance, and deduction granularity depends on authorized SP-API endpoints and accounting integrations.
        </span>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Gross Revenue"
          value="$186,420"
          delta="+12.8%"
          deltaPositive
          comparison="illustrative"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          label="Net Revenue (Est.)"
          value="$163,865"
          delta="+13.3%"
          deltaPositive
          comparison="after allowances"
          icon={<Landmark className="w-4 h-4" />}
        />
        <KpiCard
          label="Estimated Deductions"
          value="$12,680"
          delta="6.8% of gross"
          deltaPositive
          icon={<Receipt className="w-4 h-4" />}
        />
        <KpiCard
          label="Advertising Expense"
          value={formatCurrency(currentAdSpend)}
          delta={`${adRatio}% of gross`}
          deltaPositive
          icon={<Megaphone className="w-4 h-4" />}
        />
        <KpiCard
          label="Contribution Overview"
          value="$151,025"
          delta="81.0% ratio"
          deltaPositive
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Charts + AI Financial Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <SectionHeader
            title="Monthly Financial Comparison"
            subtitle="Gross revenue, estimated net revenue, and advertising expense (6-month illustrative trend)"
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONTHLY_FINANCIAL_SERIES} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEA" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#748078', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#748078', fontSize: 11.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="grossRevenue" name="Gross Revenue" fill="#E6EDE7" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="contribution" name="Contribution Overview" fill="#244B3D" radius={[4, 4, 0, 0]} barSize={24} />
                <Line type="monotone" dataKey="adSpend" name="Advertising Expense" stroke="#B89B68" strokeWidth={2.2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="lg:col-span-5 space-y-5 flex flex-col">
          <Card>
            <SectionHeader title="Financial Breakdown" subtitle="Share of gross illustrative revenue" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={BREAKDOWN_DATA}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={2}
                    >
                      {BREAKDOWN_DATA.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-[12.5px]">
                {BREAKDOWN_DATA.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[#4F5B53] truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold text-[#202923] tabular-nums">{formatCurrency(item.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="bg-[#F2F6F3] border-[#D4DFD6] flex-1">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#18382E] mb-2">
              <Sparkles className="w-4 h-4 text-[#244B3D]" />
              Financial AI Insight (Simulated)
            </div>
            <p className="text-[13.5px] leading-relaxed text-[#2C3A32]">
              Advertising represents <strong>{adRatio}%</strong> of recorded gross revenue in the current demonstration period — improving from 8.1% in September while gross revenue expanded +12.8%. One price-variance adjustment (<code>ADJ-PRC-074</code>, -$480) remains marked Pending Review.
            </p>
          </Card>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-[15.5px] font-semibold text-[#202923]">Financial Records & Adjustments</h3>
            <p className="text-[12.5px] text-[#748078]">
              Illustrative wholesale remittances, advertising invoices, deductions, and reconciliations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference or description..."
                className="h-9 pl-8 pr-3 rounded-lg border border-[#E6EAE5] bg-[#F7F8F6] text-[13px] focus:bg-white focus:border-[#244B3D] focus:outline-none w-56"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | FinancialCategory)}
              aria-label="Filter by financial category"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="All">All Categories</option>
              <option value="Revenue">Revenue</option>
              <option value="Advertising">Advertising</option>
              <option value="Deductions">Deductions</option>
              <option value="Adjustments">Adjustments</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'nov' | 'oct')}
              aria-label="Filter by month"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="all">All Dates</option>
              <option value="nov">November 2026</option>
              <option value="oct">October 2026</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-[#F7F9F7] transition-colors">
                  <td className="py-3 px-5 tabular-nums text-[#5C6860]">{r.date}</td>
                  <td className="py-3 px-4 font-mono text-[12px] font-medium text-[#18382E]">{r.reference}</td>
                  <td className="py-3 px-4 text-[#202923]">{r.description}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        r.category === 'Revenue'
                          ? 'success'
                          : r.category === 'Advertising'
                            ? 'gold'
                            : r.category === 'Deductions'
                              ? 'warning'
                              : 'neutral'
                      }
                    >
                      {r.category}
                    </Badge>
                  </td>
                  <td
                    className={`py-3 px-4 text-right tabular-nums font-semibold ${
                      r.amount >= 0 ? 'text-[#244B3D]' : 'text-[#202923]'
                    }`}
                  >
                    {r.amount >= 0 ? `+${formatCurrency(r.amount)}` : formatCurrency(r.amount)}
                  </td>
                  <td className="py-3 px-5">
                    <Badge variant={r.status === 'Pending Review' ? 'warning' : 'neutral'}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FinancialsPage;
