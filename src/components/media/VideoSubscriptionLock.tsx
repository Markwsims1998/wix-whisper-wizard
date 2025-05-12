
import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface VideoSubscriptionLockProps {
  opacity?: number;
  className?: string;
}

/**
 * A component that displays a subscription lock overlay for videos,
 * shown to users who don't have the required subscription tier
 */
const VideoSubscriptionLock: React.FC<VideoSubscriptionLockProps> = ({
  opacity = 0.85,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/shop');
  };

  return (
    <div 
      className={`absolute inset-0 overflow-hidden z-20 flex items-center justify-center ${className}`}
      style={{ backgroundColor: `rgba(0, 0, 0, ${opacity})` }}
    >
      <div className="text-center px-4 py-6 rounded-lg max-w-xs">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
            <Lock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Premium Content</h3>
        <p className="text-gray-200 text-sm mb-4">
          This video requires a premium subscription to view
        </p>
        <Button 
          onClick={handleUpgradeClick} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
};

export default VideoSubscriptionLock;
