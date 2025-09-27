import Journey from "./Journey";

export default function JourneyCard() {
  return (
    <div className="bg-gradient-to-br from-blue-200 via-green-100 to-green-300 rounded-3xl shadow-xl p-6 sm:p-8 mt-10 flex flex-col items-center text-center min-w-0">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-green-700 mb-2 truncate">Available Journeys</h1>
      <Journey
        title="30 Day Self Improvement Challenge"
        description="Become a better version of yourself with daily challenges and tips."
        continueHref="/journeys/self-improvement-journey"
        exploreHref="/journeys/self-improvement-journey/journey-intro"
      />
      <Journey
        title="Fitness"
        description="Get in shape with our personalized fitness plans and track your progress."
        continueHref="/hubs/fitness"
        exploreHref="/hubs/fitness/intro"
      />
      
    </div>
  );
}
