import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp,
  ClipboardList,
  Boxes,
  Landmark,
  Megaphone,
  Sparkles,
} from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(target);

  useEffect(() => {
    if (!inView) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVal(target);
      return;
    }

    const duration = 900;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf = requestAnimationFrame(frame);
      else setVal(target);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  const formatted =
    decimals > 0
      ? val.toFixed(decimals)
      : new Intl.NumberFormat('en-US').format(Math.round(val));

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

const CAPABILITIES = [
  {
    title: 'Sales Intelligence',
    description: 'Understand revenue trends, title-level performance, and sales movement across your entire catalog.',
    icon: TrendingUp,
    visual: (
      <div className="flex items-end gap-1.5 h-10 pt-2">
        {[38, 48, 44, 62, 58, 76, 84, 92].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              backgroundColor: i >= 6 ? '#244B3D' : '#D4DFD6',
            }}
          />
        ))}
      </div>
    ),
  },
  {
    title: 'Vendor Operations',
    description: 'Monitor purchase orders, order status, expected deliveries, and fulfillment center activity.',
    icon: ClipboardList,
    visual: (
      <div className="space-y-1.5 pt-1">
        {[
          { label: 'PO-HL-88421', badge: 'New', pct: '30%', color: '#B89B68' },
          { label: 'PO-HL-88416', badge: 'Shipped', pct: '78%', color: '#244B3D' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2 text-[11px]">
            <span className="font-mono text-[#4F5B53] w-20 shrink-0">{row.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-[#E6EAE5] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: row.pct, backgroundColor: row.color }} />
            </div>
            <span className="text-[#748078] w-12 text-right">{row.badge}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Inventory Intelligence',
    description: 'Understand inventory availability, low-stock risks, inbound stock, and product-level coverage.',
    icon: Boxes,
    visual: (
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex-1">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[#748078]">Catalog Coverage</span>
            <span className="font-semibold text-[#244B3D]">94.2%</span>
          </div>
          <div className="h-2 rounded-full bg-[#E6EAE5] overflow-hidden flex">
            <div className="bg-[#557F64] w-[82%]" />
            <div className="bg-[#B58B4F] w-[12%]" />
            <div className="bg-[#B66A65] w-[6%]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Financial Visibility',
    description: 'Analyze revenue, estimated deductions, settlement-related information where available, and trends.',
    icon: Landmark,
    visual: (
      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
        <div className="rounded-md bg-[#F7F8F6] border border-[#E6EAE5] px-2 py-1.5">
          <div className="text-[#748078]">Gross</div>
          <div className="font-semibold text-[#202923] tabular-nums">$186k</div>
        </div>
        <div className="rounded-md bg-[#F7F8F6] border border-[#E6EAE5] px-2 py-1.5">
          <div className="text-[#748078]">Ad Ratio</div>
          <div className="font-semibold text-[#244B3D] tabular-nums">6.9%</div>
        </div>
        <div className="rounded-md bg-[#F7F8F6] border border-[#E6EAE5] px-2 py-1.5">
          <div className="text-[#748078]">Net Est.</div>
          <div className="font-semibold text-[#557F64] tabular-nums">$164k</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Advertising Intelligence',
    description: 'Monitor campaign performance, advertising costs, keyword efficiency, ROAS, and conversions.',
    icon: Megaphone,
    visual: (
      <div className="flex items-center justify-between pt-1.5 text-[11.5px]">
        <div>
          <span className="text-[#748078]">Blended ROAS</span>
          <div className="text-[15px] font-semibold text-[#18382E] tabular-nums">4.34x</div>
        </div>
        <div className="text-right">
          <span className="text-[#748078]">Blended ACOS</span>
          <div className="text-[15px] font-semibold text-[#557F64] tabular-nums">23.1%</div>
        </div>
      </div>
    ),
  },
  {
    title: 'AI Business Assistant',
    description: 'Ask questions, identify opportunities, and turn business information into actionable recommendations.',
    icon: Sparkles,
    visual: (
      <div className="rounded-md bg-[#F2F6F3] border border-[#DCE5DD] px-2.5 py-2 text-[11px] text-[#244B3D] leading-snug">
        “Three high-velocity titles need replenishment review prior to late-month PO cutoff.”
      </div>
    ),
  },
];

export const MetricsAndCapabilities: React.FC = () => {
  return (
    <>
      {/* 6.3 Business Intelligence Strip */}
      <section className="border-y border-[#E6EAE5] bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="border-l-2 border-[#244B3D] pl-4">
              <div className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.025em] text-[#18382E]">
                <AnimatedCounter target={248} />
              </div>
              <div className="mt-1 text-[13px] font-medium text-[#748078]">Active Titles</div>
            </div>
            <div className="border-l-2 border-[#B89B68] pl-4">
              <div className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.025em] text-[#18382E]">
                <AnimatedCounter target={186420} prefix="$" />
              </div>
              <div className="mt-1 text-[13px] font-medium text-[#748078]">Monthly Revenue</div>
            </div>
            <div className="border-l-2 border-[#557F64] pl-4">
              <div className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.025em] text-[#18382E]">
                <AnimatedCounter target={94.2} suffix="%" decimals={1} />
              </div>
              <div className="mt-1 text-[13px] font-medium text-[#748078]">Inventory Availability</div>
            </div>
            <div className="border-l-2 border-[#82988A] pl-4">
              <div className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.025em] text-[#18382E]">
                <AnimatedCounter target={12840} prefix="$" />
              </div>
              <div className="mt-1 text-[13px] font-medium text-[#748078]">Advertising Spend</div>
            </div>
          </div>
          <p className="mt-6 text-[11.5px] text-[#748078] flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B89B68]" />
            Illustrative business data shown for interactive product demonstration.
          </p>
        </div>
      </section>

      {/* 6.4 Platform Capabilities */}
      <section id="capabilities" className="py-20 lg:py-24 bg-[#F7F8F6]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#244B3D]">
              Platform Capabilities
            </span>
            <h2 className="mt-2.5 font-editorial text-[32px] sm:text-[38px] font-medium leading-[1.15] tracking-[-0.02em] text-[#18382E]">
              One connected view of your Amazon business.
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-[#5C6860]">
              Bring sales, inventory, purchase orders, financial performance, and advertising intelligence together with an AI-powered operational workspace.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="group bg-white border border-[#E6EAE5] rounded-xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D3C9] hover:shadow-[0_10px_28px_rgba(24,56,46,0.06)]"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-[#F0F3EF] text-[#244B3D] flex items-center justify-center mb-4 group-hover:bg-[#E6EDE7] transition-colors">
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#202923] tracking-[-0.01em]">
                      {cap.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-[1.55] text-[#647068]">
                      {cap.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#F0F3EF]">{cap.visual}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
