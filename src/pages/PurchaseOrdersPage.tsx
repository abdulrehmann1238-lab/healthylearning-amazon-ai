import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Loader2,
  Truck,
  CheckCircle2,
  Search,
  MessageSquarePlus,
  Check,
  Info,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { PO_SUMMARY_COUNTS } from '../data/operations';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';
import { formatCurrency, formatNumber } from '../utilities/format';

const STATUS_OPTIONS: ('All' | PurchaseOrderStatus)[] = [
  'All',
  'New',
  'Acknowledged',
  'In Progress',
  'Shipped',
  'Delivered',
  'Closed',
];

function poStatusVariant(status: PurchaseOrderStatus): BadgeVariant {
  switch (status) {
    case 'New':
      return 'gold';
    case 'Acknowledged':
      return 'forest';
    case 'In Progress':
      return 'warning';
    case 'Shipped':
      return 'forest';
    case 'Delivered':
    case 'Closed':
      return 'success';
  }
}

export const PurchaseOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { purchaseOrders, markPoReviewed, addPoNote } = useAppState();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PurchaseOrderStatus>('All');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    const id = searchParams.get('selected');
    if (id && purchaseOrders.some((p) => p.id === id)) {
      setSelectedId(id);
    }
  }, [searchParams, purchaseOrders]);

  const selectedPo: PurchaseOrder | null = useMemo(
    () => purchaseOrders.find((p) => p.id === selectedId) ?? null,
    [purchaseOrders, selectedId]
  );

  const closeDrawer = () => {
    setSelectedId(null);
    setNoteInput('');
    if (searchParams.has('selected')) {
      searchParams.delete('selected');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      if (statusFilter !== 'All' && po.status !== statusFilter) return false;
      if (dateFilter === '7d' && po.orderDate < '2026-11-12') return false;
      if (
        q &&
        !po.poNumber.toLowerCase().includes(q) &&
        !po.fulfillmentCenter.toLowerCase().includes(q) &&
        !po.items.some((i) => i.title.toLowerCase().includes(q) || i.isbn.includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [purchaseOrders, search, statusFilter, dateFilter]);

  const unreviewedDelta = useMemo(() => {
    const newCount = purchaseOrders.filter((p) => p.status === 'New').length;
    return Math.max(0, PO_SUMMARY_COUNTS.pendingAcknowledgment - (2 - newCount));
  }, [purchaseOrders]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo || !noteInput.trim()) return;
    addPoNote(selectedPo.id, noteInput);
    setNoteInput('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
          Purchase Order Management
        </h2>
        <p className="text-[13.5px] text-[#748078] mt-0.5">
          Amazon Vendor Central purchase order tracking, fulfillment review, and delivery visibility
        </p>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total Purchase Orders"
          value={String(PO_SUMMARY_COUNTS.total)}
          delta="+6.2%"
          deltaPositive
          icon={<ClipboardList className="w-4 h-4" />}
          onClick={() => setStatusFilter('All')}
          active={statusFilter === 'All'}
        />
        <KpiCard
          label="Pending Acknowledgment"
          value={String(unreviewedDelta)}
          comparison="needs review"
          icon={<Clock className="w-4 h-4" />}
          onClick={() => setStatusFilter('New')}
          active={statusFilter === 'New'}
        />
        <KpiCard
          label="In Progress"
          value={String(PO_SUMMARY_COUNTS.inProgress)}
          comparison="warehouse prep"
          icon={<Loader2 className="w-4 h-4" />}
          onClick={() => setStatusFilter('In Progress')}
          active={statusFilter === 'In Progress'}
        />
        <KpiCard
          label="Shipped"
          value={String(PO_SUMMARY_COUNTS.shipped)}
          comparison="in transit"
          icon={<Truck className="w-4 h-4" />}
          onClick={() => setStatusFilter('Shipped')}
          active={statusFilter === 'Shipped'}
        />
        <KpiCard
          label="Completed"
          value={String(PO_SUMMARY_COUNTS.completed)}
          comparison="delivered & closed"
          icon={<CheckCircle2 className="w-4 h-4" />}
          onClick={() => setStatusFilter('Closed')}
          active={statusFilter === 'Closed'}
        />
      </div>

      {/* PO Table */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PO number, FC, or title..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-[#E6EAE5] bg-[#F7F8F6] text-[13px] focus:bg-white focus:border-[#244B3D] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | PurchaseOrderStatus)}
              aria-label="Filter by status"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | '7d' | '30d')}
              aria-label="Filter by order date"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="all">All Order Dates</option>
              <option value="7d">Ordered Last 7 Days</option>
              <option value="30d">Ordered Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">PO Number</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Expected Delivery</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4 text-right">Units</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#748078]">
                    No purchase orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((po) => (
                  <tr
                    key={po.id}
                    onClick={() => setSelectedId(po.id)}
                    className="hover:bg-[#F7F9F7] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-mono font-semibold text-[#18382E]">{po.poNumber}</div>
                      <div className="text-[11.5px] text-[#748078]">{po.fulfillmentCenter}</div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-[#5C6860]">{po.orderDate}</td>
                    <td className="py-3.5 px-4 tabular-nums text-[#202923] font-medium">
                      {po.expectedDelivery}
                    </td>
                    <td className="py-3.5 px-4 text-[#4F5B53]">
                      <div className="truncate max-w-[240px]">
                        {po.items.map((i) => i.title).join(', ')}
                      </div>
                      <div className="text-[11px] text-[#748078]">{po.items.length} line items</div>
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-medium">
                      {formatNumber(po.totalUnits)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-semibold text-[#18382E]">
                      {formatCurrency(po.totalValue)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <Badge variant={poStatusVariant(po.status)} dot>
                          {po.status}
                        </Badge>
                        {po.reviewed && (
                          <span className="text-[11px] text-[#557F64]" title="Internally reviewed">
                            Reviewed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Full PO Detail Drawer */}
      <Drawer
        open={Boolean(selectedPo)}
        onClose={closeDrawer}
        title={selectedPo?.poNumber ?? ''}
        subtitle={selectedPo ? `${selectedPo.fulfillmentCenter} · Ordered ${selectedPo.orderDate}` : ''}
        width="max-w-2xl"
        headerExtra={
          selectedPo ? <Badge variant={poStatusVariant(selectedPo.status)} dot>{selectedPo.status}</Badge> : null
        }
      >
        {selectedPo && (
          <div className="space-y-6">
            {/* Demo notice */}
            <div className="rounded-lg border border-[#DCE3DB] bg-[#F7F8F6] px-3.5 py-2.5 flex items-start gap-2.5 text-[12px] text-[#525E56]">
              <Info className="w-4 h-4 text-[#244B3D] shrink-0 mt-0.5" />
              <span>
                Demonstration record. Reviewing or adding internal notes updates local demo state only and does not submit acknowledgments to Amazon Vendor Central.
              </span>
            </div>

            {/* Delivery & Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">Order Date</div>
                <div className="text-[14px] font-semibold tabular-nums mt-0.5">{selectedPo.orderDate}</div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">Expected Delivery</div>
                <div className="text-[14px] font-semibold tabular-nums mt-0.5">{selectedPo.expectedDelivery}</div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">Total Units</div>
                <div className="text-[14px] font-semibold tabular-nums mt-0.5">{formatNumber(selectedPo.totalUnits)}</div>
              </div>
              <div className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                <div className="text-[11px] text-[#748078]">Total Value</div>
                <div className="text-[14px] font-semibold text-[#18382E] tabular-nums mt-0.5">
                  {formatCurrency(selectedPo.totalValue)}
                </div>
              </div>
            </div>

            {/* Simulated action bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                disabled={selectedPo.reviewed}
                onClick={() => markPoReviewed(selectedPo.id)}
              >
                <Check className="w-3.5 h-3.5" />
                {selectedPo.reviewed ? 'Marked as Reviewed' : 'Mark as Reviewed (Demo)'}
              </Button>
            </div>

            {/* Ordered Line Items */}
            <div>
              <h4 className="text-[13.5px] font-semibold text-[#202923] mb-2.5">Ordered Products</h4>
              <div className="rounded-xl border border-[#E6EAE5] overflow-hidden">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-[#FAFBFA] border-b border-[#E6EAE5] text-[#748078] text-[11px] uppercase">
                      <th className="py-2.5 px-3.5">Title & ISBN</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Cost</th>
                      <th className="py-2.5 px-3.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F3EF]">
                    {selectedPo.items.map((item) => (
                      <tr key={item.isbn}>
                        <td className="py-3 px-3.5">
                          <div className="font-medium text-[#202923]">{item.title}</div>
                          <div className="font-mono text-[11px] text-[#748078]">{item.isbn}</div>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">{formatNumber(item.quantity)}</td>
                        <td className="py-3 px-3 text-right tabular-nums">{formatCurrency(item.unitCost, 2)}</td>
                        <td className="py-3 px-3.5 text-right tabular-nums font-semibold text-[#18382E]">
                          {formatCurrency(item.quantity * item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <h4 className="text-[13.5px] font-semibold text-[#202923] mb-2.5">Internal Notes</h4>
              <ul className="space-y-2 mb-3">
                {selectedPo.notes.map((n, i) => (
                  <li key={i} className="rounded-lg bg-[#F7F8F6] border border-[#E6EAE5] px-3.5 py-2.5 text-[12.5px] text-[#3B4840]">
                    {n}
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add an internal operational note..."
                  className="flex-1 h-9 px-3 rounded-lg border border-[#E6EAE5] text-[13px] focus:border-[#244B3D] focus:outline-none"
                />
                <Button type="submit" variant="secondary" size="sm" disabled={!noteInput.trim()}>
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  Add Note
                </Button>
              </form>
            </div>

            {/* Activity Timeline */}
            <div>
              <h4 className="text-[13.5px] font-semibold text-[#202923] mb-3">Order History & Timeline</h4>
              <ol className="relative border-l border-[#DCE3DB] ml-2 space-y-4">
                {selectedPo.timeline.map((ev, i) => (
                  <li key={i} className="pl-4 relative">
                    <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#244B3D] ring-4 ring-white" />
                    <div className="text-[13px] font-medium text-[#202923]">{ev.label}</div>
                    <div className="text-[11.5px] text-[#748078] mt-0.5">
                      {ev.timestamp} · {ev.actor}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PurchaseOrdersPage;
