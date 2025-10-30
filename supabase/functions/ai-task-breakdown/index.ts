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
    console.log('Task description:', task_description);

    const subtasks = await generateTaskBreakdown(task_title, task_description);
    
    console.log('Generated subtasks count:', subtasks.length);
    console.log('Subtasks:', JSON.stringify(subtasks));

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
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.error('Gemini API key not found in environment');
    throw new Error('Gemini API key not configured');
  }
  
  console.log('Using Gemini API to generate breakdown...');

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
            temperature: 0.5,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response received');
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('AI response content:', generatedText);
    
    if (!generatedText) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response');
      return generateSmartFallbackSubtasks(taskTitle, taskDescription);
    }

    const subtasks = JSON.parse(jsonMatch[0]);
    console.log('Parsed subtasks:', subtasks);
    
    // Validate and ensure proper format
    if (!Array.isArray(subtasks)) {
      console.error('Response is not an array, using fallback');
      return generateSmartFallbackSubtasks(taskTitle, taskDescription);
    }
    
    const validSubtasks = subtasks.filter(s => typeof s === 'string' && s.length > 0);
    console.log('Valid subtasks count:', validSubtasks.length);
    
    return validSubtasks;

  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error details:', error.message);
    console.log('Falling back to smart fallback function');
    
    // Smarter fallback: Create context-aware subtasks based on task patterns
    return generateSmartFallbackSubtasks(taskTitle, taskDescription);
  }
}

