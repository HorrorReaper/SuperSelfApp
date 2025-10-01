import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

type JourneyProps = {
  title: string;
  description: string;
  continueHref: string; // where to go if user has data
  exploreHref: string;  // where to go if user has no data
  imageUrl?: string;
};

export default function Journey({ title, description, continueHref, exploreHref, imageUrl }: JourneyProps) {
  const [hasData, setHasData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUserJourney() {
      const user = await getCurrentUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_journey")
        .select("id")
        .eq("user_id", user.id)
        .eq("journey",title);
      if (data && data.length > 0) {
        setHasData(true);
      }
    }
    checkUserJourney();
  }, []);

  return (
    <div className="">
      
      <Card className="overflow-hidden px-4 py-2">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground text-balance">
                  {description}
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="mt-4 px-8 py-3 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform duration-200 border-none cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasData) {
                    router.push(continueHref);
                  } else {
                    router.push(exploreHref);
                  }
                }}
              >
                {hasData ? "Continue" : "Explore Journey"}
              </Button>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src={imageUrl}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}