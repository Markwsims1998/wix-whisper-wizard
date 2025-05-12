
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface WatermarkProps {
  opacity?: number;
  fontSize?: string;
  className?: string;
  showSubscriptionMessage?: boolean;
}

/**
 * A reusable watermark component that displays "© HappyKinks"
 * Can also display a subscription message for premium content
 */
const Watermark: React.FC<WatermarkProps> = ({
  opacity = 0.5,
  fontSize = '6xl',
  className = '',
  showSubscriptionMessage = false,
}) => {
  if (showSubscriptionMessage) {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-auto z-20 ${className}`}>
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/70">
          <div className="text-white text-center px-4 py-8 rounded-lg max-w-md">
            <h3 className="text-2xl font-bold mb-2">Premium Content</h3>
            <p className="mb-4">You need a subscription to view this video in full quality.</p>
            <Link to="/settings?tab=subscription">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-10 ${className}`}>
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div 
          className={`font-bold text-white text-${fontSize} transform -rotate-12 select-none whitespace-nowrap`}
          style={{ opacity }}
        >
          © HappyKinks
        </div>
      </div>
    </div>
  );
};

export default Watermark;
