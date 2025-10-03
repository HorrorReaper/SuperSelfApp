import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fetchAllJourneys, fetchJourneysByUserId } from '@/lib/dashboard';
type JourneySummary = { id: string; title: string; description: string; image_url?: string; slug?: string };
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function StartNewJourneyModal({ children, userid }: { children?: React.ReactNode, userid?: string }) {
    const [open, setOpen] = useState(false);
    const [selectedJourney, setSelectedJourney] = useState('');
    const [availableJourneys, setAvailableJourneys] = useState<JourneySummary[]>([]);
    const getJourneys = useCallback(async () => {
            const journeys = await fetchAllJourneys();
            try {
                const userId = userid ?? (await getCurrentUser())?.id;
                if (!userId) {
                    setAvailableJourneys(journeys);
                    if (journeys.length) setSelectedJourney((s) => s || journeys[0].id);
                    return;
                }

                const enrolled = await fetchJourneysByUserId(userId);
                const enrolledIds = new Set(enrolled.map((e) => e.journey_id).filter(Boolean));
                const enrolledSlugs = new Set(enrolled.map((e) => e.slug).filter(Boolean));

                const filtered = (journeys || []).filter((j: JourneySummary) => !enrolledIds.has(j.id) && !enrolledSlugs.has(j.slug));
                setAvailableJourneys(filtered);
                if (filtered.length) setSelectedJourney((s) => s || filtered[0].id);
            } catch (e) {
                console.error('Failed to fetch enrolled journeys, falling back to all journeys', e);
                setAvailableJourneys(journeys);
                if (journeys.length) setSelectedJourney((s) => s || journeys[0].id);
            }
        }, [userid]);
    useEffect(() => { getJourneys(); }, [getJourneys]);

    async function startJourney() {
        // Placeholder: integrate with actual creation logic (supabase upsert) later
        const { error: dbError } = await supabase.from("user_journey").upsert({
            user_id: userid,
            journey_id: selectedJourney
        });
        if (dbError) {
            console.error('Failed to start journey', dbError);
        } else {
            console.log('Starting journey', selectedJourney);
        }
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ?? <Button>Start New Journey</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Start a new journey</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        {availableJourneys.length === 0
                            ? "You've already enrolled in all available journeys — try completing your current one or check back later for new journeys."
                            : 'Choose a journey to begin with'}
                    </p>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label>Choose a journey</Label>
                        <div className="mt-3 space-y-3">
                            {availableJourneys.map((journey) => (
                                <button
                                    key={journey.id}
                                    type="button"
                                    onClick={() => setSelectedJourney(journey.id)}
                                    className={`w-full flex items-center justify-between p-3 border rounded-lg text-left hover:shadow transition-shadow duration-150 ${
                                        selectedJourney === journey.id ? 'ring-2 ring-green-400 border-green-300' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex-1 pr-4" key={journey.id}>
                                        <div className="font-semibold">{journey.title}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{journey.description}</div>
                                    </div>
                                    <div className="flex-shrink-0 w-28 h-16 bg-gray-50 rounded overflow-hidden">
                                        {journey.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={journey.image_url} alt={journey.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)} className="mr-2">Cancel</Button>
                    <Button onClick={startJourney} disabled={!selectedJourney || availableJourneys.length === 0} className='bg-green-500 hover:bg-green-600 text-white hover:cursor-pointer'>Start</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}