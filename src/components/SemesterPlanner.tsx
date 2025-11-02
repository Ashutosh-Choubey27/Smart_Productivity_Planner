import { useState, useMemo } from 'react';
import { Calendar, BookOpen, Clock, GraduationCap, Target, Plus, Filter, BookOpenCheck, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { useTask, Task } from '@/contexts/TaskContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskForm } from '@/components/TaskForm';
import { SemesterGuide, useSemesterGuide } from '@/components/SemesterGuide';
import { SemesterGuideDetailed } from '@/components/SemesterGuideDetailed';
import { cn } from '@/lib/utils';

const ACADEMIC_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Data Structures & Algorithms',
  'Database Management', 'Operating Systems', 'Computer Networks', 'Software Engineering',
  'Web Development', 'Mobile Development', 'Machine Learning', 'Artificial Intelligence',
  'Cybersecurity', 'Statistics', 'Linear Algebra', 'Discrete Mathematics', 'English',
  'Economics', 'Management', 'Research Project', 'Internship', 'Placement Preparation'
];

const STUDY_CATEGORIES = [
  'Lecture Notes', 'Assignments', 'Lab Work', 'Project Work', 'Exam Preparation',
  'Research', 'Reading', 'Practice Problems', 'Mock Tests', 'Group Study'
];

const TASK_TEMPLATES = {
  'Assignments': {
    priority: 'high' as const,
    description: 'Complete assignment with all requirements and submit on time',
    estimatedHours: 4
  },
  'Exam Preparation': {
    priority: 'high' as const,
    description: 'Study material and practice questions for upcoming exam',
    estimatedHours: 6
  },
  'Lab Work': {
    priority: 'medium' as const,
    description: 'Complete lab exercises and prepare lab report',
    estimatedHours: 3
  },
  'Project Work': {
    priority: 'high' as const,
    description: 'Work on project milestones and deliverables',
    estimatedHours: 8
  },
  'Lecture Notes': {
    priority: 'low' as const,
    description: 'Review and organize lecture notes',
    estimatedHours: 2
  }
};

