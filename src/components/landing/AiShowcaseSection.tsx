import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const PRESET_SCENARIOS = [
  {
    id: 'priority',
    prompt: 'Which of our books should we prioritize this month?',
    answer:
      'Based on the current demonstration dataset, three titles stand out because of their revenue contribution, recent sales momentum, and inventory position.',
    rows: [
      {
        title: 'The Sports Medicine Handbook',
        reason: '$34,200 monthly revenue (+17.5% MoM) · 5.50x campaign ROAS',
        nextStep: 'Review +$30/day budget proposal',
      },
      {
        title: 'Foundations of Lifestyle Medicine',
        reason: '$28,640 monthly revenue (+14.7% MoM) · Healthy 28d coverage',
        nextStep: 'Confirm Q4 institutional restock',
      },
      {
        title: 'Clinical Exercise Prescription',
        reason: '$21,410 revenue (+8.6%) · Coverage down to 10 days',
        nextStep: 'Verify PO-HL-88419 delivery date',
      },
    ],
  },
  {
    id: 'revenue',
    prompt: 'Which titles generated the highest revenue this month?',
    answer:
      'Your top three titles contributed $84,250 (45.2% of total monthly demonstration revenue) across 3,623 units sold.',
    rows: [
      {
        title: 'The Sports Medicine Handbook',
        reason: '$34,200 revenue · 1,396 units sold (+17.5%)',
        nextStep: 'Open Sales Intelligence',
      },
      {
        title: 'Foundations of Lifestyle Medicine',
        reason: '$28,640 revenue · 1,245 units sold (+14.7%)',
        nextStep: 'View Product Profile',
      },
      {
        title: 'Clinical Exercise Prescription',
        reason: '$21,410 revenue · 982 units sold (+8.6%)',
        nextStep: 'Monitor replenishment cadence',
      },
    ],
  },
  {
    id: 'ads',
    prompt: 'Which advertising campaigns are spending without generating sufficient returns?',
    answer:
      'One campaign and three broad keywords currently run above your 25% target ACOS threshold and merit bid or budget review.',
    rows: [
      {
        title: 'Musculoskeletal Health — Sponsored Brands',
        reason: '$1,920 spend · 41.7% ACOS (2.40x ROAS vs. 4.34x account avg)',
        nextStep: 'Review temporary pause proposal',
      },
      {
        title: 'Keyword: "rehabilitation medical books"',
        reason: '$640 spend · 54.2% ACOS on broad match',
        nextStep: 'Reduce max CPC to $0.62',
      },
      {
        title: 'Clinical Exercise Guide — Sponsored Products',
        reason: '$2,480 spend · 29.4% ACOS while inventory is tight (10d)',
        nextStep: 'Hold budget cap until inbound arrives',
      },
    ],
  },
  {
    id: 'inventory',
    prompt: 'Which products may need inventory attention?',
    answer:
      'Four monitored titles require replenishment review: one is temporarily out of stock and three have 10 days or less of estimated coverage.',
    rows: [
      {
        title: 'Orthopedic Rehabilitation Protocols',
        reason: '0 available units (Out of Stock) · 350 units in transit',
        nextStep: 'Track PO-HL-88416 arrival at DFW7',
      },
      {
        title: 'Cardiopulmonary Assessment Manual',
        reason: '92 available units · Critical 7-day coverage',
        nextStep: 'Expedite PO-HL-88419 verification',
      },
      {
        title: 'Strength & Conditioning Science',
        reason: '210 available units · 10-day coverage (+14.6% velocity)',
        nextStep: 'Confirm ONT8 receiving schedule',
      },
    ],
  },
];

export const AiShowcaseSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('priority');
  const active = PRESET_SCENARIOS.find((s) => s.id === selectedId) ?? PRESET_SCENARIOS[0];

  return (
    <section id="ai-intelligence" className="py-20 lg:py-28 bg-white border-y border-[#E6EAE5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left editorial explanation & clickable example questions */}
          <div className="lg:col-span-5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#244B3D]">
              AI Operational Intelligence
            </span>
            <h2 className="mt-2.5 font-editorial text-[32px] sm:text-[38px] font-medium leading-[1.15] tracking-[-0.02em] text-[#18382E]">
              From business data to better decisions.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.65] text-[#5C6860]">
              Instead of exporting spreadsheets across Vendor Central and Advertising consoles, ask structured questions that synthesize title-level sales velocity, inventory coverage, purchase orders, and campaign returns in one place.
            </p>

            <div className="mt-7">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#748078] mb-3">
                Select a sample question to preview
              </div>
              <div className="space-y-2.5">
                {PRESET_SCENARIOS.slice(1).map((scenario) => {
                  const isSelected = scenario.id === selectedId;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => setSelectedId(scenario.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-[13.5px] transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#F2F6F3] border-[#244B3D] text-[#18382E] font-medium'
                          : 'bg-[#F7F8F6] border-[#E6EAE5] text-[#4C5850] hover:border-[#C5D1C7] hover:bg-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-[#244B3D]" />
                      <span>{scenario.prompt}</span>
                    </button>
                  );
                })}
              </div>
              {selectedId !== 'priority' && (
                <button
                  type="button"
                  onClick={() => setSelectedId('priority')}
                  className="mt-2.5 text-[12px] font-medium text-[#244B3D] hover:underline"
                >
                  Reset to default monthly priority briefing
                </button>
              )}
            </div>
          </div>

          {/* Right interactive AI Assistant preview */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#DCE3DB] bg-[#F7F8F6] shadow-[0_14px_40px_rgba(24,56,46,0.06)] overflow-hidden">
              <div className="px-5 py-3.5 bg-white border-b border-[#E6EAE5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#18382E] text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#202923]">
                      Healthy Learning AI Assistant
                    </div>
                    <div className="text-[11px] text-[#748078]">
                      Interactive Demonstration · Local Sample Datasets
                    </div>
                  </div>
                </div>
                <Badge variant="forest">Simulated</Badge>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-md rounded-2xl rounded-tr-sm bg-[#244B3D] text-white px-4 py-2.5 text-[13.5px] leading-relaxed">
                    {active.prompt}
                  </div>
                </div>

                {/* AI response card */}
                <div className="rounded-xl bg-white border border-[#E6EAE5] p-4 sm:p-5 space-y-4">
                  <p className="text-[13.5px] leading-[1.6] text-[#202923]">{active.answer}</p>

                  <div className="space-y-2.5">
                    {active.rows.map((row, idx) => (
                      <div
                        key={row.title}
                        className="rounded-lg border border-[#E6EAE5] bg-[#FAFBFA] px-3.5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#748078] tabular-nums">
                              0{idx + 1}
                            </span>
                            <span className="text-[13.5px] font-semibold text-[#18382E] truncate">
                              {row.title}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#647068] mt-0.5 pl-6">{row.reason}</p>
                        </div>
                        <span className="text-[11.5px] font-medium text-[#244B3D] bg-[#E6EDE7] px-2.5 py-1 rounded-md shrink-0 self-start sm:self-center">
                          {row.nextStep}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#F0F3EF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[11.5px] text-[#748078]">
                      Sources: Demonstration Sales Dataset · Inventory Dataset · Advertising Dataset
                    </span>
                    <Link to="/ai-assistant">
                      <Button size="sm">
                        Ask a Question
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
