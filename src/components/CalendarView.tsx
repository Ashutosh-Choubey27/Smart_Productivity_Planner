import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTask, Task } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TaskCard } from '@/components/TaskCard';

export const CalendarView = () => {
  const { tasks, toggleTask, updateTask, deleteTask } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  // Get selected date tasks
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  }, [selectedDate, tasks]);

  // Calculate task count by priority for a date
  const getTaskStats = (date: Date) => {
    const dateTasks = getTasksForDate(date);
    return {
      total: dateTasks.length,
      completed: dateTasks.filter(t => t.completed).length,
      high: dateTasks.filter(t => t.priority === 'high').length,
    };
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {daysInMonth.map(day => {
              const stats = getTaskStats(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square p-2 rounded-lg border-2 transition-all hover:scale-105",
                    "flex flex-col items-center justify-center gap-1",
                    isTodayDate && "border-primary bg-primary/10",
                    isSelected && "border-success bg-success/20",
                    !isSelected && !isTodayDate && "border-border hover:border-primary/50",
                    !isSameMonth(day, currentDate) && "opacity-50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isTodayDate && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {stats.total > 0 && (
                    <div className="flex gap-1">
                      {stats.high > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-priority-high" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-4">
              {selectedDateTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No tasks scheduled for this day
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          {task.timeBlock && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ⏰ {task.timeBlock.startTime} - {task.timeBlock.endTime}
                            </p>
                          )}
                        </div>
                        <Badge variant={task.completed ? "default" : "outline"} className={task.completed ? "bg-success" : ""}>
                          {task.priority}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={task.completed ? "outline" : "default"}
                        onClick={() => toggleTask(task.id)}
                        className="w-full"
                      >
                        {task.completed ? 'Mark Incomplete' : 'Complete'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Click on a date to view tasks
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
