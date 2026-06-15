import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskAnalysis {
  completedTasks: number;
  pendingTasks: number;
  averageCompletionTime: number;
  mostActiveCategory: string;
  commonPriorities: string[];
  recentPatterns: string[];
}

interface Suggestion {
  type: string;
  text: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { user_id, tasks: clientTasks, persist } = await req.json();

    if (!user_id && (!clientTasks || clientTasks.length === 0)) {
      throw new Error("Either user_id or tasks must be provided");
    }

    console.log("Generating AI suggestions for user:", user_id ?? "anonymous");

    let tasks: any[] = [];

    if (Array.isArray(clientTasks) && clientTasks.length > 0) {
      tasks = clientTasks;
    } else if (user_id) {
      const { data: dbTasks, error: tasksError } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }

      tasks = dbTasks || [];
    }

    const analysis = analyzeTaskPatterns(tasks);
    const suggestions = await generateAISuggestions(analysis, tasks);

    if (persist && user_id) {
      const suggestionPromises = suggestions.map((suggestion) =>
        supabaseClient.from("task_suggestions").insert({
          user_id,
          suggestion_type: suggestion.type,
          suggestion_text: suggestion.text,
          confidence_score: suggestion.confidence,
        })
      );

      await Promise.all(suggestionPromises);
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        analysis,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Error in ai-task-suggestions:", message);

    return new Response(
      JSON.stringify({
        error: message,
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function analyzeTaskPatterns(tasks: any[]): TaskAnalysis {
  const completed = tasks.filter((task) => task.completed);
  const pending = tasks.filter((task) => !task.completed);

  const completionTimes = completed
    .map((task) => {
      const createdRaw = task.created_at ?? task.createdAt ?? null;
      const completedRaw = task.completed_at ?? task.completedAt ?? null;

      if (!createdRaw || !completedRaw) return null;

      const created = new Date(createdRaw).getTime();
      const completedAt = new Date(completedRaw).getTime();

      if (isNaN(created) || isNaN(completedAt)) return null;

      return (completedAt - created) / (1000 * 60 * 60 * 24);
    })
    .filter((value): value is number => typeof value === "number");

  const averageCompletionTime =
    completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 3;

  const categoryCount: Record<string, number> = {};

  tasks.forEach((task) => {
    const category = task.category || "general";
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const mostActiveCategory =
    Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "general";

  const priorityCount: Record<string, number> = {};

  tasks.forEach((task) => {
    const priority = task.priority || "medium";
    priorityCount[priority] = (priorityCount[priority] || 0) + 1;
  });

  const commonPriorities = Object.entries(priorityCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([priority]) => priority);

  const recentTasks = tasks.slice(0, 10);

  const recentCategories = [
    ...new Set(recentTasks.map((task) => task.category || "general")),
  ];

  return {
    completedTasks: completed.length,
    pendingTasks: pending.length,
    averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
    mostActiveCategory,
    commonPriorities,
    recentPatterns: recentCategories,
  };
}

async function generateAISuggestions(
  analysis: TaskAnalysis,
  recentTasks: any[]
): Promise<Suggestion[]> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured, using fallback suggestions");
    return generateFallbackSuggestions(analysis);
  }

  const recentTaskTitles = recentTasks
    .slice(0, 10)
    .map((task) => task.title)
    .filter(Boolean);

  const pendingTasks = recentTasks.filter((task) => !task.completed).slice(0, 5);

  const prompt = `Analyze this user's productivity patterns and generate 3-4 intelligent task suggestions.

USER ANALYSIS:
- Completed tasks: ${analysis.completedTasks}
- Pending tasks: ${analysis.pendingTasks}
- Average completion time: ${analysis.averageCompletionTime} days
- Most active category: ${analysis.mostActiveCategory}
- Common priorities: ${analysis.commonPriorities.join(", ") || "medium"}
- Recent categories: ${analysis.recentPatterns.join(", ") || "general"}

RECENT TASKS:
${recentTaskTitles.length > 0 ? recentTaskTitles.map((title) => `- ${title}`).join("\n") : "- No recent task titles available"}

CURRENT PENDING TASKS:
${
  pendingTasks.length > 0
    ? pendingTasks
        .map(
          (task) =>
            `- ${task.title} (${task.priority || "medium"} priority, ${
              task.category || "general"
            })`
        )
        .join("\n")
    : "- No pending tasks available"
}

Generate 3-4 actionable suggestions that:
1. Complement the user's existing workflow
2. Help reduce pending tasks
3. Introduce productive habits
4. Are specific and actionable
5. Match the user's categories and priorities

Return ONLY a valid JSON array with this exact format:
[
  {
    "type": "productivity_optimization",
    "text": "Specific task suggestion here",
    "confidence": 0.85
  }
]

Allowed types:
productivity_optimization, skill_development, organization, wellness, habit_building`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errorText);
      return generateFallbackSuggestions(analysis);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error("No response text from Gemini");
      return generateFallbackSuggestions(analysis);
    }

    const cleanedText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.error("No JSON array found in Gemini response");
      return generateFallbackSuggestions(analysis);
    }

    const parsedSuggestions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsedSuggestions)) {
      return generateFallbackSuggestions(analysis);
    }

    const suggestions = parsedSuggestions
      .filter((suggestion) => suggestion && typeof suggestion === "object")
      .map((suggestion) => ({
        type:
          typeof suggestion.type === "string"
            ? suggestion.type
            : "productivity_optimization",
        text:
          typeof suggestion.text === "string"
            ? suggestion.text
            : "Focus on completing your pending tasks with better prioritization",
        confidence:
          typeof suggestion.confidence === "number"
            ? suggestion.confidence
            : 0.7,
      }))
      .filter((suggestion) => suggestion.text.trim().length > 0);

    return suggestions.length > 0
      ? suggestions.slice(0, 4)
      : generateFallbackSuggestions(analysis);
  } catch (error) {
    console.error("Gemini suggestion generation error:", error);
    return generateFallbackSuggestions(analysis);
  }
}

function generateFallbackSuggestions(analysis: TaskAnalysis): Suggestion[] {
  const priority = analysis.commonPriorities[0] || "medium";
  const category = analysis.mostActiveCategory || "general";

  return [
    {
      type: "productivity_optimization",
      text: `Focus on completing your ${analysis.pendingTasks} pending tasks, starting with ${priority} priority items.`,
      confidence: 0.8,
    },
    {
      type: "organization",
      text: `Create a weekly review task for your ${category} category to maintain consistent progress.`,
      confidence: 0.75,
    },
    {
      type: "habit_building",
      text: "Set up a daily planning session to break down complex tasks into smaller milestones.",
      confidence: 0.72,
    },
    {
      type: "wellness",
      text: "Add short focus breaks between demanding tasks to maintain energy and reduce burnout.",
      confidence: 0.68,
    },
  ];
}