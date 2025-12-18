-- Add subtasks column to tasks table for storing subtasks as JSONB
ALTER TABLE public.tasks
ADD COLUMN subtasks JSONB DEFAULT '[]'::jsonb;