import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, task_title, task_description, task_category } = await req.json();
    
    if (!user_id || !task_title) {
      throw new Error('user_id and task_title are required');
    }

    console.log('Estimating time for user:', user_id, '- Task:', task_title);

    const estimation = await generateTimeEstimation(task_title, task_description, task_category);

    return new Response(JSON.stringify({ 
      success: true, 
      estimation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-time-estimator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateTimeEstimation(taskTitle: string, taskDescription: string = '', taskCategory: string = '') {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Estimate the time required to complete this task:

TASK: ${taskTitle}
${taskDescription ? `DESCRIPTION: ${taskDescription}` : ''}
${taskCategory ? `CATEGORY: ${taskCategory}` : ''}

Provide a realistic time estimate considering:
1. The complexity of the task
2. Typical time needed for similar tasks
3. Potential obstacles or challenges
4. Learning curve if new skills are required

Return ONLY a JSON object with this format:
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
- estimatedHours: realistic number (can be decimal)
- confidence: 0.0-1.0 based on how certain you are
- breakdown: 2-4 time allocation items
- difficulty: "Easy", "Medium", or "Hard"

Be realistic and slightly conservative with estimates to account for unexpected challenges.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a productivity expert that provides accurate time estimates for tasks. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    const estimation = JSON.parse(aiResponse);
    
    // Validate and ensure proper format
    return {
      estimatedHours: typeof estimation.estimatedHours === 'number' ? estimation.estimatedHours : 2,
      confidence: typeof estimation.confidence === 'number' ? estimation.confidence : 0.7,
      breakdown: Array.isArray(estimation.breakdown) ? estimation.breakdown : ['Planning and execution'],
      difficulty: ['Easy', 'Medium', 'Hard'].includes(estimation.difficulty) ? estimation.difficulty : 'Medium'
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback estimation based on task characteristics
    const words = taskTitle.split(' ').length;
    const hasComplexKeywords = /research|develop|build|create|design|analyze|implement|study|learn/.test(taskTitle.toLowerCase());
    
    let estimatedHours = 1.5; // Base estimate
    if (words > 5) estimatedHours += 0.5;
    if (hasComplexKeywords) estimatedHours *= 1.5;
    if (taskCategory?.toLowerCase().includes('project')) estimatedHours *= 2;
    
    return {
      estimatedHours: Math.round(estimatedHours * 2) / 2, // Round to nearest 0.5
      confidence: 0.6,
      breakdown: [
        `Planning and preparation: ${Math.round(estimatedHours * 0.2 * 2) / 2} hours`,
        `Main execution: ${Math.round(estimatedHours * 0.6 * 2) / 2} hours`,
        `Review and completion: ${Math.round(estimatedHours * 0.2 * 2) / 2} hours`
      ],
      difficulty: estimatedHours > 3 ? 'Hard' : estimatedHours > 1.5 ? 'Medium' : 'Easy'
    };
  }
}