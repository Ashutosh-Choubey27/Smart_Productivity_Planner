import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, useTask } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAchievement } from '@/contexts/AchievementContext';

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
  color: string;
}

export const DragDropTaskBoard = () => {
  const { tasks, updateTask, toggleTask, deleteTask } = useTask();
  const { checkAchievements, userStats } = useAchievement();
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Organize tasks into columns
  const columns: Column[] = [
    {
      id: 'pending',
      title: 'Pending Tasks',
      tasks: tasks.filter(task => !task.completed),
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-500'
    },
    {
      id: 'completed',
      title: 'Completed Tasks',
      tasks: tasks.filter(task => task.completed),
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'text-green-500'
    }
  ];

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Update task completion status based on destination
    const shouldBeCompleted = destination.droppableId === 'completed';
    
    if (task.completed !== shouldBeCompleted) {
      toggleTask(task.id);

      // Predict updated tasks state and update achievements
      const todayStr = new Date().toDateString();
      const updatedTasks = tasks.map(t =>
        t.id === task.id ? { ...t, completed: shouldBeCompleted, updatedAt: new Date() } : t
      );
      const completedToday = updatedTasks.filter(
        t => t.completed && new Date(t.updatedAt).toDateString() === todayStr
      ).length;

      checkAchievements({
        totalTasksCompleted: userStats.totalTasksCompleted + (shouldBeCompleted && !task.completed ? 1 : 0),
        tasksCompletedToday: completedToday,
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <Badge variant="secondary" className="text-sm">
          Drag tasks between columns
        </Badge>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {columns.map((column) => (
            <Card key={column.id} className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className={column.color}>{column.icon}</span>
                  {column.title}
                  <Badge variant="outline" className="ml-auto">
                    {column.tasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "min-h-[200px] space-y-3 p-2 rounded-lg",
                        snapshot.isDraggingOver ? "bg-muted/50 border-2 border-dashed border-primary" : "border-2 border-transparent"
                      )}
                    >
                      {column.tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">No {column.id} tasks</p>
                          <p className="text-xs opacity-70">
                            {column.id === 'pending' ? 'All caught up!' : 'Drag tasks here to mark as complete'}
                          </p>
                        </div>
                      ) : (
                        column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  transition: snapshot.isDragging ? 'none' : 'box-shadow 0.2s ease',
                                }}
                                className={cn(
                                  "h-[280px]",
                                  snapshot.isDragging && "shadow-xl z-50 opacity-95"
                                )}
                              >
                                <TaskCard
                                  task={task}
                                  onToggle={toggleTask}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};