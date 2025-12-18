import { useState, useMemo } from 'react';
import { Plus, BookOpen, Trophy, Settings, Calendar as CalendarIconTab } from 'lucide-react';
import { useTask, Task } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskStats } from '@/components/TaskStats';
import { TaskAnalytics } from '@/components/TaskAnalytics';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { AchievementPanel } from '@/components/AchievementPanel';
import { ProductivityHeatmap } from '@/components/ProductivityHeatmap';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VoiceTaskInput } from '@/components/VoiceTaskInput';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { AISuggestions } from '@/components/AISuggestions';
import { AITaskBreakdown } from '@/components/AITaskBreakdown';
import { AITimeEstimator } from '@/components/AITimeEstimator';
import { AISmartScheduler } from '@/components/AISmartScheduler';
import { TaskFilter, FilterType, PriorityFilter, SortType } from '@/components/TaskFilter';
import { DragDropTaskBoard } from '@/components/DragDropTaskBoard';
import { SemesterPlanner } from '@/components/SemesterPlanner';
import { ExportPanel } from '@/components/ExportPanel';
import { MotivationalQuoteCard } from '@/components/MotivationalQuoteCard';
import { CalendarView } from '@/components/CalendarView';
import { SemesterGoals } from '@/components/SemesterGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAchievement } from '@/contexts/AchievementContext';

export const Dashboard = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTask();
  const { toast } = useToast();
  const { checkAchievements, userStats } = useAchievement();
  
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
    
    // Update achievement stats
    const completedToday = tasks.filter(task => {
      const today = new Date().toDateString();
      const taskDate = new Date(task.updatedAt).toDateString();
      return task.completed && taskDate === today;
    }).length;
    
    checkAchievements({
      totalTasksCompleted: userStats.totalTasksCompleted,
      tasksCompletedToday: completedToday
    });
    
    toast({
      title: "✓ Task created!",
      description: `"${taskData.title}" has been added to your tasks.`,
      className: "bg-green-600 border-green-500 text-white dark:bg-green-600 dark:text-white backdrop-blur-md",
    });
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast({
        title: "✓ Task updated!",
        description: `"${taskData.title}" has been updated.`,
        className: "bg-blue-600 border-blue-500 text-white dark:bg-blue-600 dark:text-white backdrop-blur-md",
      });
      setEditingTask(undefined);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    toggleTask(id);

    // Predict updated tasks state for today's completion count
    const todayStr = new Date().toDateString();
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
    );
    const completedToday = updatedTasks.filter(
      t => t.completed && new Date(t.updatedAt).toDateString() === todayStr
    ).length;

    // Update achievements: increment lifetime on first completion toggle
    if (task) {
      checkAchievements({
        totalTasksCompleted: userStats.totalTasksCompleted + (task.completed ? 0 : 1),
        tasksCompletedToday: completedToday,
      });

      toast({
        title: task.completed ? "⏸️ Task marked as pending" : "✓ Task completed!",
        description: `"${task.title}" ${task.completed ? 'is now pending' : 'has been completed'}.`,
        className: task.completed 
          ? "bg-yellow-600 border-yellow-500 text-white dark:bg-yellow-600 dark:text-white backdrop-blur-md"
          : "bg-green-600 border-green-500 text-white dark:bg-green-600 dark:text-white backdrop-blur-md",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        {/* Header with Theme Toggle */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Smart Productivity Planner
                </h1>
                <p className="text-muted-foreground mt-2">
                  Stay organized, focused, and motivated with AI-powered task management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <TaskForm onSubmit={handleAddTask} />
            </div>
          </div>
          
          {/* Motivational Quote */}
          <MotivationalQuoteCard />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIconTab className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2">
              🎯 Board
            </TabsTrigger>
            <TabsTrigger value="semester" className="flex items-center gap-2">
              🎓 Semester
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              🤖 AI
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              🍅 Focus
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              📥 Export
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6 animate-enter">
            {/* Stats */}
            <TaskStats />
            
            {/* AI Suggestions - ONLY HERE, removed from AI tab */}
            <AISuggestions />

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
                  {filteredAndSortedTasks.map((task, index) => (
                    <div key={task.id} className={`stagger-item stagger-${Math.min(index + 1, 8)}`}>
                      <TaskCard
                        task={task}
                        onToggle={handleToggleTask}
                        onEdit={setEditingTask}
                        onDelete={handleDeleteTask}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6 animate-enter">
            <CalendarView />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 animate-enter">
            <TaskAnalytics />
            <ProductivityHeatmap />
          </TabsContent>

          {/* Focus Tab */}
          <TabsContent value="focus" className="space-y-6 animate-enter">
            <PomodoroTimer onFocusComplete={(minutes) => {
              checkAchievements({
                totalFocusTime: userStats.totalFocusTime + minutes
              });
            }} />
          </TabsContent>

          {/* Board Tab */}
          <TabsContent value="board" className="space-y-6 animate-enter">
            <DragDropTaskBoard />
          </TabsContent>

          {/* AI Tools Tab - Removed duplicate AISuggestions */}
          <TabsContent value="ai" className="space-y-6 animate-enter">
            <AISmartScheduler />
            
            {/* Task Enhancement Tools */}
            {tasks.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AITaskBreakdown 
                  taskId={tasks.filter(t => !t.completed)[0]?.id}
                  taskTitle={tasks.filter(t => !t.completed)[0]?.title || "Sample Task"}
                  taskDescription={tasks.filter(t => !t.completed)[0]?.description}
                />
                <AITimeEstimator 
                  taskTitle={tasks.filter(t => !t.completed)[0]?.title || "Sample Task"}
                  taskDescription={tasks.filter(t => !t.completed)[0]?.description}
                  taskCategory={tasks.filter(t => !t.completed)[0]?.category}
                />
              </div>
            )}
          </TabsContent>

          {/* Semester Tab */}
          <TabsContent value="semester" className="space-y-6 animate-enter">
            <SemesterGoals />
            <SemesterPlanner />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6 animate-enter">
            <ExportPanel />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 animate-enter">
            <AchievementPanel />
          </TabsContent>
        </Tabs>

        {/* Edit Task Modal */}
        {editingTask && (
          <TaskForm
            editingTask={editingTask}
            onSubmit={handleEditTask}
            onEditComplete={() => setEditingTask(undefined)}
          />
        )}

        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </div>
  );
};