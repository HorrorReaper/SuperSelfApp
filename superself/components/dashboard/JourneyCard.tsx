'use client';

import { useEffect, useState } from 'react';
import Journey from './Journey';
import { fetchJourneysByUserId } from '@/lib/dashboard';

export default function JourneyCard({ userid }: { userid?: string }) {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {

        const rows = await fetchJourneysByUserId(userid);
        if (!mounted) return;
        setJourneys(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error('Failed to load journeys', err);
        if (mounted) setJourneys([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const mapContinueHref = (j: any) =>
    j?.continueHref ?? j?.continue_href ?? j?.continue_path ?? `/journeys/${j?.slug ?? 'self-improvement-journey'}`;

  const mapExploreHref = (j: any) =>
    j?.exploreHref ?? j?.explore_href ?? j?.explore_path ?? `/journeys/${j?.slug ?? 'self-improvement-journey'}/journey-intro`;

  return (
    <div className="">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-2 truncate">Available Journeys</h1>

      {loading && <div className="py-8">Loading journeys…</div>}

      {!loading && journeys.length === 0 && (
        <>
          <p className="text-muted-foreground">No journeys found. Please check back later.</p>
          <p className="text-muted-foreground">Or start a new journey!</p>
        </>
      )}

      {!loading && journeys.length > 0 && (
        <div className="w-full space-y-4">
          {journeys.map((j, idx) => (
            <Journey
              key={j.id ?? j.slug ?? idx}
              id={j.journey_id ?? j.id}
              title={j.title ?? j.journey ?? `Journey ${idx + 1}`}
              description={j.description ?? ''}
              continueHref={mapContinueHref(j)}
              exploreHref={mapExploreHref(j)}
              imageUrl={j.image_url ?? `/images/journeys/${j.slug ?? 'self-improvement-journey'}.jpg`}
              userid={userid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
