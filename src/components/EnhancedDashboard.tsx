import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { AITaskBreakdown } from './AITaskBreakdown';
import { SemesterPlanner } from './SemesterPlanner';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Zap, 
  Brain, 
  Target,
  Calendar,
  Lightbulb
} from 'lucide-react';

export const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Smart Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Productivity Hub</h1>
          <p className="text-muted-foreground">Your AI-powered productivity command center</p>
        </div>
        <SmartNotifications />
      </div>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Tools</span>
          </TabsTrigger>
          <TabsTrigger value="focus" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Focus</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Habits</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Planning</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Main Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Dashboard />
            </div>
            <div className="space-y-6">
              <TaskStats compact />
              <AISuggestions />
            </div>
          </div>
        </TabsContent>

        {/* Advanced Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <AdvancedAnalytics />
            <div className="grid md:grid-cols-2 gap-6">
              <TaskAnalytics />
              <div className="space-y-6">
                <TaskStats compact />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* AI Tools Hub */}
        <TabsContent value="ai-tools" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <AISmartScheduler />
            <AISuggestions />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <AITimeEstimator 
              taskTitle="Sample Task" 
              taskDescription="Sample description for time estimation"
              taskCategory="Work"
            />
            <AITaskBreakdown 
              taskTitle="Complete Project Report"
              taskDescription="Research and write comprehensive project analysis"
            />
          </div>
        </TabsContent>

        {/* Focus & Productivity */}
        <TabsContent value="focus" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <FocusMode />
            <div className="space-y-6">
              <TaskStats compact />
              <AISuggestions />
            </div>
          </div>
        </TabsContent>

        {/* Habit Tracking */}
        <TabsContent value="habits" className="space-y-6">
          <HabitTracker />
        </TabsContent>

        {/* Team Collaboration */}
        <TabsContent value="team" className="space-y-6">
          <TeamCollaboration />
        </TabsContent>

        {/* Semester Planning */}
        <TabsContent value="planning" className="space-y-6">
          <SemesterPlanner />
        </TabsContent>

        {/* Insights & Suggestions */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <AdvancedAnalytics />
            <div className="grid md:grid-cols-2 gap-6">
              <AISuggestions />
              <AISmartScheduler />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};