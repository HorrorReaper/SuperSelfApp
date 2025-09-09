"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export default function JourneyStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [weight, setWeight] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const w = searchParams.get("weight") || "";
    setWeight(w);
    if (w) {
      setGoal((parseFloat(w) * 0.8).toFixed(1));
    }
  }, [searchParams]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const user = await getCurrentUser();
      if (!user) {
        setError("You must be logged in to save your journey.");
        setSaving(false);
        return;
      }
      // Check if a row already exists for this user
      const { data: existingRows, error: selectError } = await supabase
        .from("user_journey")
        .select("id")
        .eq("user_id", user.id);
      if (selectError) {
        setError(selectError.message);
        setSaving(false);
        return;
      }
      if (existingRows && existingRows.length > 0) {
        console.log("User has inputted data");
      }
      const { error: dbError } = await supabase.from("user_journey").upsert({
        user_id: user.id,
        weight: searchParams.get("weight"),
        training: searchParams.get("training"),
        eating: searchParams.get("eating"),
        sleep: searchParams.get("sleep"),
        goal,
        deadline,
      });
      if (dbError) {
        setError(dbError.message);
        setSaving(false);
        return;
      }
      router.push("/dashboard");
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setSaving(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-green-100 to-green-300">
      <div className="max-w-xl w-full mx-auto p-8 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-green-700 mb-4 text-center">Set your weight goal</h1>
        <label className="w-full font-medium text-blue-700">What is your weight goal?</label>
        <input
          className="border border-blue-200 rounded p-2 w-full mb-4"
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder={weight ? `${(parseFloat(weight) * 0.8).toFixed(1)}` : "Your goal"}
        />
        <label className="w-full font-medium text-blue-700">By when do you want to achieve your goal?</label>
        <input
          type="date"
          className="border border-blue-200 rounded p-2 w-full mb-4"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
        <button
          className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
          onClick={handleSave}
          disabled={!goal || saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
