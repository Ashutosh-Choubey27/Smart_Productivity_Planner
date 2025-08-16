import { useMemo } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export const ProductivityHeatmap = () => {
  const { tasks } = useTask();

  const heatmapData = useMemo(() => {
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(today.getFullYear() - 1);

    const data: HeatmapDay[] = [];
    const tasksByDate: { [key: string]: number } = {};

    // Count completed tasks by date
    tasks.forEach(task => {
      if (task.completed) {
        const date = new Date(task.updatedAt).toISOString().split('T')[0];
        tasksByDate[date] = (tasksByDate[date] || 0) + 1;
      }
    });

    // Generate data for the last 365 days
    for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const count = tasksByDate[dateString] || 0;
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0) level = 1;
      if (count >= 3) level = 2;
      if (count >= 5) level = 3;
      if (count >= 8) level = 4;

      data.push({
        date: dateString,
        count,
        level
      });
    }

    return data;
  }, [tasks]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-muted/30';
      case 1: return 'bg-success/30';
      case 2: return 'bg-success/50';
      case 3: return 'bg-success/70';
      case 4: return 'bg-success';
      default: return 'bg-muted/30';
    }
  };

  const getMonthLabel = (date: string) => {
    const d = new Date(date);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[d.getMonth()];
  };

  const getDayOfWeek = (date: string) => {
    return new Date(date).getDay();
  };

  const getWeeksInYear = () => {
    return Math.ceil(heatmapData.length / 7);
  };

  const getTooltipText = (day: HeatmapDay) => {
    const date = new Date(day.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (day.count === 0) {
      return `No tasks completed on ${formattedDate}`;
    } else if (day.count === 1) {
      return `1 task completed on ${formattedDate}`;
    } else {
      return `${day.count} tasks completed on ${formattedDate}`;
    }
  };

  const weeks = [];
  for (let i = 0; i < getWeeksInYear(); i++) {
    const weekData = heatmapData.slice(i * 7, (i + 1) * 7);
    weeks.push(weekData);
  }

  // Get month labels for the year
  const monthLabels = [];
  for (let i = 0; i < heatmapData.length; i += 30) {
    if (heatmapData[i]) {
      monthLabels.push({
        month: getMonthLabel(heatmapData[i].date),
        position: i / 7
      });
    }
  }

  return (
    <Card className="task-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-success" />
          Productivity Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your task completion activity over the last year
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {/* Month labels */}
          <div className="flex text-xs text-muted-foreground ml-8">
            {monthLabels.map((label, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-[12px] text-center"
                style={{ marginLeft: index === 0 ? '0' : `${(label.position - (monthLabels[index-1]?.position || 0)) * 12 - 12}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2">
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Mon</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Wed</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Fri</div>
              <div className="h-3"></div>
            </div>
            
            {/* Heatmap cells */}
            <div className="flex gap-1 overflow-x-auto">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const day = week[dayIndex];
                    if (!day) {
                      return <div key={dayIndex} className="w-3 h-3" />;
                    }
                    
                    return (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${getCellColor(day.level)}`}
                        title={getTooltipText(day)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getCellColor(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-success">
                {heatmapData.filter(d => d.count > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {Math.max(...heatmapData.map(d => d.count), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Best Day</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">
                {Math.round((heatmapData.filter(d => d.count > 0).length / heatmapData.length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Consistency</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};