import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { validateTaskTitle, getTaskTitleError } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';
import { getLocalUserId } from '@/utils/userStorage';
import { supabase } from '@/integrations/supabase/client';

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
  progress: number; // 0-100 percentage of completion
  subtasks?: Subtask[]; // Auto-generated subtasks
  createdAt: Date;
  updatedAt: Date;
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
  const { toast } = useToast();
  const localUserId = getLocalUserId();

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('productivity-planner-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          progress: typeof task.progress === 'number' ? task.progress : 0,
          subtasks: Array.isArray(task.subtasks) ? task.subtasks : undefined
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('productivity-planner-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'> & { progress?: number }) => {
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

    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: typeof taskData.progress === 'number' ? Math.max(0, Math.min(100, taskData.progress)) : 0,
    };
    
    setTasks(prev => [newTask, ...prev]);
    
    // Save to Supabase for AI analysis (with proper error handling)
    supabase.from('tasks').insert({
      id: newTask.id,
      user_id: localUserId,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      due_date: newTask.dueDate?.toISOString(),
      completed: newTask.completed
    }).then(({ error }) => {
      if (error) {
        console.error('Error saving task to Supabase:', error);
        // Don't show error to user since localStorage still works
      }
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
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

    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
    
    // Update in Supabase using proper task ID
    const taskToUpdate = tasks.find(t => t.id === id);
    if (taskToUpdate) {
      supabase.from('tasks').update({
        title: updates.title || taskToUpdate.title,
        description: updates.description !== undefined ? updates.description : taskToUpdate.description,
        priority: updates.priority || taskToUpdate.priority,
        category: updates.category || taskToUpdate.category,
        due_date: updates.dueDate?.toISOString() || taskToUpdate.dueDate?.toISOString(),
        completed: updates.completed !== undefined ? updates.completed : taskToUpdate.completed,
        completed_at: updates.completed ? new Date().toISOString() : null
      }).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating task in Supabase:', error);
      });
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    
    // Delete from Supabase as well
    supabase.from('tasks').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting task from Supabase:', error);
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, updatedAt: new Date() }
        : task
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
        
        // Calculate new progress based on completed subtasks
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
    getPendingTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};