
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { checkIfWinked, sendWink } from '@/services/winksService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from 'date-fns';

interface WinkButtonProps {
  recipientId: string;
  className?: string;
}

const WinkButton: React.FC<WinkButtonProps> = ({ recipientId, className = '' }) => {
  const [isWinked, setIsWinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [winkStatus, setWinkStatus] = useState<'pending' | 'accepted' | 'rejected' | undefined>();
  const [canSendNewWink, setCanSendNewWink] = useState(true);
  const [nextWinkDate, setNextWinkDate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkWinkStatus = async () => {
      if (!recipientId) return;
      
      try {
        setIsLoading(true);
        const { winked, status, canSendNewWink } = await checkIfWinked(recipientId);
        setIsWinked(winked);
        setWinkStatus(status);
        setCanSendNewWink(canSendNewWink);
        
        // If winked and can't send new wink, calculate the next available date
        if (winked && !canSendNewWink) {
          // Get the created_at date and add 7 days
          const { data } = await supabase
            .from('winks')
            .select('created_at')
            .match({ sender_id: user.id, recipient_id: recipientId })
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (data && data.length > 0) {
            const winkDate = new Date(data[0].created_at);
            const resetDate = new Date(winkDate);
            resetDate.setDate(winkDate.getDate() + 7);
            setNextWinkDate(resetDate);
          }
        }
      } catch (error) {
        console.error('Error checking wink status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWinkStatus();
  }, [recipientId]);

  const handleWink = async () => {
    if (isWinked && !canSendNewWink) {
      if (nextWinkDate) {
        toast({
          title: "Already Winked",
          description: `You can send another wink on ${format(nextWinkDate, 'MMMM d')}`,
        });
      } else {
        toast({
          title: "Already Winked",
          description: `You have already sent a wink (status: ${winkStatus || 'pending'})`,
        });
      }
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
        setCanSendNewWink(false);
        
        // Set next wink date to 7 days from now
        const resetDate = new Date();
        resetDate.setDate(resetDate.getDate() + 7);
        setNextWinkDate(resetDate);
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
  
  const getTooltipText = () => {
    if (isWinked && !canSendNewWink && nextWinkDate) {
      return `You can send another wink on ${format(nextWinkDate, 'MMMM d')}`;
    }
    if (isWinked) {
      switch (winkStatus) {
        case 'accepted': return 'Your wink was accepted';
        case 'rejected': return 'Your wink was declined';
        default: return 'Your wink is pending response';
      }
    }
    return 'Send a wink to show interest';
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isWinked ? "outline" : "default"}
            size="sm"
            className={`flex items-center gap-1 ${isWinked ? 'border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30' : 'bg-pink-500 hover:bg-pink-600'} ${className}`}
            disabled={isLoading || (isWinked && !canSendNewWink)}
            onClick={handleWink}
          >
            <Heart className={`h-4 w-4 ${isWinked ? 'fill-pink-500' : 'fill-white'}`} />
            <span>{getButtonText()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WinkButton;