export const SemesterPlanner = () => {
  const { tasks, addTask } = useTask();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState<string>('');
  const { showGuide, hideGuide, showGuideAgain } = useSemesterGuide();

  // Filter only tasks created as academic tasks
  const academicTasks = useMemo(() => {
    return tasks.filter(task => task.isAcademic === true);
  }, [tasks]);

  // Get available subjects from actual tasks
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    academicTasks.forEach(task => {
      if (ACADEMIC_SUBJECTS.includes(task.category)) {
        subjects.add(task.category);
      }
    });
    return Array.from(subjects).sort();
  }, [academicTasks]);

  // Get subject statistics
  const subjectStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; priority: Record<string, number> }> = {};
    
    academicTasks.forEach(task => {
      const subject = task.category;
      if (!stats[subject]) {
        stats[subject] = { total: 0, completed: 0, priority: { high: 0, medium: 0, low: 0 } };
      }
      stats[subject].total++;
      if (task.completed) stats[subject].completed++;
      stats[subject].priority[task.priority]++;
    });

    return stats;
  }, [academicTasks]);

  // Get upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return academicTasks
      .filter(task => !task.completed && task.dueDate)
      .map(task => ({
        ...task,
        daysLeft: Math.ceil((task.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [academicTasks]);

  // Filter tasks by selected subject
  const filteredTasks = useMemo(() => {
    if (selectedSubject === 'all') return academicTasks;
    return academicTasks.filter(task => task.category === selectedSubject);
  }, [academicTasks, selectedSubject]);

  const handleAddAcademicTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask({ ...taskData, isAcademic: true });
    setIsAddingTask(false);
  };

  const createQuickTask = (category: string, subject?: string) => {
    const template = TASK_TEMPLATES[category as keyof typeof TASK_TEMPLATES];
    const defaultCategory = subject && ACADEMIC_SUBJECTS.includes(subject) ? subject : category;
    
    if (template) {
      const now = new Date();
      const dueDate = new Date(now.getTime() + (template.estimatedHours * 24 * 60 * 60 * 1000)); // Add days based on estimated hours
      
      addTask({
        title: `${category}${subject ? ` - ${subject}` : ''}`,
        description: template.description,
        category: defaultCategory,
        priority: template.priority,
        dueDate,
        completed: false,
        isAcademic: true
      });
    } else {
      setQuickAddCategory(category);
      setIsAddingTask(true);
    }
  };

  const getStudyPlanSuggestions = () => {
    const now = new Date();
    const upcomingTasks = academicTasks.filter(task => 
      !task.completed && task.dueDate && task.dueDate > now
    ).length;

    const highPriorityTasks = academicTasks.filter(task => 
      !task.completed && task.priority === 'high'
    ).length;

    const suggestions = [];
    
    if (highPriorityTasks > 3) {
      suggestions.push({
        icon: AlertCircle,
        text: `Focus on ${highPriorityTasks} high-priority tasks first`,
        color: 'text-red-500'
      });
    }

    if (upcomingTasks > 5) {
      suggestions.push({
        icon: Clock,
        text: `Plan ahead for ${upcomingTasks} upcoming deadlines`,
        color: 'text-orange-500'
      });
    } else {
      suggestions.push({
        icon: Target,
        text: 'Great job managing your workload!',
        color: 'text-green-500'
      });
    }

    suggestions.push({
      icon: BookOpenCheck,
      text: 'Review completed tasks to reinforce learning',
      color: 'text-blue-500'
    });

    return suggestions;
  };

  const getSubjectProgress = (subject: string) => {
    const stats = subjectStats[subject];
    return stats ? (stats.completed / stats.total) * 100 : 0;
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'text-red-500';
    if (daysLeft <= 1) return 'text-red-400';
    if (daysLeft <= 3) return 'text-orange-400';
    if (daysLeft <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Semester Planner</h2>
            <p className="text-muted-foreground">Manage your academic tasks and deadlines</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={showGuideAgain}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
          <TaskForm
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Academic Task
              </Button>
            }
            onSubmit={handleAddAcademicTask}
            defaultCategory={selectedSubject !== 'all' ? selectedSubject : ''}
            academicMode={true}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="planning">Study Plan</TabsTrigger>
          <TabsTrigger value="how-to-use" className="gap-1.5">
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">How to Use</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-enter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="stagger-item stagger-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Academic Tasks</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredTasks.filter(t => t.completed).length} completed
                </p>
              </CardContent>
            </Card>

            <Card className="stagger-item stagger-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingDeadlines[0] ? `Next in ${upcomingDeadlines[0].daysLeft} days` : 'No deadlines'}
                </p>
              </CardContent>
            </Card>

            <Card className="stagger-item stagger-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredTasks.length > 0 
                    ? Math.round((filteredTasks.filter(t => t.completed).length / filteredTasks.length) * 100)
                    : 0}%
                </div>
                <Progress 
                  value={filteredTasks.length > 0 
                    ? (filteredTasks.filter(t => t.completed).length / filteredTasks.length) * 100
                    : 0
                  } 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Section */}
          <Card className="stagger-item stagger-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Task Creation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.keys(TASK_TEMPLATES).map((category, index) => (
                  <Button
                    key={category}
                    variant="outline"
                    className={`h-auto p-3 text-xs stagger-item stagger-${Math.min(index + 5, 8)}`}
                    onClick={() => createQuickTask(category, selectedSubject !== 'all' ? selectedSubject : undefined)}
                  >
                    <div className="text-center">
                      <div className="font-medium">{category}</div>
                      <div className="text-muted-foreground mt-1">
                        {TASK_TEMPLATES[category as keyof typeof TASK_TEMPLATES].priority} priority
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6 animate-enter">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(subjectStats).map(([subject, stats], index) => (
              <Card key={subject} className={`hover:shadow-md transition-shadow stagger-item stagger-${Math.min(index + 1, 8)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium truncate">{subject}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {stats.completed}/{stats.total}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
                    </div>
                    <Progress value={getSubjectProgress(subject)} className="h-2" />
                    
                    <div className="flex gap-2 mt-3">
                      <Badge variant="destructive" className="text-xs">
                        H: {stats.priority.high}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        M: {stats.priority.medium}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        L: {stats.priority.low}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines" className="space-y-6 animate-enter">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((task, index) => (
                    <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border stagger-item stagger-${Math.min(index + 1, 8)}`}>
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("font-medium", getUrgencyColor(task.daysLeft))}>
                          {task.daysLeft < 0 ? `${Math.abs(task.daysLeft)} days overdue` :
                           task.daysLeft === 0 ? 'Due today' :
                           task.daysLeft === 1 ? 'Due tomorrow' :
                           `${task.daysLeft} days left`}
                        </p>
                        <Badge className={cn(
                          task.priority === 'high' ? 'priority-badge-high' :
                          task.priority === 'medium' ? 'priority-badge-medium' :
                          'priority-badge-low'
                        )}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Plan Tab */}
        <TabsContent value="planning" className="space-y-6 animate-enter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Study Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getStudyPlanSuggestions().map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <Icon className={`h-5 w-5 ${suggestion.color}`} />
                        <p className="text-sm">{suggestion.text}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Task Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {STUDY_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm font-medium">{category}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => createQuickTask(category)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Study Schedule Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium text-lg">Morning Focus</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    High-priority tasks and complex subjects
                  </p>
                  <Badge variant="outline" className="mt-2">9:00 AM - 12:00 PM</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium text-lg">Afternoon Review</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Practice problems and assignments
                  </p>
                  <Badge variant="outline" className="mt-2">2:00 PM - 5:00 PM</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium text-lg">Evening Prep</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Reading and light study material
                  </p>
                  <Badge variant="outline" className="mt-2">7:00 PM - 9:00 PM</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* How to Use Tab */}
        <TabsContent value="how-to-use" className="space-y-6 animate-enter">
          <SemesterGuideDetailed />
        </TabsContent>
      </Tabs>

      {/* Semester Guide */}
      <SemesterGuide isVisible={showGuide} onClose={hideGuide} />
    </div>
  );
};