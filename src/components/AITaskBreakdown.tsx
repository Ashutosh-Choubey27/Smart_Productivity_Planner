import { useState } from 'react';
import { Layers, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTask } from '@/contexts/TaskContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getLocalUserId } from '@/utils/userStorage';
import { isValidTaskTitle } from '@/utils/validation';

interface TaskBreakdownProps {
  taskTitle: string;
  taskDescription?: string;
  onBreakdown?: (subtasks: string[]) => void;
}

export const AITaskBreakdown = ({ taskTitle, taskDescription, onBreakdown }: TaskBreakdownProps) => {
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const { addTask } = useTask();
  const { toast } = useToast();

  const generateBreakdown = async () => {
    setLoading(true);
    try {
      const localUserId = getLocalUserId();

      const { data, error } = await supabase.functions.invoke('ai-task-breakdown', {
        body: { 
          user_id: localUserId,
          task_title: taskTitle,
          task_description: taskDescription || ''
        }
      });

      if (error) throw error;

      if (data.success && data.subtasks) {
        // Filter valid subtasks
        const validSubtasks = data.subtasks.filter((subtask: string) => 
          isValidTaskTitle(subtask)
        );
        
        setSubtasks(validSubtasks);
        onBreakdown?.(validSubtasks);

        toast({
          title: "✓ Task Breakdown Generated!",
          description: `Split "${taskTitle}" into ${validSubtasks.length} manageable subtasks.`,
          className: "bg-green-600 border-green-500 text-white dark:bg-green-600 dark:text-white backdrop-blur-md",
        });
      }
    } catch (error) {
      console.error('Error generating breakdown:', error);
      toast({
        title: "❌ Error",
        description: "Failed to generate task breakdown. Please try again.",
        className: "bg-red-600 border-red-500 text-white dark:bg-red-600 dark:text-white backdrop-blur-md",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubtask = (subtask: string) => {
    addTask({
      title: subtask,
      description: `Subtask from: "${taskTitle}"`,
      priority: 'medium',
      category: 'Subtask',
      completed: false,
      progress: 0
    });

    toast({
      title: "✓ Subtask Added!",
      description: `"${subtask}" has been added to your tasks.`,
      className: "bg-green-600 border-green-500 text-white dark:bg-green-600 dark:text-white backdrop-blur-md",
    });
  };

  const addAllSubtasks = () => {
    subtasks.forEach(subtask => {
      addTask({
        title: subtask,
        description: `Subtask from: "${taskTitle}"`,
        priority: 'medium',
        category: 'Subtask',
        completed: false,
        progress: 0
      });
    });

    toast({
      title: "✓ All Subtasks Added!",
      description: `Added ${subtasks.length} subtasks to your task list.`,
      className: "bg-green-600 border-green-500 text-white dark:bg-green-600 dark:text-white backdrop-blur-md",
    });

    setSubtasks([]);
  };

  return (
    <Card className="task-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Task Breakdown</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-foreground mb-1">Breaking Down:</p>
          <p className="text-sm text-muted-foreground">{taskTitle}</p>
          {taskDescription && (
            <p className="text-xs text-muted-foreground mt-1">{taskDescription}</p>
          )}
        </div>

        {subtasks.length === 0 ? (
          <div className="text-center py-6">
            <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Break complex tasks into manageable steps
            </p>
            <Button
              onClick={generateBreakdown}
              disabled={loading}
              className="bg-gradient-primary hover:bg-primary-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Breaking Down...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  Generate Breakdown
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Suggested Subtasks:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={addAllSubtasks}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add All
              </Button>
            </div>
            {subtasks.map((subtask, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    {index + 1}. {subtask}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSubtask(subtask)}
                    className="h-7 text-xs ml-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};