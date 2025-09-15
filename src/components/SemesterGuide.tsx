import { useState } from 'react';
import { BookOpen, CheckCircle, Calendar, Target, Users, TrendingUp, X, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SemesterGuideProps {
  onClose?: () => void;
  isVisible?: boolean;
}

export const SemesterGuide = ({ onClose, isVisible = true }: SemesterGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      title: "Welcome to Semester Planner! 📚",
      content: "Your AI-powered academic productivity companion",
      tips: [
        "Organize all your academic tasks in one place",
        "Get smart suggestions based on your workload",
        "Track progress across different subjects",
        "Never miss another deadline"
      ]
    },
    {
      title: "Quick Task Creation 🚀",
      content: "Create academic tasks in seconds",
      tips: [
        "Use Quick Actions for instant task templates",
        "Select your subject to auto-categorize tasks",
        "Templates include smart priority and time estimates",
        "Academic mode shows relevant subjects and categories"
      ]
    },
    {
      title: "Smart Organization 🎯",
      content: "Let AI help organize your academic workload",
      tips: [
        "Filter tasks by specific subjects using the dropdown",
        "View progress and priority breakdown per subject",
        "Track upcoming deadlines with urgency indicators",
        "Get personalized study suggestions based on your tasks"
      ]
    },
    {
      title: "Study Planning 📊",
      content: "Optimize your study schedule",
      tips: [
        "Follow suggested time slots for maximum productivity",
        "Use morning hours for complex, high-priority subjects",
        "Review completed tasks to reinforce learning",
        "Balance workload to prevent burnout"
      ]
    }
  ];

  const currentGuide = guideSteps[currentStep];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{currentGuide.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentGuide.content}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {currentGuide.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2">
            {guideSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Badge variant="secondary">
              {currentStep + 1} of {guideSteps.length}
            </Badge>

            {currentStep < guideSteps.length - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
                Get Started!
              </Button>
            )}
          </div>

          {/* Quick tips for current tab */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Pro Tips for Students
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• <strong>Batch similar tasks:</strong> Group all readings, assignments, or lab work together</p>
              <p>• <strong>Use the 2-minute rule:</strong> If a task takes less than 2 minutes, do it immediately</p>
              <p>• <strong>Set realistic deadlines:</strong> Add buffer time for unexpected challenges</p>
              <p>• <strong>Review weekly:</strong> Check completed tasks to identify learning patterns</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for managing guide visibility
export const useSemesterGuide = () => {
  const [showGuide, setShowGuide] = useState(() => {
    const hasSeenGuide = localStorage.getItem('semester-guide-seen');
    return !hasSeenGuide;
  });

  const hideGuide = () => {
    setShowGuide(false);
    localStorage.setItem('semester-guide-seen', 'true');
  };

  const showGuideAgain = () => {
    setShowGuide(true);
  };

  return { showGuide, hideGuide, showGuideAgain };
};