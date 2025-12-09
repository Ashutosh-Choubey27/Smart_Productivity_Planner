import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SmartNotifications } from './SmartNotifications';
import { TeamCollaboration } from './TeamCollaboration';
import { FocusMode } from './FocusMode';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { HabitTracker } from './HabitTracker';
import { Dashboard } from './Dashboard';
import { TaskStats } from './TaskStats';
import { TaskAnalytics } from './TaskAnalytics';
import { AISuggestions } from './AISuggestions';
import { AISmartScheduler } from './AISmartScheduler';
import { AITimeEstimator } from './AITimeEstimator';

import { SemesterPlanner } from './SemesterPlanner';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Zap, 
  Brain, 
  Target,
  Calendar,
  Lightbulb,
  LogOut,
  User,
  Settings,
  ExternalLink
} from 'lucide-react';

export const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Smart Notifications and User Profile */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-in-left">
          <h1 className="text-3xl font-bold">Smart Productivity Hub</h1>
          <p className="text-muted-foreground">Your AI-powered productivity command center</p>
        </div>
        <div className="flex items-center gap-4 animate-slide-in-right">
          <SmartNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => window.open('https://supabase.com/dashboard/project/soxtmznhpmbsndjcuhse/settings/functions', '_blank')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>API Key Settings</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Enhanced Navigation - Responsive Grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 w-full gap-0 animate-slide-in-top stagger-1 p-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm relative border-r border-border/50 last:border-r-0">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm relative border-r border-border/50 last:border-r-0">
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="gap-1.5 text-xs sm:text-sm relative border-r border-border/50 last:border-r-0">
            <Brain className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">AI Tools</span>
          </TabsTrigger>
          <TabsTrigger value="focus" className="gap-1.5 text-xs sm:text-sm relative border-r border-border/50 last:border-r-0">
            <Zap className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Focus</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="gap-1.5 text-xs sm:text-sm relative border-r border-border/50 last:border-r-0">
            <Target className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Habits</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs sm:text-sm relative border-r border-border/50 last:border-r-0">
            <Users className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Team</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-1.5 text-xs sm:text-sm relative border-r border-border/50 last:border-r-0">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Main Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 animate-slide-in-left stagger-2">
              <Dashboard />
            </div>
            <div className="space-y-6 animate-slide-in-right stagger-3">
              <TaskStats compact />
              <AISuggestions />
            </div>
          </div>
        </TabsContent>

        {/* Advanced Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <div className="animate-slide-in-top stagger-2">
              <AdvancedAnalytics />
            </div>
            <div className="grid md:grid-cols-2 gap-6 stagger-3">
              <div className="animate-slide-in-left">
                <TaskAnalytics />
              </div>
              <div className="space-y-6 animate-slide-in-right">
                <TaskStats compact />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* AI Tools Hub */}
        <TabsContent value="ai-tools" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 stagger-2">
            <div className="animate-slide-in-left">
              <AISmartScheduler />
            </div>
            <div className="animate-slide-in-right">
              <AISuggestions />
            </div>
          </div>
          <div className="animate-slide-in-bottom stagger-3">
            <AITimeEstimator 
              taskTitle="Sample Task" 
              taskDescription="Sample description for time estimation"
              taskCategory="Work"
            />
          </div>
        </TabsContent>

        {/* Focus & Productivity */}
        <TabsContent value="focus" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="animate-slide-in-left stagger-2">
              <FocusMode />
            </div>
            <div className="space-y-6 animate-slide-in-right stagger-3">
              <TaskStats compact />
              <AISuggestions />
            </div>
          </div>
        </TabsContent>

        {/* Habit Tracking */}
        <TabsContent value="habits" className="space-y-6 animate-slide-in-bottom stagger-2">
          <HabitTracker />
        </TabsContent>

        {/* Team Collaboration */}
        <TabsContent value="team" className="space-y-6 animate-scale-in stagger-2">
          <TeamCollaboration />
        </TabsContent>

        {/* Insights & Suggestions */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <div className="animate-slide-in-top stagger-2">
              <AdvancedAnalytics />
            </div>
            <div className="grid md:grid-cols-2 gap-6 stagger-3">
              <div className="animate-slide-in-left">
                <AISuggestions />
              </div>
              <div className="animate-slide-in-right">
                <AISmartScheduler />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};