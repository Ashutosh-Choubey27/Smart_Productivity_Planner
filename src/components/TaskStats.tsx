import { CheckCircle2, Clock, AlertTriangle, Target } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TaskStats = ({ compact = false }: { compact?: boolean }) => {
  const { tasks, getCompletedTasks, getPendingTasks, getTasksByPriority } = useTask();

  const totalTasks = tasks.length;
  const completedTasks = getCompletedTasks().length;
  const pendingTasks = getPendingTasks().length;
  const highPriorityTasks = getTasksByPriority('high').filter(task => !task.completed).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Pending',
      value: pendingTasks,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'High Priority',
      value: highPriorityTasks,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ];

  return (
    <div className={`grid gap-4 mb-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`task-card hover-lift overflow-hidden animate-scale-in stagger-${index + 1} relative before:absolute before:top-0 before:left-0 before:w-3 before:h-3 before:border-t-2 before:border-l-2 before:border-transparent before:bg-gradient-to-br before:from-cyan-500 before:via-purple-500 before:to-pink-500 before:bg-clip-border after:absolute after:top-0 after:right-0 after:w-3 after:h-3 after:border-t-2 after:border-r-2 after:border-transparent after:bg-gradient-to-bl after:from-cyan-500 after:via-purple-500 after:to-pink-500 after:bg-clip-border`}>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-transparent bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 bg-clip-border" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-transparent bg-gradient-to-tl from-cyan-500 via-purple-500 to-pink-500 bg-clip-border" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-md shrink-0 hover-rotate`}>
                <Icon className={`h-4 w-4 ${stat.color} shrink-0`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-fade-in">{stat.value}</div>
              {stat.title === 'Completed' && totalTasks > 0 && (
                <p className="text-xs text-muted-foreground animate-fade-in stagger-1">
                  {completionRate}% completion rate
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};