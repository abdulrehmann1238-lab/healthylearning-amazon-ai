import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Database,
  Sparkles,
  Lightbulb,
  UserCheck,
  ShieldCheck,
  FileText,
  KeyRound,
  Lock,
  Users,
  SlidersHorizontal,
  Activity,
  Server,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BrandWordmark } from '../ui/BrandMark';

const AUTOMATION_STAGES = [
  { label: 'Business Data', sub: 'Normalized catalog & POs', icon: Database },
  { label: 'AI Analysis', sub: 'Pattern & risk detection', icon: Sparkles },
  { label: 'Recommendation', sub: 'Context & expected impact', icon: Lightbulb },
  { label: 'Approval', sub: 'Human sign-off required', icon: UserCheck },
  { label: 'Authorized Action', sub: 'Scoped execution layer', icon: ShieldCheck },
  { label: 'Audit Record', sub: 'Immutable activity trail', icon: FileText },
];

const SECURITY_CARDS = [
  {
    title: 'OAuth 2.0 Authorization Architecture',
    desc: 'Designed around Amazon Login with Amazon (LWA) and scoped OAuth flows rather than password sharing.',
    icon: KeyRound,
  },
  {
    title: 'Encrypted Credential Storage',
    desc: 'Architecture separates token storage into dedicated encrypted secrets management in production.',
    icon: Lock,
  },
  {
    title: 'Role-Based Access Controls',
    desc: 'Distinct Administrator, Operations Manager, Analyst, and Viewer roles govern visibility and approvals.',
    icon: Users,
  },
  {
    title: 'Least-Privilege Permissions',
    desc: 'Read-only reporting scopes are isolated from future advertising or operational write permissions.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Comprehensive Audit Logging',
    desc: 'Every dataset query, proposed optimization, approval decision, and workflow run is recorded.',
    icon: Activity,
  },
  {
    title: 'Controlled API Access',
    desc: 'AI tools interact only with a curated internal service layer — never directly with raw Amazon credentials.',
    icon: Server,
  },
];

