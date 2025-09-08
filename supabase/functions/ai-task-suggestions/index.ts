import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskAnalysis {
  completedTasks: number;
  pendingTasks: number;
  averageCompletionTime: number;
  mostActiveCategory: string;
  commonPriorities: string[];
  recentPatterns: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user_id and/or tasks from request body
    const { user_id, tasks: clientTasks, persist } = await req.json();
    
    if (!user_id && (!clientTasks || clientTasks.length === 0)) {
      throw new Error('Either user_id or tasks must be provided');
    }
    
    console.log('Generating AI suggestions for local user:', user_id ?? 'anonymous');
    
    let tasks: any[] = [];
    
    if (Array.isArray(clientTasks) && clientTasks.length > 0) {
      tasks = clientTasks;
    } else if (user_id) {
      // Fetch user's tasks to analyze patterns (DB)
      const { data: dbTasks, error: tasksError } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(50);
    
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }
    
      tasks = dbTasks || [];
    }


    // Analyze task patterns
    const analysis = analyzeTaskPatterns(tasks || []);
    
    // Generate AI suggestions using OpenAI
    const suggestions = await generateAISuggestions(analysis, tasks || []);

    // Optionally store suggestions in database
    if (persist && user_id) {
      const suggestionPromises = suggestions.map(suggestion => 
        supabaseClient.from('task_suggestions').insert({
          user_id: user_id,
          suggestion_type: suggestion.type,
          suggestion_text: suggestion.text,
          confidence_score: suggestion.confidence
        })
      );

      await Promise.all(suggestionPromises);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      suggestions,
      analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeTaskPatterns(tasks: any[]): TaskAnalysis {
  const completed = tasks.filter((t: any) => t.completed);
  const pending = tasks.filter((t: any) => !t.completed);
  
  // Calculate average completion time for completed tasks
  const completionTimes = completed
    .map((t: any) => {
      const createdRaw = (t.created_at ?? t.createdAt ?? null);
      const completedRaw = (t.completed_at ?? t.completedAt ?? null);
      if (!createdRaw || !completedRaw) return null;
      const created = new Date(createdRaw).getTime();
      const completedAt = new Date(completedRaw).getTime();
      if (isNaN(created) || isNaN(completedAt)) return null;
      return (completedAt - created) / (1000 * 60 * 60 * 24); // days
    })
    .filter((v: number | null): v is number => typeof v === 'number');
  
  const avgCompletionTime = completionTimes.length > 0 
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
    : 3;

  // Find most active category
  const categoryCount: Record<string, number> = {};
  tasks.forEach((t: any) => {
    const cat = t.category || 'general';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  
  const mostActiveCategory = Object.entries(categoryCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'work';

  // Common priorities
  const priorityCount: Record<string, number> = {};
  tasks.forEach((t: any) => {
    const pr = t.priority || 'medium';
    priorityCount[pr] = (priorityCount[pr] || 0) + 1;
  });
  
  const commonPriorities = Object.entries(priorityCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([priority]) => priority);

  // Recent patterns (categories from last 10 tasks)
  const recentTasks = tasks.slice(0, 10);
  const recentCategories = [...new Set(recentTasks.map((t: any) => t.category || 'general'))];

  return {
    completedTasks: completed.length,
    pendingTasks: pending.length,
    averageCompletionTime: Math.round(avgCompletionTime * 10) / 10,
    mostActiveCategory,
    commonPriorities,
    recentPatterns: recentCategories
  };
}

async function generateAISuggestions(analysis: TaskAnalysis, recentTasks: any[]) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const recentTaskTitles = recentTasks.slice(0, 10).map(t => t.title);
  const pendingTasks = recentTasks.filter(t => !t.completed).slice(0, 5);

  const prompt = `Analyze this user's productivity patterns and generate 3-4 intelligent task suggestions:

USER ANALYSIS:
- Completed tasks: ${analysis.completedTasks}
- Pending tasks: ${analysis.pendingTasks}
- Average completion time: ${analysis.averageCompletionTime} days
- Most active category: ${analysis.mostActiveCategory}
- Common priorities: ${analysis.commonPriorities.join(', ')}
- Recent categories: ${analysis.recentPatterns.join(', ')}

RECENT TASKS:
${recentTaskTitles.join('\n- ')}

CURRENT PENDING TASKS:
${pendingTasks.map(t => `${t.title} (${t.priority} priority, ${t.category})`).join('\n- ')}

Generate 3-4 actionable task suggestions that:
1. Complement their existing workflow
2. Help reduce pending tasks
3. Introduce productive habits
4. Are specific and actionable
5. Match their preferred categories and priorities

Return ONLY a JSON array of suggestions in this format:
[
  {
    "type": "productivity_optimization",
    "text": "Specific task suggestion here",
    "confidence": 0.85
  }
]

Types can be: productivity_optimization, skill_development, organization, wellness, habit_building`;

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
            content: 'You are a productivity expert AI that analyzes user patterns and provides intelligent task suggestions. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    const suggestions = JSON.parse(aiResponse);
    
    // Validate and ensure proper format
    return suggestions.map((s: any) => ({
      type: s.type || 'productivity_optimization',
      text: s.text || 'Focus on completing your pending tasks',
      confidence: s.confidence || 0.7
    }));

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback suggestions based on analysis
    return [
      {
        type: 'productivity_optimization',
        text: `Focus on completing your ${analysis.pendingTasks} pending tasks, starting with ${analysis.commonPriorities[0]} priority items`,
        confidence: 0.8
      },
      {
        type: 'organization',
        text: `Create a weekly review task for your ${analysis.mostActiveCategory} category to maintain momentum`,
        confidence: 0.75
      },
      {
        type: 'habit_building',
        text: 'Set up a daily planning session to break down complex tasks into smaller, manageable steps',
        confidence: 0.7
      }
    ];
  }
}