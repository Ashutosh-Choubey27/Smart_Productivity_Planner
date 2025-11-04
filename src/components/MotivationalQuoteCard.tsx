import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getDailyQuote, getRandomQuote } from '@/utils/motivationalQuotes';

export const MotivationalQuoteCard = () => {
  const [quote, setQuote] = useState(getDailyQuote());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20 hover-lift">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1 animate-pulse-glow" />
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshQuote}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <blockquote className="text-sm md:text-base font-medium text-foreground/90 italic leading-relaxed">
          "{quote}"
        </blockquote>
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Daily Motivation</span>
        </div>
      </CardContent>
    </Card>
  );
};