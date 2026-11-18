import React, { useState } from 'react';
import {
  Plug,
  Megaphone,
  Sparkles,
  CheckCircle2,
  ArrowDown,
  ShieldCheck,
  Info,
  Eye,
} from 'lucide-react';
import { Card, SectionHeader } from '../components/ui/Card';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAppState } from '../context/AppStateContext';

interface IntegrationSpec {
  id: string;
  name: string;
  phase: string;
  status: string;
  statusVariant: BadgeVariant;
  description: string;
  icon: React.FC<{ className?: string }>;
  capabilities: string[];
  purpose: string;
  authMethod: string;
  permissionScope: string;
  dataCategories: string[];
  syncDesign: string;
  securityNotes: string;
  implementationStatus: string;
}

const INTEGRATIONS: IntegrationSpec[] = [
  {
    id: 'sp-api',
    name: 'Amazon Selling Partner API',
    phase: 'Phase 1 Target',
    status: 'Demonstration / Not Connected',
    statusVariant: 'gold',
    description: 'Designed to retrieve authorized Vendor Central business information.',
    icon: Plug,
    capabilities: [
      'Sales and reporting data',
      'Purchase orders',
      'Inventory visibility',
      'Financial information where available',
      'Product catalog information',
    ],
    purpose:
      'Establish a clean, read-focused data pipeline connecting Healthy Learning LLC’s Amazon Vendor Central account into a normalized operational datastore.',
    authMethod:
      'Planned use of Amazon’s approved OAuth 2.0 / Login with Amazon (LWA) authorization workflow with rotating refresh tokens stored in an encrypted server-side secrets manager.',
    permissionScope:
      'Least-privilege Vendor Central SP-API roles (Vendor Retail Analytics, Vendor Direct Fulfillment / Orders, Catalog Items) restricted to approved reporting endpoints.',
    dataCategories: ['Vendor Sales Reports', 'Purchase Orders & Shipments', 'Inventory Health', 'ASIN/ISBN Catalog Metadata'],
    syncDesign:
      'Scheduled incremental sync jobs respecting SP-API burst & restore rate limits, exponential backoff retries, and normalized schema ingestion.',
    securityNotes:
      'Credentials never reside in browser code. All token exchanges occur on isolated backend infrastructure under Healthy Learning LLC account ownership.',
    implementationStatus:
      'Frontend demonstration only. No live Amazon SP-API credentials, OAuth sessions, or production approvals are active in this preview.',
  },
  {
    id: 'ads-api',
    name: 'Amazon Advertising API',
    phase: 'Phase 2 Target',
    status: 'Planned Integration',
    statusVariant: 'neutral',
    description: 'Designed to support advertising performance analysis and controlled campaign management.',
    icon: Megaphone,
    capabilities: [
      'Campaign performance metrics',
      'Advertising spend tracking',
      'Keyword performance & search terms',
      'Conversion & ROAS metrics',
      'Authorized campaign management',
    ],
    purpose:
      'Unify Sponsored Products and Sponsored Brands performance alongside catalog sales and inventory availability so ad spend aligns with stock health.',
    authMethod:
      'Amazon Advertising API OAuth 2.0 authorization subject to Amazon’s applicable developer registration and advertiser access requirements.',
    permissionScope:
      'Initially read-only campaign reporting; write scopes (budget/bid/keyword updates) gated behind the Approval Center and configured daily spending caps.',
    dataCategories: ['Campaign Reports', 'Ad Group & Keyword Metrics', 'Attributed Sales', 'Budget Utilization'],
    syncDesign:
      'Asynchronous report generation polling with attribution-window lookback (7d/14d) to keep ROAS and ACOS accurate without API throttling.',
    securityNotes:
      'Every write operation requires an explicit Approval Center record, spending limit validation, and immutable audit trail entry.',
    implementationStatus:
      'Planned Phase 2 capability. All advertising metrics and budget/bid controls in this demo operate strictly on local mock state.',
  },
  {
    id: 'chatgpt-ai',
    name: 'ChatGPT / AI Interface',
    phase: 'AI Operations Layer',
    status: 'Simulated Assistant Active',
    statusVariant: 'forest',
    description: 'Demonstrates the intended AI interaction layer for business analysis and controlled actions.',
    icon: Sparkles,
    capabilities: [
      'Business data retrieval',
      'Natural-language question answering',
      'Opportunity recommendations',
      'Executive report generation',
      'Human-in-the-loop approval workflows',
    ],
    purpose:
      'Give Healthy Learning leadership a conversational research and operations layer over normalized business datasets without exposing raw API credentials to the model.',
    authMethod:
      'Scoped internal tool/API endpoints (MCP or OpenAI tool-calling backend) authenticated per user session with RBAC enforcement.',
    permissionScope:
      'Read-only analytical tools plus proposal-drafting tools. The AI layer can draft Approval Center proposals but cannot execute live Amazon write actions autonomously.',
    dataCategories: ['Normalized Sales Summaries', 'Inventory Coverage Alerts', 'PO Statuses', 'Campaign Efficiency Aggregates'],
    syncDesign:
      'On-demand structured tool queries against the Business Data Store, returning verifiable figures and source citations.',
    securityNotes:
      'Zero direct model access to Amazon tokens. Input/output logging ensures every AI query and recommendation is traceable.',
    implementationStatus:
      'Active local simulation using a deterministic analysis engine over shared mock datasets. No external OpenAI/ChatGPT API calls are made.',
  },
];

