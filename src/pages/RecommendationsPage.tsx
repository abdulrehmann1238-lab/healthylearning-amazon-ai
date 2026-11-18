import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ArrowRight, Check, X, Sparkles } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { PriorityLevel, Recommendation, RecommendationCategory } from '../types';
import { Card } from '../components/ui/Card';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';

type FilterChip = 'All' | PriorityLevel | RecommendationCategory;

const FILTERS: FilterChip[] = [
  'All',
  'High',
  'Medium',
  'Low',
  'Inventory',
  'Advertising',
  'Sales',
  'Operations',
];

function priorityVariant(p: PriorityLevel): BadgeVariant {
  return p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'neutral';
}

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { recommendations, updateRecommendationStatus } = useAppState();
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');
  const [showDismissed, setShowDismissed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: Recommendation | null = useMemo(
    () => recommendations.find((r) => r.id === selectedId) ?? null,
    [recommendations, selectedId]
  );

  const filtered = useMemo(() => {
    return recommendations.filter((rec) => {
      if (!showDismissed && rec.status === 'Dismissed') return false;
      if (activeFilter === 'All') return true;
      if (activeFilter === 'High' || activeFilter === 'Medium' || activeFilter === 'Low') {
        return rec.priority === activeFilter;
      }
      return rec.category === activeFilter;
    });
  }, [recommendations, activeFilter, showDismissed]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Business Opportunities
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Actionable opportunities identified from your business data across sales, inventory, operations, and advertising.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-[12.5px] text-[#5C6860] cursor-pointer">
          <input
            type="checkbox"
            checked={showDismissed}
            onChange={(e) => setShowDismissed(e.target.checked)}
            className="accent-[#244B3D] rounded"
          />
          Show dismissed items
        </label>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition-colors ${
              activeFilter === f
                ? 'bg-[#244B3D] text-white border-[#244B3D]'
                : 'bg-white text-[#4F5B53] border-[#E6EAE5] hover:bg-[#F0F3EF]'
            }`}
          >
            {f === 'High' || f === 'Medium' || f === 'Low' ? `${f} Priority` : f}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <Lightbulb className="w-8 h-8 text-[#82988A] mx-auto mb-2" />
          <p className="text-[14px] font-medium text-[#202923]">No opportunities match this filter.</p>
          <p className="text-[12.5px] text-[#748078] mt-1">Try switching categories or showing dismissed items.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((rec) => (
            <Card key={rec.id} hoverable className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={priorityVariant(rec.priority)} dot>
                      {rec.priority} Priority
                    </Badge>
                    <Badge variant="forest">{rec.category}</Badge>
                    {rec.status !== 'Open' && <Badge variant="neutral">{rec.status}</Badge>}
                  </div>
                  <span className="text-[11px] text-[#82988A]">{rec.createdAt}</span>
                </div>

                <h3 className="text-[15.5px] font-semibold text-[#18382E] leading-snug">
                  {rec.title}
                </h3>
                <p className="mt-2 text-[13px] text-[#525E56] leading-relaxed">{rec.explanation}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {rec.supportingMetrics.map((m) => (
                    <div key={m.label} className="rounded-lg bg-[#F7F8F6] border border-[#ECEFEA] px-2.5 py-2">
                      <div className="text-[10.5px] text-[#748078] truncate">{m.label}</div>
                      <div className="text-[12.5px] font-semibold text-[#202923] tabular-nums mt-0.5 truncate">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-[#F2F6F3] border border-[#DCE5DD] px-3 py-2 text-[12px] text-[#244B3D]">
                  <strong>Suggested action:</strong> {rec.suggestedAction}
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#F0F3EF] flex items-center justify-between gap-2">
                <Button size="sm" onClick={() => setSelectedId(rec.id)}>
                  Review Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <div className="flex items-center gap-1.5">
                  {rec.status === 'Open' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateRecommendationStatus(rec.id, 'Dismissed')}
                    >
                      <X className="w-3.5 h-3.5" />
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Recommendation Drawer */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.title ?? ''}
        subtitle={selected ? `${selected.category} · ${selected.priority} Priority · ${selected.createdAt}` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant={priorityVariant(selected.priority)} dot>
                {selected.priority} Priority
              </Badge>
              <Badge variant="forest">{selected.category}</Badge>
              <Badge variant="neutral">{selected.status}</Badge>
            </div>

            <div>
              <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1.5">
                Analysis & Context
              </h4>
              <p className="text-[13.5px] text-[#202923] leading-relaxed">{selected.explanation}</p>
            </div>

            <div className="rounded-xl border border-[#D4DFD6] bg-[#F2F6F3] p-4">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#18382E] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#244B3D]" />
                Estimated Impact Assessment (Illustrative)
              </div>
              <p className="text-[13px] text-[#36443B] leading-relaxed">{selected.impactAssessment}</p>
            </div>

            <div>
              <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-2">
                Supporting Demonstration Data
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selected.supportingMetrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-[#E6EAE5] p-3 bg-[#FAFBFA]">
                    <div className="text-[11px] text-[#748078]">{m.label}</div>
                    <div className="text-[14px] font-semibold text-[#18382E] tabular-nums mt-0.5">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.05em] text-[#748078] mb-1.5">
                Suggested Next Step
              </h4>
              <p className="text-[13.5px] text-[#202923] leading-relaxed">{selected.suggestedAction}</p>
            </div>

            <div className="pt-4 border-t border-[#E6EAE5] flex flex-wrap gap-2.5">
              <Button
                size="sm"
                onClick={() => {
                  updateRecommendationStatus(selected.id, 'Reviewed');
                  navigate(selected.relatedRoute);
                }}
              >
                Open Related Module
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              {selected.status !== 'Reviewed' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateRecommendationStatus(selected.id, 'Reviewed')}
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Reviewed
                </Button>
              )}
              {selected.status !== 'Dismissed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateRecommendationStatus(selected.id, 'Dismissed');
                    setSelectedId(null);
                  }}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RecommendationsPage;
