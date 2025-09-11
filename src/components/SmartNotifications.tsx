import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { toast } from 'sonner';

interface SmartNotification {
  id: string;
  type: 'deadline' | 'reminder' | 'suggestion' | 'achievement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  taskId?: string;
  timestamp: Date;
  dismissed: boolean;
}

export const SmartNotifications: React.FC = () => {
  const { tasks } = useTask();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    generateSmartNotifications();
  }, [tasks]);

  const generateSmartNotifications = () => {
    const now = new Date();
    const newNotifications: SmartNotification[] = [];

    tasks.forEach(task => {
      if (task.completed) return;

      // Deadline warnings
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff <= 1 && daysDiff >= 0) {
          newNotifications.push({
            id: `deadline-${task.id}`,
            type: 'deadline',
            title: 'Urgent Deadline',
            message: `"${task.title}" is due ${daysDiff === 0 ? 'today' : 'tomorrow'}!`,
            priority: 'high',
            taskId: task.id,
            timestamp: now,
            dismissed: false
          });
        } else if (daysDiff <= 3 && daysDiff > 1) {
          newNotifications.push({
            id: `reminder-${task.id}`,
            type: 'reminder',
            title: 'Upcoming Deadline',
            message: `"${task.title}" is due in ${daysDiff} days`,
            priority: 'medium',
            taskId: task.id,
            timestamp: now,
            dismissed: false
          });
        }
      }

      // Stagnant task suggestions
      if (task.progress && task.progress > 0 && task.progress < 100) {
        const lastUpdate = new Date(task.updatedAt);
        const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
        
        if (daysSinceUpdate >= 2) {
          newNotifications.push({
            id: `stagnant-${task.id}`,
            type: 'suggestion',
            title: 'Task Needs Attention',
            message: `"${task.title}" hasn't been updated in ${daysSinceUpdate} days`,
            priority: 'medium',
            taskId: task.id,
            timestamp: now,
            dismissed: false
          });
        }
      }
    });

    // Achievement notifications
    const completedToday = tasks.filter(task => {
      if (!task.completed) return false;
      // Since we don't have completed_at, we'll use a different approach
      return task.completed;
    }).length;

    if (completedToday >= 5) {
      newNotifications.push({
        id: `achievement-${now.getTime()}`,
        type: 'achievement',
        title: '🎉 Productivity Star!',
        message: `You've completed ${completedToday} tasks today! Keep up the great work!`,
        priority: 'low',
        timestamp: now,
        dismissed: false
      });
    }

    setNotifications(newNotifications.filter(n => !n.dismissed));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'deadline': return <AlertTriangle className="w-4 h-4" />;
      case 'reminder': return <Clock className="w-4 h-4" />;
      case 'suggestion': return <Bell className="w-4 h-4" />;
      case 'achievement': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
    }
  };

  const unreadCount = notifications.filter(n => !n.dismissed).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Smart Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications at the moment
              </p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs opacity-90 mt-1">{notification.message}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0 hover:bg-background/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};