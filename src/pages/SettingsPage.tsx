import React, { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { DateRangeKey, WorkspaceSettings } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type SettingsTab =
  | 'General'
  | 'Workspace'
  | 'Notifications'
  | 'Approval Preferences'
  | 'Automation Preferences'
  | 'Data Preferences';

const TABS: SettingsTab[] = [
  'General',
  'Workspace',
  'Notifications',
  'Approval Preferences',
  'Automation Preferences',
  'Data Preferences',
];

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useAppState();
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const [draft, setDraft] = useState<WorkspaceSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(draft);
  };

  const ToggleRow: React.FC<{
    label: string;
    desc: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }> = ({ label, desc, checked, onChange }) => (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-[#F0F3EF] last:border-b-0">
      <div>
        <div className="text-[13.5px] font-medium text-[#202923]">{label}</div>
        <div className="text-[12px] text-[#748078] mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-[#244B3D]' : 'bg-[#D2DAD3]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Workspace Settings
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Configure demonstration workspace preferences, thresholds, and governance rules (persisted in local browser storage)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={resetSettings}>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Settings
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tabs Rail */}
        <div className="lg:col-span-3">
          <Card padded={false} className="p-2">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="Settings sections">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'bg-[#E6EDE7] text-[#18382E]'
                      : 'text-[#525E56] hover:bg-[#F7F8F6] hover:text-[#202923]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Form Area */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSave}>
            <Card className="space-y-5">
              <div className="pb-3 border-b border-[#E6EAE5]">
                <h3 className="text-[16px] font-semibold text-[#18382E]">{activeTab}</h3>
              </div>

              {activeTab === 'General' && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label htmlFor="biz-name" className="block text-[13px] font-medium text-[#202923] mb-1">
                      Business Name
                    </label>
                    <input
                      id="biz-name"
                      type="text"
                      value={draft.businessName}
                      onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] focus:border-[#244B3D] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="currency-select" className="block text-[13px] font-medium text-[#202923] mb-1">
                        Reporting Currency
                      </label>
                      <select
                        id="currency-select"
                        value={draft.currency}
                        onChange={(e) => setDraft({ ...draft, currency: e.target.value as 'USD' })}
                        className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] bg-white"
                      >
                        <option value="USD">USD ($) — United States Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="default-range" className="block text-[13px] font-medium text-[#202923] mb-1">
                        Default Reporting Period
                      </label>
                      <select
                        id="default-range"
                        value={draft.defaultDateRange}
                        onChange={(e) =>
                          setDraft({ ...draft, defaultDateRange: e.target.value as DateRangeKey })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] bg-white"
                      >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="ytd">Year to Date</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Workspace' && (
                <div className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="low-days" className="block text-[13px] font-medium text-[#202923] mb-1">
                        Low Stock Alert Threshold (Days)
                      </label>
                      <input
                        id="low-days"
                        type="number"
                        min={5}
                        max={60}
                        value={draft.lowStockThresholdDays}
                        onChange={(e) =>
                          setDraft({ ...draft, lowStockThresholdDays: Number(e.target.value) || 14 })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="crit-days" className="block text-[13px] font-medium text-[#202923] mb-1">
                        Critical Stock Threshold (Days)
                      </label>
                      <input
                        id="crit-days"
                        type="number"
                        min={1}
                        max={30}
                        value={draft.criticalStockThresholdDays}
                        onChange={(e) =>
                          setDraft({ ...draft, criticalStockThresholdDays: Number(e.target.value) || 7 })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] tabular-nums"
                      />
                    </div>
                  </div>
                  <p className="text-[12px] text-[#748078]">
                    Changes to inventory alert thresholds immediately recalculate stock status labels on Inventory Intelligence, Product Catalog, and AI Assistant responses.
                  </p>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="max-w-2xl">
                  <ToggleRow
                    label="Executive Morning Summary Digest"
                    desc="Include daily sales, purchase order, and advertising highlights in workspace notifications."
                    checked={draft.emailDigestEnabled}
                    onChange={(v) => setDraft({ ...draft, emailDigestEnabled: v })}
                  />
                  <ToggleRow
                    label="Low & Critical Inventory Coverage Alerts"
                    desc="Flag titles crossing your configured days-of-coverage threshold."
                    checked={draft.lowStockAlertsEnabled}
                    onChange={(v) => setDraft({ ...draft, lowStockAlertsEnabled: v })}
                  />
                  <ToggleRow
                    label="Approval Request Alerts"
                    desc="Notify business administrators whenever AI analysis drafts a new proposal."
                    checked={draft.approvalAlertsEnabled}
                    onChange={(v) => setDraft({ ...draft, approvalAlertsEnabled: v })}
                  />
                  <ToggleRow
                    label="Advertising ACOS Anomaly Detection"
                    desc="Surface alerts when a campaign or keyword exceeds target ACOS guidelines."
                    checked={draft.adAnomalyAlertsEnabled}
                    onChange={(v) => setDraft({ ...draft, adAnomalyAlertsEnabled: v })}
                  />
                </div>
              )}

              {activeTab === 'Approval Preferences' && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label htmlFor="spend-limit" className="block text-[13px] font-medium text-[#202923] mb-1">
                      Daily Advertising Spending Limit Guardrail (USD)
                    </label>
                    <input
                      id="spend-limit"
                      type="number"
                      min={100}
                      max={5000}
                      value={draft.dailyAdSpendLimit}
                      onChange={(e) =>
                        setDraft({ ...draft, dailyAdSpendLimit: Number(e.target.value) || 650 })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] tabular-nums"
                    />
                  </div>
                  <div>
                    <label htmlFor="approval-budget" className="block text-[13px] font-medium text-[#202923] mb-1">
                      Require Explicit Owner Approval Above Budget Change ($/day)
                    </label>
                    <input
                      id="approval-budget"
                      type="number"
                      min={0}
                      max={500}
                      value={draft.requireApprovalAboveBudget}
                      onChange={(e) =>
                        setDraft({ ...draft, requireApprovalAboveBudget: Number(e.target.value) || 0 })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] tabular-nums"
                    />
                  </div>
                  <ToggleRow
                    label="Require Approval for Campaign Status Changes"
                    desc="Ensure pausing or enabling any advertising campaign requires an Approval Center decision."
                    checked={draft.requireApprovalForCampaignPause}
                    onChange={(v) => setDraft({ ...draft, requireApprovalForCampaignPause: v })}
                  />
                </div>
              )}

              {activeTab === 'Automation Preferences' && (
                <div className="max-w-2xl">
                  <ToggleRow
                    label="Auto-Generate Weekly Executive Brief"
                    desc="Schedule weekly multi-module summary across sales, inventory, and advertising."
                    checked={draft.autoGenerateWeeklyBrief}
                    onChange={(v) => setDraft({ ...draft, autoGenerateWeeklyBrief: v })}
                  />
                </div>
              )}

              {activeTab === 'Data Preferences' && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label htmlFor="retention" className="block text-[13px] font-medium text-[#202923] mb-1">
                      Audit & Historical Snapshot Retention (Days)
                    </label>
                    <input
                      id="retention"
                      type="number"
                      min={30}
                      max={1825}
                      value={draft.dataRetentionDays}
                      onChange={(e) =>
                        setDraft({ ...draft, dataRetentionDays: Number(e.target.value) || 365 })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#DCE3DB] text-[13.5px] tabular-nums"
                    />
                  </div>
                  <ToggleRow
                    label="Show Illustrative Demonstration Footer"
                    desc="Display transparent disclosure noting that all figures in this preview are illustrative."
                    checked={draft.includeIllustrativeDisclosure}
                    onChange={(v) => setDraft({ ...draft, includeIllustrativeDisclosure: v })}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[#E6EAE5] flex flex-wrap justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={resetSettings}>
                  Reset Demo Settings
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
