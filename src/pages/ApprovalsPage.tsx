import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { ApprovalRequest, ApprovalStatus, RiskLevel } from '../types';
import { Card } from '../components/ui/Card';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

function statusBadge(s: ApprovalStatus): BadgeVariant {
  switch (s) {
    case 'Pending':
      return 'gold';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'error';
    case 'Review Requested':
      return 'warning';
  }
}

function riskBadge(r: RiskLevel): BadgeVariant {
  return r === 'Low' ? 'success' : r === 'Moderate' ? 'warning' : 'error';
}

export const ApprovalsPage: React.FC = () => {
  const { approvals, decideApproval, activeRole } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const selected: ApprovalRequest | null = useMemo(
    () => approvals.find((a) => a.id === selectedId) ?? null,
    [approvals, selectedId]
  );

  const pending = useMemo(
    () => approvals.filter((a) => a.status === 'Pending' || a.status === 'Review Requested'),
    [approvals]
  );
  const history = useMemo(
    () => approvals.filter((a) => a.status === 'Approved' || a.status === 'Rejected'),
    [approvals]
  );

  const canApprove = activeRole === 'Administrator' || activeRole === 'Operations Manager';

  const handleDecision = (decision: 'Approved' | 'Rejected' | 'Review Requested') => {
    if (!selected) return;
    decideApproval(selected.id, decision, decisionNote);
    setDecisionNote('');
    setSelectedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Approval Center
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Maintain control over every proposed business action with explicit human-in-the-loop sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="forest" dot>
            {pending.length} Awaiting Decision
          </Badge>
          <Badge variant="neutral">Active Role: {activeRole}</Badge>
        </div>
      </div>

      {/* Demo mode clarity banner */}
      <div className="rounded-xl border border-[#DCE3DB] bg-white px-4 py-3 flex items-start gap-3 text-[12.5px] text-[#4F5B53]">
        <ShieldCheck className="w-4 h-4 text-[#244B3D] shrink-0 mt-0.5" />
        <span>
          <strong>Controlled Execution Simulation:</strong> Approving or rejecting a proposal updates local demonstration state (such as campaign budget or bid tables) and logs an audit entry. No live operational or advertising changes occur on Amazon.
        </span>
      </div>

      {/* Pending Requests */}
      <div className="space-y-3">
        <h3 className="text-[14.5px] font-semibold text-[#202923]">Pending Approval Queue</h3>
        {pending.length === 0 ? (
          <Card className="py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#557F64] mx-auto mb-2" />
            <p className="text-[14px] font-semibold text-[#202923]">All pending proposals reviewed</p>
            <p className="text-[12.5px] text-[#748078] mt-1">
              Every proposed operational change has been addressed in this demonstration session.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map((req) => (
              <Card
                key={req.id}
                hoverable
                onClick={() => {
                  setSelectedId(req.id);
                  setDecisionNote('');
                }}
                className="cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusBadge(req.status)} dot>
                        {req.status}
                      </Badge>
                      <Badge variant="neutral">{req.type}</Badge>
                      <Badge variant={riskBadge(req.riskLevel)}>{req.riskLevel} Risk</Badge>
                    </div>
                  </div>

                  <h4 className="text-[15.5px] font-semibold text-[#18382E] leading-snug">
                    {req.title}
                  </h4>
                  <p className="text-[12px] text-[#748078] mt-1">
                    Proposed by {req.proposedBy} · {req.date}
                  </p>

                  {/* Current vs Proposed */}
                  <div className="mt-4 rounded-xl border border-[#ECEFEA] bg-[#FAFBFA] p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.04em] text-[#748078] block">
                        Current Value
                      </span>
                      <span className="font-medium text-[#4F5B53] mt-0.5 block">{req.currentValue}</span>
                    </div>
                    <div className="sm:border-l sm:border-[#E6EAE5] sm:pl-3">
                      <span className="text-[11px] uppercase tracking-[0.04em] text-[#244B3D] block">
                        Proposed Value
                      </span>
                      <span className="font-semibold text-[#18382E] mt-0.5 block">
                        {req.proposedValue}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-[13px] text-[#525E56] leading-relaxed">{req.reason}</p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#F0F3EF] flex items-center justify-between">
                  <span className="text-[12px] text-[#748078]">Click to review & decide</span>
                  <Button size="sm" variant="outline">
                    Review Proposal
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approval History */}
      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5]">
          <h3 className="text-[15.5px] font-semibold text-[#202923]">Approval History</h3>
          <p className="text-[12.5px] text-[#748078]">
            Completed governance decisions recorded with actor and timestamp
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[740px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">Proposal</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Proposed Change</th>
                <th className="py-3 px-4">Decided By</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-5">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F9F7]">
                  <td className="py-3.5 px-5 font-medium text-[#202923]">
                    <div>{item.title}</div>
                    {item.decisionNote && (
                      <div className="text-[11.5px] text-[#748078] mt-0.5">Note: {item.decisionNote}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#5C6860]">{item.type}</td>
                  <td className="py-3.5 px-4 text-[#18382E] font-medium">{item.proposedValue}</td>
                  <td className="py-3.5 px-4 text-[#5C6860]">{item.decidedBy ?? '—'}</td>
                  <td className="py-3.5 px-4 text-[#748078] tabular-nums">{item.decidedAt ?? '—'}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={statusBadge(item.status)} dot>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Approval Modal */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.title ?? ''}
        subtitle={selected ? `${selected.type} · Proposed by ${selected.proposedBy}` : ''}
        maxWidth="max-w-xl"
        footer={
          selected && (
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDecision('Review Requested')}
                disabled={!canApprove}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Request Review
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDecision('Rejected')}
                  disabled={!canApprove}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDecision('Approved')}
                  disabled={!canApprove}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve (Simulated)
                </Button>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            {!canApprove && (
              <div className="rounded-lg border border-[#E5C9C6] bg-[#F6EAE9] p-3 text-[12px] text-[#8E433E] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Your currently simulated role (<strong>{activeRole}</strong>) has read-only approval permissions. Switch to Administrator or Operations Manager in Security & Access to approve proposals.
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusBadge(selected.status)} dot>{selected.status}</Badge>
              <Badge variant={riskBadge(selected.riskLevel)}>{selected.riskLevel} Risk</Badge>
              <span className="text-[12px] text-[#748078] inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selected.date}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E6EAE5] bg-[#FAFBFA] p-3.5">
                <div className="text-[11px] uppercase tracking-[0.05em] text-[#748078]">Current Value</div>
                <div className="text-[14px] font-semibold text-[#202923] mt-1">{selected.currentValue}</div>
              </div>
              <div className="rounded-xl border border-[#244B3D] bg-[#F2F6F3] p-3.5">
                <div className="text-[11px] uppercase tracking-[0.05em] text-[#244B3D]">Proposed Value</div>
                <div className="text-[14px] font-semibold text-[#18382E] mt-1">{selected.proposedValue}</div>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1">
                Justification
              </h4>
              <p className="text-[13.5px] text-[#202923] leading-relaxed">{selected.reason}</p>
            </div>

            <div className="rounded-lg border border-[#DCE5DD] bg-[#F7F8F6] p-3.5 text-[13px] text-[#36443B]">
              <strong className="text-[#18382E] block mb-0.5">Expected Operational Impact</strong>
              {selected.expectedImpact}
            </div>

            <div>
              <label htmlFor="approval-note" className="block text-[12.5px] font-medium text-[#202923] mb-1">
                Governance Note (Optional)
              </label>
              <textarea
                id="approval-note"
                rows={2}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Add context for the audit trail..."
                className="w-full rounded-lg border border-[#DCE3DB] p-2.5 text-[13px] focus:border-[#244B3D] focus:outline-none"
              />
            </div>

            <p className="text-[11.5px] text-[#748078]">
              Local simulation only: approving updates demonstration tables and writes to Activity Logs without connecting to Amazon APIs.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalsPage;
