import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TaskProvider } from "@/contexts/TaskContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
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