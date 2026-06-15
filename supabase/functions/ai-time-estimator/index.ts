import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TimeEstimation {
  estimatedHours: number;
  confidence: number;
  breakdown: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, task_title, task_description, task_category } =
      await req.json();

    if (!user_id || !task_title) {
      throw new Error("user_id and task_title are required");
    }

    console.log("Estimating time for user:", user_id, "- Task:", task_title);

    const estimation = await generateTimeEstimation(
      task_title,
      task_description,
      task_category
    );

    return new Response(
      JSON.stringify({
        success: true,
        estimation,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Error in ai-time-estimator:", message);

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

async function generateTimeEstimation(
  taskTitle: string,
  taskDescription: string = "",
  taskCategory: string = ""
): Promise<TimeEstimation> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured, using fallback estimation");
    return generateFallbackEstimation(taskTitle, taskCategory);
  }

  const prompt = `Estimate the time required to complete this task.

TASK: ${taskTitle}
${taskDescription ? `DESCRIPTION: ${taskDescription}` : ""}
${taskCategory ? `CATEGORY: ${taskCategory}` : ""}

Provide a realistic time estimate considering:
1. The complexity of the task
2. Typical time needed for similar tasks
3. Potential obstacles or challenges
4. Learning curve if new skills are required

Return ONLY a valid JSON object with this exact format:
{
  "estimatedHours": 2.5,
  "confidence": 0.85,
  "breakdown": [
    "Research and planning: 0.5 hours",
    "Main work execution: 1.5 hours",
    "Review and refinement: 0.5 hours"
  ],
  "difficulty": "Medium"
}

Guidelines:
- estimatedHours: realistic number, can be decimal
- confidence: number between 0.0 and 1.0
- breakdown: 2-4 time allocation items
- difficulty: "Easy", "Medium", or "Hard"
- Be realistic and slightly conservative
- Return valid JSON only, no markdown`;

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
            temperature: 0.4,
            maxOutputTokens: 900,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errorText);
      return generateFallbackEstimation(taskTitle, taskCategory);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error("No response text from Gemini");
      return generateFallbackEstimation(taskTitle, taskCategory);
    }

    const cleanedText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("No JSON object found in Gemini response");
      return generateFallbackEstimation(taskTitle, taskCategory);
    }

    const estimation = JSON.parse(jsonMatch[0]);

    const estimatedHours =
      typeof estimation.estimatedHours === "number"
        ? estimation.estimatedHours
        : 2;

    const confidence =
      typeof estimation.confidence === "number" ? estimation.confidence : 0.7;

    const breakdown = Array.isArray(estimation.breakdown)
      ? estimation.breakdown.filter(
          (item: unknown) => typeof item === "string" && item.trim().length > 0
        )
      : ["Planning and execution"];

    const difficulty = ["Easy", "Medium", "Hard"].includes(
      estimation.difficulty
    )
      ? estimation.difficulty
      : "Medium";

    return {
      estimatedHours,
      confidence,
      breakdown: breakdown.length > 0 ? breakdown.slice(0, 4) : ["Planning and execution"],
      difficulty,
    };
  } catch (error) {
    console.error("Gemini time estimation error:", error);
    return generateFallbackEstimation(taskTitle, taskCategory);
  }
}

function generateFallbackEstimation(
  taskTitle: string,
  taskCategory: string = ""
): TimeEstimation {
  const words = taskTitle.split(" ").length;

  const hasComplexKeywords =
    /research|develop|build|create|design|analyze|implement|study|learn|prepare|debug|deploy|write|practice/i.test(
      taskTitle
    );

  let estimatedHours = 1.5;

  if (words > 5) estimatedHours += 0.5;
  if (hasComplexKeywords) estimatedHours *= 1.5;
  if (taskCategory?.toLowerCase().includes("project")) estimatedHours *= 2;
  if (taskCategory?.toLowerCase().includes("interview")) estimatedHours *= 1.4;
  if (taskCategory?.toLowerCase().includes("exam")) estimatedHours *= 1.6;

  estimatedHours = Math.round(estimatedHours * 2) / 2;

  return {
    estimatedHours,
    confidence: 0.6,
    breakdown: [
      `Planning and preparation: ${Math.round(estimatedHours * 0.2 * 2) / 2} hours`,
      `Main execution: ${Math.round(estimatedHours * 0.6 * 2) / 2} hours`,
      `Review and completion: ${Math.round(estimatedHours * 0.2 * 2) / 2} hours`,
    ],
    difficulty:
      estimatedHours > 3 ? "Hard" : estimatedHours > 1.5 ? "Medium" : "Easy",
  };
}