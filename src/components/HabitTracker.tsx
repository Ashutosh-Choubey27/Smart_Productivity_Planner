import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, Plus, CheckCircle2, Circle, Flame, Target, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  targetCount: number;
  category: 'health' | 'productivity' | 'learning' | 'personal';
  icon: string;
  createdAt: Date;
  completions: { date: string; completed: boolean }[];
}

const HABIT_CATEGORIES = {
  health: { icon: '💪', color: 'bg-green-500' },
  productivity: { icon: '🎯', color: 'bg-blue-500' },
  learning: { icon: '📚', color: 'bg-purple-500' },
  personal: { icon: '🌟', color: 'bg-yellow-500' }
};

const PRESET_HABITS = [
  { name: 'Morning Exercise', category: 'health', icon: '🏃‍♂️', description: 'Start your day with 30 minutes of exercise' },
  { name: 'Read for 30 minutes', category: 'learning', icon: '📖', description: 'Expand your knowledge daily' },
  { name: 'Meditate', category: 'personal', icon: '🧘‍♀️', description: 'Practice mindfulness for 10 minutes' },
  { name: 'Review daily goals', category: 'productivity', icon: '📋', description: 'Plan and review your day' },
  { name: 'Drink 8 glasses of water', category: 'health', icon: '💧', description: 'Stay hydrated throughout the day' },
  { name: 'Practice coding', category: 'learning', icon: '💻', description: 'Code for at least 1 hour daily' }
];

export const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof HABIT_CATEGORIES>('productivity');

  useEffect(() => {
    // Load habits from localStorage
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  useEffect(() => {
    // Save habits to localStorage
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const addHabit = (habitData: Partial<Habit>) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitData.name || newHabitName,
      description: habitData.description || '',
      frequency: 'daily',
      targetCount: 1,
      category: selectedCategory,
      icon: habitData.icon || HABIT_CATEGORIES[selectedCategory].icon,
      createdAt: new Date(),
      completions: []
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setShowAddDialog(false);
    toast.success(`Habit "${newHabit.name}" added! 🎉`);
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const existingCompletion = habit.completions.find(c => c.date === date);
        let newCompletions;
        
        if (existingCompletion) {
          newCompletions = habit.completions.map(c => 
            c.date === date ? { ...c, completed: !c.completed } : c
          );
        } else {
          newCompletions = [...habit.completions, { date, completed: true }];
        }

        const isCompleted = newCompletions.find(c => c.date === date)?.completed;
        if (isCompleted) {
          toast.success(`Great job! Habit "${habit.name}" completed! ✅`);
        }

        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  const getHabitStreak = (habit: Habit) => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateString = date.toISOString().split('T')[0];
      const completion = habit.completions.find(c => c.date === dateString);
      
      if (completion?.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeekProgress = (habit: Habit) => {
    const today = new Date();
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    let completed = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateString = date.toISOString().split('T')[0];
      const completion = habit.completions.find(c => c.date === dateString);
      
      if (completion?.completed) completed++;
    }
    
    return { completed, target: 7 };
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const isHabitCompletedToday = (habit: Habit) => {
    const today = getTodayDate();
    return habit.completions.find(c => c.date === today)?.completed || false;
  };

  const getOverallStats = () => {
    const totalHabits = habits.length;
    const completedToday = habits.filter(isHabitCompletedToday).length;
    const averageStreak = habits.reduce((sum, habit) => sum + getHabitStreak(habit), 0) / Math.max(habits.length, 1);
    
    return {
      totalHabits,
      completedToday,
      completionRate: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
      averageStreak: Math.round(averageStreak)
    };
  };

  const stats = getOverallStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Habit Tracker
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Habit Name</label>
                  <Input
                    placeholder="e.g., Morning Exercise"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(HABIT_CATEGORIES).map(([key, category]) => (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? "default" : "outline"}
                        onClick={() => setSelectedCategory(key as keyof typeof HABIT_CATEGORIES)}
                        className="gap-2"
                      >
                        <span>{category.icon}</span>
                        <span className="capitalize">{key}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Add</label>
                  <div className="grid gap-2">
                    {PRESET_HABITS.filter(h => h.category === selectedCategory).map(preset => (
                  <Button
                    key={preset.name}
                    variant="ghost"
                    onClick={() => addHabit(preset as Partial<Habit>)}
                    className="justify-start gap-2 h-auto p-3"
                  >
                        <span className="text-lg">{preset.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => addHabit({})} 
                  className="w-full"
                  disabled={!newHabitName.trim()}
                >
                  Add Custom Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg">{stats.totalHabits}</div>
            <div className="text-xs text-muted-foreground">Total Habits</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg text-green-600">{stats.completedToday}</div>
            <div className="text-xs text-muted-foreground">Done Today</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg text-blue-600">{stats.completionRate}%</div>
            <div className="text-xs text-muted-foreground">Completion</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg text-orange-600 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              {stats.averageStreak}
            </div>
            <div className="text-xs text-muted-foreground">Avg Streak</div>
          </div>
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No habits yet. Add your first habit to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map(habit => {
              const streak = getHabitStreak(habit);
              const weekProgress = getWeekProgress(habit);
              const isCompletedToday = isHabitCompletedToday(habit);
              
              return (
                <div key={habit.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant={isCompletedToday ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleHabitCompletion(habit.id, getTodayDate())}
                        className="w-10 h-10 p-0"
                      >
                        {isCompletedToday ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </Button>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{habit.icon}</span>
                          <span className="font-medium">{habit.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {habit.category}
                          </Badge>
                        </div>
                        {habit.description && (
                          <div className="text-sm text-muted-foreground">{habit.description}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold">{streak}</span>
                        <span className="text-muted-foreground">day streak</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>This week</span>
                      <span>{weekProgress.completed}/{weekProgress.target} days</span>
                    </div>
                    <Progress 
                      value={(weekProgress.completed / weekProgress.target) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};