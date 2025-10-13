import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Play, Pause, Square, Timer, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface FocusSession {
  id: string;
  taskId?: string;
  duration: number; // in minutes
  startTime: Date;
  isActive: boolean;
  blockedSites: string[];
  sessionType: 'pomodoro' | 'deep-work' | 'study' | 'custom';
}

const FOCUS_PRESETS = {
  pomodoro: { duration: 25, break: 5, name: 'Pomodoro', icon: '🍅' },
  'deep-work': { duration: 90, break: 15, name: 'Deep Work', icon: '🧠' },
  study: { duration: 45, break: 10, name: 'Study Session', icon: '📚' },
  custom: { duration: 60, break: 10, name: 'Custom', icon: '⚙️' }
};

const DISTRACTION_SITES = [
  'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 
  'tiktok.com', 'reddit.com', 'netflix.com', 'twitch.tv'
];

export const FocusMode: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockedAttempts, setBlockedAttempts] = useState(0);
  const [sessionType, setSessionType] = useState<keyof typeof FOCUS_PRESETS>('pomodoro');
  const [customDuration, setCustomDuration] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentSession?.isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [currentSession?.isActive, timeRemaining]);

  const startFocusSession = () => {
    const preset = FOCUS_PRESETS[sessionType];
    const duration = sessionType === 'custom' ? customDuration : preset.duration;
    
    const session: FocusSession = {
      id: Date.now().toString(),
      duration,
      startTime: new Date(),
      isActive: true,
      blockedSites: DISTRACTION_SITES,
      sessionType
    };

    setCurrentSession(session);
    setTimeRemaining(duration * 60); // Convert to seconds
    setIsBlocking(true);
    setBlockedAttempts(0);

    // Notify about blocking
    implementWebsiteBlocking();
    
    toast.success(`${preset.name} session started! Stay focused! 🎯`);
  };

  const pauseSession = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: false });
      toast.info('Focus session paused');
    }
  };

  const resumeSession = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: true });
      toast.info('Focus session resumed');
    }
  };

  const stopSession = () => {
    setCurrentSession(null);
    setTimeRemaining(0);
    setIsBlocking(false);
    setBlockedAttempts(0);
    toast.info('Focus session ended');
  };

  const handleSessionComplete = () => {
    const preset = FOCUS_PRESETS[sessionType];
    toast.success(`🎉 ${preset.name} session completed! Great job!`);
    
    // Show break suggestion
    setTimeout(() => {
      toast.info(`Time for a ${preset.break}-minute break! 🧘‍♂️`);
    }, 1000);

    stopSession();
  };

  const implementWebsiteBlocking = () => {
    // Show blocking instructions
    toast.info('🛡️ Focus Mode Active! Browser instructions sent.', {
      duration: 5000,
      description: 'Check the instructions panel for manual blocking steps.'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!currentSession) return 0;
    const totalSeconds = currentSession.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  const getFocusIntensity = () => {
    const percentage = getProgressPercentage();
    if (percentage < 25) return { level: 'Starting Up', color: 'bg-blue-500', intensity: '🟢' };
    if (percentage < 50) return { level: 'Getting Focused', color: 'bg-yellow-500', intensity: '🟡' };
    if (percentage < 75) return { level: 'Deep Focus', color: 'bg-orange-500', intensity: '🟠' };
    return { level: 'Peak Focus', color: 'bg-red-500', intensity: '🔴' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Focus Mode & Distraction Blocker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!currentSession ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Focus Type</label>
              <Select value={sessionType} onValueChange={(value: keyof typeof FOCUS_PRESETS) => setSessionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FOCUS_PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{preset.icon}</span>
                        <span>{preset.name}</span>
                        <span className="text-muted-foreground">({preset.duration}min)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sessionType === 'custom' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Select value={customDuration.toString()} onValueChange={(value) => setCustomDuration(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120].map(duration => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Distraction Sites to Block:
              </h4>
              <div className="flex flex-wrap gap-1">
                {DISTRACTION_SITES.slice(0, 6).map(site => (
                  <Badge key={site} variant="outline" className="text-xs">
                    {site}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  +{DISTRACTION_SITES.length - 6} more
                </Badge>
              </div>
              
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p className="font-medium mb-1">📌 How to block these sites:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Chrome: Settings → Privacy → Site Settings → Add sites</li>
                  <li>Firefox: about:preferences → Content Blocking → Custom</li>
                  <li>Or use browser extensions like "StayFocusd" or "LeechBlock"</li>
                </ol>
              </div>
            </div>

            <Button onClick={startFocusSession} className="w-full gap-2">
              <Play className="w-4 h-4" />
              Start Focus Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session Info */}
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
              <div className="flex items-center justify-center gap-2">
                <span>{FOCUS_PRESETS[sessionType].icon}</span>
                <span className="font-medium">{FOCUS_PRESETS[sessionType].name}</span>
                <Badge variant="outline">
                  {getFocusIntensity().intensity} {getFocusIntensity().level}
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={getProgressPercentage()} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress: {Math.round(getProgressPercentage())}%</span>
                <span>Time: {Math.round(timeRemaining / 60)}min left</span>
              </div>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-semibold text-lg flex items-center justify-center gap-1">
                  <Timer className="w-4 h-4" />
                  {Math.round(timeRemaining / 60)}
                </div>
                <div className="text-xs text-muted-foreground">Minutes Left</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-semibold text-lg flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  {isBlocking ? 'ACTIVE' : 'OFF'}
                </div>
                <div className="text-xs text-muted-foreground">Focus Mode</div>
              </div>
            </div>

            {/* Blocking Instructions */}
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                🛡️ Manual Blocking Active
              </p>
              <p className="text-xs text-muted-foreground">
                For automatic blocking, install browser extensions like <strong>StayFocusd</strong> (Chrome) or <strong>LeechBlock</strong> (Firefox).
                Web apps cannot block websites directly.
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {currentSession.isActive ? (
                <Button onClick={pauseSession} variant="outline" className="flex-1 gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeSession} variant="outline" className="flex-1 gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              )}
              <Button onClick={stopSession} variant="destructive" className="flex-1 gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </div>

            {/* Motivation */}
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-sm font-medium text-primary">
                🎯 Stay focused! You're building great habits!
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};