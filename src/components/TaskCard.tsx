import { useState } from 'react';
import { Clock, Calendar, Trash2, Edit, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onToggle, onEdit, onDelete }: TaskCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'priority-badge-high';
      case 'medium': return 'priority-badge-medium';
      case 'low': return 'priority-badge-low';
      default: return 'priority-badge-low';
    }
  };

  const getTaskCardClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'task-card-high';
      case 'medium': return 'task-card-medium';
      case 'low': return 'task-card-low';
      default: return 'task-card-low';
    }
  };

  const getDueDateInfo = () => {
    if (!task.dueDate) return null;
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, status: 'overdue' };
    } else if (diffDays === 0) {
      return { text: 'Due today', status: 'today' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', status: 'tomorrow' };
    } else {
      return { text: `Due in ${diffDays} days`, status: 'future' };
    }
  };

  const dueDateInfo = getDueDateInfo();

  const handleDelete = async () => {
    setIsDeleting(true);
    // Add small delay for animation
    setTimeout(() => {
      onDelete(task.id);
    }, 150);
  };

  return (
    <Card 
      className={cn(
        'task-card animate-slide-in transition-all duration-300',
        getTaskCardClass(task.priority),
        task.completed && 'opacity-60',
        isDeleting && 'animate-slide-out opacity-0'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:bg-transparent"
              onClick={() => onToggle(task.id)}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
              )}
            </Button>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-sm leading-tight",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className={cn(
                  "text-sm text-muted-foreground mt-1 line-clamp-2",
                  task.completed && "line-through"
                )}>
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {task.category && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>{task.category}</span>
            </div>
          )}
          
          {dueDateInfo && (
            <div className={cn(
              "flex items-center gap-1",
              dueDateInfo.status === 'overdue' && "text-destructive",
              dueDateInfo.status === 'today' && "text-warning",
              dueDateInfo.status === 'tomorrow' && "text-accent"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{dueDateInfo.text}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Created {task.createdAt.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};