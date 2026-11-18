import React, { useMemo, useState } from 'react';
import {
  Workflow,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { AutomationWorkflow } from '../types';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';

export const AutomationPage: React.FC = () => {
  const { workflows, toggleWorkflow, recordWorkflowRun } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(-1);

  const selected: AutomationWorkflow | null = useMemo(
    () => workflows.find((w) => w.id === selectedId) ?? null,
    [workflows, selectedId]
  );

  const totals = useMemo(() => {
    const active = workflows.filter((w) => w.enabled).length;
    const completed = workflows.reduce((s, w) => s + w.executionCount, 0);
    const failed = workflows.reduce((s, w) => s + w.failedCount, 0);
    return { total: workflows.length, active, completed, failed };
  }, [workflows]);

  const triggerSimulation = (wf: AutomationWorkflow) => {
    if (runningId) return;
    setRunningId(wf.id);
    setSelectedId(wf.id);
    setActiveStageIdx(0);

    wf.stages.forEach((_, idx) => {
      setTimeout(() => {
        setActiveStageIdx(idx);
      }, idx * 280);
    });

    setTimeout(() => {
      recordWorkflowRun(wf.id);
      setRunningId(null);
      setActiveStageIdx(-1);
    }, wf.stages.length * 280 + 250);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
          Automation History
        </h2>
        <p className="text-[13.5px] text-[#748078] mt-0.5">
          Scheduled reporting pipelines, monitoring routines, and simulated manual workflow execution
        </p>
      </div>

      {/* 4 Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Workflows" value={String(totals.total)} icon={<Workflow className="w-4 h-4" />} />
        <KpiCard
          label="Active Workflows"
          value={String(totals.active)}
          delta={`${Math.round((totals.active / totals.total) * 100)}% enabled`}
          deltaPositive
          icon={<PlayCircle className="w-4 h-4" />}
        />
        <KpiCard
          label="Completed Executions"
          value={String(totals.completed)}
          delta="99.5% success"
          deltaPositive
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <KpiCard
          label="Failed Executions"
          value={String(totals.failed)}
          comparison="auto-recovered"
          icon={<AlertCircle className="w-4 h-4" />}
        />
      </div>

      {/* Workflows List */}
      <div className="space-y-3.5">
        {workflows.map((wf) => {
          const isRunning = runningId === wf.id;
          return (
            <Card key={wf.id} hoverable>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-[15.5px] font-semibold text-[#18382E]">{wf.name}</h3>
                    <Badge variant={wf.enabled ? 'success' : 'neutral'} dot>
                      {wf.enabled ? 'Active' : 'Paused'}
                    </Badge>
                    <span className="text-[12px] text-[#748078]">{wf.schedule}</span>
                  </div>
                  <p className="text-[13px] text-[#525E56] leading-relaxed">{wf.purpose}</p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] text-[#748078]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Last run: <strong className="text-[#202923]">{wf.lastExecuted}</strong>
                    </span>
                    <span>
                      Executions: <strong className="text-[#202923] tabular-nums">{wf.executionCount}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={wf.enabled}
                    aria-label={`Toggle ${wf.name}`}
                    onClick={() => toggleWorkflow(wf.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      wf.enabled ? 'bg-[#244B3D]' : 'bg-[#D2DAD3]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        wf.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedId(wf.id)}
                  >
                    View Details
                  </Button>

                  <Button
                    size="sm"
                    disabled={Boolean(runningId)}
                    onClick={() => triggerSimulation(wf)}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Simulate Run
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Workflow Details Drawer */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.schedule} · ${selected.executionCount} total executions` : ''}
        width="max-w-2xl"
      >
        {selected && (
          <div className="space-y-6">
            <p className="text-[13.5px] text-[#4F5B53] leading-relaxed">{selected.purpose}</p>

            {/* 6-Stage Pipeline Visualization */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-semibold text-[#202923]">Execution Pipeline</h4>
                <Button
                  size="sm"
                  disabled={Boolean(runningId)}
                  onClick={() => triggerSimulation(selected)}
                >
                  {runningId === selected.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Executing Stages...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Trigger Simulated Execution
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {selected.stages.map((stage, idx) => {
                  const isRunningThis = runningId === selected.id;
                  const isDone = isRunningThis && idx < activeStageIdx;
                  const isCurrent = isRunningThis && idx === activeStageIdx;

                  return (
                    <div
                      key={stage}
                      className={`rounded-xl border p-3 transition-all ${
                        isCurrent
                          ? 'border-[#244B3D] bg-[#E6EDE7] ring-1 ring-[#244B3D]/20'
                          : isDone
                            ? 'border-[#CFE0D4] bg-[#F2F7F3]'
                            : 'border-[#E6EAE5] bg-[#FAFBFA]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#748078] mb-1">
                        <span className="font-mono">0{idx + 1}</span>
                        {isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#244B3D] animate-spin" />
                        ) : isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#557F64]" />
                        ) : (
                          <ArrowRight className="w-3 h-3 text-[#C2CBC3]" />
                        )}
                      </div>
                      <div className="text-[12.5px] font-semibold text-[#18382E]">{stage}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execution History Table */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#202923] mb-2.5">Execution Log</h4>
              <div className="rounded-xl border border-[#E6EAE5] overflow-hidden">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-[#FAFBFA] border-b border-[#E6EAE5] text-[#748078] text-[11px] uppercase">
                      <th className="py-2.5 px-3.5">Timestamp</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3.5">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F3EF]">
                    {selected.history.map((ex) => (
                      <tr key={ex.id}>
                        <td className="py-2.5 px-3.5 whitespace-nowrap tabular-nums text-[#5C6860]">
                          {ex.timestamp}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap tabular-nums text-[#748078]">
                          {(ex.durationMs / 1000).toFixed(1)}s
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge variant={ex.status === 'Completed' ? 'success' : 'error'}>
                            {ex.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3.5 text-[#202923]">{ex.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AutomationPage;
