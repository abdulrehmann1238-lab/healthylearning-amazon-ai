import React, { useMemo, useState } from 'react';
import { Search, Download, History } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { ActivityLogEntry } from '../types';
import { Card } from '../components/ui/Card';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';
import { exportToCsv } from '../utilities/csv';

function logStatusVariant(status: ActivityLogEntry['status']): BadgeVariant {
  switch (status) {
    case 'Completed':
    case 'Approved':
      return 'success';
    case 'Warning':
      return 'warning';
    case 'Rejected':
      return 'error';
    default:
      return 'neutral';
  }
}

export const ActivityLogsPage: React.FC = () => {
  const { activityLogs, addToast } = useAppState();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [actorFilter, setActorFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selected, setSelected] = useState<ActivityLogEntry | null>(null);

  const modules = useMemo(() => ['All', ...Array.from(new Set(activityLogs.map((l) => l.module)))], [activityLogs]);
  const actors = useMemo(() => ['All', ...Array.from(new Set(activityLogs.map((l) => l.actor)))], [activityLogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activityLogs.filter((l) => {
      if (moduleFilter !== 'All' && l.module !== moduleFilter) return false;
      if (actorFilter !== 'All' && l.actor !== actorFilter) return false;
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (
        q &&
        !l.action.toLowerCase().includes(q) &&
        !l.resource.toLowerCase().includes(q) &&
        !l.actor.toLowerCase().includes(q) &&
        !l.details.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [activityLogs, search, moduleFilter, actorFilter, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      'healthy-learning-activity-logs.csv',
      ['Timestamp', 'Actor', 'Action', 'Module', 'Resource', 'Status', 'Details'],
      filtered.map((l) => [l.timestamp, l.actor, l.action, l.module, l.resource, l.status, l.details])
    );
    addToast({
      title: 'Activity log exported',
      description: `Downloaded ${filtered.length} audit events as CSV.`,
      tone: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Activity Logs
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Centralized audit trail of reports, AI queries, approvals, workflow runs, and configuration updates
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-3.5 h-3.5" />
          Export Audit CSV
        </Button>
      </div>

      <Card padded={false}>
        <div className="p-5 border-b border-[#E6EAE5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, resource, or actor..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-[#E6EAE5] bg-[#F7F8F6] text-[13px] focus:bg-white focus:border-[#244B3D] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              aria-label="Filter by module"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'All Modules' : m}
                </option>
              ))}
            </select>
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              aria-label="Filter by actor"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              {actors.map((a) => (
                <option key={a} value={a}>
                  {a === 'All' ? 'All Actors' : a}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="h-9 px-3 rounded-lg border border-[#E6EAE5] bg-white text-[13px]"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Recorded">Recorded</option>
              <option value="Warning">Warning</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[840px]">
            <thead>
              <tr className="border-b border-[#E6EAE5] bg-[#FAFBFA] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#748078]">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-4">User / Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3EF] text-[13px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#748078]">
                    No activity records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelected(log)}
                    className="hover:bg-[#F7F9F7] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-5 tabular-nums text-[12px] text-[#748078] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#202923] whitespace-nowrap">{log.actor}</td>
                    <td className="py-3 px-4 text-[#202923]">{log.action}</td>
                    <td className="py-3 px-4">
                      <Badge variant="forest">{log.module}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#5C6860] truncate max-w-[220px]">{log.resource}</td>
                    <td className="py-3 px-5">
                      <Badge variant={logStatusVariant(log.status)} dot>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Detail Drawer */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Audit Event Details"
        subtitle={selected ? `Event ID ${selected.id} · ${selected.timestamp}` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant={logStatusVariant(selected.status)} dot>
                {selected.status}
              </Badge>
              <Badge variant="forest">{selected.module}</Badge>
            </div>

            <div className="rounded-xl border border-[#E6EAE5] bg-[#FAFBFA] p-4 space-y-3 text-[13px]">
              <div className="flex justify-between gap-4 border-b border-[#ECEFEA] pb-2">
                <span className="text-[#748078]">Actor</span>
                <span className="font-semibold text-[#202923]">{selected.actor}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#ECEFEA] pb-2">
                <span className="text-[#748078]">Action</span>
                <span className="font-medium text-[#202923] text-right">{selected.action}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#ECEFEA] pb-2">
                <span className="text-[#748078]">Resource</span>
                <span className="font-medium text-[#18382E] text-right">{selected.resource}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#748078]">Timestamp</span>
                <span className="tabular-nums text-[#5C6860]">{selected.timestamp}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1.5 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Event Payload Summary
              </h4>
              <p className="rounded-xl border border-[#E6EAE5] bg-white p-4 text-[13.5px] leading-relaxed text-[#202923]">
                {selected.details}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ActivityLogsPage;
