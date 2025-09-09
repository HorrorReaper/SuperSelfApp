'use client'
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export default function JourneyIntro() {
  const [showModal, setShowModal] = useState(false);
  const [lifestyle, setLifestyle] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleStartJourney = () => {
    window.location.href = "/journey-intro/steps/step1";
  };

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
      const { error: dbError } = await supabase.from("user_journey").upsert({
        user_id: user.id,
        lifestyle,
        goal,
      });
      if (dbError) {
        setError(dbError.message);
        setSaving(false);
        return;
      }
      setShowModal(false);
      window.location.href = "/dashboard";
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-green-100 to-green-300">
      <div className="max-w-xl w-full mx-auto p-8 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center">
        <Image
          src="/globe.svg"
          alt="Journey Globe"
          width={120}
          height={120}
          className="mb-6 drop-shadow-lg"
        />
        <h1 className="text-4xl font-extrabold mb-4 text-green-700 text-center">Welcome to Your Journey!</h1>
        <p className="mb-6 text-lg text-gray-700 text-center">
          You're about to start a <span className="text-blue-600 font-semibold">personalized journey</span> designed to help you build healthy habits and reach your goals.
        </p>
        <ul className="list-disc pl-6 mb-6 text-md text-gray-800">
          <li className="mb-2">Receive <span className="text-green-600 font-medium">daily personalized habits</span> tailored to your needs.</li>
          <li className="mb-2">Track your progress and stay motivated every day.</li>
          <li className="mb-2">Get reminders and tips to help you succeed.</li>
          <li>Connect with a <span className="text-blue-600 font-medium">supportive community</span>.</li>
        </ul>
        <p className="text-md text-gray-600 mb-8 text-center">
          Ready to begin? Let's get started and make lasting changes together!
        </p>
        <button
          className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
          onClick={handleStartJourney}
        >
          Start Journey
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Tell us about yourself</h2>
            <label className="font-medium text-green-700">Describe your current lifestyle:</label>
            <textarea
              className="border border-blue-200 rounded p-2 w-full mb-2"
              rows={3}
              value={lifestyle}
              onChange={e => setLifestyle(e.target.value)}
              placeholder="e.g. I work a desk job, exercise twice a week, eat out often..."
            />
            <label className="font-medium text-green-700">What is your main goal?</label>
            <input
              className="border border-blue-200 rounded p-2 w-full mb-4"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Get fit, reduce stress, eat healthier..."
            />
            {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
            <button
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-full shadow hover:scale-105 transition-transform duration-200"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
