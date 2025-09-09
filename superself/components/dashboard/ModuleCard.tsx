import { Module } from "@/lib/dashboard";
import { useRouter } from "next/navigation";

interface ModuleCardProps {
    module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
    const router = useRouter();

    const handleLessonClick = (lessonId: string, status: string) => {
        const isCompleted = status === 'completed';
        
        // Log the lesson status for debugging or analytics
        console.log(`Lesson ${lessonId} clicked - Status: ${status}, Completed: ${isCompleted}`);
        
        // Navigate to the lesson
        router.push(`/lessons/${lessonId}`);
        
        // You can add additional logic here based on completion status
        // For example, show a different message or behavior for completed lessons
        if (isCompleted) {
            console.log("This lesson is already completed - reviewing content");
        } else {
            console.log("Starting new lesson or continuing in progress");
        }
    };
    return (
        <div className="border rounded-xl p-4 space-y-2 mt-4">
            <h2 className="text-xl font-semibold">{module.title}</h2>
            <p className="text-sm text-muted-foreground">{module.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {module.module_lessons.map((moduleLesson) => (
                    <div
                        key={moduleLesson.lesson_id}
                        onClick={() => handleLessonClick(moduleLesson.lessons.id, moduleLesson.lessons.status || 'locked')}
                        className="p-3 rounded-lg bg-muted hover:bg-muted/70 transition cursor-pointer"
                    >
                        <h3 className="text-lg font-bold">{moduleLesson.lessons.title}</h3>
                        <p className="text-sm font-light">{moduleLesson.lessons.description}</p>
                        <p className={`text-xs mt-1 ${
  moduleLesson.lessons.status === 'completed' ? 'text-green-600' :
  moduleLesson.lessons.status === 'in_progress' ? 'text-yellow-600' :
  'text-gray-400'
}`}>
  Status: {moduleLesson.lessons.status || 'locked'}
  {moduleLesson.lessons.status === 'completed' && ' ✓'}
</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
