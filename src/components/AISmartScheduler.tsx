import { useState } from 'react';
import { Calendar, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getLocalUserId } from '@/utils/userStorage';

interface ScheduleItem {
  task: string;
  startTime: string;
  duration: number;
  priority: string;
  reasoning: string;
}

export const AISmartScheduler = () => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const { tasks } = useTask();
  const { toast } = useToast();

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const localUserId = getLocalUserId();
      const pendingTasks = tasks.filter(t => !t.completed).slice(0, 10); // Limit to 10 tasks

      if (pendingTasks.length === 0) {
        toast({
          title: "No Pending Tasks",
          description: "Add some tasks first to generate an optimized schedule.",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-smart-scheduler', {
        body: { 
          user_id: localUserId,
          tasks: pendingTasks.map(t => ({
            title: t.title,
            description: t.description,
            priority: t.priority,
            category: t.category,
            dueDate: t.dueDate?.toISOString()
          }))
        }
      });

      if (error) throw error;

      if (data.success && data.schedule) {
        setSchedule(data.schedule);

        toast({
          title: "Smart Schedule Generated!",
          description: `Created an optimized schedule for ${data.schedule.length} tasks.`,
        });
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate smart schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'low':
        return 'bg-green-500/10 text-green-600 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="task-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Smart Scheduler</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Get AI-optimized scheduling for your pending tasks
            </p>
            <Button
              onClick={generateSchedule}
              disabled={loading || tasks.filter(t => !t.completed).length === 0}
              className="bg-gradient-primary hover:bg-primary-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  Generate Schedule
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Optimized Schedule:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSchedule([])}
                className="h-7 text-xs"
              >
                Clear Schedule
              </Button>
            </div>
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {item.startTime}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({item.duration}h)
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground font-medium mb-1">
                        {item.task}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={generateSchedule}
              className="w-full mt-4"
            >
              Regenerate Schedule
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};