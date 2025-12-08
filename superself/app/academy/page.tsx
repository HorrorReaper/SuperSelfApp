import Link from "next/link";
import Image from "next/image";

type Skill = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  image?: string;
};

const skills: Skill[] = [
  {
    id: "1",
    slug: "founder",
    title: "Founder Skill Path",
    description: "Master the essential skills needed to build and launch your startup",
    icon: "🚀",
    difficulty: "intermediate",
    image: "/images/founder.jpg",
  },
  {
    id: "2",
    slug: "product-thinking",
    title: "Product Thinking",
    description: "Learn how to think like a product person and build products users love",
    icon: "🎯",
    difficulty: "intermediate",
    image: "/images/product.jpg",
  },
  {
    id: "3",
    slug: "communication",
    title: "Communication Mastery",
    description: "Improve your communication skills for better leadership and influence",
    icon: "💬",
    difficulty: "beginner",
    image: "/images/communication.jpg",
  },
  {
    id: "4",
    slug: "data-literacy",
    title: "Data Literacy",
    description: "Understand data and make informed decisions using analytics",
    icon: "📊",
    difficulty: "advanced",
    image: "/images/data.jpg",
  },
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-2 mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Academy</h1>
          <p className="text-lg text-slate-600">
            Choose a skill path and start your learning journey today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-purple-100 text-purple-800",
  };

  return (
    <Link href={`/academy/${skill.slug}`}>
      <div className="h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 overflow-hidden group">
        {skill.image && (
          <div className="relative w-full h-48 overflow-hidden bg-slate-200">
            <Image
              src={skill.image}
              alt={skill.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="text-4xl">{skill.icon}</div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[skill.difficulty]}`}>
              {skill.difficulty.charAt(0).toUpperCase() + skill.difficulty.slice(1)}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900 group-hover:text-primary transition-colors">
              {skill.title}
            </h2>
            <p className="text-sm text-slate-600">
              {skill.description}
            </p>
          </div>

          <div className="flex items-center gap-2 text-primary font-medium text-sm pt-4">
            Start Learning
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}