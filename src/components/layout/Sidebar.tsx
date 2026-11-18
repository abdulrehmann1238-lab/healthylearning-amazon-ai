import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Boxes,
  Landmark,
  Megaphone,
  LineChart,
  Sparkles,
  Lightbulb,
  CheckSquare,
  Workflow,
  Plug,
  ShieldCheck,
  History,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { BrandWordmark } from '../ui/BrandMark';
import { useAppState } from '../../context/AppStateContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.FC<{ className?: string }>;
  badgeCount?: number;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const { approvals, recommendations, activeRole, settings } = useAppState();

  const pendingApprovals = approvals.filter((a) => a.status === 'Pending').length;
  const openRecommendations = recommendations.filter((r) => r.status === 'Open').length;

  const navGroups: NavGroup[] = [
    {
      heading: 'OVERVIEW',
      items: [{ label: 'Business Overview', to: '/overview', icon: LayoutDashboard }],
    },
    {
      heading: 'COMMERCE',
      items: [
        { label: 'Sales Intelligence', to: '/sales', icon: TrendingUp },
        { label: 'Product Catalog', to: '/products', icon: BookOpen },
        { label: 'Purchase Orders', to: '/purchase-orders', icon: ClipboardList },
        { label: 'Inventory', to: '/inventory', icon: Boxes },
        { label: 'Financials', to: '/financials', icon: Landmark },
      ],
    },
    {
      heading: 'ADVERTISING',
      items: [
        { label: 'Campaign Performance', to: '/advertising', icon: Megaphone },
        { label: 'Advertising Insights', to: '/advertising?view=insights', icon: LineChart },
      ],
    },
    {
      heading: 'AI & AUTOMATION',
      items: [
        { label: 'AI Assistant', to: '/ai-assistant', icon: Sparkles },
        {
          label: 'Recommendations',
          to: '/recommendations',
          icon: Lightbulb,
          badgeCount: openRecommendations,
        },
        {
          label: 'Approvals',
          to: '/approvals',
          icon: CheckSquare,
          badgeCount: pendingApprovals,
        },
        { label: 'Automation History', to: '/automation', icon: Workflow },
      ],
    },
    {
      heading: 'SYSTEM',
      items: [
        { label: 'Integrations', to: '/integrations', icon: Plug },
        { label: 'Security & Access', to: '/security', icon: ShieldCheck },
        { label: 'Activity Logs', to: '/activity', icon: History },
        { label: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  const isActive = (to: string) => {
    if (to.includes('?')) {
      return `${location.pathname}${location.search}` === to;
    }
    if (to === '/advertising' && location.search.includes('view=insights')) {
      return false;
    }
    return location.pathname === to;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-[#E6EAE5] w-[250px] shrink-0">
      {/* Brand header */}
      <div className="h-[70px] px-4 flex items-center justify-between border-b border-[#E6EAE5] shrink-0">
        <Link to="/" onClick={onCloseMobile} className="min-w-0">
          <BrandWordmark subtitle="Business Intelligence" compact />
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-[#748078] hover:text-[#202923] hover:bg-[#F0F3EF]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Workspace navigation">
        {navGroups.map((group) => (
          <div key={group.heading}>
            <div className="px-2.5 mb-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-[#82988A]">
              {group.heading}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onCloseMobile}
                      className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? 'bg-[#E6EDE7] text-[#18382E]'
                          : 'text-[#525E56] hover:bg-[#F4F6F3] hover:text-[#202923]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active
                              ? 'text-[#244B3D]'
                              : 'text-[#82988A] group-hover:text-[#244B3D]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                        <span
                          className={`text-[10.5px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${
                            active
                              ? 'bg-[#244B3D] text-white'
                              : 'bg-[#F0F3EF] text-[#4C5850]'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Demo Status & Profile */}
      <div className="p-3 border-t border-[#E6EAE5] bg-[#FAFBFA] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#F0F3EF] border border-[#DCE3DB]">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.06em] text-[#244B3D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89B68]" />
            DEMO ENVIRONMENT
          </span>
          <Link
            to="/"
            title="View Landing Page"
            className="text-[#748078] hover:text-[#18382E] transition-colors"
            aria-label="Return to landing page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Link
          to="/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#F0F3EF] transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#18382E] text-[#F7F8F6] text-[12px] font-semibold flex items-center justify-center shrink-0">
            BA
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[12.5px] font-semibold text-[#202923] truncate">
              {activeRole}
            </div>
            <div className="text-[11px] text-[#748078] truncate">{settings.businessName}</div>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">{sidebarContent}</aside>

      {/* Mobile / Tablet slide-out drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-[#18382E]/30 backdrop-blur-[1px]"
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
