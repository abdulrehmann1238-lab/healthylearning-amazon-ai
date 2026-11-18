import React from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Users,
  Check,
  X,
  Info,
  FileSearch,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { UserRole } from '../types';
import { Card, SectionHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const ROLES: {
  role: UserRole;
  summary: string;
  perms: {
    analytics: boolean;
    poReview: boolean;
    adPropose: boolean;
    approveActions: boolean;
    manageIntegrations: boolean;
  };
}[] = [
  {
    role: 'Administrator',
    summary: 'Full configuration, role governance, and approval authority.',
    perms: { analytics: true, poReview: true, adPropose: true, approveActions: true, manageIntegrations: true },
  },
  {
    role: 'Operations Manager',
    summary: 'Operational review, PO tracking, and permitted approval access.',
    perms: { analytics: true, poReview: true, adPropose: true, approveActions: true, manageIntegrations: false },
  },
  {
    role: 'Analyst',
    summary: 'Read-only business intelligence, AI queries, and CSV exports.',
    perms: { analytics: true, poReview: false, adPropose: false, approveActions: false, manageIntegrations: false },
  },
  {
    role: 'Viewer',
    summary: 'Read-only executive overview and summary access.',
    perms: { analytics: true, poReview: false, adPropose: false, approveActions: false, manageIntegrations: false },
  },
];

const SECURITY_CONTROLS = [
  { label: 'Encrypted Credential Storage', status: 'Planned', variant: 'neutral' as const },
  { label: 'Role-Based Access Control', status: 'Demonstration', variant: 'forest' as const },
  { label: 'API Access Logging', status: 'Demonstration', variant: 'forest' as const },
  { label: 'Approval Requirements', status: 'Demonstration', variant: 'forest' as const },
  { label: 'Advertising Spending Limits', status: 'Demonstration', variant: 'forest' as const },
  { label: 'TLS Encrypted Transmission', status: 'Planned', variant: 'neutral' as const },
];

export const SecurityPage: React.FC = () => {
  const { activeRole, setActiveRole, activityLogs, addActivityLog, addToast } = useAppState();

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    addActivityLog({
      actor: 'Demo Session',
      action: 'Switched simulated role view',
      module: 'Security',
      resource: role,
      status: 'Recorded',
      details: `Demonstrating permission boundaries for ${role} role across workspace modules.`,
    });
    addToast({
      title: `Viewing workspace as ${role}`,
      description: 'Role permission boundaries updated across the demo.',
      tone: 'info',
    });
  };

  const securityLogs = activityLogs.filter(
    (l) => l.module === 'Security' || l.module === 'Approvals' || l.module === 'AI Assistant'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
          Security & Access Control
        </h2>
        <p className="text-[13.5px] text-[#748078] mt-0.5">
          Account ownership, credential protection architecture, role-based access, and auditability
        </p>
      </div>

      {/* Honest status banner */}
      <div className="rounded-xl border border-[#DCE3DB] bg-white px-4 py-3 flex items-start gap-3 text-[12.5px] text-[#4F5B53]">
        <Info className="w-4 h-4 text-[#244B3D] shrink-0 mt-0.5" />
        <span>
          <strong>Architectural Security Demonstration:</strong> The controls and placeholder vault below illustrate the intended production design for Healthy Learning LLC. No real Amazon credentials are stored, and this frontend demonstration does not claim external security certifications.
        </span>
      </div>

      {/* Top Grid: Auth Architecture + Simulated Credential Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <SectionHeader
            title="Authentication Architecture"
            subtitle="Designed around Amazon’s sanctioned authorization protocols"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                title: 'OAuth 2.0 Authorization',
                desc: 'Scoped, revocable API grants without sharing Vendor Central user passwords.',
              },
              {
                title: 'Login with Amazon (LWA) for SP-API',
                desc: 'Follows Amazon’s official LWA authorization flow under Healthy Learning LLC’s own developer/account ownership.',
              },
              {
                title: 'Secure Token Lifecycle',
                desc: 'Short-lived access tokens minted server-side from encrypted refresh tokens with automated rotation.',
              },
              {
                title: 'Scoped API Permissions',
                desc: 'Separates read-only reporting tokens from future approval-gated advertising write permissions.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-[#ECEFEA] bg-[#FAFBFA] p-4">
                <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[#18382E]">
                  <KeyRound className="w-4 h-4 text-[#244B3D] shrink-0" />
                  {item.title}
                </div>
                <p className="mt-1.5 text-[12.5px] text-[#5C6860] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <SectionHeader
            title="Simulated Credential Vault"
            subtitle="Masked placeholder records — zero live secrets stored"
          />
          <div className="space-y-3">
            {[
              { label: 'SP-API Refresh Token', status: 'Placeholder Only' },
              { label: 'Advertising API Credentials', status: 'Planned Phase 2' },
              { label: 'Application Client Secret', status: 'Placeholder Only' },
            ].map((cred) => (
              <div
                key={cred.label}
                className="rounded-xl border border-[#E6EAE5] bg-[#FAFBFA] p-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#202923] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#244B3D]" />
                    {cred.label}
                  </div>
                  <div className="font-mono text-[13px] tracking-[0.2em] text-[#748078] mt-1">
                    ••••••••••••
                  </div>
                </div>
                <Badge variant="neutral">{cred.status}</Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] text-[#748078]">
            In production, secrets are provisioned exclusively in encrypted server-side vault infrastructure (e.g., KMS/Secrets Manager) and never exposed to client code.
          </p>
        </Card>
      </div>

      {/* Security Control Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {SECURITY_CONTROLS.map((ctrl) => (
          <div
            key={ctrl.label}
            className="bg-white border border-[#E6EAE5] rounded-xl px-4 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#244B3D] shrink-0" />
              <span className="text-[13px] font-medium text-[#202923]">{ctrl.label}</span>
            </div>
            <Badge variant={ctrl.variant}>{ctrl.status}</Badge>
          </div>
        ))}
      </div>

      {/* Role-Based Permission Management Table with Interactive Role Switcher */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-[15.5px] font-semibold text-[#202923] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#244B3D]" />
              Role-Based Permission Matrix
            </h3>
            <p className="text-[12.5px] text-[#748078] mt-0.5">
              Select a role below to preview permission boundaries (for example, Analyst & Viewer cannot execute approvals in Approval Center)
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleSwitch(r.role)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                  activeRole === r.role
                    ? 'bg-[#244B3D] text-white border-[#244B3D]'
                    : 'bg-[#F7F8F6] text-[#4F5B53] border-[#E6EAE5] hover:bg-[#E6EDE7]'
                }`}
              >
                {r.role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-3 text-center">Business Analytics</th>
                <th className="py-3 px-3 text-center">PO Review</th>
                <th className="py-3 px-3 text-center">Draft Proposals</th>
                <th className="py-3 px-3 text-center">Approve Actions</th>
                <th className="py-3 px-5 text-center">Integrations & Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {ROLES.map((r) => {
                const isCurrent = activeRole === r.role;
                const CellIcon = ({ allowed }: { allowed: boolean }) =>
                  allowed ? (
                    <span className="inline-flex w-6 h-6 rounded-full bg-[#EBF2ED] text-[#355A42] items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex w-6 h-6 rounded-full bg-[#F4F5F4] text-[#9AA59D] items-center justify-center">
                      <X className="w-3.5 h-3.5" />
                    </span>
                  );

                return (
                  <tr
                    key={r.role}
                    onClick={() => handleRoleSwitch(r.role)}
                    className={`cursor-pointer transition-colors ${
                      isCurrent ? 'bg-[#F2F6F3]' : 'hover:bg-[#F9FAF8]'
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#18382E]">{r.role}</span>
                        {isCurrent && <Badge variant="forest">Active Preview</Badge>}
                      </div>
                      <div className="text-[12px] text-[#748078] mt-0.5">{r.summary}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center"><CellIcon allowed={r.perms.analytics} /></td>
                    <td className="py-3.5 px-3 text-center"><CellIcon allowed={r.perms.poReview} /></td>
                    <td className="py-3.5 px-3 text-center"><CellIcon allowed={r.perms.adPropose} /></td>
                    <td className="py-3.5 px-3 text-center"><CellIcon allowed={r.perms.approveActions} /></td>
                    <td className="py-3.5 px-5 text-center"><CellIcon allowed={r.perms.manageIntegrations} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Log Preview */}
      <Card>
        <SectionHeader
          title="Security & Governance Audit Preview"
          subtitle="Recent access, approval, and AI dataset query records"
        />
        <div className="space-y-2.5">
          {securityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-[#ECEFEA] bg-[#FAFBFA] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12.5px]"
            >
              <div className="flex items-start gap-2.5">
                <FileSearch className="w-4 h-4 text-[#244B3D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#202923]">{log.actor}</span>{' '}
                  <span className="text-[#525E56]">{log.action.toLowerCase()}</span>{' '}
                  <span className="font-medium text-[#18382E]">({log.resource})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="neutral">{log.module}</Badge>
                <span className="text-[11.5px] text-[#748078] tabular-nums">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SecurityPage;
