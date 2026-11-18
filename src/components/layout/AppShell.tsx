import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppState } from '../../context/AppStateContext';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useAppState();

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#202923] flex">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-[250px]">
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] w-full mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>

          {settings.includeIllustrativeDisclosure && (
            <footer className="mt-10 pt-4 border-t border-[#E6EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11.5px] text-[#748078]">
              <span>
                {settings.businessName} · Amazon Business Intelligence & AI Operations (Interactive Frontend Demonstration)
              </span>
              <span>
                All figures, purchase orders, campaigns, and AI insights are illustrative mock data.
              </span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};
