import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchAllJourneys } from '@/lib/dashboard';

export default function StartNewJourneyModal({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [selectedJourney, setSelectedJourney] = useState('self-improvement-journey');
    const [customTitle, setCustomTitle] = useState('');
    const [availableJourneys, setAvailableJourneys] = useState<any[]>([]);
    useEffect(() => {
        const getJourneys = async () => {
            // Placeholder: fetch available journeys from backend (supabase)
            const journeys = await fetchAllJourneys();
            console.log('Fetched journeys222', journeys);
            setAvailableJourneys(journeys);
        };
        getJourneys();
    }, []);

    function startJourney() {
        // Placeholder: integrate with actual creation logic (supabase upsert) later
        console.log('Starting journey', selectedJourney );
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
                    <p className="text-sm text-muted-foreground mt-2">Choose a journey to begin and give it a title.</p>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label>Choose a journey</Label>
                        <div className="mt-3 space-y-3">
                            {availableJourneys.map((journey) => (
                                <button
                                    key={journey.id}
                                    type="button"
                                    onClick={() => setSelectedJourney(journey.slug)}
                                    className={`w-full flex items-center justify-between p-3 border rounded-lg text-left hover:shadow transition-shadow duration-150 ${
                                        selectedJourney === journey.slug ? 'ring-2 ring-green-400 border-green-300' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex-1 pr-4">
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
                    <Button onClick={startJourney}>Start</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}