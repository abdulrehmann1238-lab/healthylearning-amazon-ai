import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type {
  ActivityLogEntry,
  AdCampaign,
  AdKeyword,
  AiConversation,
  ApprovalRequest,
  AutomationWorkflow,
  DateRangeKey,
  FinancialRecord,
  NotificationItem,
  Product,
  PurchaseOrder,
  Recommendation,
  ToastMessage,
  UserRole,
  WorkspaceSettings,
} from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import {
  DEFAULT_SETTINGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_APPROVALS,
  INITIAL_CAMPAIGNS,
  INITIAL_FINANCIAL_RECORDS,
  INITIAL_KEYWORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_WORKFLOWS,
} from '../data/operations';

const SETTINGS_STORAGE_KEY = 'hl_demo_workspace_settings_v1';

interface AppStateContextValue {
  dateRange: DateRangeKey;
  setDateRange: (r: DateRangeKey) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  financials: FinancialRecord[];
  campaigns: AdCampaign[];
  keywords: AdKeyword[];
  recommendations: Recommendation[];
  approvals: ApprovalRequest[];
  workflows: AutomationWorkflow[];
  activityLogs: ActivityLogEntry[];
  notifications: NotificationItem[];
  settings: WorkspaceSettings;
  conversations: AiConversation[];
  setConversations: React.Dispatch<React.SetStateAction<AiConversation[]>>;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  addActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  // Purchase Orders
  markPoReviewed: (poId: string) => void;
  addPoNote: (poId: string, note: string) => void;
  // Advertising
  updateCampaignBudget: (campaignId: string, newBudget: number) => void;
  toggleCampaignStatus: (campaignId: string) => void;
  updateKeywordBid: (keywordId: string, newBid: number) => void;
  addKeyword: (campaignId: string, keyword: string, matchType: 'Exact' | 'Phrase' | 'Broad', bid: number, isNegative?: boolean) => void;
  // Recommendations
  updateRecommendationStatus: (recId: string, status: Recommendation['status']) => void;
  createRecommendation: (rec: Omit<Recommendation, 'id' | 'createdAt' | 'status'>) => void;
  // Approvals
  decideApproval: (approvalId: string, decision: 'Approved' | 'Rejected' | 'Review Requested', note?: string) => void;
  // Workflows
  toggleWorkflow: (workflowId: string) => void;
  recordWorkflowRun: (workflowId: string) => void;
  // Settings
  updateSettings: (partial: Partial<WorkspaceSettings>, silent?: boolean) => void;
  resetSettings: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function loadStoredSettings(): WorkspaceSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function nowTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${y}-${m}-${d} ${t}`;
}

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WorkspaceSettings>(loadStoredSettings);
  const [dateRange, setDateRange] = useState<DateRangeKey>(() => loadStoredSettings().defaultDateRange);
  const [activeRole, setActiveRole] = useState<UserRole>('Administrator');
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [financials] = useState<FinancialRecord[]>(INITIAL_FINANCIAL_RECORDS);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(INITIAL_CAMPAIGNS);
  const [keywords, setKeywords] = useState<AdKeyword[]>(INITIAL_KEYWORDS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(INITIAL_WORKFLOWS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [conversations, setConversations] = useState<AiConversation[]>([
    {
      id: 'conv-initial',
      title: 'Monthly Performance Briefing',
      updatedAt: 'Today, 08:30 AM',
      messages: [],
    },
    {
      id: 'conv-inv',
      title: 'Q4 Inventory Replenishment',
      updatedAt: 'Yesterday, 03:15 PM',
      messages: [
        {
          id: 'm-prev-1',
          role: 'user',
          content: 'Which titles have low inventory coverage?',
          timestamp: '03:14 PM',
        },
        {
          id: 'm-prev-2',
          role: 'assistant',
          content:
            'Based on your configured demonstration thresholds (Low Stock ≤ 14 days, Critical ≤ 7 days), **4 titles** require inventory attention: Cardiopulmonary Assessment Manual (7 days), Clinical Exercise Prescription (10 days), Strength & Conditioning Science (10 days), and Orthopedic Rehabilitation Protocols (Out of Stock, 350 units inbound via PO-HL-88416).',
          timestamp: '03:15 PM',
          sources: ['Demonstration Inventory Dataset', 'Vendor Central Purchase Orders (Simulated)'],
          actions: [
            { label: 'Review Inventory', route: '/inventory' },
            { label: 'Inspect Purchase Orders', route: '/purchase-orders' },
          ],
        },
      ],
    },
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const addActivityLog = useCallback((entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    setActivityLogs((prev) => [
      {
        ...entry,
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: nowTimestamp(),
      },
      ...prev,
    ]);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markPoReviewed = useCallback(
    (poId: string) => {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id !== poId) return po;
          const nextStatus = po.status === 'New' ? 'Acknowledged' : po.status;
          return {
            ...po,
            reviewed: true,
            status: nextStatus,
            timeline: [
              ...po.timeline,
              {
                timestamp: 'Just now',
                label: 'Marked as reviewed in local demonstration workspace',
                actor: activeRole,
              },
            ],
          };
        })
      );
      const target = purchaseOrders.find((p) => p.id === poId);
      addActivityLog({
        actor: activeRole,
        action: 'Marked purchase order as reviewed (demo)',
        module: 'Purchase Orders',
        resource: target?.poNumber ?? poId,
        status: 'Completed',
        details: 'Internal verification recorded in demonstration state. No external Vendor Central submission was made.',
      });
      addToast({
        title: `${target?.poNumber ?? 'Purchase Order'} marked as reviewed`,
        description: 'Recorded in local demo workspace and activity log.',
        tone: 'success',
      });
    },
    [activeRole, addActivityLog, addToast, purchaseOrders]
  );

  const addPoNote = useCallback(
    (poId: string, note: string) => {
      if (!note.trim()) return;
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.id === poId
            ? {
                ...po,
                notes: [...po.notes, note.trim()],
                timeline: [
                  ...po.timeline,
                  {
                    timestamp: 'Just now',
                    label: `Internal note added: "${note.trim()}"`,
                    actor: activeRole,
                  },
                ],
              }
            : po
        )
      );
      const target = purchaseOrders.find((p) => p.id === poId);
      addActivityLog({
        actor: activeRole,
        action: 'Added internal purchase order note',
        module: 'Purchase Orders',
        resource: target?.poNumber ?? poId,
        status: 'Recorded',
        details: note.trim(),
      });
      addToast({ title: 'Internal note added', description: `Attached to ${target?.poNumber ?? 'PO'}.`, tone: 'info' });
    },
    [activeRole, addActivityLog, addToast, purchaseOrders]
  );

  const updateCampaignBudget = useCallback(
    (campaignId: string, newBudget: number) => {
      const target = campaigns.find((c) => c.id === campaignId);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, dailyBudget: newBudget } : c))
      );
      addActivityLog({
        actor: activeRole,
        action: 'Updated simulated campaign daily budget',
        module: 'Advertising',
        resource: target?.name ?? campaignId,
        status: 'Completed',
        details: `Daily budget adjusted from $${target?.dailyBudget ?? 0}/day to $${newBudget}/day in demonstration workspace.`,
      });
      addToast({
        title: 'Campaign budget updated (Demo)',
        description: `${target?.name ?? 'Campaign'} set to $${newBudget}/day.`,
        tone: 'success',
      });
    },
    [activeRole, addActivityLog, addToast, campaigns]
  );

  const toggleCampaignStatus = useCallback(
    (campaignId: string) => {
      const target = campaigns.find((c) => c.id === campaignId);
      if (!target) return;
      const nextStatus = target.status === 'Paused' ? 'Active' : 'Paused';
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status: nextStatus } : c))
      );
      addActivityLog({
        actor: activeRole,
        action: `${nextStatus === 'Paused' ? 'Paused' : 'Enabled'} simulated campaign`,
        module: 'Advertising',
        resource: target.name,
        status: 'Completed',
        details: `Campaign status changed from ${target.status} to ${nextStatus} locally.`,
      });
      addToast({
        title: `Campaign ${nextStatus === 'Paused' ? 'paused' : 'enabled'} (Demo)`,
        description: `${target.name} is now ${nextStatus}.`,
        tone: nextStatus === 'Paused' ? 'warning' : 'success',
      });
    },
    [activeRole, addActivityLog, addToast, campaigns]
  );

  const updateKeywordBid = useCallback(
    (keywordId: string, newBid: number) => {
      const target = keywords.find((k) => k.id === keywordId);
      setKeywords((prev) =>
        prev.map((k) => (k.id === keywordId ? { ...k, bid: Number(newBid.toFixed(2)) } : k))
      );
      addActivityLog({
        actor: activeRole,
        action: 'Adjusted simulated keyword bid',
        module: 'Advertising',
        resource: target?.keyword ?? keywordId,
        status: 'Completed',
        details: `Keyword max CPC bid updated from $${target?.bid.toFixed(2) ?? '0.00'} to $${newBid.toFixed(2)} locally.`,
      });
      addToast({
        title: 'Keyword bid updated (Demo)',
        description: `"${target?.keyword ?? 'Keyword'}" max CPC set to $${newBid.toFixed(2)}.`,
        tone: 'success',
      });
    },
    [activeRole, addActivityLog, addToast, keywords]
  );

  const addKeyword = useCallback(
    (
      campaignId: string,
      keyword: string,
      matchType: 'Exact' | 'Phrase' | 'Broad',
      bid: number,
      isNegative = false
    ) => {
      const trimmed = keyword.trim().toLowerCase();
      if (!trimmed) return;
      const newEntry: AdKeyword = {
        id: `kw-${Date.now()}`,
        campaignId,
        keyword: trimmed,
        matchType,
        bid: isNegative ? 0 : Number(bid.toFixed(2)),
        impressions: 0,
        clicks: 0,
        spend: 0,
        attributedSales: 0,
        acos: 0,
        isNegative,
      };
      setKeywords((prev) => [newEntry, ...prev]);
      const camp = campaigns.find((c) => c.id === campaignId);
      addActivityLog({
        actor: activeRole,
        action: isNegative ? 'Added simulated negative keyword' : 'Added simulated target keyword',
        module: 'Advertising',
        resource: `${trimmed} (${matchType})`,
        status: 'Completed',
        details: `Added to ${camp?.name ?? 'campaign'} in local demonstration state.`,
      });
      addToast({
        title: isNegative ? 'Negative keyword added (Demo)' : 'Target keyword added (Demo)',
        description: `"${trimmed}" (${matchType}) recorded in local campaign table.`,
        tone: 'success',
      });
    },
    [activeRole, addActivityLog, addToast, campaigns]
  );

  const updateRecommendationStatus = useCallback(
    (recId: string, status: Recommendation['status']) => {
      const target = recommendations.find((r) => r.id === recId);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status } : r))
      );
      addActivityLog({
        actor: activeRole,
        action: `Marked recommendation as ${status}`,
        module: 'AI Assistant',
        resource: target?.title ?? recId,
        status: 'Recorded',
        details: `Recommendation status updated to ${status} in demonstration workspace.`,
      });
      addToast({
        title: `Recommendation ${status.toLowerCase()}`,
        description: target?.title,
        tone: status === 'Dismissed' ? 'info' : 'success',
      });
    },
    [activeRole, addActivityLog, addToast, recommendations]
  );

  const createRecommendation = useCallback(
    (rec: Omit<Recommendation, 'id' | 'createdAt' | 'status'>) => {
      const newRec: Recommendation = {
        ...rec,
        id: `rec-${Date.now()}`,
        createdAt: 'Just now',
        status: 'Open',
      };
      setRecommendations((prev) => [newRec, ...prev]);
      addActivityLog({
        actor: 'AI Assistant',
        action: 'Created business recommendation from analysis',
        module: 'AI Assistant',
        resource: rec.title,
        status: 'Recorded',
        details: rec.summary,
      });
      addToast({
        title: 'Recommendation created',
        description: 'Added to Business Opportunities queue.',
        tone: 'success',
      });
    },
    [addActivityLog, addToast]
  );

  const decideApproval = useCallback(
    (approvalId: string, decision: 'Approved' | 'Rejected' | 'Review Requested', note?: string) => {
      const target = approvals.find((a) => a.id === approvalId);
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === approvalId
            ? {
                ...a,
                status: decision,
                decidedAt: nowTimestamp(),
                decidedBy: activeRole,
                decisionNote: note?.trim() || (decision === 'Approved' ? 'Approved in demonstration workflow.' : undefined),
              }
            : a
        )
      );

      // Reflect simulated approval into local campaign state if applicable
      if (decision === 'Approved' && target) {
        if (target.id === 'apr-01') {
          setCampaigns((prev) => prev.map((c) => (c.id === 'camp-01' ? { ...c, dailyBudget: 175 } : c)));
        } else if (target.id === 'apr-02') {
          setKeywords((prev) => prev.map((k) => (k.id === 'kw-14' ? { ...k, bid: 0.62 } : k)));
        } else if (target.id === 'apr-03') {
          setCampaigns((prev) => prev.map((c) => (c.id === 'camp-04' ? { ...c, status: 'Paused' } : c)));
        }
      }

      addActivityLog({
        actor: activeRole,
        action: `Approval request ${decision.toLowerCase()} (demo)`,
        module: 'Approvals',
        resource: target?.title ?? approvalId,
        status: decision === 'Approved' ? 'Approved' : decision === 'Rejected' ? 'Rejected' : 'Recorded',
        details: note?.trim() || `Simulated human-in-the-loop decision recorded as ${decision}. No live Amazon changes executed.`,
      });
      addToast({
        title: `Request ${decision.toLowerCase()} (Demo)`,
        description: target?.title,
        tone: decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'warning' : 'info',
      });
    },
    [activeRole, addActivityLog, addToast, approvals]
  );

  const toggleWorkflow = useCallback(
    (workflowId: string) => {
      const target = workflows.find((w) => w.id === workflowId);
      if (!target) return;
      const next = !target.enabled;
      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflowId ? { ...w, enabled: next } : w))
      );
      addActivityLog({
        actor: activeRole,
        action: `${next ? 'Enabled' : 'Disabled'} automation workflow`,
        module: 'Automation',
        resource: target.name,
        status: 'Completed',
        details: `Workflow schedule state set to ${next ? 'Active' : 'Paused'} locally.`,
      });
      addToast({
        title: `${target.name} ${next ? 'enabled' : 'disabled'}`,
        tone: 'info',
      });
    },
    [activeRole, addActivityLog, addToast, workflows]
  );

  const recordWorkflowRun = useCallback(
    (workflowId: string) => {
      const target = workflows.find((w) => w.id === workflowId);
      if (!target) return;
      const duration = 2400 + Math.floor(Math.random() * 1400);
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === workflowId
            ? {
                ...w,
                lastExecuted: 'Just now',
                executionCount: w.executionCount + 1,
                history: [
                  {
                    id: `ex-${Date.now()}`,
                    timestamp: 'Just now',
                    durationMs: duration,
                    status: 'Completed',
                    summary: 'Manual demonstration execution completed across local datasets.',
                  },
                  ...w.history,
                ],
              }
            : w
        )
      );
      addActivityLog({
        actor: activeRole,
        action: 'Manually triggered simulated workflow',
        module: 'Automation',
        resource: target.name,
        status: 'Completed',
        details: `Completed all 6 pipeline stages in ${(duration / 1000).toFixed(1)}s using demonstration dataset.`,
      });
      addToast({
        title: 'Workflow execution completed (Demo)',
        description: `${target.name} finished in ${(duration / 1000).toFixed(1)}s.`,
        tone: 'success',
      });
    },
    [activeRole, addActivityLog, addToast, workflows]
  );

  const updateSettings = useCallback(
    (partial: Partial<WorkspaceSettings>, silent = false) => {
      setSettings((prev) => ({ ...prev, ...partial }));
      if (partial.defaultDateRange) {
        setDateRange(partial.defaultDateRange);
      }
      if (!silent) {
        addActivityLog({
          actor: activeRole,
          action: 'Updated workspace configuration',
          module: 'Settings',
          resource: 'Workspace Preferences',
          status: 'Completed',
          details: 'Demo workspace preferences saved to browser storage.',
        });
        addToast({
          title: 'Settings saved',
          description: 'Preferences updated for this demonstration session.',
          tone: 'success',
        });
      }
    },
    [activeRole, addActivityLog, addToast]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setDateRange(DEFAULT_SETTINGS.defaultDateRange);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // ignore
    }
    addActivityLog({
      actor: activeRole,
      action: 'Reset demo settings to defaults',
      module: 'Settings',
      resource: 'Workspace Preferences',
      status: 'Recorded',
      details: 'Restored default Healthy Learning LLC demonstration thresholds and preferences.',
    });
    addToast({
      title: 'Demo settings restored',
      description: 'Default workspace thresholds and preferences applied.',
      tone: 'info',
    });
  }, [activeRole, addActivityLog, addToast]);

  return (
    <AppStateContext.Provider
      value={{
        dateRange,
        setDateRange,
        activeRole,
        setActiveRole,
        products,
        purchaseOrders,
        financials,
        campaigns,
        keywords,
        recommendations,
        approvals,
        workflows,
        activityLogs,
        notifications,
        settings,
        conversations,
        setConversations,
        toasts,
        addToast,
        dismissToast,
        addActivityLog,
        markAllNotificationsRead,
        markNotificationRead,
        markPoReviewed,
        addPoNote,
        updateCampaignBudget,
        toggleCampaignStatus,
        updateKeywordBid,
        addKeyword,
        updateRecommendationStatus,
        createRecommendation,
        decideApproval,
        toggleWorkflow,
        recordWorkflowRun,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
