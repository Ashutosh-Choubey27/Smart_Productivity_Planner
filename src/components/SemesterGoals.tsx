import { useState, useEffect } from 'react';
import { Target, TrendingUp, Award, Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from '@/hooks/use-toast';

interface SemesterGoal {
  id: string;
  title: string;
  targetGPA?: string;
  targetCompletionRate?: number; // percentage
  targetTasksCompleted?: number;
  deadline?: Date;
  description?: string;
}

export const SemesterGoals = () => {
  const { tasks } = useTask();
  const { toast } = useToast();
  const [goals, setGoals] = useState<SemesterGoal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<SemesterGoal>>({});

  // Load goals from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('semester-goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGoals(parsed.map((g: any) => ({
          ...g,
          deadline: g.deadline ? new Date(g.deadline) : undefined
        })));
      } catch (error) {
        console.error('Error loading semester goals:', error);
      }
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('semester-goals', JSON.stringify(goals));
  }, [goals]);

  // Calculate progress
  const calculateProgress = (goal: SemesterGoal): number => {
    const academicTasks = tasks.filter(t => t.isAcademic);
    const completed = academicTasks.filter(t => t.completed).length;
    const total = academicTasks.length;

    if (goal.targetTasksCompleted && total > 0) {
      return Math.min(100, (completed / goal.targetTasksCompleted) * 100);
    }

    if (goal.targetCompletionRate && total > 0) {
      const actualRate = (completed / total) * 100;
      return Math.min(100, (actualRate / goal.targetCompletionRate) * 100);
    }

    return 0;
  };

  const handleAddGoal = () => {
    if (!newGoal.title) {
      toast({
        title: "⚠️ Title Required",
        description: "Please enter a goal title",
      });
      return;
    }

    const goal: SemesterGoal = {
      id: crypto.randomUUID(),
      title: newGoal.title,
      targetGPA: newGoal.targetGPA,
      targetCompletionRate: newGoal.targetCompletionRate,
      targetTasksCompleted: newGoal.targetTasksCompleted,
      deadline: newGoal.deadline,
      description: newGoal.description,
    };

    setGoals([...goals, goal]);
    setNewGoal({});
    setIsAdding(false);

    toast({
      title: "✓ Goal Added!",
      description: `"${goal.title}" has been added to your semester goals`,
      className: "bg-success border-success/50 text-white",
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast({
      title: "✓ Goal Deleted",
      description: "Semester goal has been removed",
      className: "bg-success border-success/50 text-white",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Semester Goals
              </CardTitle>
              <CardDescription>
                Set and track your academic goals for this semester
              </CardDescription>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add New Goal Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>New Semester Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Goal Title *</Label>
              <Input
                placeholder="e.g., Achieve 3.8 GPA this semester"
                value={newGoal.title || ''}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Target GPA</Label>
                <Input
                  placeholder="e.g., 3.8"
                  value={newGoal.targetGPA || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetGPA: e.target.value })}
                />
              </div>

              <div>
                <Label>Completion Rate (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 95"
                  min="0"
                  max="100"
                  value={newGoal.targetCompletionRate || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetCompletionRate: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label>Tasks to Complete</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  min="1"
                  value={newGoal.targetTasksCompleted || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetTasksCompleted: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Additional notes about this goal..."
                value={newGoal.description || ''}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddGoal} className="flex-1">
                Create Goal
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAdding(false);
                setNewGoal({});
              }} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No semester goals yet. Set your first goal to track your progress!
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map(goal => {
            const progress = calculateProgress(goal);
            const academicTasks = tasks.filter(t => t.isAcademic);
            const completedTasks = academicTasks.filter(t => t.completed).length;

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      {goal.description && (
                        <CardDescription className="mt-2">
                          {goal.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Goal Metrics */}
                  <div className="space-y-2">
                    {goal.targetGPA && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target GPA:</span>
                        <Badge variant="outline">{goal.targetGPA}</Badge>
                      </div>
                    )}

                    {goal.targetTasksCompleted && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tasks Progress:</span>
                        <Badge variant="outline">
                          {completedTasks} / {goal.targetTasksCompleted}
                        </Badge>
                      </div>
                    )}

                    {goal.targetCompletionRate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target Rate:</span>
                        <Badge variant="outline">{goal.targetCompletionRate}%</Badge>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="pt-2 border-t">
                    {progress >= 100 ? (
                      <Badge className="bg-success text-white">
                        <Award className="h-3 w-3 mr-1" />
                        Goal Achieved!
                      </Badge>
                    ) : progress >= 75 ? (
                      <Badge className="bg-blue-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        On Track
                      </Badge>
                    ) : progress >= 50 ? (
                      <Badge className="bg-yellow-500 text-white">
                        Making Progress
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Just Started
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
