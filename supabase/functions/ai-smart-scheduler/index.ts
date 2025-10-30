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
    const { user_id, tasks } = await req.json();
    
    if (!user_id || !tasks || !Array.isArray(tasks)) {
      throw new Error('user_id and tasks array are required');
    }

    console.log('Generating smart schedule for user:', user_id, '- Tasks:', tasks.length);

    const schedule = await generateSmartSchedule(tasks);

    return new Response(JSON.stringify({ 
      success: true, 
      schedule
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-smart-scheduler:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSmartSchedule(tasks: any[]) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const taskList = tasks.map((task, index) => 
    `${index + 1}. ${task.title} (${task.priority} priority, ${task.category}, ${task.dueDate ? 'Due: ' + new Date(task.dueDate).toLocaleDateString() : 'No due date'})`
  ).join('\n');

  const prompt = `Create an optimized daily schedule for these tasks:

TASKS TO SCHEDULE:
${taskList}

Create a smart schedule considering:
1. Priority levels (high priority tasks should be scheduled earlier)
2. Due dates (urgent tasks should be prioritized)  
3. Energy levels (complex tasks in morning, easier tasks later)
4. Time blocking (group similar tasks together)
5. Realistic time estimates

Assume an 8-hour work day from 9:00 AM to 5:00 PM.

Return ONLY a JSON array with this exact format:
[
  {
    "task": "Task title here",
    "startTime": "9:00 AM",
    "duration": 2,
    "priority": "high",
    "reasoning": "Brief explanation why scheduled at this time"
  }
]

Guidelines:
- startTime: Use 12-hour format (e.g., "9:00 AM", "2:30 PM")
- duration: Hours as number (can be decimal like 1.5)
- Schedule high-priority tasks in the morning when energy is high
- Group similar tasks together for better focus
- Leave buffer time between complex tasks
- Don't exceed 8 total hours
- Provide clear reasoning for timing decisions`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const schedule = JSON.parse(jsonMatch[0]);
      if (Array.isArray(schedule)) {
        return schedule.filter(item => 
          item.task && item.startTime && typeof item.duration === 'number'
        );
      }
    }

    throw new Error('Invalid response format');

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback schedule based on priority and order
    return tasks.slice(0, 6).map((task, index) => {
      const startTimes = ['9:00 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM', '4:45 PM'];
      const durations = [2, 1.5, 1, 1.5, 1, 0.75];
      
      return {
        task: task.title,
        startTime: startTimes[index] || '9:00 AM',
        duration: durations[index] || 1,
        priority: task.priority,
        reasoning: `Scheduled based on ${task.priority} priority and task order`
      };
    });
  }
}
