import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Pencil,
  Check,
  MessageSquare,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { generateAiResponse } from '../data/aiEngine';
import { CATALOG_SUMMARY } from '../data/products';
import type { AiChatAction } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatRoas, getInventoryStatus } from '../utilities/format';

const SUGGESTED_QUESTIONS = [
  'Which books generated the most revenue this month?',
  'Which titles have low inventory coverage?',
  'Which advertising campaigns need attention?',
  'Summarize our business performance this month.',
];

export const AiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    campaigns,
    keywords,
    purchaseOrders,
    financials,
    approvals,
    settings,
    conversations,
    setConversations,
    addActivityLog,
    createRecommendation,
    addToast,
  } = useAppState();

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id ?? 'conv-initial');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) ?? conversations[0],
    [conversations, activeConvId]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length, isTyping]);

  const lowStockCount = useMemo(
    () =>
      products.filter(
        (p) =>
          getInventoryStatus(p, settings.lowStockThresholdDays, settings.criticalStockThresholdDays) !== 'Healthy'
      ).length,
    [products, settings.lowStockThresholdDays, settings.criticalStockThresholdDays]
  );

  const totalAdSpend = useMemo(() => campaigns.reduce((s, c) => s + c.spend, 0), [campaigns]);
  const totalAdSales = useMemo(() => campaigns.reduce((s, c) => s + c.attributedSales, 0), [campaigns]);
  const blendedRoas = totalAdSpend > 0 ? totalAdSales / totalAdSpend : 0;

  const submitQuestion = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping || !activeConv) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const convId = activeConv.id;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: c.messages.length === 0 ? trimmed.slice(0, 36) : c.title,
              updatedAt: 'Just now',
              messages: [...c.messages, userMsg],
            }
          : c
      )
    );
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg = generateAiResponse(trimmed, {
        products,
        campaigns,
        keywords,
        purchaseOrders,
        financials,
        approvals,
        settings,
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                updatedAt: 'Just now',
                messages: [...c.messages, aiMsg],
              }
            : c
        )
      );
      addActivityLog({
        actor: 'AI Assistant',
        action: 'Answered business intelligence query (simulated)',
        module: 'AI Assistant',
        resource: trimmed.slice(0, 48),
        status: 'Completed',
        details: `Generated structured response from local sample datasets.`,
      });
      setIsTyping(false);
    }, 520);
  };

  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    setConversations((prev) => [
      {
        id: newId,
        title: 'New Analysis Session',
        updatedAt: 'Just now',
        messages: [],
      },
      ...prev,
    ]);
    setActiveConvId(newId);
  };

  const handleClearCurrent = () => {
    if (!activeConv) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, messages: [], updatedAt: 'Cleared' } : c))
    );
    addToast({ title: 'Conversation cleared', tone: 'info' });
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editingTitle.trim() } : c))
      );
    }
    setEditingId(null);
  };

  const handleActionClick = (action: AiChatAction) => {
    if (action.actionType === 'create-recommendation') {
      createRecommendation({
        title: 'Follow up on AI-flagged inventory coverage titles',
        category: 'Inventory',
        priority: 'High',
        summary: 'Generated directly from AI Business Assistant inventory analysis.',
        explanation:
          'Several active publishing titles are approaching or below the configured coverage threshold and warrant PO delivery verification.',
        impactAssessment: 'Protects ongoing wholesale velocity and catalog availability.',
        suggestedAction: 'Inspect Inventory Intelligence and inbound Vendor Central purchase orders.',
        supportingMetrics: [
          { label: 'Flagged Titles', value: `${lowStockCount} Titles` },
          { label: 'Threshold', value: `≤ ${settings.lowStockThresholdDays} Days` },
        ],
        relatedRoute: '/inventory',
      });
      navigate('/recommendations');
      return;
    }
    navigate(action.route);
  };

  const renderRichText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={idx} className="font-semibold text-[#18382E]">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[#18382E]">
            Your business intelligence assistant
          </h2>
          <p className="text-[13.5px] text-[#748078] mt-0.5">
            Ask questions across sales, inventory, purchase orders, finances, and advertising.
          </p>
        </div>
        <Badge variant="forest" dot>
          Simulated Local Analysis Engine
        </Badge>
      </div>

      {/* 3-Panel Enterprise Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
        {/* Left: Conversation History */}
        <div className="lg:col-span-3 bg-white border border-[#E6EAE5] rounded-xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-[#E6EAE5] flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-[#202923]">Sessions</span>
            <Button size="sm" variant="secondary" onClick={handleNewConversation}>
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  className={`group rounded-lg px-2.5 py-2 transition-colors ${
                    isActive ? 'bg-[#E6EDE7] text-[#18382E]' : 'hover:bg-[#F7F8F6] text-[#4C5850]'
                  }`}
                >
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                        autoFocus
                        className="flex-1 bg-white border border-[#244B3D] rounded px-2 py-0.5 text-[12.5px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(conv.id)}
                        aria-label="Save title"
                        className="p-1 text-[#244B3D]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveConvId(conv.id)}
                        className="text-left min-w-0 flex-1"
                      >
                        <div className="text-[12.5px] font-medium truncate flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#82988A]" />
                          <span className="truncate">{conv.title}</span>
                        </div>
                        <div className="text-[10.5px] text-[#748078] mt-0.5 pl-5">{conv.updatedAt}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(conv.id);
                          setEditingTitle(conv.title);
                        }}
                        aria-label="Rename conversation"
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#748078] hover:text-[#18382E]"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-[#E6EAE5] bg-[#FAFBFA]">
            <Button variant="ghost" size="sm" className="w-full justify-start text-[#748078]" onClick={handleClearCurrent}>
              <Trash2 className="w-3.5 h-3.5" />
              Clear Current Chat
            </Button>
          </div>
        </div>

        {/* Center: Chat Interface */}
        <div className="lg:col-span-6 bg-white border border-[#E6EAE5] rounded-xl flex flex-col overflow-hidden min-h-[540px]">
          <div className="px-5 py-3.5 border-b border-[#E6EAE5] bg-[#FAFBFA] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-[#18382E] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-[#202923] truncate">
                  {activeConv?.title ?? 'Business Analysis'}
                </div>
                <div className="text-[11px] text-[#748078]">
                  Connected to local Healthy Learning demonstration datasets
                </div>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {(!activeConv || activeConv.messages.length === 0) && (
              <div className="py-6 space-y-6">
                <div className="max-w-lg">
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#244B3D] mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Executive Assistant Ready
                  </div>
                  <h3 className="font-editorial text-[24px] font-medium text-[#18382E] leading-snug">
                    Good morning. I've prepared an overview of your business performance.
                  </h3>
                  <p className="mt-2 text-[13.5px] text-[#647068] leading-relaxed">
                    Select a suggested briefing below or ask a custom question about revenue, titles, inventory coverage, purchase orders, financials, or advertising campaigns.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submitQuestion(q)}
                      className="text-left rounded-xl border border-[#DCE3DB] bg-[#F7F8F6] hover:bg-[#EDF3EE] hover:border-[#244B3D] p-3.5 text-[13px] font-medium text-[#202923] transition-all flex items-start justify-between gap-2"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#244B3D] shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeConv?.messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#244B3D] text-white px-4 py-2.5 text-[13.5px] leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full rounded-xl border border-[#E6EAE5] bg-[#FAFBFA] p-4 space-y-3.5">
                    <div className="text-[13.5px] leading-[1.65] text-[#202923] whitespace-pre-line">
                      {renderRichText(msg.content)}
                    </div>

                    {msg.highlights && msg.highlights.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {msg.highlights.map((h) => (
                          <div key={h.label} className="rounded-lg bg-white border border-[#E6EAE5] px-3 py-2">
                            <div className="text-[11px] text-[#748078]">{h.label}</div>
                            <div className="text-[13.5px] font-semibold text-[#18382E] tabular-nums mt-0.5">
                              {h.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.table && (
                      <div className="overflow-x-auto rounded-lg border border-[#E6EAE5] bg-white">
                        <table className="w-full text-left border-collapse text-[12px]">
                          <thead>
                            <tr className="bg-[#F4F6F3] border-b border-[#E6EAE5] text-[#647068]">
                              {msg.table.headers.map((h) => (
                                <th key={h} className="py-2 px-3 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F3EF]">
                            {msg.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-2 px-3 ${
                                      cIdx === 0 ? 'font-medium text-[#202923]' : 'text-[#525E56] tabular-nums'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.actions.map((act) => (
                          <Button
                            key={act.label}
                            variant="outline"
                            size="sm"
                            onClick={() => handleActionClick(act)}
                          >
                            {act.label}
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        ))}
                      </div>
                    )}

                    {msg.sources && (
                      <div className="pt-2 border-t border-[#ECEFEA] flex items-center justify-between gap-2 text-[11px] text-[#748078]">
                        <span className="inline-flex items-center gap-1.5">
                          <Database className="w-3 h-3" />
                          Sources: {msg.sources.join(' · ')}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[12.5px] text-[#748078] px-3 py-2 rounded-lg bg-[#F7F8F6] w-fit">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244B3D] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244B3D] animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244B3D] animate-bounce [animation-delay:240ms]" />
                </span>
                Analyzing demonstration datasets...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuestion(input);
            }}
            className="p-3.5 border-t border-[#E6EAE5] bg-[#FAFBFA] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about top books, low inventory, high-ACOS campaigns, or POs..."
              aria-label="Ask the AI business assistant a question"
              className="flex-1 h-10 px-3.5 rounded-lg bg-white border border-[#DCE3DB] text-[13.5px] focus:border-[#244B3D] focus:outline-none"
            />
            <Button type="submit" size="md" disabled={!input.trim() || isTyping}>
              <Send className="w-3.5 h-3.5" />
              Send
            </Button>
          </form>
        </div>

        {/* Right: Business Context Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#E6EAE5] rounded-xl p-4 space-y-3.5">
            <div className="text-[12.5px] font-semibold text-[#202923]">Live Workspace Context</div>
            <div className="space-y-2.5 text-[12.5px]">
              <div className="flex justify-between py-1.5 border-b border-[#F0F3EF]">
                <span className="text-[#748078]">Monthly Revenue</span>
                <strong className="tabular-nums text-[#18382E]">{formatCurrency(CATALOG_SUMMARY.monthlyRevenue)}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F3EF]">
                <span className="text-[#748078]">Inventory Flagged</span>
                <strong className="tabular-nums text-[#B58B4F]">{lowStockCount} Titles</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F3EF]">
                <span className="text-[#748078]">Blended Ad ROAS</span>
                <strong className="tabular-nums text-[#244B3D]">{formatRoas(blendedRoas)}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F3EF]">
                <span className="text-[#748078]">Pending Approvals</span>
                <strong className="tabular-nums text-[#202923]">
                  {approvals.filter((a) => a.status === 'Pending').length} Requests
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#748078]">Active Datasets</span>
                <strong className="text-[#557F64]">5 Demo Modules</strong>
              </div>
            </div>
          </div>

          <div className="bg-[#F2F6F3] border border-[#D4DFD6] rounded-xl p-4 space-y-2.5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#18382E]">
              Quick Prompts
            </div>
            <div className="space-y-1.5">
              {[
                'Which purchase orders need review?',
                'Break down our financial deductions and ad spend.',
                'Which keywords have the highest ACOS?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitQuestion(prompt)}
                  className="w-full text-left text-[12px] text-[#244B3D] hover:text-[#18382E] bg-white/80 hover:bg-white border border-[#DCE5DD] rounded-lg px-3 py-2 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E6EAE5] bg-white p-4 text-[12px] text-[#647068] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#244B3D] shrink-0 mt-0.5" />
            <span>
              Simulated ChatGPT / AI Tool interface powered by a local deterministic engine over the shared demonstration dataset. No external LLM calls or live Amazon data are accessed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
