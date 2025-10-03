'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export default function FitnessJourneyPage(_props?: unknown) {
  const [startWeight, setStartWeight] = useState<number | null>(null);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [deadline, setDeadline] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJourney() {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_journey")
        .select("weight, goal, deadline")
        .eq("user_id", user.id)
        .single();
      if (data) {
        console.log("Fetched journey data:", data);
        setStartWeight(Number(data.weight));
        setGoalWeight(Number(data.goal));
        setDeadline(data.deadline);
        setCurrentWeight(Number(data.weight)); // Default to start weight
        // Calculate progress
        {/*if (data.weight && data.goal) {
          const total = Math.abs(Number(data.weight) - Number(data.goal));
          const done = Math.abs(Number(data.weight) - Number(data.goal)); // Initially 0 progress
          setProgress(0);
        }*/}
      }else{
        console.log("No journey data found");
      }
      setLoading(false);
    }
    fetchJourney();
  }, []);

  // Handler to update current weight
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCurrentWeight(value);
    if (startWeight !== null && goalWeight !== null) {
      const total = Math.abs(startWeight - goalWeight);
      const done = Math.abs(startWeight - value);
      setProgress(Math.min(100, Math.round((done / total) * 100)));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-green-300 p-8">
      <div className="max-w-xl w-full bg-white/90 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-green-700 mb-4 text-center">Your Fitness Journey</h1>
        <p className="mb-4 text-lg text-gray-700 text-center">Track your progress and stay motivated!</p>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="w-full mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-blue-700">Start: {startWeight} kg</span>
                <span className="font-bold text-green-700">Goal: {goalWeight} kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center mt-2 font-bold text-lg text-green-700">{progress}% completed</div>
            </div>
            <div className="w-full mb-6">
              <label className="block font-medium text-blue-700 mb-2">Update your current weight:</label>
              <input
                type="number"
                className="border border-blue-200 rounded p-2 w-full mb-2"
                value={currentWeight ?? ""}
                onChange={handleWeightChange}
                min={goalWeight ?? 0}
                max={startWeight ?? 999}
              />
            </div>
            <div className="w-full mb-6">
              <label className="block font-medium text-blue-700 mb-2">Deadline to reach your goal:</label>
              <div className="font-bold text-green-700">{deadline ? new Date(deadline).toLocaleDateString() : "No deadline set"}</div>
            </div>
            <div className="w-full mb-6">
              <h2 className="text-xl font-bold text-blue-700 mb-2">Tips for Success</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Stay consistent with your training.</li>
                <li>Eat balanced meals and track your nutrition.</li>
                <li>Get enough sleep for recovery.</li>
                <li>Celebrate small wins along the way!</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
