
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { checkIfWinked, sendWink } from '@/services/winksService';

interface WinkButtonProps {
  recipientId: string;
  className?: string;
}

const WinkButton: React.FC<WinkButtonProps> = ({ recipientId, className = '' }) => {
  const [isWinked, setIsWinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [winkStatus, setWinkStatus] = useState<'pending' | 'accepted' | 'rejected' | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    const checkWinkStatus = async () => {
      if (!recipientId) return;
      
      try {
        setIsLoading(true);
        const { winked, status } = await checkIfWinked(recipientId);
        setIsWinked(winked);
        setWinkStatus(status);
      } catch (error) {
        console.error('Error checking wink status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWinkStatus();
  }, [recipientId]);

  const handleWink = async () => {
    if (isWinked) {
      toast({
        title: "Already Winked",
        description: `You have already sent a wink (status: ${winkStatus || 'pending'})`,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const { success, message } = await sendWink(recipientId);
      
      toast({
        title: success ? "Wink Sent" : "Failed to Send Wink",
        description: message,
        variant: success ? "default" : "destructive",
      });
      
      if (success) {
        setIsWinked(true);
        setWinkStatus('pending');
      }
    } catch (error) {
      console.error('Error sending wink:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the wink",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isWinked) {
      switch (winkStatus) {
        case 'accepted': return 'Wink Accepted';
        case 'rejected': return 'Wink Rejected';
        default: return 'Winked';
      }
    }
    return 'Wink';
  };

  return (
    <Button
      variant={isWinked ? "outline" : "default"}
      size="sm"
      className={`flex items-center gap-1 ${isWinked ? 'border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30' : 'bg-pink-500 hover:bg-pink-600'} ${className}`}
      disabled={isLoading}
      onClick={handleWink}
    >
      <Heart className={`h-4 w-4 ${isWinked ? 'fill-pink-500' : 'fill-white'}`} />
      <span>{getButtonText()}</span>
    </Button>
  );
};

export default WinkButton;
