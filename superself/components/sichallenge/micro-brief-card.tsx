"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  tldr: string;
  content: string;
  actionLabel: string;
  onAction: () => void;
  onSkip?: () => void;
};

export function MicroBriefCard({ title, tldr, content, actionLabel, onAction, onSkip }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-sm">{tldr}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{content}</p>
        <div className="flex gap-2">
          <Button onClick={onAction}>{actionLabel}</Button>
          <Button variant="ghost" onClick={onSkip}>
            TL;DR, do action
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
