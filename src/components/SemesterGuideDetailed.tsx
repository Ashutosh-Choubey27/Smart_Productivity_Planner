import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Calendar, Target, BookOpen, Clock, 
  TrendingUp, CheckCircle, AlertCircle, Lightbulb 
} from 'lucide-react';

export const SemesterGuideDetailed: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <GraduationCap className="h-6 w-6 text-primary" />
            How Students Can Use the Semester Tab
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Real-Life Benefits */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Real-Life Benefits & Solutions
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Alert className="border-success/50 bg-success/5">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription>
                  <strong>Problem:</strong> Missing assignment deadlines<br/>
                  <strong>Solution:</strong> Visual deadline tracker with urgency indicators (red = urgent, green = safe)
                </AlertDescription>
              </Alert>

              <Alert className="border-success/50 bg-success/5">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription>
                  <strong>Problem:</strong> Overwhelmed by multiple subjects<br/>
                  <strong>Solution:</strong> Subject-wise organization with progress tracking per course
                </AlertDescription>
              </Alert>

              <Alert className="border-success/50 bg-success/5">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription>
                  <strong>Problem:</strong> Poor time management<br/>
                  <strong>Solution:</strong> Priority-based task system (High/Medium/Low) with quick task templates
                </AlertDescription>
              </Alert>

              <Alert className="border-success/50 bg-success/5">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription>
                  <strong>Problem:</strong> Losing track of progress<br/>
                  <strong>Solution:</strong> Real-time progress bars and completion stats for each subject
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* How to Use - Step by Step */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              Step-by-Step Usage Guide
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">1</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Start Your Semester Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    Click <strong>"Add Academic Task"</strong> to create tasks for all your subjects. 
                    Use templates like "Assignments", "Exam Preparation", "Lab Work" for quick creation.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">2</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Organize by Subjects</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit the <strong>"Subjects"</strong> tab to see all your courses. 
                    Each subject shows total tasks, completion rate, and priority breakdown (High/Medium/Low).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">3</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Track Deadlines</h4>
                  <p className="text-sm text-muted-foreground">
                    The <strong>"Deadlines"</strong> tab shows upcoming due dates sorted by urgency. 
                    Red = overdue/urgent, Orange = this week, Yellow = next week, Green = plenty of time.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">4</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Get Study Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    The <strong>"Study Plan"</strong> tab provides personalized suggestions based on your workload. 
                    It tells you if you have too many high-priority tasks or upcoming deadlines.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">5</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Use Quick Task Creation</h4>
                  <p className="text-sm text-muted-foreground">
                    On the <strong>"Overview"</strong> tab, use pre-defined templates to quickly add common academic tasks. 
                    Each template comes with appropriate priority and time estimates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Key Features You're Getting
            </h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Smart Deadline Management</h4>
                  <p className="text-xs text-muted-foreground">Never miss a submission with visual urgency indicators</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Progress Tracking</h4>
                  <p className="text-xs text-muted-foreground">See completion rates for each subject in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Priority Management</h4>
                  <p className="text-xs text-muted-foreground">Auto-categorized tasks by importance level</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Quick Task Templates</h4>
                  <p className="text-xs text-muted-foreground">Pre-configured templates for common academic tasks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <Alert className="border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>💡 Pro Tips for Maximum Productivity:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Review your semester planner every morning to prioritize daily tasks</li>
                <li>Add tasks as soon as professors announce them - don't wait!</li>
                <li>Use the subject filter to focus on one course at a time during study sessions</li>
                <li>Check the "Deadlines" tab weekly to plan ahead for busy periods</li>
                <li>Mark tasks complete immediately to get accurate progress tracking</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};