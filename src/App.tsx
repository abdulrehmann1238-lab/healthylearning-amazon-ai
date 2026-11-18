import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { LoadingScreen } from './components/loading/LoadingScreen';
import { AppShell } from './components/layout/AppShell';
import { ToastContainer } from './components/ui/ToastContainer';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const FinancialsPage = lazy(() => import('./pages/FinancialsPage'));
const AdvertisingPage = lazy(() => import('./pages/AdvertisingPage'));
const AiAssistantPage = lazy(() => import('./pages/AiAssistantPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'));
const AutomationPage = lazy(() => import('./pages/AutomationPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const ActivityLogsPage = lazy(() => import('./pages/ActivityLogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const RouteFallback: React.FC = () => (
  <div className="min-h-[45vh] flex items-center justify-center">
    <div className="flex items-center gap-2.5 text-[13px] text-[#748078]">
      <span className="w-2 h-2 rounded-full bg-[#244B3D] animate-pulse" />
      Loading workspace module...
    </div>
  </div>
);

export const App: React.FC = () => {
  const [introDone, setIntroDone] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hl_intro_seen') === '1';
    } catch {
      return false;
    }
  });

  const handleIntroComplete = () => {
    setIntroDone(true);
    try {
      sessionStorage.setItem('hl_intro_seen', '1');
    } catch {
      // ignore
    }
  };

  return (
    <AppStateProvider>
      {!introDone && <LoadingScreen onComplete={handleIntroComplete} />}
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AppShell />}>
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/financials" element={<FinancialsPage />} />
              <Route path="/advertising" element={<AdvertisingPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/activity" element={<ActivityLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </AppStateProvider>
  );
};

export default App;
