import { supabase } from "@/lib/supabase";

export interface Lesson {
    id: string;
    title: string;
    description: string;
    status?: string;
}

export interface ModuleLesson {
    lesson_id: string;
    lessons: Lesson;
}

export interface Module {
    id: string;
    title: string;
    description: string;
    order_index: number;
    module_lessons: ModuleLesson[];
}

export interface Progress {
    lesson_id: string;
    status: string;
}

/**
 * Fetches all modules with their lessons from the database
 */
export async function fetchModules(): Promise<Module[]> {
    const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`id, title, description, order_index, module_lessons(lesson_id, lessons(id, title, description))`)
        .order('order_index');

    if (modulesError) {
        console.error("Error fetching modules:", modulesError);
        throw new Error(`Failed to fetch modules: ${modulesError.message}`);
    }

    // Convert raw data to typed data with proper type assertion
    const typedModules: Module[] = (modulesData || []).map((module: any) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order_index: module.order_index,
        module_lessons: module.module_lessons.map((ml: any) => ({
            lesson_id: ml.lesson_id,
            lessons: {
                id: ml.lessons.id,
                title: ml.lessons.title,
                description: ml.lessons.description
            }
        }))
    }));

    return typedModules;
}

/**
 * Fetches user progress for all lessons
 */
export async function fetchUserProgress(userId: string): Promise<Progress[]> {
    const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select('lesson_id, status')
        .eq('user_id', userId);

    if (progressError) {
        console.error("Error fetching progress:", progressError);
        throw new Error(`Failed to fetch user progress: ${progressError.message}`);
    }

    return progress || [];
}

/**
 * Combines modules with user progress to create enriched modules
 */
export function enrichModulesWithProgress(modules: Module[], progress: Progress[]): Module[] {
    const progressMap = new Map(progress.map(p => [p.lesson_id, p.status]));

    return modules.map(module => ({
        ...module,
        module_lessons: module.module_lessons.map(ml => ({
            ...ml,
            lessons: {
                ...ml.lessons,
                status: progressMap.get(ml.lesson_id) || 'locked'
            }
        }))
    }));
}

/**
 * Fetches modules with enriched progress data for a specific user
 */
export async function fetchModulesWithProgress(userId: string): Promise<Module[]> {
    try {
        const [modules, progress] = await Promise.all([
            fetchModules(),
            fetchUserProgress(userId)
        ]);

        return enrichModulesWithProgress(modules, progress);
    } catch (error) {
        console.error("Error fetching modules with progress:", error);
        throw error;
    }
}

export async function fetchJourneysByUserId(userId: string): Promise<{ id: string; journey: string; description: string }[]> {
    const { data: journeys, error: journeysError } = await supabase
        .from('user_journey')
        .select('id, journey, description, image_url')
        .eq('user_id', userId);

    if (journeysError) {
        console.error("Error fetching journeys:", journeysError);
        throw new Error(`Failed to fetch journeys: ${journeysError.message}`);
    }
    console.log("Fetched journeys:", journeys);

    return (journeys || []).map(j => ({
        id: j.id,
        journey: j.journey,
        description: j.description,
        image_url: j.image_url
    }));
}
export async function fetchAllJourneys(): Promise<{ id: string; title: string; description: string; slug: string;  image_url: string }[]> {
    const { data: journeys, error: journeysError } = await supabase
        .from('journeys')
        .select('id, title, description, slug,  image_url');

    if (journeysError) {
        console.error("Error fetching all journeys:", journeysError);
        throw new Error(`Failed to fetch all journeys: ${journeysError.message}`);
    }

    return (journeys || []).map(j => ({
        id: j.id,
        title: j.title,
        description: j.description,
        slug: j.slug,
        image_url: j.image_url
    }));
}