import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Package,
  Megaphone,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="platform"
      className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 bg-[#F7F8F6]"
    >
      {/* Atmospheric subtle animated network visualization */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 70% 28%, rgba(230, 237, 231, 0.72) 0%, rgba(247, 248, 246, 0) 70%), radial-gradient(ellipse 50% 45% at 15% 80%, rgba(184, 155, 104, 0.08) 0%, rgba(247, 248, 246, 0) 70%)',
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-75"
          viewBox="0 0 1440 820"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {/* Flowing thin intelligence lines */}
          <path
            d="M-40 520 C 240 440, 420 260, 740 290 C 1020 315, 1180 180, 1480 140"
            stroke="#C8D6CB"
            strokeWidth="1"
          />
          <path
            d="M-40 520 C 240 440, 420 260, 740 290 C 1020 315, 1180 180, 1480 140"
            stroke="#244B3D"
            strokeOpacity="0.22"
            strokeWidth="1.25"
            strokeDasharray="6 12"
            className="animate-flow-dash"
          />
          <path
            d="M60 720 C 360 580, 620 510, 960 440 C 1180 395, 1310 340, 1480 280"
            stroke="#D6DFD7"
            strokeWidth="1"
          />
          <path
            d="M210 120 C 480 220, 720 150, 1040 250 C 1220 306, 1340 420, 1490 480"
            stroke="#D6DFD7"
            strokeWidth="1"
          />
          <path
            d="M210 120 C 480 220, 720 150, 1040 250"
            stroke="#B89B68"
            strokeOpacity="0.28"
            strokeWidth="1.2"
            strokeDasharray="4 14"
            className="animate-flow-dash"
          />
          {/* Interconnected subtle data points */}
          {[
            { cx: 185, cy: 455, r: 3.5, c: '#82988A' },
            { cx: 430, cy: 332, r: 4, c: '#244B3D' },
            { cx: 740, cy: 290, r: 4.5, c: '#B89B68' },
            { cx: 1040, cy: 250, r: 4, c: '#244B3D' },
            { cx: 1265, cy: 192, r: 3.5, c: '#82988A' },
            { cx: 615, cy: 512, r: 3.5, c: '#82988A' },
            { cx: 960, cy: 440, r: 4, c: '#244B3D' },
            { cx: 480, cy: 190, r: 3.2, c: '#B89B68' },
          ].map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.cx}
                cy={pt.cy}
                r={pt.r * 2.5}
                fill={pt.c}
                fillOpacity="0.1"
                className="animate-pulse-soft"
              />
              <circle cx={pt.cx} cy={pt.cy} r={pt.r} fill={pt.c} fillOpacity="0.55" />
            </g>
          ))}
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left editorial copy */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE3DB] bg-white/90 px-3 py-1 text-[12px] font-medium text-[#244B3D] mb-6 shadow-[0_1px_2px_rgba(24,56,46,0.04)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#557F64]" />
              Healthy Learning LLC · Interactive Platform Demonstration
            </div>

            <h1 className="font-editorial text-[40px] sm:text-[50px] lg:text-[54px] font-medium leading-[1.08] tracking-[-0.022em] text-[#18382E]">
              Run your Amazon business with greater intelligence.
            </h1>

            <p className="mt-5 text-[16px] sm:text-[17.5px] leading-[1.6] text-[#4E5A52] max-w-xl">
              Connect your sales, inventory, financial performance, and advertising operations with an AI-powered workspace designed to turn business data into informed decisions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link to="/overview">
                <Button size="lg" className="px-6 py-3">
                  Explore the Platform
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#capabilities">
                <Button variant="outline" size="lg" className="px-6 py-3 bg-white">
                  Discover How It Works
                </Button>
              </a>
            </div>

            <div className="mt-7 flex items-center gap-2.5 text-[13px] text-[#748078]">
              <ShieldCheck className="w-4 h-4 text-[#244B3D] shrink-0" />
              <span>
                Built around secure integrations, controlled automation, and business-owner oversight.
              </span>
            </div>
          </motion.div>

          {/* Right custom layered animated product composition */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            {/* Main workspace panel */}
            <div className="relative bg-white border border-[#DCE3DB] rounded-2xl shadow-[0_20px_55px_rgba(24,56,46,0.09)] p-5 sm:p-6">
              {/* Top bar inside miniature composition */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E6EAE5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#244B3D]" />
                  <span className="text-[12.5px] font-semibold text-[#202923]">
                    Healthy Learning · Executive Workspace
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="forest" dot>
                    Demo Snapshot
                  </Badge>
                  <span className="text-[11px] text-[#748078] hidden sm:inline">Last 30 Days</span>
                </div>
              </div>

              {/* Revenue trend visualization */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-5">
                  <span className="text-[11.5px] font-medium uppercase tracking-[0.05em] text-[#748078]">
                    Monthly Revenue
                  </span>
                  <div className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#18382E] tabular-nums">
                    $186,420
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[#557F64]">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +12.8% vs. previous period
                  </div>
                </div>
                <div className="sm:col-span-7">
                  <svg viewBox="0 0 280 86" className="w-full h-[78px]" aria-label="Illustrative 30-day revenue trend">
                    <defs>
                      <linearGradient id="heroAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#244B3D" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#244B3D" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Previous period baseline */}
                    <path
                      d="M4 68 C 40 65, 75 61, 110 58 C 145 55, 180 48, 215 45 C 240 43, 260 40, 276 38"
                      fill="none"
                      stroke="#C7D3C9"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Current period area */}
                    <path
                      d="M4 62 C 38 56, 72 49, 108 44 C 144 39, 178 30, 216 24 C 242 20, 260 15, 276 11 L 276 82 L 4 82 Z"
                      fill="url(#heroAreaFill)"
                    />
                    {/* Current period line */}
                    <path
                      d="M4 62 C 38 56, 72 49, 108 44 C 144 39, 178 30, 216 24 C 242 20, 260 15, 276 11"
                      fill="none"
                      stroke="#244B3D"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <circle cx="276" cy="11" r="3.5" fill="#18382E" />
                    <circle cx="276" cy="11" r="7" fill="#244B3D" fillOpacity="0.18" />
                  </svg>
                </div>
              </div>

              {/* Dual operational indicators: Advertising + Inventory */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#E6EAE5] bg-[#F7F8F6] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#748078]">
                      <Megaphone className="w-3.5 h-3.5 text-[#244B3D]" />
                      Advertising ROAS
                    </span>
                    <Badge variant="success">4.34x</Badge>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[17px] font-semibold text-[#202923] tabular-nums">$12,840</span>
                    <span className="text-[11.5px] text-[#557F64] font-medium">23.1% ACOS</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[#E6EAE5] overflow-hidden">
                    <div className="h-full w-[76%] rounded-full bg-[#244B3D]" />
                  </div>
                </div>

                <div className="rounded-xl border border-[#E6EAE5] bg-[#F7F8F6] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#748078]">
                      <Package className="w-3.5 h-3.5 text-[#B89B68]" />
                      Inventory Availability
                    </span>
                    <Badge variant="warning">3 Low Stock</Badge>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[17px] font-semibold text-[#202923] tabular-nums">94.2%</span>
                    <span className="text-[11.5px] text-[#748078]">248 Active Titles</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[#E6EAE5] overflow-hidden">
                    <div className="h-full w-[94%] rounded-full bg-[#557F64]" />
                  </div>
                </div>
              </div>

              {/* Embedded AI Insight panel */}
              <div className="mt-4 rounded-xl border border-[#D4DFD6] bg-[#F2F6F3] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#244B3D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-[#18382E]">
                        AI Operational Brief
                      </span>
                      <span className="text-[10.5px] font-medium text-[#748078]">
                        Simulated Analysis
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[#36443B]">
                      Sports Medicine Handbook (+17.5%) leads catalog growth. Three titles crossed your 14-day stock threshold; 4 controlled optimization proposals await review.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle floating status cards (desktop) */}
            <div className="hidden sm:flex items-center gap-2.5 absolute -top-4 -right-3 bg-white border border-[#DCE3DB] rounded-xl px-3.5 py-2 shadow-[0_10px_25px_rgba(24,56,46,0.08)] animate-float-subtle">
              <CheckCircle2 className="w-4 h-4 text-[#557F64]" />
              <div className="leading-tight">
                <div className="text-[11.5px] font-semibold text-[#202923]">Approval Gate Active</div>
                <div className="text-[10.5px] text-[#748078]">Human sign-off required</div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2.5 absolute -bottom-4 -left-4 bg-white border border-[#DCE3DB] rounded-xl px-3.5 py-2 shadow-[0_10px_25px_rgba(24,56,46,0.08)] animate-float-subtle-delayed">
              <TrendingUp className="w-4 h-4 text-[#B89B68]" />
              <div className="leading-tight">
                <div className="text-[11.5px] font-semibold text-[#202923]">142 Vendor POs</div>
                <div className="text-[10.5px] text-[#748078]">+6.2% replenishment cadence</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
