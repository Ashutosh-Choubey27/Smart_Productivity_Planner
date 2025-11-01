import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  category: 'productivity' | 'streak' | 'milestone' | 'special';
}

interface UserStats {
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompletedToday: number;
  totalFocusTime: number; // in minutes
  achievementsUnlocked: number;
  perfectDays: number; // days with 100% task completion
}

interface AchievementContextType {
  achievements: Achievement[];
  userStats: UserStats;
  checkAchievements: (stats: Partial<UserStats>) => void;
  resetAchievements: () => void;
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first-task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    isUnlocked: false,
    category: 'milestone'
  },
  {
    id: 'five-tasks',
    title: 'Productive Day',
    description: 'Complete 5 tasks in a single day',
    icon: '🔥',
    isUnlocked: false,
    category: 'productivity'
  },
  {
    id: 'ten-tasks',
    title: 'Task Master',
    description: 'Complete 10 tasks total',
    icon: '⭐',
    isUnlocked: false,
    category: 'milestone'
  },
  {
    id: 'three-day-streak',
    title: 'Consistency',
    description: 'Complete tasks for 3 days in a row',
    icon: '🔄',
    isUnlocked: false,
    category: 'streak'
  },
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Complete tasks for 7 days straight',
    icon: '⚡',
    isUnlocked: false,
    category: 'streak'
  },
  {
    id: 'fifty-tasks',
    title: 'Half Century',
    description: 'Complete 50 tasks total',
    icon: '🏆',
    isUnlocked: false,
    category: 'milestone'
  },
  {
    id: 'perfect-day',
    title: 'Perfectionist',
    description: 'Complete all tasks in a day',
    icon: '💎',
    isUnlocked: false,
    category: 'special'
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a task before 8 AM',
    icon: '🐦',
    isUnlocked: false,
    category: 'special'
  },
  {
    id: 'hundred-tasks',
    title: 'Centurion',
    description: 'Complete 100 tasks total',
    icon: '👑',
    isUnlocked: false,
    category: 'milestone'
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 10 hours of focused work',
    icon: '🧠',
    isUnlocked: false,
    category: 'productivity'
  }
];

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievement must be used within an AchievementProvider');
  }
  return context;
};

interface AchievementProviderProps {
  children: ReactNode;
}

export const AchievementProvider = ({ children }: AchievementProviderProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('productivity-achievements');
    if (saved) {
      try {
        return JSON.parse(saved).map((ach: any) => ({
          ...ach,
          unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : undefined
        }));
      } catch {
        return defaultAchievements;
      }
    }
    return defaultAchievements;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('productivity-user-stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          totalTasksCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          tasksCompletedToday: 0,
          totalFocusTime: 0,
          achievementsUnlocked: 0,
          perfectDays: 0
        };
      }
    }
    return {
      totalTasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      tasksCompletedToday: 0,
      totalFocusTime: 0,
      achievementsUnlocked: 0,
      perfectDays: 0
    };
  });

  const { toast } = useToast();

  // Save to localStorage whenever achievements or stats change
  useEffect(() => {
    localStorage.setItem('productivity-achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('productivity-user-stats', JSON.stringify(userStats));
  }, [userStats]);

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.id === achievementId && !ach.isUnlocked) {
        toast({
          title: "🎉 Achievement Unlocked!",
          description: `${ach.icon} ${ach.title}: ${ach.description}`,
          className: "bg-purple-600 border-purple-500 text-white dark:bg-purple-600 dark:text-white backdrop-blur-md",
        });
        
        return {
          ...ach,
          isUnlocked: true,
          unlockedAt: new Date()
        };
      }
      return ach;
    }));
  };

  const checkAchievements = (newStats: Partial<UserStats>) => {
    const updatedStats = { ...userStats, ...newStats };
    setUserStats(updatedStats);

    // Check each achievement condition
    if (updatedStats.totalTasksCompleted >= 1) {
      unlockAchievement('first-task');
    }
    
    if (updatedStats.tasksCompletedToday >= 5) {
      unlockAchievement('five-tasks');
    }
    
    if (updatedStats.totalTasksCompleted >= 10) {
      unlockAchievement('ten-tasks');
    }
    
    if (updatedStats.currentStreak >= 3) {
      unlockAchievement('three-day-streak');
    }
    
    if (updatedStats.currentStreak >= 7) {
      unlockAchievement('week-streak');
    }
    
    if (updatedStats.totalTasksCompleted >= 50) {
      unlockAchievement('fifty-tasks');
    }
    
    if (updatedStats.totalTasksCompleted >= 100) {
      unlockAchievement('hundred-tasks');
    }
    
    if (updatedStats.perfectDays >= 1) {
      unlockAchievement('perfect-day');
    }
    
    if (updatedStats.totalFocusTime >= 600) { // 10 hours in minutes
      unlockAchievement('focus-master');
    }

    // Check for early bird (this would need to be called from task completion)
    const now = new Date();
    if (now.getHours() < 8 && updatedStats.tasksCompletedToday > 0) {
      unlockAchievement('early-bird');
    }
  };

  const resetAchievements = () => {
    setAchievements(defaultAchievements);
    setUserStats({
      totalTasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      tasksCompletedToday: 0,
      totalFocusTime: 0,
      achievementsUnlocked: 0,
      perfectDays: 0
    });
    localStorage.removeItem('productivity-achievements');
    localStorage.removeItem('productivity-user-stats');
  };

  return (
    <AchievementContext.Provider value={{
      achievements,
      userStats,
      checkAchievements,
      resetAchievements
    }}>
      {children}
    </AchievementContext.Provider>
  );
};