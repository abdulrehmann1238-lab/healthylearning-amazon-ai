import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronRight,
  Menu,
  Search,
  Sparkles,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  BookOpen,
  ClipboardList,
  Megaphone,
  Lightbulb,
  X,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import type { DateRangeKey } from '../../types';
import { getDateRangeLabel } from '../../utilities/format';

const ROUTE_META: Record<string, { title: string; section: string }> = {
  '/overview': { title: 'Business Overview', section: 'Overview' },
  '/sales': { title: 'Sales Intelligence', section: 'Commerce' },
  '/products': { title: 'Product Catalog', section: 'Commerce' },
  '/purchase-orders': { title: 'Purchase Orders', section: 'Commerce' },
  '/inventory': { title: 'Inventory Intelligence', section: 'Commerce' },
  '/financials': { title: 'Financial Intelligence', section: 'Commerce' },
  '/advertising': { title: 'Advertising Intelligence', section: 'Advertising' },
  '/ai-assistant': { title: 'AI Business Assistant', section: 'AI & Automation' },
  '/recommendations': { title: 'Business Opportunities', section: 'AI & Automation' },
  '/approvals': { title: 'Approval Center', section: 'AI & Automation' },
  '/automation': { title: 'Automation History', section: 'AI & Automation' },
  '/integrations': { title: 'Integration Center', section: 'System' },
  '/security': { title: 'Security & Access Control', section: 'System' },
  '/activity': { title: 'Activity Logs', section: 'System' },
  '/settings': { title: 'Workspace Settings', section: 'System' },
};

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    dateRange,
    setDateRange,
    products,
    purchaseOrders,
    campaigns,
    recommendations,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    activeRole,
  } = useAppState();

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const meta = ROUTE_META[location.pathname] ?? { title: 'Workspace', section: 'Overview' };
  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: { type: string; title: string; sub: string; route: string; icon: React.FC<{ className?: string }> }[] = [];

    products.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.isbn.toLowerCase().includes(q) ||
        p.asin.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Title',
          title: p.title,
          sub: `${p.isbn} · ${p.category}`,
          route: `/products?selected=${p.id}`,
          icon: BookOpen,
        });
      }
    });

    purchaseOrders.forEach((po) => {
      if (
        po.poNumber.toLowerCase().includes(q) ||
        po.fulfillmentCenter.toLowerCase().includes(q) ||
        po.status.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Purchase Order',
          title: po.poNumber,
          sub: `${po.fulfillmentCenter} · ${po.status}`,
          route: `/purchase-orders?selected=${po.id}`,
          icon: ClipboardList,
        });
      }
    });

    campaigns.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)) {
        results.push({
          type: 'Campaign',
          title: c.name,
          sub: `${c.type} · ${c.roas.toFixed(2)}x ROAS`,
          route: `/advertising?selected=${c.id}`,
          icon: Megaphone,
        });
      }
    });

    recommendations.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) {
        results.push({
          type: 'Opportunity',
          title: r.title,
          sub: `${r.category} · ${r.priority} Priority`,
          route: `/recommendations`,
          icon: Lightbulb,
        });
      }
    });

    return results.slice(0, 8);
  }, [query, products, purchaseOrders, campaigns, recommendations]);

  return (
    <>
    <header className="sticky top-0 z-20 h-[70px] bg-white/95 backdrop-blur-sm border-b border-[#E6EAE5] px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile toggle + Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-lg text-[#4F5B53] hover:bg-[#F0F3EF] shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#748078]">
            <span>{meta.section}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#4F5B53] font-medium">{meta.title}</span>
          </div>
          <h1 className="text-[15.5px] sm:text-[16.5px] font-semibold tracking-[-0.015em] text-[#202923] truncate leading-tight">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Center: Global Working Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchFocused(true);
            }}
            placeholder="Search titles, orders, campaigns..."
            aria-label="Search titles, purchase orders, and campaigns"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F7F8F6] border border-[#E6EAE5] text-[13px] text-[#202923] placeholder:text-[#82988A] focus:bg-white focus:border-[#244B3D] focus:outline-none transition-colors"
          />
        </div>

        {searchFocused && query.trim().length > 0 && (
          <div className="absolute top-11 inset-x-0 bg-white border border-[#DCE3DB] rounded-xl shadow-[0_14px_36px_rgba(24,56,46,0.12)] overflow-hidden z-40">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px] text-[#748078]">
                No matches for “{query}” in the demonstration dataset.
              </div>
            ) : (
              <ul className="divide-y divide-[#F0F3EF] max-h-80 overflow-y-auto">
                {searchResults.map((res, idx) => {
                  const Icon = res.icon;
                  return (
                    <li key={`${res.route}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(res.route);
                          setSearchFocused(false);
                          setQuery('');
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#F7F8F6] flex items-center gap-3 transition-colors"
                      >
                        <span className="w-7 h-7 rounded-md bg-[#F0F3EF] text-[#244B3D] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-[#202923] truncate">
                            {res.title}
                          </div>
                          <div className="text-[11.5px] text-[#748078] truncate">{res.sub}</div>
                        </div>
                        <span className="text-[10.5px] font-medium text-[#748078] bg-[#F0F3EF] px-2 py-0.5 rounded shrink-0">
                          {res.type}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Right: Date Range + Mobile Search + AI Shortcut + Notifications + User Menu */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileSearchOpen((v) => !v)}
          aria-label="Toggle mobile search"
          className="md:hidden w-9 h-9 rounded-lg border border-[#E6EAE5] bg-white hover:bg-[#F7F8F6] text-[#4F5B53] flex items-center justify-center"
        >
          {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>
        {/* Date range selector */}
        <div className="relative hidden sm:flex items-center">
          <Calendar className="w-3.5 h-3.5 text-[#748078] absolute left-2.5 pointer-events-none" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
            aria-label="Reporting date range"
            className="h-9 pl-8 pr-7 rounded-lg bg-[#F7F8F6] border border-[#E6EAE5] text-[12.5px] font-medium text-[#202923] hover:border-[#CFD8D0] focus:border-[#244B3D] focus:outline-none cursor-pointer"
          >
            {(['7d', '30d', '90d', 'ytd'] as DateRangeKey[]).map((key) => (
              <option key={key} value={key}>
                {getDateRangeLabel(key)}
              </option>
            ))}
          </select>
        </div>

        {/* AI Assistant quick shortcut */}
        <Link
          to="/ai-assistant"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#E6EDE7] text-[#18382E] hover:bg-[#D7E3D9] text-[12.5px] font-medium transition-colors"
          title="Open AI Business Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#244B3D]" />
          <span className="hidden xl:inline">Ask AI</span>
        </Link>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setUserMenuOpen(false);
            }}
            aria-label={`Notifications (${unreadCount} unread)`}
            className="relative w-9 h-9 rounded-lg border border-[#E6EAE5] bg-white hover:bg-[#F7F8F6] text-[#4F5B53] flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B89B68] ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DCE3DB] rounded-xl shadow-[0_16px_40px_rgba(24,56,46,0.12)] overflow-hidden z-40">
              <div className="px-4 py-3 border-b border-[#E6EAE5] flex items-center justify-between bg-[#FAFBFA]">
                <span className="text-[13px] font-semibold text-[#202923]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[11.5px] font-medium text-[#244B3D] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <ul className="divide-y divide-[#F0F3EF] max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        markNotificationRead(item.id);
                        setNotifOpen(false);
                        navigate(item.route);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-[#F7F8F6] transition-colors flex items-start gap-3 ${
                        item.read ? 'opacity-75' : 'bg-[#F9FBF9]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          item.read
                            ? 'bg-[#D0D8D1]'
                            : item.tone === 'warning'
                              ? 'bg-[#B58B4F]'
                              : 'bg-[#244B3D]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-medium text-[#202923] leading-snug">
                          {item.title}
                        </div>
                        <p className="text-[11.5px] text-[#748078] mt-0.5 leading-snug">
                          {item.description}
                        </p>
                        <span className="text-[10.5px] text-[#82988A] mt-1 block">
                          {item.timestamp}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            aria-label="Account menu"
            className="h-9 pl-2 pr-2.5 rounded-lg border border-[#E6EAE5] bg-white hover:bg-[#F7F8F6] flex items-center gap-2 transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-[#244B3D] text-white text-[11px] font-semibold flex items-center justify-center">
              BA
            </div>
            <span className="hidden xl:inline text-[12.5px] font-medium text-[#202923]">
              {activeRole}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DCE3DB] rounded-xl shadow-[0_14px_36px_rgba(24,56,46,0.12)] overflow-hidden z-40 py-1.5">
              <div className="px-3.5 py-2 border-b border-[#F0F3EF]">
                <div className="text-[12.5px] font-semibold text-[#202923]">{activeRole}</div>
                <div className="text-[11px] text-[#748078]">Demo Session · Healthy Learning</div>
              </div>
              <Link
                to="/overview"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#4C5850] hover:bg-[#F7F8F6] hover:text-[#202923]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#82988A]" />
                Workspace Overview
              </Link>
              <Link
                to="/security"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#4C5850] hover:bg-[#F7F8F6] hover:text-[#202923]"
              >
                <ShieldCheck className="w-4 h-4 text-[#82988A]" />
                Roles & Security
              </Link>
              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#4C5850] hover:bg-[#F7F8F6] hover:text-[#202923]"
              >
                <Settings className="w-4 h-4 text-[#82988A]" />
                Settings
              </Link>
              <div className="my-1 border-t border-[#F0F3EF]" />
              <Link
                to="/"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#4C5850] hover:bg-[#F7F8F6] hover:text-[#202923]"
              >
                <LogOut className="w-4 h-4 text-[#82988A]" />
                Return to Landing Page
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
    {mobileSearchOpen && (
      <div className="md:hidden sticky top-[70px] z-20 bg-white border-b border-[#E6EAE5] px-4 py-3 shadow-[0_6px_18px_rgba(24,56,46,0.06)]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#82988A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, orders, campaigns..."
            aria-label="Search titles, purchase orders, and campaigns"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F7F8F6] border border-[#DCE3DB] text-[13px] focus:bg-white focus:border-[#244B3D] focus:outline-none"
          />
        </div>
        {query.trim().length > 0 && (
          <div className="mt-2 rounded-xl border border-[#DCE3DB] bg-white overflow-hidden">
            {searchResults.length === 0 ? (
              <div className="px-4 py-4 text-center text-[12.5px] text-[#748078]">
                No matches for “{query}”.
              </div>
            ) : (
              <ul className="divide-y divide-[#F0F3EF] max-h-64 overflow-y-auto">
                {searchResults.map((res, idx) => {
                  const Icon = res.icon;
                  return (
                    <li key={`m-${res.route}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(res.route);
                          setMobileSearchOpen(false);
                          setQuery('');
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-[#F7F8F6] flex items-center gap-2.5"
                      >
                        <span className="w-7 h-7 rounded-md bg-[#F0F3EF] text-[#244B3D] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-[#202923] truncate">{res.title}</div>
                          <div className="text-[11px] text-[#748078] truncate">{res.sub}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    )}
    </>
  );
};
