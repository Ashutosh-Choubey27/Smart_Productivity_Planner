import { useState, useMemo } from 'react';
import { Plus, BookOpen, Trophy } from 'lucide-react';
import { useTask, Task } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskStats } from '@/components/TaskStats';
import { TaskAnalytics } from '@/components/TaskAnalytics';
import { TaskFilter, FilterType, PriorityFilter, SortType } from '@/components/TaskFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTask();
  const { toast } = useToast();
  
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');

  const availableCategories = useMemo(() => {
    const categories = [...new Set(tasks.map(task => task.category))];
    return categories.sort();
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                           (filter === 'completed' && task.completed) ||
                           (filter === 'pending' && !task.completed);
      
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

      return matchesSearch && matchesFilter && matchesPriority && matchesCategory;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [tasks, searchTerm, filter, priorityFilter, categoryFilter, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    return count;
  }, [searchTerm, filter, priorityFilter, categoryFilter]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask(taskData);
    toast({
      title: "Task created!",
      description: `"${taskData.title}" has been added to your tasks.`,
    });
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast({
        title: "Task updated!",
        description: `"${taskData.title}" has been updated.`,
      });
      setEditingTask(undefined);
    }
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    deleteTask(id);
    toast({
      title: "Task deleted",
      description: task ? `"${task.title}" has been removed.` : "Task has been removed.",
      variant: "destructive",
    });
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    toggleTask(id);
    if (task) {
      toast({
        title: task.completed ? "Task marked as pending" : "Task completed!",
        description: `"${task.title}" ${task.completed ? 'is now pending' : 'has been completed'}.`,
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  const motivationalQuotes = [
    "The secret of getting ahead is getting started. - Mark Twain",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The future depends on what you do today. - Mahatma Gandhi"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Smart Productivity Planner
              </h1>
              <p className="text-muted-foreground mt-2">
                Stay organized, focused, and motivated with your personal task manager
              </p>
            </div>
            <TaskForm onSubmit={handleAddTask} />
          </div>
          
          {/* Motivational Quote */}
          <Card className="mt-6 bg-gradient-card border-none shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm italic text-muted-foreground flex-1">
                  {randomQuote}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <TaskStats />

        {/* Analytics Charts */}
        <div className="mb-6">
          <TaskAnalytics />
        </div>

        {/* Filters */}
        <TaskFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          availableCategories={availableCategories}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={clearFilters}
        />

        {/* Task List */}
        <div className="space-y-4">
          {filteredAndSortedTasks.length === 0 ? (
            <Card className="task-card text-center py-12">
              <CardHeader>
                <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl text-muted-foreground">
                  {tasks.length === 0 ? "No tasks yet!" : "No tasks match your filters"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {tasks.length === 0 
                    ? "Create your first task to get started on your productivity journey."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {tasks.length === 0 && (
                  <TaskForm 
                    onSubmit={handleAddTask}
                    trigger={
                      <Button className="bg-gradient-primary hover:bg-primary-hover">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Task
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAndSortedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Edit Task Modal */}
        {editingTask && (
          <TaskForm
            editingTask={editingTask}
            onSubmit={handleEditTask}
            onEditComplete={() => setEditingTask(undefined)}
          />
        )}
      </div>
    </div>
  );
};