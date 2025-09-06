import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

type JourneyProps = {
  title: string;
  description: string;
  continueHref: string; // where to go if user has data
  exploreHref: string;  // where to go if user has no data
};

export default function Journey({ title, description, continueHref, exploreHref }: JourneyProps) {
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
        .eq("journey",title.toLowerCase());
      if (data && data.length > 0) {
        setHasData(true);
      }
    }
    checkUserJourney();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-200 via-green-100 to-green-300 rounded-3xl shadow-xl p-8 mt-10 flex flex-col items-center text-center">
      <h1 className="text-3xl font-extrabold text-green-700 mb-2">{title}</h1>
      <p className="mb-6 text-lg text-gray-700">{description}</p>
      <Button
        variant="outline"
        className="mt-4 px-8 py-3 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform duration-200 border-none cursor-pointer"
        onClick={() => {
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
  );
}