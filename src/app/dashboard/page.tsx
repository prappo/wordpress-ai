"use client";

import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { DashboardLoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading time to ensure smooth transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardLoadingScreen />;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Dashboard'} />
      <DashboardLandingPage />
    </main>
  );
}
