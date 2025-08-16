import { Trophy, Award, Zap, Calendar } from 'lucide-react';
import { useAchievement } from '@/contexts/AchievementContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export const AchievementPanel = () => {
  const { achievements, userStats } = useAchievement();

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  const getProgressForAchievement = (achievementId: string) => {
    switch (achievementId) {
      case 'ten-tasks':
        return Math.min((userStats.totalTasksCompleted / 10) * 100, 100);
      case 'fifty-tasks':
        return Math.min((userStats.totalTasksCompleted / 50) * 100, 100);
      case 'hundred-tasks':
        return Math.min((userStats.totalTasksCompleted / 100) * 100, 100);
      case 'three-day-streak':
        return Math.min((userStats.currentStreak / 3) * 100, 100);
      case 'week-streak':
        return Math.min((userStats.currentStreak / 7) * 100, 100);
      case 'focus-master':
        return Math.min((userStats.totalFocusTime / 600) * 100, 100);
      default:
        return 0;
    }
  };

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(a => a.category === category);
  };

  const AchievementCard = ({ achievement, showProgress = false }: { achievement: any, showProgress?: boolean }) => (
    <Card className={cn(
      "task-card transition-all duration-300",
      achievement.isUnlocked 
        ? "bg-gradient-card border-success/20 shadow-medium" 
        : "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "text-2xl p-2 rounded-full",
            achievement.isUnlocked 
              ? "bg-success/10 text-success" 
              : "bg-muted text-muted-foreground"
          )}>
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold text-sm",
                achievement.isUnlocked ? "text-card-foreground" : "text-muted-foreground"
              )}>
                {achievement.title}
              </h3>
              {achievement.isUnlocked && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  Unlocked
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {achievement.description}
            </p>
            
            {achievement.unlockedAt && (
              <p className="text-xs text-success">
                Unlocked on {achievement.unlockedAt.toLocaleDateString()}
              </p>
            )}
            
            {!achievement.isUnlocked && showProgress && (
              <div className="mt-2">
                <Progress value={getProgressForAchievement(achievement.id)} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(getProgressForAchievement(achievement.id))}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="task-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Achievements
          <Badge variant="secondary" className="ml-auto">
            {unlockedAchievements.length} / {achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{userStats.totalTasksCompleted}</div>
            <div className="text-xs text-muted-foreground">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{userStats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{Math.round(userStats.totalFocusTime / 60)}h</div>
            <div className="text-xs text-muted-foreground">Focus Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{unlockedAchievements.length}</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">
              <Award className="h-4 w-4 mr-1" />
              Unlocked
            </TabsTrigger>
            <TabsTrigger value="milestone">
              <Zap className="h-4 w-4 mr-1" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="streak">
              <Calendar className="h-4 w-4 mr-1" />
              Streaks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 mt-4">
            {achievements.map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                showProgress={!achievement.isUnlocked}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="unlocked" className="space-y-3 mt-4">
            {unlockedAchievements.length > 0 ? (
              unlockedAchievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No achievements unlocked yet!</p>
                <p className="text-sm">Complete tasks to start earning achievements.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="milestone" className="space-y-3 mt-4">
            {getAchievementsByCategory('milestone').map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                showProgress={!achievement.isUnlocked}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="streak" className="space-y-3 mt-4">
            {getAchievementsByCategory('streak').map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                showProgress={!achievement.isUnlocked}
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};