import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { validateTaskTitle, getTaskTitleError } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  completed: boolean;
  progress: number;
  subtasks?: Subtask[];
  isAcademic?: boolean;
  createdAt: Date;
  updatedAt: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  timeBlock?: {
    startTime: string;
    endTime: string;
  };
  grade?: {
    score: string;
    maxScore?: string;
    notes?: string;
  };
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'> & { progress?: number }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTasksByCategory: (category: string) => Task[];
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load tasks from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const loadTasks = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        toast({
          title: "Error loading tasks",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        const mappedTasks: Task[] = data.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          priority: task.priority as 'low' | 'medium' | 'high',
          category: task.category,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          completed: task.completed,
          progress: task.completed ? 100 : 0,
          isAcademic: task.is_academic,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
        }));
        setTasks(mappedTasks);
      }
      setIsLoading(false);
    };

    loadTasks();
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'> & { progress?: number }) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to create tasks",
        variant: "destructive",
      });
      return;
    }

    // Validate task title before adding
    const validation = validateTaskTitle(taskData.title);
    if (!validation.isValid) {
      toast({
        title: "❌ Invalid Task Title",
        description: getTaskTitleError(taskData.title) || "Please enter a meaningful task name",
        className: "bg-red-600 border-red-500 text-white dark:bg-red-600 dark:text-white backdrop-blur-md",
      });
      return;
    }

    const newTaskId = crypto.randomUUID();
    const now = new Date();

    // Insert into Supabase first
    const { error } = await supabase.from('tasks').insert({
      id: newTaskId,
      user_id: user.id,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      category: taskData.category,
      due_date: taskData.dueDate?.toISOString(),
      completed: taskData.completed,
      is_academic: taskData.isAcademic || false
    });

    if (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Add to local state after successful save
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      createdAt: now,
      updatedAt: now,
      progress: typeof taskData.progress === 'number' ? Math.max(0, Math.min(100, taskData.progress)) : 0,
    };
    
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    // Validate title if it's being updated
    if (updates.title) {
      const validation = validateTaskTitle(updates.title);
      if (!validation.isValid) {
        toast({
          title: "❌ Invalid Task Title",
          description: getTaskTitleError(updates.title) || "Please enter a meaningful task name",
          className: "bg-red-600 border-red-500 text-white dark:bg-red-600 dark:text-white backdrop-blur-md",
        });
        return;
      }
    }

    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    // Update in Supabase
    const { error } = await supabase.from('tasks').update({
      title: updates.title ?? taskToUpdate.title,
      description: updates.description ?? taskToUpdate.description,
      priority: updates.priority ?? taskToUpdate.priority,
      category: updates.category ?? taskToUpdate.category,
      due_date: updates.dueDate?.toISOString() ?? taskToUpdate.dueDate?.toISOString(),
      completed: updates.completed ?? taskToUpdate.completed,
      completed_at: updates.completed ? new Date().toISOString() : null,
      is_academic: updates.isAcademic ?? taskToUpdate.isAcademic ?? false
    }).eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTasks(prev => prev.filter(task => task.id !== id));
    
    toast({
      title: "✅ Task Deleted",
      description: "Your task has been successfully removed",
      className: "bg-success border-success/50 text-white dark:bg-success dark:text-white backdrop-blur-md",
    });
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !user) return;

    const newCompleted = !task.completed;

    const { error } = await supabase.from('tasks').update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null
    }).eq('id', id);

    if (error) {
      console.error('Error toggling task:', error);
      return;
    }

    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completed: newCompleted, updatedAt: new Date() }
        : t
    ));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.subtasks) {
        const updatedSubtasks = task.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          progress: newProgress,
          completed: newProgress === 100,
          updatedAt: new Date()
        };
      }
      return task;
    }));
  };

  const getTasksByPriority = (priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority);
  };

  const getTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.completed);
  };

  const getPendingTasks = () => {
    return tasks.filter(task => !task.completed);
  };

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    getTasksByPriority,
    getTasksByCategory,
    getCompletedTasks,
    getPendingTasks,
    isLoading
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
