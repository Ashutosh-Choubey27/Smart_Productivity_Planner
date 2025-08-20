import { useState, useMemo } from 'react';
import { Calendar, BookOpen, Clock, GraduationCap, Target, Plus } from 'lucide-react';
import { useTask, Task } from '@/contexts/TaskContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export const SemesterPlanner = () => {
  const { tasks, addTask } = useTask();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Filter tasks that are academic-related
  const academicTasks = useMemo(() => {
    return tasks.filter(task => 
      ACADEMIC_SUBJECTS.some(subject => 
        task.category.toLowerCase().includes(subject.toLowerCase()) ||
        task.title.toLowerCase().includes(subject.toLowerCase())
      ) || 
      STUDY_CATEGORIES.some(category => 
        task.category.toLowerCase().includes(category.toLowerCase()) ||
        task.title.toLowerCase().includes(category.toLowerCase())
      )
    );
  }, [tasks]);

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
    addTask(taskData);
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
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="planning">Study Plan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-enter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Academic Tasks</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{academicTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {academicTasks.filter(t => t.completed).length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
                <p className="text-xs text-muted-foreground">
                  Next in {upcomingDeadlines[0]?.daysLeft || 0} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {academicTasks.length > 0 
                    ? Math.round((academicTasks.filter(t => t.completed).length / academicTasks.length) * 100)
                    : 0}%
                </div>
                <Progress 
                  value={academicTasks.length > 0 
                    ? (academicTasks.filter(t => t.completed).length / academicTasks.length) * 100
                    : 0
                  } 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6 animate-enter">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(subjectStats).map(([subject, stats]) => (
              <Card key={subject} className="hover:shadow-md transition-shadow">
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
                  {upcomingDeadlines.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
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
          <Card>
            <CardHeader>
              <CardTitle>Study Plan Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Suggestions</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Focus on high-priority tasks first
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Allocate 2-3 hours daily for exam subjects
                    </p>
                    <p className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      Review completed topics weekly
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Study Categories</h4>
                  <div className="space-y-2">
                    {STUDY_CATEGORIES.slice(0, 6).map(category => (
                      <Badge key={category} variant="outline" className="mr-2 mb-2">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};