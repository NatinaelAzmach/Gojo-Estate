import { createClient } from '@supabase/supabase-js';
import { computeAnalytics } from '@/lib/analytics';
import { Property, Profile } from '@/lib/types';
import AnalyticsCards from '@/components/admin/AnalyticsCards';
import UserGrowthChart from '@/components/admin/UserGrowthChart';

function buildTimeSeriesData(profiles: Profile[]): { date: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const profile of profiles) {
    const d = new Date(profile.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export default async function AdminAnalyticsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const [{ data: properties }, { data: profiles }] = await Promise.all([
    supabase.from('properties').select('*'),
    supabase.from('profiles').select('*'),
  ]);

  const stats = computeAnalytics(
    (properties as Property[]) ?? [],
    (profiles as Profile[]) ?? []
  );
  const timeSeriesData = buildTimeSeriesData((profiles as Profile[]) ?? []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics</h1>
      <AnalyticsCards initialStats={stats} />
      <div className="mt-6">
        <UserGrowthChart data={timeSeriesData} />
      </div>
    </div>
  );
}
