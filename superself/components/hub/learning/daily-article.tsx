import { getBriefForDay } from "@/lib/brief";
import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";

export default function DailyArticle({ day }: { day?: number }) {
  const d = day ?? 1;
  const brief = getBriefForDay(d, "overall improvement");

  if (!brief) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Article</CardTitle>
          <CardDescription>No article available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
    <h1 className="text-2xl font-bold mb-4">Daily Article</h1>
    <Card>
      <CardHeader>
        <CardTitle>{brief.title}</CardTitle>
        <CardDescription>{brief.tldr}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p>{brief.longcontent}</p>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
