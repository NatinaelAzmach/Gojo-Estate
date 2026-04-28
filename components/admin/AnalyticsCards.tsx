'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { computeAnalytics } from '@/lib/analytics';
import { Property, Profile } from '@/lib/types';

interface Stats {
  totalRevenue: number;
  activeListings: number;
  totalUsers: number;
}

export default function AnalyticsCards({ initialStats }: { initialStats: Stats }) {
  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    const interval = setInterval(async () => {
      const supabase = createBrowserClient();
      const [{ data: properties }, { data: profiles }] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('profiles').select('*'),
      ]);
      if (properties && profiles) {
        setStats(computeAnalytics(properties as Property[], profiles as Profile[]));
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      bg: 'bg-teal-500',
    },
    {
      label: 'Active Listings',
      value: stats.activeListings.toLocaleString(),
      bg: 'bg-[#0f1f3d]',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      bg: 'bg-teal-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {cards.map(({ label, value, bg }) => (
        <div key={label} className={`${bg} text-white rounded-xl p-6 shadow-md`}>
          <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
