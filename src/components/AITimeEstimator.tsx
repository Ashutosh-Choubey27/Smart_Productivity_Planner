import { useState } from 'react';
import { Clock, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getLocalUserId } from '@/utils/userStorage';

interface TimeEstimatorProps {
  taskTitle: string;
  taskDescription?: string;
  taskCategory?: string;
  onEstimate?: (estimation: TimeEstimation) => void;
}

interface TimeEstimation {
  estimatedHours: number;
  confidence: number;
  breakdown: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const AITimeEstimator = ({ taskTitle, taskDescription, taskCategory, onEstimate }: TimeEstimatorProps) => {
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<TimeEstimation | null>(null);
  const { toast } = useToast();

  const generateEstimate = async () => {
    setLoading(true);
    try {
      const localUserId = getLocalUserId();

      const { data, error } = await supabase.functions.invoke('ai-time-estimator', {
        body: { 
          user_id: localUserId,
          task_title: taskTitle,
          task_description: taskDescription || '',
          task_category: taskCategory || ''
        }
      });

      if (error) throw error;

      if (data.success && data.estimation) {
        setEstimation(data.estimation);
        onEstimate?.(data.estimation);

        toast({
          title: "✓ Time Estimate Generated!",
          description: `Estimated ${data.estimation.estimatedHours} hours for "${taskTitle}"`,
        });
      }
    } catch (error) {
      console.error('Error generating time estimate:', error);
      toast({
        title: "❌ Error",
        description: "Failed to generate time estimate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'Hard':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="task-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Time Estimator</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-foreground mb-1">Estimating Time For:</p>
          <p className="text-sm text-muted-foreground">{taskTitle}</p>
          {taskDescription && (
            <p className="text-xs text-muted-foreground mt-1">{taskDescription}</p>
          )}
        </div>

        {!estimation ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Get AI-powered time estimates for better planning
            </p>
            <Button
              onClick={generateEstimate}
              disabled={loading}
              className="bg-gradient-primary hover:bg-primary-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  Estimate Time
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border">
              <div>
                <p className="text-lg font-semibold text-primary">
                  {estimation.estimatedHours} hours
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(estimation.confidence * 100)}% confidence
                </p>
              </div>
              <Badge
                variant="outline"
                className={getDifficultyColor(estimation.difficulty)}
              >
                {estimation.difficulty}
              </Badge>
            </div>

            {estimation.breakdown.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Time Breakdown:</p>
                <div className="space-y-2">
                  {estimation.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 text-sm bg-muted/30 rounded border-l-2 border-primary/30"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setEstimation(null);
                generateEstimate();
              }}
              className="w-full"
            >
              Regenerate Estimate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};