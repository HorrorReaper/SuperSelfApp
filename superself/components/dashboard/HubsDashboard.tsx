"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Hub = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image?: string; // placeholder path; you can add real images under public/ later
};

const HUBS: Hub[] = [
  {
    id: "fitness",
    title: "Fitness Hub",
    tagline: "Move daily, feel stronger",
    description:
      "Short guided workouts, movement streaks and tracked sessions to build consistent habits.",
    image: "/images/hubs/fitness.jpg",

  },
  {
    id: "learning",
    title: "Learning Hub",
    tagline: "Learn something new daily",
    description:
      "Micro-lessons, spaced repetition and curated resources to keep you growing every week.",
    image: "/images/hubs/learning.jpg",

  },
  {
    id: "productivity",
    title: "Productivity Hub",
    tagline: "Ship important work",
    description:
      "Focus blocks, planning templates and accountability systems to help you do your best work.",
    image: "/images/hubs/productivity.jpg",

  },
];

export function HubsDashboard() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Hubs</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Explore focused hubs to build habits, learn consistently, and collaborate with others.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {HUBS.map((hub) => (
          <Card key={hub.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row-reverse items-stretch">
                {/* Left: content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">{hub.title}</h3>
                      <div className="text-sm text-muted-foreground mt-1">{hub.tagline}</div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {hub.id.charAt(0).toUpperCase() + hub.id.slice(1)}
                    </Badge>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground">{hub.description}</div>

                  <div className="mt-4">
                    <Separator />
                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <div className="flex gap-2">
                      <Link href={`/hubs/${hub.id}`} passHref>
                        <Button asChild size="sm">
                          <a aria-label={`Open ${hub.title}`}>Open</a>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right: image (appears above content on mobile due to DOM order + flex-col) */}
                <div className="w-full md:w-48 lg:w-56 bg-slate-50 relative h-40 md:h-48 overflow-hidden">
                  {hub.image ? (
                    <Image
                      src={hub.image}
                      alt={hub.title + " image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 12rem"
                      priority={false}
                    />
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">Image placeholder</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HubsDashboard;