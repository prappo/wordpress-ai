"use client";

import { DashboardUsageCardGroup } from '@/components/dashboard/landing/components/dashboard-usage-card-group';

export function DashboardLandingPage() {
  return (
    <div className={'grid flex-1 items-start gap-6 p-0 md:grid-cols-1 lg:grid-cols-2'}>
      <div className={'grid auto-rows-max items-start gap-6'}>
        <DashboardUsageCardGroup />
      </div>
    </div>
  );
}
