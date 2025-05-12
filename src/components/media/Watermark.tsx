
import React from 'react';

interface WatermarkProps {
  opacity?: number;
  fontSize?: string;
  className?: string;
}

/**
 * A reusable watermark component that displays "© HappyKinks"
 * Used primarily for images - for videos, use VideoSubscriptionLock instead
 */
const Watermark: React.FC<WatermarkProps> = ({
  opacity = 0.5,
  fontSize = '6xl',
  className = '',
}) => {
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
