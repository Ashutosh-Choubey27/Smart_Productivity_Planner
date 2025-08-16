import { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceTaskInputProps {
  onVoiceInput: (text: string) => void;
  disabled?: boolean;
}

export const VoiceTaskInput = ({ onVoiceInput, disabled }: VoiceTaskInputProps) => {
  const { 
    isListening, 
    transcript, 
    isSupported, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useVoiceRecognition();

  const { toast } = useToast();

  useEffect(() => {
    if (transcript && !isListening) {
      onVoiceInput(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onVoiceInput, resetTranscript]);

  const handleClick = () => {
    if (!isSupported) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "transition-all duration-200",
        isListening && "bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse"
      )}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4 mr-2" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-2" />
          Voice
        </>
      )}
    </Button>
  );
};