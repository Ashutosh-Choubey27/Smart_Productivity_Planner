-- Add isAcademic field to tasks table
ALTER TABLE public.tasks 
ADD COLUMN is_academic BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster filtering
CREATE INDEX idx_tasks_is_academic ON public.tasks(is_academic);

-- Add comment for documentation
COMMENT ON COLUMN public.tasks.is_academic IS 'Flag to distinguish academic tasks (for Semester Planner) from general tasks';