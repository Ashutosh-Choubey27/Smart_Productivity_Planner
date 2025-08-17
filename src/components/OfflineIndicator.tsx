import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { OfflineService } from '@/utils/offlineService';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
    };

    const handleSyncComplete = () => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    };

    window.addEventListener('app-online', handleOnline);
    window.addEventListener('app-offline', handleOffline);
    window.addEventListener('sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('app-online', handleOnline);
      window.removeEventListener('app-offline', handleOffline);
      window.removeEventListener('sync-complete', handleSyncComplete);
    };
  }, []);

  if (isOnline && syncStatus === 'idle') {
    return null; // Don't show anything when online and not syncing
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Online</span>
              </div>
              {syncStatus === 'syncing' && (
                <Badge variant="secondary" className="animate-pulse">
                  <Cloud className="h-3 w-3 mr-1" />
                  Syncing...
                </Badge>
              )}
              {syncStatus === 'synced' && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Cloud className="h-3 w-3 mr-1" />
                  Synced
                </Badge>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Offline Mode</span>
              <Badge variant="outline" className="text-orange-500 border-orange-500">
                <HardDrive className="h-3 w-3 mr-1" />
                Local Storage
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};