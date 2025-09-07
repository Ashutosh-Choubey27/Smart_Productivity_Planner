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
    const { user_id, task_title, task_description } = await req.json();
    
    if (!user_id || !task_title) {
      throw new Error('user_id and task_title are required');
    }

    console.log('Breaking down task for user:', user_id, '- Task:', task_title);

    const subtasks = await generateTaskBreakdown(task_title, task_description);

    return new Response(JSON.stringify({ 
      success: true, 
      subtasks
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-breakdown:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateTaskBreakdown(taskTitle: string, taskDescription: string = '') {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Break down this task into 3-6 clear, actionable subtasks:

TASK: ${taskTitle}
${taskDescription ? `DESCRIPTION: ${taskDescription}` : ''}

Requirements:
1. Create 3-6 specific, actionable subtasks
2. Each subtask should be a complete sentence with clear action verbs
3. Order them logically (what should be done first, second, etc.)
4. Make them small enough to complete in 1-2 hours each
5. Be specific and concrete, not vague

Return ONLY a JSON array of subtask strings:
["First subtask here", "Second subtask here", "Third subtask here"]

Examples of good subtasks:
- "Research available Python tutorials online"
- "Set up development environment with VS Code"
- "Complete first 3 chapters of tutorial"
- "Build a simple calculator project"
- "Review and refactor the code"

Examples of bad subtasks:
- "Learn Python" (too vague)
- "Do research" (not specific)
- "Code stuff" (unclear)`;

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
            content: 'You are a productivity expert that breaks down complex tasks into manageable subtasks. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    const subtasks = JSON.parse(aiResponse);
    
    // Validate and ensure proper format
    return Array.isArray(subtasks) ? subtasks.filter(s => typeof s === 'string' && s.length > 0) : [];

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback subtasks based on task title
    return [
      `Research and plan approach for: ${taskTitle}`,
      `Set up necessary resources and materials`,
      `Complete the main components of: ${taskTitle}`,
      `Review and finalize the work`,
      `Document and organize results`
    ];
  }
}