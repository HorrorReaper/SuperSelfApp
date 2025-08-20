interface Lesson {
    id: string;
    title: string;
    description: string;
    status: string;
}

interface ModuleLesson {
    lesson_id: string;
    lessons: Lesson;
}

interface Module {
    id: string;
    title: string;
    description: string;
    order_index: number;
    module_lessons: ModuleLesson[];
}

interface ModuleCardProps {
    module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
    return (
        <div className="border rounded-xl p-4 space-y-2 mt-4">
            <h2 className="text-xl font-semibold">{module.title}</h2>
            <p className="text-sm text-muted-foreground">{module.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {module.module_lessons.map((moduleLesson) => (
                    <a
                        key={moduleLesson.lesson_id}
                        href={`/lessons/${moduleLesson.lessons.id}`}
                        className="p-3 rounded-lg bg-muted hover:bg-muted/70 transition"
                    >
                        <h3 className="text-lg font-bold">{moduleLesson.lessons.title}</h3>
                        <p className="text-sm font-light">{moduleLesson.lessons.description}</p>
                        <p className={`text-xs mt-1 ${
  moduleLesson.lessons.status === 'completed' ? 'text-green-600' :
  moduleLesson.lessons.status === 'in_progress' ? 'text-yellow-600' :
  'text-gray-400'
}`}>
  Status: {moduleLesson.lessons.status}
</p>
                    </a>
                ))}
            </div>
        </div>
    );
}
