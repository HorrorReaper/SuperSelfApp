"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JourneyStep1() {
  const [weight, setWeight] = useState("");
  const [training, setTraining] = useState("");
  const [eating, setEating] = useState("");
  const [sleep, setSleep] = useState("");
  const router = useRouter();

  const handleNext = () => {
    // Pass data via query params
    router.push(`/journey-intro/steps/step2?weight=${weight}&training=${training}&eating=${eating}&sleep=${sleep}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-green-100 to-green-300">
      <div className="max-w-xl w-full mx-auto p-8 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-green-700 mb-4 text-center">Tell us about your current lifestyle</h1>
        <label className="w-full font-medium text-blue-700">How much do you weigh? (kg)</label>
        <input
          type="number"
          className="border border-blue-200 rounded p-2 w-full mb-2"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="e.g. 80"
        />
        <label className="w-full font-medium text-blue-700">How often do you train per week?</label>
        <input
          type="number"
          className="border border-blue-200 rounded p-2 w-full mb-2"
          value={training}
          onChange={e => setTraining(e.target.value)}
          placeholder="e.g. 3"
        />
        <label className="w-full font-medium text-blue-700">How much do you eat? (calories/day)</label>
        <input
          type="number"
          className="border border-blue-200 rounded p-2 w-full mb-2"
          value={eating}
          onChange={e => setEating(e.target.value)}
          placeholder="e.g. 2500"
        />
        <label className="w-full font-medium text-blue-700">How much do you sleep? (hours/night)</label>
        <input
          type="number"
          className="border border-blue-200 rounded p-2 w-full mb-4"
          value={sleep}
          onChange={e => setSleep(e.target.value)}
          placeholder="e.g. 7"
        />
        <button
          className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
          onClick={handleNext}
          disabled={!weight || !training || !eating || !sleep}
        >
          Next
        </button>
      </div>
    </div>
  );
}
