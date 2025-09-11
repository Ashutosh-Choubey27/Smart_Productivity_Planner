import { TaskProvider } from "@/contexts/TaskContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AchievementProvider } from "@/contexts/AchievementContext";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OfflineIndicator } from "@/components/OfflineIndicator";

const Index = () => {
  return (
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
  );
};

export default Index;