export const AutomationSecurityArchitecture: React.FC = () => {
  return (
    <>
      {/* 6.6 Controlled Automation */}
      <section className="py-20 lg:py-24 bg-[#F7F8F6]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#244B3D]">
              Human-in-the-Loop Governance
            </span>
            <h2 className="mt-2.5 font-editorial text-[32px] sm:text-[38px] font-medium leading-[1.15] tracking-[-0.02em] text-[#18382E]">
              Automation with accountability built in.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-[#5C6860]">
              Future operational and advertising automation is architected around explicit business-owner approval, strict spending caps, and full traceability. All actions in this demonstration are safely simulated locally.
            </p>
          </div>

          {/* Six connected stages */}
          <div className="mt-12 relative">
            <div
              className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-[2px] bg-[#DCE3DB]"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
              {AUTOMATION_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isGate = stage.label === 'Approval';
                return (
                  <motion.div
                    key={stage.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    className={`rounded-xl border p-4 bg-white relative z-10 ${
                      isGate
                        ? 'border-[#244B3D] ring-1 ring-[#244B3D]/15 shadow-[0_6px_20px_rgba(24,56,46,0.08)]'
                        : 'border-[#E6EAE5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isGate
                            ? 'bg-[#244B3D] text-white'
                            : 'bg-[#F0F3EF] text-[#244B3D]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono text-[#748078]">0{idx + 1}</span>
                    </div>
                    <div className="text-[14px] font-semibold text-[#202923]">{stage.label}</div>
                    <div className="mt-1 text-[12px] text-[#748078] leading-snug">{stage.sub}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Safeguards strip */}
          <div className="mt-8 rounded-xl border border-[#E6EAE5] bg-white p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              'Configurable daily spending limits',
              'Mandatory owner approval gates',
              'Scoped, restricted API permissions',
              'Timestamped activity tracking',
              'Reversible decisions where supported',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-[13px] text-[#3B4840]">
                <CheckCircle2 className="w-4 h-4 text-[#557F64] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6.7 Security Section */}
      <section id="security" className="py-20 lg:py-24 bg-white border-y border-[#E6EAE5]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#244B3D]">
                Security Architecture
              </span>
              <h2 className="mt-2.5 font-editorial text-[32px] sm:text-[38px] font-medium leading-[1.15] tracking-[-0.02em] text-[#18382E]">
                Your business data deserves a secure foundation.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#5C6860]">
                Designed to respect Amazon developer policies, account ownership, and publishing-data confidentiality. The architecture below illustrates the planned production security boundary; no live credentials are connected in this demonstration.
              </p>
            </div>
            <Link to="/security" className="shrink-0">
              <Button variant="outline">
                Explore Security Controls
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Security boundary horizontal diagram */}
          <div className="mt-10 rounded-xl border border-[#DCE3DB] bg-[#F7F8F6] p-5 overflow-x-auto">
            <div className="min-w-[680px] flex items-center justify-between gap-2">
              {[
                { title: 'Amazon APIs', sub: 'SP-API & Ads API' },
                { title: 'Secure Integration Layer', sub: 'OAuth 2.0 / Token Vault' },
                { title: 'Business Data Layer', sub: 'Normalized Store' },
                { title: 'ChatGPT Tools', sub: 'Scoped Read/Propose' },
                { title: 'Authorized Actions', sub: 'Approval + Audit Log' },
              ].map((node, i, arr) => (
                <React.Fragment key={node.title}>
                  <div className="flex-1 rounded-lg bg-white border border-[#E6EAE5] px-3.5 py-3 text-center">
                    <div className="text-[12.5px] font-semibold text-[#18382E]">{node.title}</div>
                    <div className="text-[11px] text-[#748078] mt-0.5">{node.sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[#82988A] shrink-0" aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SECURITY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-[#E6EAE5] bg-[#FAFBFA] p-5"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E6EDE7] text-[#244B3D] flex items-center justify-center mb-3.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#202923]">{card.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#647068]">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6.8 Technical Architecture Section */}
      <section id="architecture" className="py-20 lg:py-24 bg-[#F7F8F6]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#244B3D]">
              System Blueprint
            </span>
            <h2 className="mt-2.5 font-editorial text-[32px] sm:text-[38px] font-medium leading-[1.15] tracking-[-0.02em] text-[#18382E]">
              A phased, maintainable technical architecture.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5C6860]">
              Starting with Phase 1 Amazon Selling Partner API (Vendor Central) integration, then expanding cleanly into Amazon Advertising API intelligence and controlled AI-assisted workflows.
            </p>
          </div>

          <div className="mt-12 rounded-2xl border border-[#DCE3DB] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,56,46,0.04)]">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
              {/* Left Dual Sources */}
              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-xl border border-[#DCE3DB] bg-[#F7F8F6] p-4">
                  <Badge variant="forest">Phase 1</Badge>
                  <div className="mt-2 text-[14px] font-semibold text-[#18382E]">
                    Amazon Vendor Central
                  </div>
                  <div className="text-[12px] text-[#748078] mt-0.5">
                    Amazon SP-API · Sales, POs, Inventory, Catalog
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4">
                  <Badge variant="gold">Phase 2</Badge>
                  <div className="mt-2 text-[14px] font-semibold text-[#18382E]">
                    Amazon Advertising
                  </div>
                  <div className="text-[12px] text-[#748078] mt-0.5">
                    Advertising API · Campaigns, Keywords, ROAS
                  </div>
                </div>
              </div>

              {/* Animated Connector Arrow */}
              <div className="hidden lg:flex lg:col-span-1 justify-center" aria-hidden="true">
                <svg width="48" height="120" viewBox="0 0 48 120" fill="none">
                  <path
                    d="M0 30 C 24 30, 24 60, 48 60"
                    stroke="#244B3D"
                    strokeWidth="1.6"
                    strokeDasharray="4 5"
                    className="animate-flow-dash"
                  />
                  <path
                    d="M0 90 C 24 90, 24 60, 48 60"
                    stroke="#B89B68"
                    strokeWidth="1.6"
                    strokeDasharray="4 5"
                    className="animate-flow-dash"
                  />
                  <circle cx="44" cy="60" r="3" fill="#244B3D" />
                </svg>
              </div>

              {/* Middle Core Platform */}
              <div className="lg:col-span-3 space-y-3">
                <div className="rounded-xl border border-[#244B3D] bg-[#18382E] text-white p-4">
                  <div className="text-[11px] uppercase tracking-[0.06em] text-[#B89B68] font-medium">
                    Core Integration Tier
                  </div>
                  <div className="mt-1 text-[14.5px] font-semibold">Secure Integration Service</div>
                  <div className="mt-1 text-[12px] text-[#C9D6CE]">
                    LWA OAuth, rate limiting, retries & encryption
                  </div>
                </div>
                <div className="rounded-xl border border-[#DCE3DB] bg-[#F7F8F6] p-4">
                  <div className="text-[14px] font-semibold text-[#18382E]">
                    Normalized Business Data
                  </div>
                  <div className="text-[12px] text-[#748078] mt-0.5">
                    Unified ISBN, ASIN, PO, and campaign schemas
                  </div>
                </div>
              </div>

              {/* Animated Connector Arrow */}
              <div className="hidden lg:flex lg:col-span-1 justify-center" aria-hidden="true">
                <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
                  <path
                    d="M0 30 L 44 30"
                    stroke="#244B3D"
                    strokeWidth="1.6"
                    strokeDasharray="4 5"
                    className="animate-flow-dash"
                  />
                  <circle cx="44" cy="30" r="3" fill="#244B3D" />
                </svg>
              </div>

              {/* Right AI & Governance Stack */}
              <div className="lg:col-span-3 space-y-2.5">
                {[
                  { title: 'ChatGPT / AI Tool Interface', sub: 'Structured read & analysis tools' },
                  { title: 'Business Intelligence & Recommendations', sub: 'Prioritized insights & alerts' },
                  { title: 'Human Approval Gate', sub: 'Owner review & spending limits' },
                  { title: 'Authorized Operations', sub: 'Scoped execution & audit trail' },
                ].map((step, i) => (
                  <div
                    key={step.title}
                    className={`rounded-lg border px-3.5 py-2.5 ${
                      i === 2
                        ? 'border-[#244B3D] bg-[#F2F6F3]'
                        : 'border-[#E6EAE5] bg-[#FAFBFA]'
                    }`}
                  >
                    <div className="text-[13px] font-semibold text-[#18382E]">{step.title}</div>
                    <div className="text-[11.5px] text-[#748078]">{step.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E6EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-[#748078]">
              <span>
                Cross-cutting governance: Audit Logging · Role-Based Access · Rate-Limit Monitoring
              </span>
              <Link
                to="/integrations"
                className="font-medium text-[#244B3D] hover:text-[#18382E] inline-flex items-center gap-1"
              >
                Inspect Integration Center
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6.9 Final CTA */}
      <section className="py-20 lg:py-24 bg-[#18382E] text-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-editorial text-[34px] sm:text-[42px] font-medium leading-[1.15] tracking-[-0.02em]">
            Make your Amazon business easier to understand — and easier to manage.
          </h2>
          <p className="mt-4 text-[16px] text-[#C8D5CD] max-w-2xl mx-auto leading-relaxed">
            Explore a connected operational workspace built around your publishing business.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/overview">
              <Button
                size="lg"
                className="bg-white text-[#18382E] border-white hover:bg-[#F0F3EF] px-7 py-3"
              >
                Explore the Business Workspace
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6.10 Footer */}
      <footer className="bg-[#F7F8F6] border-t border-[#E6EAE5] pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#E6EAE5]">
            <div className="lg:col-span-4">
              <BrandWordmark subtitle="Amazon Intelligence" />
              <p className="mt-3.5 text-[13.5px] leading-relaxed text-[#647068] max-w-xs">
                Intelligent business management for modern publishing operations.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-[13px] text-[#244B3D]">
                <Mail className="w-4 h-4" />
                <a href="#contact-placeholder" onClick={(e) => e.preventDefault()} className="hover:underline">
                  [Contact Inquiry Placeholder]
                </a>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#202923] mb-3.5">
                Platform
              </h3>
              <ul className="space-y-2 text-[13.5px] text-[#647068]">
                <li><Link to="/overview" className="hover:text-[#18382E]">Overview</Link></li>
                <li><Link to="/sales" className="hover:text-[#18382E]">Sales Intelligence</Link></li>
                <li><Link to="/inventory" className="hover:text-[#18382E]">Inventory</Link></li>
                <li><Link to="/advertising" className="hover:text-[#18382E]">Advertising</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-[#18382E]">AI Assistant</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#202923] mb-3.5">
                Capabilities
              </h3>
              <ul className="space-y-2 text-[13.5px] text-[#647068]">
                <li><Link to="/financials" className="hover:text-[#18382E]">Business Analytics</Link></li>
                <li><Link to="/automation" className="hover:text-[#18382E]">Operational Automation</Link></li>
                <li><Link to="/approvals" className="hover:text-[#18382E]">Approvals</Link></li>
                <li><Link to="/integrations" className="hover:text-[#18382E]">Integrations</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#202923] mb-3.5">
                Company
              </h3>
              <ul className="space-y-2 text-[13.5px] text-[#647068]">
                <li><a href="#platform" className="hover:text-[#18382E]">About Healthy Learning</a></li>
                <li><Link to="/settings" className="hover:text-[#18382E]">Contact</Link></li>
                <li><Link to="/security" className="hover:text-[#18382E]">Privacy</Link></li>
                <li><Link to="/integrations" className="hover:text-[#18382E]">Documentation</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-[#748078]">
            <span>© 2026 Healthy Learning LLC. All rights reserved.</span>
            <span>Interactive product demonstration. Data shown is illustrative.</span>
          </div>
        </div>
      </footer>
    </>
  );
};