export const IntegrationsPage: React.FC = () => {
  const { addActivityLog, activeRole } = useAppState();
  const [selected, setSelected] = useState<IntegrationSpec | null>(null);

  const openDetails = (spec: IntegrationSpec) => {
    setSelected(spec);
    addActivityLog({
      actor: activeRole,
      action: 'Viewed integration architecture specification',
      module: 'Security',
      resource: spec.name,
      status: 'Recorded',
      details: `Inspected planned authentication, permission scope, and synchronization design for ${spec.name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
          Integration Management
        </h2>
        <p className="text-[13.5px] text-[#748078] mt-0.5">
          A controlled integration architecture for your Amazon Vendor Central, Advertising, and AI systems.
        </p>
      </div>

      {/* Transparency banner */}
      <div className="rounded-xl border border-[#DCE3DB] bg-white px-4 py-3 flex items-start gap-3 text-[12.5px] text-[#4F5B53]">
        <Info className="w-4 h-4 text-[#244B3D] shrink-0 mt-0.5" />
        <span>
          <strong>Architectural Preview:</strong> This workspace demonstrates the target integration blueprint. No live Amazon SP-API, Amazon Advertising API, or ChatGPT API credentials are connected.
        </span>
      </div>

      {/* 3 Main Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {INTEGRATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} hoverable className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F3EF] text-[#244B3D] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={item.statusVariant} dot>
                    {item.status}
                  </Badge>
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#82988A]">
                  {item.phase}
                </div>
                <h3 className="text-[16.5px] font-semibold text-[#18382E] mt-0.5">{item.name}</h3>
                <p className="mt-2 text-[13px] text-[#5C6860] leading-relaxed">{item.description}</p>

                <div className="mt-4 pt-4 border-t border-[#F0F3EF]">
                  <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-2">
                    Capabilities
                  </div>
                  <ul className="space-y-1.5">
                    {item.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2 text-[12.5px] text-[#3B4840]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#557F64] shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#F0F3EF]">
                <Button variant="outline" size="sm" className="w-full" onClick={() => openDetails(item)}>
                  <Eye className="w-3.5 h-3.5" />
                  View Integration Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Architecture Diagram */}
      <Card>
        <SectionHeader
          title="End-to-End Integration Architecture"
          subtitle="Controlled data flow from Amazon APIs through normalization, AI tooling, human approval, and audited execution"
        />

        <div className="rounded-xl border border-[#E6EAE5] bg-[#F7F8F6] p-5 sm:p-7">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Dual Amazon Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white border border-[#DCE3DB] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#18382E]">Amazon Vendor Central</span>
                  <Badge variant="forest">Phase 1</Badge>
                </div>
                <div className="text-[12px] text-[#748078]">↓ Amazon SP-API (OAuth 2.0 / LWA)</div>
                <div className="rounded-lg bg-[#F0F3EF] px-3 py-2 text-[12px] font-medium text-[#244B3D]">
                  Secure SP-API Connector (Rate-Limited & Scoped)
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[#E5DEC9] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#18382E]">Amazon Advertising</span>
                  <Badge variant="gold">Phase 2</Badge>
                </div>
                <div className="text-[12px] text-[#748078]">↓ Amazon Advertising API</div>
                <div className="rounded-lg bg-[#FAF6EE] px-3 py-2 text-[12px] font-medium text-[#84622E]">
                  Secure Advertising Connector (Read & Gated Write)
                </div>
              </div>
            </div>

            <div className="flex justify-center text-[#82988A]">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Data Normalization + Store */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white border border-[#DCE3DB] p-4 text-center">
                <div className="text-[13.5px] font-semibold text-[#18382E]">Data Normalization Layer</div>
                <div className="text-[12px] text-[#748078] mt-0.5">
                  Unifies ISBN-13, ASIN, Vendor POs, inventory, and ad attribution
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#DCE3DB] p-4 text-center">
                <div className="text-[13.5px] font-semibold text-[#18382E]">Business Data Store</div>
                <div className="text-[12px] text-[#748078] mt-0.5">
                  Encrypted, structured historical repository owned by Healthy Learning LLC
                </div>
              </div>
            </div>

            <div className="flex justify-center text-[#82988A]">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* AI & Human Approval Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Controlled AI Tool Interface', sub: 'Read-only queries + proposal drafting' },
                { title: 'ChatGPT / AI Analysis', sub: 'Insights & recommendations' },
                { title: 'Human Approval Gate', sub: 'Owner sign-off & spend limits', highlight: true },
                { title: 'Authorized Execution Service', sub: 'Scoped write execution where approved' },
              ].map((step) => (
                <div
                  key={step.title}
                  className={`rounded-xl border p-3.5 text-center ${
                    step.highlight
                      ? 'bg-[#18382E] border-[#18382E] text-white'
                      : 'bg-white border-[#DCE3DB] text-[#202923]'
                  }`}
                >
                  <div className="text-[12.5px] font-semibold">{step.title}</div>
                  <div className={`text-[11.5px] mt-1 ${step.highlight ? 'text-[#C8D5CD]' : 'text-[#748078]'}`}>
                    {step.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Cross-cutting Audit & Monitoring bar */}
            <div className="rounded-xl border border-[#C9D8CC] bg-[#E6EDE7] px-4 py-3 flex flex-wrap items-center justify-center gap-3 text-[12px] font-medium text-[#18382E]">
              <ShieldCheck className="w-4 h-4 text-[#244B3D]" />
              <span>Cross-Cutting Controls:</span>
              <span>Immutable Audit Logging</span>
              <span>·</span>
              <span>Role-Based Access Control</span>
              <span>·</span>
              <span>API Health & Rate-Limit Monitoring</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Integration Detail Modal */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.phase} · ${selected.status}` : ''}
        maxWidth="max-w-2xl"
        footer={
          <Button size="sm" onClick={() => setSelected(null)}>
            Close Specification
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4 text-[13px]">
            <div className="rounded-lg border border-[#DCE3DB] bg-[#F7F8F6] p-3 text-[#4F5B53]">
              <strong className="text-[#18382E] block mb-0.5">Implementation Status</strong>
              {selected.implementationStatus}
            </div>

            <div>
              <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1">
                Integration Purpose
              </h4>
              <p className="text-[#202923] leading-relaxed">{selected.purpose}</p>
            </div>

            <div>
              <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1">
                Planned Authentication Method
              </h4>
              <p className="text-[#202923] leading-relaxed">{selected.authMethod}</p>
            </div>

            <div>
              <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1">
                Permission Scope
              </h4>
              <p className="text-[#202923] leading-relaxed">{selected.permissionScope}</p>
            </div>

            <div>
              <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1.5">
                Data Categories
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selected.dataCategories.map((cat) => (
                  <Badge key={cat} variant="forest">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1">
                Synchronization Design
              </h4>
              <p className="text-[#202923] leading-relaxed">{selected.syncDesign}</p>
            </div>

            <div>
              <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1">
                Security Considerations
              </h4>
              <p className="text-[#202923] leading-relaxed">{selected.securityNotes}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IntegrationsPage;
