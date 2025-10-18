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

  const prompt = `You are an AI-powered smart productivity planning assistant for students.
Your goal is to analyze a given main task and generate practical, context-specific subtasks that help complete it efficiently.

TASK TO ANALYZE:
Title: "${taskTitle}"
${taskDescription ? `Description: "${taskDescription}"` : ''}

CRITICAL INSTRUCTIONS:
1. Understand what the main task is trying to achieve
2. Break it into 3–7 meaningful subtasks (depending on complexity)
3. AVOID vague or generic steps like "Plan your work", "Do the task", "Set up resources", "Review and finalize"
4. Each subtask MUST be action-oriented, starting with a VERB (Research, Review, Write, Debug, Test, Revise, Summarize, Create, Implement, Analyze, Practice, Study, Build, etc.)
5. For STUDYING tasks: include smart learning steps (revision, testing, note summarization, practice problems, flashcards)
6. For TECHNICAL tasks (coding, projects): include setup, development, testing, and documentation subtasks
7. Keep each subtask short (max 12–15 words)
8. Subtasks should be ordered logically to complete the main task

EXAMPLES OF EXCELLENT SUBTASKS:

Task: "Learn React Hooks"
✅ PERFECT:
["Read official React Hooks documentation and key concepts", "Watch tutorial video on useState and useEffect", "Build simple counter app using useState", "Create todo list with useEffect for persistence", "Practice useContext for state management", "Review and refactor code for best practices"]

Task: "Prepare for Physics Exam on Thermodynamics"
✅ PERFECT:
["Review lecture notes on laws of thermodynamics", "Solve 10 numerical problems from textbook chapter 8", "Create summary sheet of key formulas and concepts", "Watch explanation videos on entropy and enthalpy", "Take practice test and identify weak areas", "Revise difficult topics and clarify doubts"]

Task: "Build GitHub Profile README"
✅ PERFECT:
["Research best GitHub profile README examples", "Write introduction and skills section", "Add project showcase with descriptions and links", "Create visual elements using shields and stats", "Test README rendering on GitHub", "Proofread and publish final version"]

❌ NEVER DO THIS:
["Research and plan approach", "Set up necessary resources", "Complete the main components", "Review and finalize", "Document results"]

Return ONLY a valid JSON array of strings with NO markdown formatting:
["First specific subtask", "Second specific subtask", "Third specific subtask"]`;

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
    
    // Smarter fallback: Create context-aware subtasks based on task patterns
    return generateSmartFallbackSubtasks(taskTitle, taskDescription);
  }
}

function generateSmartFallbackSubtasks(taskTitle: string, taskDescription: string = ''): string[] {
  const lowerTitle = taskTitle.toLowerCase();
  const lowerDesc = taskDescription.toLowerCase();
  
  // Pattern matching for common task types
  
  // Learning/Study tasks
  if (lowerTitle.includes('learn') || lowerTitle.includes('study') || lowerTitle.includes('words') || lowerTitle.includes('vocab')) {
    if (lowerTitle.includes('word') || lowerTitle.includes('vocab')) {
      return [
        `Identify and select the specific words to learn`,
        `Create flashcards or a study document`,
        `Practice and memorize in small batches`,
        `Test yourself on the learned material`,
        `Review and reinforce weak areas`
      ];
    }
    return [
      `Gather study materials and resources`,
      `Break down the content into manageable sections`,
      `Study and take notes on each section`,
      `Practice with exercises or examples`,
      `Review and test your understanding`
    ];
  }
  
  // GitHub/Upload/Document tasks
  if (lowerTitle.includes('upload') || lowerTitle.includes('github') || lowerTitle.includes('repository') || 
      lowerDesc.includes('ppt') || lowerDesc.includes('synopsis')) {
    return [
      `Create or access the GitHub repository`,
      `Organize and prepare documents for upload`,
      `Write descriptive README or documentation`,
      `Upload files using Git or web interface`,
      `Verify uploads and add proper descriptions`
    ];
  }
  
  // Assignment/Homework tasks
  if (lowerTitle.includes('assignment') || lowerTitle.includes('homework') || lowerTitle.includes('submit')) {
    return [
      `Read and understand all requirements`,
      `Research necessary information or topics`,
      `Create an outline or plan`,
      `Complete the main work`,
      `Review, proofread, and submit`
    ];
  }
  
  // Exam/Test preparation
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('quiz')) {
    return [
      `Review syllabus and identify key topics`,
      `Gather notes and study materials`,
      `Create summary sheets or flashcards`,
      `Practice with past papers or questions`,
      `Take mock tests and review mistakes`
    ];
  }
  
  // Project tasks
  if (lowerTitle.includes('project') || lowerTitle.includes('build') || lowerTitle.includes('create')) {
    return [
      `Define project scope and requirements`,
      `Plan the structure and approach`,
      `Implement core functionality`,
      `Test and refine the solution`,
      `Document and finalize deliverables`
    ];
  }
  
  // Reading tasks
  if (lowerTitle.includes('read') || lowerTitle.includes('book') || lowerTitle.includes('chapter')) {
    return [
      `Prepare reading materials and notes`,
      `Read and highlight key points`,
      `Summarize main concepts`,
      `Note down questions or insights`,
      `Review and reflect on the content`
    ];
  }
  
  // Writing tasks
  if (lowerTitle.includes('write') || lowerTitle.includes('essay') || lowerTitle.includes('report')) {
    return [
      `Research and gather information`,
      `Create an outline or structure`,
      `Write the first draft`,
      `Edit and improve content`,
      `Proofread and finalize`
    ];
  }
  
  // Generic but improved fallback
  return [
    `Plan and outline the approach`,
    `Gather necessary materials or information`,
    `Work on the main task components`,
    `Review and refine your work`,
    `Complete and verify everything is done`
  ];
}