import { TaskProvider } from "@/contexts/TaskContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Smart Productivity Planner - AI-Powered Task Management</title>
        <meta name="description" content="Boost your productivity with AI-powered task management. Smart scheduling, habit tracking, and advanced analytics to help you achieve your goals." />
        <meta name="keywords" content="productivity, task management, AI planner, habit tracker, time management, goal setting" />
        <meta property="og:title" content="Smart Productivity Planner - AI-Powered Task Management" />
        <meta property="og:description" content="Boost your productivity with AI-powered task management" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <ErrorBoundary>
        <ThemeProvider>
          <TaskProvider>
            <AchievementProvider>
              <div className="min-h-screen bg-background">
                <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
                  <OfflineIndicator />
                  <ThemeToggle />
                </div>
                <EnhancedDashboard />
              </div>
            </AchievementProvider>
          </TaskProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </>
  );
};

export default Index;