function generateSmartFallbackSubtasks(taskTitle: string, taskDescription: string = ''): string[] {
  const lowerTitle = taskTitle.toLowerCase();
  const lowerDesc = taskDescription.toLowerCase();
  const combined = `${lowerTitle} ${lowerDesc}`.trim();
  
  // Extract specific subjects or topics from the task
  const extractSubject = () => {
    const subjects = ['physics', 'chemistry', 'biology', 'math', 'history', 'english', 'computer', 'science'];
    for (const subj of subjects) {
      if (combined.includes(subj)) return subj.charAt(0).toUpperCase() + subj.slice(1);
    }
    return 'the topic';
  };
  
  // Learning/Study tasks - highly specific
  if (lowerTitle.includes('learn') || lowerTitle.includes('study')) {
    const subject = extractSubject();
    
    if (lowerTitle.includes('word') || lowerTitle.includes('vocab')) {
      const count = lowerTitle.match(/\d+/)?.[0] || '20';
      return [
        `List out all ${count} words with definitions`,
        `Create flashcards or digital notes for each word`,
        `Practice pronunciation and usage in sentences`,
        `Quiz yourself on meanings and spelling`,
        `Review difficult words multiple times`
      ];
    }
    
    if (lowerTitle.includes('chapter') || lowerTitle.includes('unit')) {
      return [
        `Read ${subject} chapter and highlight key concepts`,
        `Make detailed notes on important formulas and theories`,
        `Solve example problems from the chapter`,
        `Create summary chart of main topics`,
        `Test understanding with practice questions`
      ];
    }
    
    return [
      `Watch video tutorials or read materials on ${subject}`,
      `Take comprehensive notes on core concepts`,
      `Practice problems or exercises to apply knowledge`,
      `Create quick reference sheet of key points`,
      `Self-test to verify understanding`
    ];
  }
  
  // GitHub/Upload/Repository tasks - very specific
  if (lowerTitle.includes('upload') || lowerTitle.includes('github') || lowerTitle.includes('repository') || lowerTitle.includes('push')) {
    const hasDoc = lowerDesc.includes('ppt') || lowerDesc.includes('pdf') || lowerDesc.includes('doc') || lowerDesc.includes('synopsis');
    
    if (hasDoc) {
      return [
        `Create new GitHub repository with descriptive name`,
        `Prepare and organize all documents to upload`,
        `Write detailed README explaining project contents`,
        `Upload files via web interface or Git commands`,
        `Add commit messages and verify all files visible`
      ];
    }
    
    return [
      `Initialize Git repository in project folder`,
      `Add all project files using git add command`,
      `Commit changes with clear descriptive message`,
      `Create remote repository on GitHub`,
      `Push code to GitHub and verify upload`
    ];
  }
  
  // Assignment/Homework tasks - action specific
  if (lowerTitle.includes('assignment') || lowerTitle.includes('homework')) {
    const subject = extractSubject();
    
    return [
      `Read ${subject} assignment requirements carefully`,
      `Research necessary information and gather resources`,
      `Draft outline organizing main points to cover`,
      `Complete all questions or tasks thoroughly`,
      `Proofread answers and check formatting before submission`
    ];
  }
  
  // Exam/Test preparation - study focused
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('quiz')) {
    const subject = extractSubject();
    
    return [
      `Review all ${subject} lecture notes and textbook chapters`,
      `List important formulas, definitions, and concepts`,
      `Solve previous year papers or sample questions`,
      `Create condensed summary sheet for quick revision`,
      `Take practice test and identify weak areas`,
      `Revise difficult topics thoroughly before exam`
    ];
  }
  
  // Coding/Project tasks - technical steps
  if (lowerTitle.includes('project') || lowerTitle.includes('code') || lowerTitle.includes('develop') || lowerTitle.includes('build') || lowerTitle.includes('app')) {
    const tech = combined.includes('react') ? 'React' : combined.includes('python') ? 'Python' : 'the project';
    
    return [
      `Set up ${tech} development environment and dependencies`,
      `Design project structure and component architecture`,
      `Implement core features and functionality`,
      `Write unit tests for critical functions`,
      `Debug issues and optimize code performance`,
      `Create documentation and deployment guide`
    ];
  }
  
  // Reading tasks - comprehension focused
  if (lowerTitle.includes('read') || lowerTitle.includes('book') || lowerTitle.includes('article')) {
    const material = lowerTitle.includes('chapter') ? 'chapter' : lowerTitle.includes('book') ? 'book' : 'material';
    
    return [
      `Skim through ${material} to understand structure`,
      `Read carefully and highlight important points`,
      `Summarize each section in your own words`,
      `Note down questions or unclear concepts`,
      `Review summary and connect with existing knowledge`
    ];
  }
  
  // Writing tasks - composition focused
  if (lowerTitle.includes('write') || lowerTitle.includes('essay') || lowerTitle.includes('report') || lowerTitle.includes('paper')) {
    const type = lowerTitle.includes('essay') ? 'essay' : lowerTitle.includes('report') ? 'report' : 'paper';
    
    return [
      `Research topic and gather credible sources`,
      `Create detailed outline with main arguments`,
      `Write introduction with clear thesis statement`,
      `Develop body paragraphs with supporting evidence`,
      `Write conclusion summarizing key points`,
      `Edit for grammar, clarity, and formatting`
    ];
  }
  
  // Presentation tasks
  if (lowerTitle.includes('presentation') || lowerTitle.includes('ppt') || lowerTitle.includes('slides')) {
    return [
      `Research topic and collect relevant information`,
      `Create presentation outline with key slides`,
      `Design slides with visuals and minimal text`,
      `Prepare speaking notes for each slide`,
      `Practice delivery and timing of presentation`,
      `Refine slides based on practice feedback`
    ];
  }
  
  // Practice/Exercise tasks
  if (lowerTitle.includes('practice') || lowerTitle.includes('exercise') || lowerTitle.includes('solve')) {
    const subject = extractSubject();
    
    return [
      `Gather ${subject} problems to practice`,
      `Attempt solving first set without help`,
      `Review solutions and understand mistakes`,
      `Practice similar problems until confident`,
      `Time yourself on final practice set`
    ];
  }
  
  // Research tasks
  if (lowerTitle.includes('research') || lowerTitle.includes('investigate')) {
    return [
      `Define research scope and key questions`,
      `Search credible sources and academic databases`,
      `Read and take notes from relevant sources`,
      `Organize findings into logical categories`,
      `Synthesize information and draw conclusions`,
      `Compile references and citations properly`
    ];
  }
  
  // Meeting/Discussion tasks
  if (lowerTitle.includes('meeting') || lowerTitle.includes('discuss') || lowerTitle.includes('call')) {
    return [
      `Prepare agenda items to discuss`,
      `Gather relevant documents or materials`,
      `Note down questions or points to raise`,
      `Attend meeting and take detailed notes`,
      `Follow up on action items assigned`
    ];
  }
  
  // Generic but MUCH more specific fallback based on verbs
  const hasAction = lowerTitle.match(/\b(complete|finish|do|make|prepare|submit)\b/);
  
  if (hasAction) {
    return [
      `List all requirements and deliverables needed`,
      `Break down main work into smaller chunks`,
      `Complete each chunk systematically`,
      `Cross-check everything against requirements`,
      `Finalize and submit or mark as complete`
    ];
  }
  
  // Ultimate fallback - extract any meaningful words from title
  const meaningfulWords = taskTitle.split(' ').filter(w => w.length > 3);
  const taskFocus = meaningfulWords.slice(0, 2).join(' ') || 'this task';
  
  return [
    `Understand exactly what ${taskFocus} requires`,
    `Collect all necessary materials and information`,
    `Work through ${taskFocus} step by step`,
    `Double-check your work for completeness`,
    `Mark ${taskFocus} as finished and verified`
  ];
}