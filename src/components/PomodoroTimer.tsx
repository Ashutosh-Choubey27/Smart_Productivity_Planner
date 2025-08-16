import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAchievement } from '@/contexts/AchievementContext';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

interface PomodoroTimerProps {
  onFocusComplete?: (minutes: number) => void;
}

export const PomodoroTimer = ({ onFocusComplete }: PomodoroTimerProps) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();
  const { checkAchievements, userStats } = useAchievement();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = TIMER_DURATIONS[mode];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'pomodoro-timer'
      });
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      playNotificationSound();
      setIsRunning(false);
      
      if (mode === 'work') {
        const newCompletedPomodoros = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedPomodoros);
        
        // Update focus time achievements
        const focusMinutes = TIMER_DURATIONS.work / 60;
        checkAchievements({
          totalFocusTime: userStats.totalFocusTime + focusMinutes
        });
        
        if (onFocusComplete) {
          onFocusComplete(focusMinutes);
        }
        
        toast({
          title: "🎉 Pomodoro Complete!",
          description: `Great job! You've completed ${newCompletedPomodoros} pomodoro${newCompletedPomodoros !== 1 ? 's' : ''} today.`,
        });
        
        showNotification(
          "Pomodoro Complete! 🍅",
          "Time for a break! You've earned it."
        );
        
        // Auto-switch to break
        const nextMode = newCompletedPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(TIMER_DURATIONS[nextMode]);
      } else {
        toast({
          title: "Break Complete! ⚡",
          description: "Ready to get back to work? Let's stay productive!",
        });
        
        showNotification(
          "Break Complete! ⚡",
          "Time to get back to focused work!"
        );
        
        // Auto-switch back to work
        setMode('work');
        setTimeLeft(TIMER_DURATIONS.work);
      }
    }
  }, [timeLeft, isRunning, mode, completedPomodoros, onFocusComplete, toast, checkAchievements, userStats.totalFocusTime]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'work': return <Zap className="h-4 w-4" />;
      case 'shortBreak': return <Coffee className="h-4 w-4" />;
      case 'longBreak': return <Coffee className="h-4 w-4" />;
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'text-primary';
      case 'shortBreak': return 'text-success';
      case 'longBreak': return 'text-warning';
    }
  };

  return (
    <Card className="task-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getModeIcon()}
          <span className={getModeColor()}>
            Pomodoro Timer
          </span>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={mode === 'work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('work')}
            disabled={isRunning}
          >
            Work (25m)
          </Button>
          <Button
            variant={mode === 'shortBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('shortBreak')}
            disabled={isRunning}
          >
            Break (5m)
          </Button>
          <Button
            variant={mode === 'longBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('longBreak')}
            disabled={isRunning}
          >
            Long Break (15m)
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`text-6xl font-mono font-bold ${getModeColor()}`}>
            {formatTime(timeLeft)}
          </div>
          <Progress value={getProgress()} className="mt-4" />
        </div>
        
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button onClick={handleStart} className="bg-gradient-primary">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button onClick={handleReset} variant="outline" disabled={timeLeft === TIMER_DURATIONS[mode]}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Completed Pomodoros Today: <span className="font-semibold text-primary">{completedPomodoros}</span></p>
          <p className="mt-1">
            {mode === 'work' && 'Focus time! 🧠 Stay concentrated on your tasks.'}
            {mode === 'shortBreak' && 'Short break! ☕ Stretch and relax.'}
            {mode === 'longBreak' && 'Long break! 🌟 Take a proper rest.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};