import type {
  AdCampaign,
  AdKeyword,
  AiMessage,
  ApprovalRequest,
  FinancialRecord,
  Product,
  PurchaseOrder,
  WorkspaceSettings,
} from '../types';
import { CATALOG_SUMMARY } from './products';
import { formatCurrency, formatNumber, formatPercent, formatRoas, getCoverageDays, getInventoryStatus } from '../utilities/format';

export interface AiAnalysisContext {
  products: Product[];
  campaigns: AdCampaign[];
  keywords: AdKeyword[];
  purchaseOrders: PurchaseOrder[];
  financials: FinancialRecord[];
  approvals: ApprovalRequest[];
  settings: WorkspaceSettings;
}

export function generateAiResponse(query: string, ctx: AiAnalysisContext): AiMessage {
  const q = query.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const totalAdSpend = ctx.campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalAdSales = ctx.campaigns.reduce((acc, c) => acc + c.attributedSales, 0);
  const blendedRoas = totalAdSpend > 0 ? totalAdSales / totalAdSpend : 0;
  const blendedAcos = totalAdSales > 0 ? (totalAdSpend / totalAdSales) * 100 : 0;

  const lowOrCritical = ctx.products.filter((p) => {
    const st = getInventoryStatus(p, ctx.settings.lowStockThresholdDays, ctx.settings.criticalStockThresholdDays);
    return st === 'Low Stock' || st === 'Critical' || st === 'Out of Stock';
  });

  // 1. Inventory queries
  if (
    q.includes('inventory') ||
    q.includes('stock') ||
    q.includes('coverage') ||
    q.includes('replenish') ||
    q.includes('out of stock') ||
    q.includes('low stock')
  ) {
    const rows = lowOrCritical.map((p) => [
      p.title,
      `${formatNumber(p.availableUnits)} avail / ${formatNumber(p.inboundUnits)} inb`,
      `${getCoverageDays(p)} days`,
      getInventoryStatus(p, ctx.settings.lowStockThresholdDays, ctx.settings.criticalStockThresholdDays),
    ]);

    return {
      id,
      role: 'assistant',
      timestamp,
      content: `Based on your configured demonstration thresholds (Low Stock ≤ ${ctx.settings.lowStockThresholdDays} days, Critical ≤ ${ctx.settings.criticalStockThresholdDays} days), **${lowOrCritical.length} titles** currently require inventory attention. Overall catalog availability remains at **${CATALOG_SUMMARY.inventoryAvailability}%**, but prioritizing inbound purchase orders for these titles will protect near-term wholesale revenue.`,
      highlights: [
        { label: 'Catalog Availability', value: `${CATALOG_SUMMARY.inventoryAvailability}%` },
        { label: 'Titles Flagged', value: `${lowOrCritical.length} Titles` },
        { label: 'Inbound Replenishment', value: `${formatNumber(lowOrCritical.reduce((s, p) => s + p.inboundUnits, 0))} Units` },
      ],
      table: {
        headers: ['Title', 'Stock Position', 'Est. Coverage', 'Status'],
        rows: rows.length > 0 ? rows : [['All monitored titles', 'Above threshold', '> 14 days', 'Healthy']],
      },
      sources: ['Demonstration Inventory Dataset', 'Vendor Central Purchase Orders (Simulated)'],
      actions: [
        { label: 'Review Inventory', route: '/inventory' },
        { label: 'Inspect Purchase Orders', route: '/purchase-orders' },
        { label: 'Create Recommendation', route: '/recommendations', actionType: 'create-recommendation' },
      ],
    };
  }

  // 2. Advertising / Campaigns / Keywords / ROAS / ACOS
  if (
    q.includes('advertis') ||
    q.includes('campaign') ||
    q.includes('roas') ||
    q.includes('acos') ||
    q.includes('keyword') ||
    q.includes('ad spend') ||
    q.includes('budget') ||
    q.includes('bid')
  ) {
    const sortedByAcos = [...ctx.campaigns].sort((a, b) => b.acos - a.acos);
    const worst = sortedByAcos[0];
    const best = [...ctx.campaigns].sort((a, b) => b.roas - a.roas)[0];
    const highAcosKeywords = [...ctx.keywords].filter((k) => k.acos >= 35).sort((a, b) => b.acos - a.acos);

    return {
      id,
      role: 'assistant',
      timestamp,
      content: `Across **${ctx.campaigns.length} demonstration campaigns**, total advertising spend is **${formatCurrency(totalAdSpend)}** generating **${formatCurrency(totalAdSales)}** in attributed sales (**${formatRoas(blendedRoas)} ROAS**, **${formatPercent(blendedAcos)} ACOS**). **${worst.name}** requires attention at **${formatPercent(worst.acos)} ACOS**, while **${best.name}** leads efficiency at **${formatRoas(best.roas)} ROAS**. There are also **${highAcosKeywords.length} broad/phrase keywords** above 35% ACOS suitable for bid reduction.`,
      highlights: [
        { label: 'Total Ad Spend', value: formatCurrency(totalAdSpend) },
        { label: 'Attributed Sales', value: formatCurrency(totalAdSales) },
        { label: 'Blended ROAS / ACOS', value: `${formatRoas(blendedRoas)} · ${formatPercent(blendedAcos)}` },
      ],
      table: {
        headers: ['Campaign', 'Status', 'Spend', 'ROAS', 'ACOS'],
        rows: ctx.campaigns.map((c) => [
          c.name,
          c.status,
          formatCurrency(c.spend),
          formatRoas(c.roas),
          formatPercent(c.acos),
        ]),
      },
      sources: ['Demonstration Advertising Dataset', 'Keyword Performance Dataset'],
      actions: [
        { label: 'Explore Campaigns', route: '/advertising' },
        { label: 'Review Pending Approvals', route: '/approvals' },
      ],
    };
  }

  // 3. Purchase Orders
  if (q.includes('purchase order') || q.includes('po ') || q.includes('pos') || q.includes('order') || q.includes('vendor')) {
    const pendingPOs = ctx.purchaseOrders.filter((po) => po.status === 'New' || !po.reviewed);
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `Your Vendor Central demonstration workspace tracks **${CATALOG_SUMMARY.totalPurchaseOrders} total purchase orders** (+${CATALOG_SUMMARY.purchaseOrderGrowth}% vs prior period). Currently, **${pendingPOs.length} featured purchase orders** are awaiting internal review, totaling **${formatCurrency(pendingPOs.reduce((s, p) => s + p.totalValue, 0))}**. Notably, **PO-HL-88419** contains replenishment units for two low-coverage titles, and **PO-HL-88416** is in transit to resolve the Orthopedic Rehabilitation Protocols stockout.`,
      highlights: [
        { label: 'Total Period POs', value: String(CATALOG_SUMMARY.totalPurchaseOrders) },
        { label: 'Pending Review', value: `${pendingPOs.length} Featured POs` },
        { label: 'Featured PO Value', value: formatCurrency(ctx.purchaseOrders.reduce((s, p) => s + p.totalValue, 0)) },
      ],
      table: {
        headers: ['PO Number', 'Expected Delivery', 'Units', 'Value', 'Status'],
        rows: ctx.purchaseOrders.slice(0, 5).map((po) => [
          po.poNumber,
          po.expectedDelivery,
          formatNumber(po.totalUnits),
          formatCurrency(po.totalValue),
          po.status,
        ]),
      },
      sources: ['Demonstration Purchase Order Dataset'],
      actions: [
        { label: 'Open Purchase Orders', route: '/purchase-orders' },
        { label: 'Check Inventory Impact', route: '/inventory' },
      ],
    };
  }

  // 4. Financials
  if (
    q.includes('financ') ||
    q.includes('deduction') ||
    q.includes('margin') ||
    q.includes('net revenue') ||
    q.includes('profit') ||
    q.includes('expense')
  ) {
    const adRatio = (totalAdSpend / CATALOG_SUMMARY.monthlyRevenue) * 100;
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `In the illustrative 30-day financial dataset, **Gross Revenue** is **${formatCurrency(CATALOG_SUMMARY.monthlyRevenue)}** with estimated **Net Revenue** of **$163,865** after illustrative deductions ($12,680) and adjustments. **Advertising expense (${formatCurrency(totalAdSpend)})** represents **${adRatio.toFixed(1)}%** of recorded gross revenue — down 4.6% from the prior period while revenue rose +12.8%. Note that Vendor Central financial settlement availability depends on authorized SP-API scopes in production.`,
      highlights: [
        { label: 'Gross Revenue (Illustrative)', value: formatCurrency(CATALOG_SUMMARY.monthlyRevenue) },
        { label: 'Est. Net Revenue', value: '$163,865' },
        { label: 'Ad Spend % of Gross', value: `${adRatio.toFixed(1)}%` },
      ],
      table: {
        headers: ['Category', 'Current Period', 'Share of Gross'],
        rows: [
          ['Gross Wholesale Revenue', '$186,420', '100.0%'],
          ['Estimated Deductions & Allowances', '-$12,680', '6.8%'],
          ['Advertising Expense', `-${formatCurrency(totalAdSpend)}`, `${adRatio.toFixed(1)}%`],
          ['Illustrative Contribution Overview', '$151,025', '81.0%'],
        ],
      },
      sources: ['Demonstration Financial Dataset', 'Advertising Spend Ledger'],
      actions: [
        { label: 'View Financial Intelligence', route: '/financials' },
        { label: 'Explore Ad Efficiency', route: '/advertising' },
      ],
    };
  }

  // 5. Sales / Top Books / Priority Titles
  if (
    q.includes('book') ||
    q.includes('title') ||
    q.includes('revenue') ||
    q.includes('sales') ||
    q.includes('top') ||
    q.includes('prioritize') ||
    q.includes('sell') ||
    q.includes('units')
  ) {
    const topTitles = [...ctx.products].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `Total monthly revenue stands at **${formatCurrency(CATALOG_SUMMARY.monthlyRevenue)}** (**+${CATALOG_SUMMARY.monthlyRevenueGrowth}%** vs. previous period) across **${formatNumber(CATALOG_SUMMARY.monthlyUnits)} units sold**. **The Sports Medicine Handbook** and **Foundations of Lifestyle Medicine** lead catalog contribution, while **Sleep Architecture & Behavioral Health** posts the highest percentage momentum (**+19.2%**).`,
      highlights: [
        { label: 'Monthly Revenue', value: formatCurrency(CATALOG_SUMMARY.monthlyRevenue) },
        { label: 'Units Sold', value: formatNumber(CATALOG_SUMMARY.monthlyUnits) },
        { label: 'Top Title', value: topTitles[0].title },
      ],
      table: {
        headers: ['Book Title', 'Category', 'Units', 'Revenue', 'Growth'],
        rows: topTitles.map((p) => [
          p.title,
          p.category,
          formatNumber(p.unitsSold),
          formatCurrency(p.revenue),
          formatPercent(p.growthPercent, true),
        ]),
      },
      sources: ['Demonstration Sales Dataset', 'Catalog Master Dataset'],
      actions: [
        { label: 'View Sales Report', route: '/sales' },
        { label: 'Open Product Catalog', route: '/products' },
      ],
    };
  }

  // 6. Executive Summary / General Business Performance / Opportunities
  if (
    q.includes('summar') ||
    q.includes('overview') ||
    q.includes('performance') ||
    q.includes('opportunit') ||
    q.includes('report') ||
    q.includes('business') ||
    q.includes('health') ||
    q.includes('month')
  ) {
    const pendingApprovals = ctx.approvals.filter((a) => a.status === 'Pending').length;
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `Here is your executive summary from the current demonstration dataset: **Revenue is up +12.8% to $186,420** across 8,462 units sold, led by Sports Medicine and Lifestyle Medicine titles. Advertising efficiency improved with spend down 4.6% to **${formatCurrency(totalAdSpend)}** at **${formatRoas(blendedRoas)} blended ROAS**. Two operational areas merit immediate attention: **${lowOrCritical.length} titles have low or out-of-stock coverage**, and **${pendingApprovals} optimization proposals** await review in your Approval Center.`,
      highlights: [
        { label: 'Revenue (30d)', value: '$186,420 (+12.8%)' },
        { label: 'Inventory Health', value: `${CATALOG_SUMMARY.inventoryAvailability}% (${lowOrCritical.length} flagged)` },
        { label: 'Pending Approvals', value: `${pendingApprovals} Proposals` },
      ],
      table: {
        headers: ['Operational Pillar', 'Status', 'Key Observation'],
        rows: [
          ['Sales Performance', 'Healthy', '+12.8% revenue growth; Sports Medicine leads at $34,200'],
          ['Inventory Position', 'Attention Required', `${lowOrCritical.length} titles below coverage threshold; inbound POs tracked`],
          ['Advertising Efficiency', 'Healthy', `${formatRoas(blendedRoas)} ROAS; opportunity to trim 41.7% ACOS Sponsored Brands`],
          ['Purchase Orders', 'Normal', '142 period POs; 2 newly synced orders awaiting review'],
        ],
      },
      sources: ['Demonstration Sales Dataset', 'Inventory Dataset', 'Advertising Dataset', 'Purchase Orders'],
      actions: [
        { label: 'View Sales Report', route: '/sales' },
        { label: 'Review Inventory', route: '/inventory' },
        { label: 'Open Approval Center', route: '/approvals' },
      ],
    };
  }

  // 7. Transparent fallback for unsupported / out-of-scope questions
  return {
    id,
    role: 'assistant',
    timestamp,
    content:
      'I can demonstrate analysis across the available sample sales, inventory, purchase order, financial, and advertising datasets. This demonstration does not access live Amazon account information.\n\nTry asking about top-revenue books, low inventory coverage, advertising campaigns with high ACOS, pending purchase orders, or an executive monthly summary.',
    sources: ['Demonstration Environment Notice'],
    actions: [
      { label: 'View Business Overview', route: '/overview' },
      { label: 'Explore Recommendations', route: '/recommendations' },
    ],
  };
}
