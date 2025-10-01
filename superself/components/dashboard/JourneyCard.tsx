'use client';

import { useEffect, useState } from 'react';
import Journey from './Journey';
import { getCurrentUser } from '@/lib/auth';
import { fetchJourneysByUserId } from '@/lib/dashboard';

export default function JourneyCard() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          window.location.href = '/auth/sign-in';
          return;
        }
        const rows = await fetchJourneysByUserId(user.id);
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
          <Journey
            title="30 Day Self Improvement Challenge"
            description="Become a better version of yourself with daily challenges and tips."
            continueHref="/journeys/self-improvement-journey"
            exploreHref="/journeys/self-improvement-journey/journey-intro"
          />
          <Journey
            title="Fitness"
            description="Get in shape with our personalized fitness plans and track your progress."
            continueHref="/hubs/fitness"
            exploreHref="/hubs/fitness/intro"
          />
        </>
      )}

      {!loading && journeys.length > 0 && (
        <div className="w-full space-y-4">
          {journeys.map((j, idx) => (
            <Journey
              key={j.id ?? j.slug ?? idx}
              title={j.journey ?? j.name ?? `Journey ${idx + 1}`}
              description={j.description ?? ''}
              continueHref={mapContinueHref(j)}
              exploreHref={mapExploreHref(j)}
              imageUrl={j.image_url ?? `/images/journeys/${j.slug ?? 'self-improvement-journey'}.jpg`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
