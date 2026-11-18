export type DateRangeKey = '7d' | '30d' | '90d' | 'ytd';

export type ProductCategory =
  | 'Sports Medicine'
  | 'Lifestyle Medicine'
  | 'Exercise Science'
  | 'Clinical Reference'
  | 'Preventive Health'
  | 'Rehabilitation';

export type InventoryStatus = 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  isbn: string;
  asin: string;
  category: ProductCategory;
  edition: string;
  publishYear: number;
  listPrice: number;
  wholesalePrice: number;
  unitsSold: number;
  previousUnitsSold: number;
  revenue: number;
  previousRevenue: number;
  growthPercent: number;
  performanceTier: 'Top Performer' | 'Strong' | 'Steady' | 'Watch';
  availableUnits: number;
  reservedUnits: number;
  inboundUnits: number;
  dailyVelocity: number;
  coverTone: {
    bg: string;
    accent: string;
    text: string;
    stripe: string;
  };
  monthlyHistory: { month: string; revenue: number; units: number }[];
  aiNote: string;
}

export interface DailySalesPoint {
  date: string;
  shortDate: string;
  revenue: number;
  previousRevenue: number;
  units: number;
  previousUnits: number;
  adSpend: number;
  attributedSales: number;
  roas: number;
  acos: number;
}

export type PurchaseOrderStatus =
  | 'New'
  | 'Acknowledged'
  | 'In Progress'
  | 'Shipped'
  | 'Delivered'
  | 'Closed';

export interface PurchaseOrderItem {
  productId: string;
  title: string;
  isbn: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderEvent {
  timestamp: string;
  label: string;
  actor: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDelivery: string;
  fulfillmentCenter: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalUnits: number;
  totalValue: number;
  reviewed: boolean;
  notes: string[];
  timeline: PurchaseOrderEvent[];
}

export type FinancialCategory =
  | 'Revenue'
  | 'Advertising'
  | 'Deductions'
  | 'Adjustments'
  | 'Other';

export interface FinancialRecord {
  id: string;
  date: string;
  reference: string;
  description: string;
  category: FinancialCategory;
  amount: number;
  status: 'Settled' | 'Recorded' | 'Pending Review' | 'Estimated';
}

export type CampaignStatus = 'Active' | 'Paused' | 'Optimizing';
export type CampaignType = 'Sponsored Products' | 'Sponsored Brands';

export interface AdCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  dailyBudget: number;
  spend: number;
  attributedSales: number;
  impressions: number;
  clicks: number;
  roas: number;
  acos: number;
  primaryProductIds: string[];
  dailyPerformance: { date: string; spend: number; sales: number }[];
  aiRecommendation: string;
}

export interface AdKeyword {
  id: string;
  campaignId: string;
  keyword: string;
  matchType: 'Exact' | 'Phrase' | 'Broad';
  bid: number;
  impressions: number;
  clicks: number;
  spend: number;
  attributedSales: number;
  acos: number;
  isNegative?: boolean;
}

export type RecommendationCategory = 'Inventory' | 'Advertising' | 'Sales' | 'Operations';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface Recommendation {
  id: string;
  title: string;
  category: RecommendationCategory;
  priority: PriorityLevel;
  summary: string;
  explanation: string;
  impactAssessment: string;
  suggestedAction: string;
  supportingMetrics: { label: string; value: string }[];
  relatedRoute: string;
  relatedProductIds?: string[];
  status: 'Open' | 'Reviewed' | 'Dismissed' | 'Converted to Approval';
  createdAt: string;
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Review Requested';
export type RiskLevel = 'Low' | 'Moderate' | 'Elevated';

export interface ApprovalRequest {
  id: string;
  title: string;
  type: 'Advertising Budget' | 'Keyword Bid' | 'Campaign Status' | 'Inventory Operations';
  proposedBy: string;
  date: string;
  currentValue: string;
  proposedValue: string;
  reason: string;
  expectedImpact: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  decidedAt?: string;
  decidedBy?: string;
  decisionNote?: string;
  relatedCampaignId?: string;
}

export interface WorkflowExecution {
  id: string;
  timestamp: string;
  durationMs: number;
  status: 'Completed' | 'Failed';
  summary: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  purpose: string;
  schedule: string;
  lastExecuted: string;
  enabled: boolean;
  executionCount: number;
  failedCount: number;
  stages: string[];
  history: WorkflowExecution[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module:
    | 'Sales'
    | 'Inventory'
    | 'Purchase Orders'
    | 'Advertising'
    | 'AI Assistant'
    | 'Approvals'
    | 'Automation'
    | 'Security'
    | 'Settings';
  resource: string;
  status: 'Completed' | 'Approved' | 'Rejected' | 'Recorded' | 'Warning';
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  route: string;
  read: boolean;
  tone: 'info' | 'warning' | 'success';
}

export type UserRole = 'Administrator' | 'Operations Manager' | 'Analyst' | 'Viewer';

export interface WorkspaceSettings {
  businessName: string;
  currency: 'USD';
  defaultDateRange: DateRangeKey;
  emailDigestEnabled: boolean;
  lowStockAlertsEnabled: boolean;
  approvalAlertsEnabled: boolean;
  adAnomalyAlertsEnabled: boolean;
  requireApprovalAboveBudget: number;
  requireApprovalForCampaignPause: boolean;
  dailyAdSpendLimit: number;
  lowStockThresholdDays: number;
  criticalStockThresholdDays: number;
  autoGenerateWeeklyBrief: boolean;
  dataRetentionDays: number;
  includeIllustrativeDisclosure: boolean;
}

export interface AiChatAction {
  label: string;
  route: string;
  actionType?: 'navigate' | 'create-recommendation';
}

export interface AiChatTable {
  headers: string[];
  rows: string[][];
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  highlights?: { label: string; value: string }[];
  table?: AiChatTable;
  actions?: AiChatAction[];
}

export interface AiConversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: AiMessage[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'info' | 'warning';
}
