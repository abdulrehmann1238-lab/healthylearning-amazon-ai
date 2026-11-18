import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { MetricsAndCapabilities } from '../components/landing/MetricsAndCapabilities';
import { AiShowcaseSection } from '../components/landing/AiShowcaseSection';
import { AutomationSecurityArchitecture } from '../components/landing/AutomationSecurityArchitecture';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#202923]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <MetricsAndCapabilities />
        <AiShowcaseSection />
        <AutomationSecurityArchitecture />
      </main>
    </div>
  );
};

export default LandingPage;
