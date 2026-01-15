import { useState } from 'react';
import { Clock, Calendar, Trash2, Edit, CheckCircle2, Circle, ChevronDown, ChevronUp, Repeat, Award, GripVertical } from 'lucide-react';
import { Task, useTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';


interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  showDragHandle?: boolean;
}

export const TaskCard = ({ task, onToggle, onEdit, onDelete, showDragHandle = false }: TaskCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const { toggleSubtask } = useTask();

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
    setTimeout(() => {
      onDelete(task.id);
    }, 150);
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = hasSubtasks ? task.subtasks.filter(s => s.completed).length : 0;

  return (
    <Card 
      className={cn(
        'task-card animate-slide-in transition-all duration-300 hover-lift',
        getTaskCardClass(task.priority),
        task.completed && 'opacity-60',
        isDeleting && 'animate-slide-out opacity-0'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {showDragHandle && (
            <div className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
              <GripVertical className="h-5 w-5" />
            </div>
          )}
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
          
          <Badge className={cn(getPriorityColor(task.priority), "hover-glow cursor-default")}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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

          {/* Time Block Indicator */}
          {task.timeBlock && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Clock className="h-3 w-3" />
              <span>{task.timeBlock.startTime} - {task.timeBlock.endTime}</span>
            </div>
          )}

          {/* Recurring Task Indicator */}
          {task.recurring && (
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <Repeat className="h-3 w-3" />
              <span>Every {task.recurring.interval} {task.recurring.frequency}</span>
            </div>
          )}

          {/* Grade Badge */}
          {task.completed && task.grade && (
            <div className="flex items-center gap-1 text-success">
              <Award className="h-3 w-3" />
              <span className="font-medium">{task.grade.score}</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-semibold">{Math.round(task.progress ?? 0)}%</span>
          </div>
          <Progress value={task.progress ?? 0} className="mb-2" />
          
          {hasSubtasks && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="w-full justify-between h-8 px-2 hover:bg-muted/50"
              >
                <span className="text-xs font-medium">
                  Subtasks ({completedSubtasks}/{task.subtasks.length})
                </span>
                {showSubtasks ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
              
              {showSubtasks && (
                <div className="mt-2 space-y-2 pl-2">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-start gap-2 group"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                        className="mt-0.5"
                      />
                      <label
                        className={cn(
                          "text-xs cursor-pointer flex-1 leading-relaxed",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                        onClick={() => toggleSubtask(task.id, subtask.id)}
                      >
                        {subtask.text}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full text-center mt-2",
            task.completed 
              ? "bg-success/10 text-success border border-success/20" 
              : task.progress && task.progress > 0 
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground border border-border"
          )}>
            {task.completed ? "✓ Complete" : task.progress && task.progress > 0 ? "In Progress" : "Not Started"}
          </div>
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
              className="h-8 w-8 p-0 hover:bg-primary/10 group hover-rotate"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground hover-rotate"
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