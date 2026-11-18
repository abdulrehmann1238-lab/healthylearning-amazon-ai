import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { BrandWordmark } from '../ui/BrandMark';
import { Button } from '../ui/Button';

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'AI Intelligence', href: '#ai-intelligence' },
  { label: 'Security', href: '#security' },
  { label: 'Architecture', href: '#architecture' },
];

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-200 ${
        scrolled || mobileOpen
          ? 'bg-[#F7F8F6]/95 backdrop-blur-sm border-b border-[#E6EAE5] shadow-[0_1px_8px_rgba(24,56,46,0.04)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[70px] flex items-center justify-between gap-4">
        <a href="#platform" className="shrink-0">
          <BrandWordmark subtitle="Amazon Intelligence" />
        </a>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13.5px] font-medium text-[#4F5B53] hover:text-[#18382E] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to="/overview"
            className="text-[13.5px] font-medium text-[#244B3D] hover:text-[#18382E] px-3 py-2 rounded-lg hover:bg-[#E6EDE7]/60 transition-colors"
          >
            Sign In
          </Link>
          <Link to="/overview">
            <Button size="md">
              Explore Platform
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="lg:hidden p-2 rounded-lg text-[#202923] hover:bg-[#E6EDE7]/70"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#F7F8F6] border-b border-[#E6EAE5] px-5 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#202923] hover:bg-[#E6EDE7]"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-[#E6EAE5] flex flex-col sm:flex-row gap-2.5">
            <Link to="/overview" onClick={() => setMobileOpen(false)} className="w-full">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/overview" onClick={() => setMobileOpen(false)} className="w-full">
              <Button className="w-full">
                Explore Platform
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
