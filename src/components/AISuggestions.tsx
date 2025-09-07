import { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTask } from '@/contexts/TaskContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getLocalUserId } from '@/utils/userStorage';
import { isValidTaskTitle } from '@/utils/validation';

interface AISuggestion {
  id: string;
  suggestion_type: string;
  suggestion_text: string;
  confidence_score: number;
  applied: boolean;
  created_at: string;
}

export const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { addTask } = useTask();
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    try {
      const localUserId = getLocalUserId();

      const { data, error } = await supabase
        .from('task_suggestions')
        .select('*')
        .eq('user_id', localUserId)
        .eq('applied', false)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const generateNewSuggestions = async () => {
    setRefreshing(true);
    try {
      const localUserId = getLocalUserId();

      const { data, error } = await supabase.functions.invoke('ai-task-suggestions', {
        body: { user_id: localUserId }
      });

      if (error) throw error;

      if (data.success) {
        await fetchSuggestions();
        toast({
          title: "AI Suggestions Generated!",
          description: `Generated ${data.suggestions?.length || 0} new task suggestions based on your patterns.`,
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const applySuggestion = async (suggestion: AISuggestion) => {
    setLoading(true);
    try {
      // Validate the suggestion title before adding
      if (!isValidTaskTitle(suggestion.suggestion_text)) {
        toast({
          title: "Invalid Suggestion",
          description: "This AI suggestion doesn't meet our quality standards. Skipping...",
        });
        // Mark as applied to remove from UI
        await supabase
          .from('task_suggestions')
          .update({ applied: true })
          .eq('id', suggestion.id);
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        return;
      }

      // Add as a task
      addTask({
        title: suggestion.suggestion_text,
        description: `AI-suggested task based on your productivity patterns (${Math.round(suggestion.confidence_score * 100)}% confidence)`,
        priority: 'medium' as const,
        category: suggestion.suggestion_type.replace('_', ' '),
        completed: false,
        progress: 0
      });

      // Mark suggestion as applied
      const { error } = await supabase
        .from('task_suggestions')
        .update({ applied: true })
        .eq('id', suggestion.id);

      if (error) throw error;

      // Remove from UI
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

      toast({
        title: "Suggestion Applied!",
        description: "The AI suggestion has been added to your tasks.",
      });
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to apply suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissSuggestion = async (suggestion: AISuggestion) => {
    try {
      const { error } = await supabase
        .from('task_suggestions')
        .update({ applied: true }) // Mark as applied to hide it
        .eq('id', suggestion.id);

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      toast({
        title: "Suggestion Dismissed",
        description: "The suggestion has been removed.",
      });
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const getSuggestionTypeIcon = (type: string) => {
    switch (type) {
      case 'productivity_optimization':
        return '⚡';
      case 'skill_development':
        return '🎯';
      case 'organization':
        return '📋';
      case 'wellness':
        return '🌱';
      case 'habit_building':
        return '🔄';
      default:
        return '💡';
    }
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'productivity_optimization':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'skill_development':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'organization':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'wellness':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'habit_building':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <Card className="task-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Task Suggestions</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewSuggestions}
            disabled={refreshing}
            className="h-8"
          >
            {refreshing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No AI suggestions available yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewSuggestions}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">
                  {getSuggestionTypeIcon(suggestion.suggestion_type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getSuggestionTypeColor(suggestion.suggestion_type)}`}
                    >
                      {suggestion.suggestion_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(suggestion.confidence_score * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {suggestion.suggestion_text}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      disabled={loading}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissSuggestion(suggestion)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};