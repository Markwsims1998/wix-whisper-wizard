
import React, { useState, useRef, useEffect } from "react";
import { ArrowDownCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RefreshableFeedProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const RefreshableFeed: React.FC<RefreshableFeedProps> = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const [refreshTriggered, setRefreshTriggered] = useState(false);
  const pullThreshold = 100; // Pull distance needed to trigger refresh
  const refreshContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset pull distance when refresh is complete
  useEffect(() => {
    if (!isRefreshing) {
      setPullMoveY(0);
    }
  }, [isRefreshing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull refresh when at top of container
    if (refreshContainer.current && refreshContainer.current.scrollTop <= 0) {
      setPullStartY(e.touches[0].clientY);
    } else {
      setPullStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY === 0 || isRefreshing) return;
    
    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - pullStartY;
    
    // Only allow pulling down, not up
    if (pullDistance > 0) {
      // Apply resistance to make pull feel natural
      const resistance = 0.4;
      setPullMoveY(pullDistance * resistance);
      
      if (pullDistance * resistance > pullThreshold && !refreshTriggered) {
        setRefreshTriggered(true);
      } else if (pullDistance * resistance <= pullThreshold && refreshTriggered) {
        setRefreshTriggered(false);
      }
      
      // Prevent default scrolling when pulling
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullMoveY > pullThreshold) {
      try {
        setIsRefreshing(true);
        await onRefresh();
        toast({
          title: "Feed Refreshed",
          description: "Your feed has been updated with new content",
        });
      } catch (error) {
        console.error("Error refreshing feed:", error);
        toast({
          title: "Refresh Failed",
          description: "Unable to refresh feed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRefreshing(false);
        setRefreshTriggered(false);
      }
    }
    setPullMoveY(0);
  };

  // Function to refresh manually via button click
  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
      toast({
        title: "Feed Refreshed",
        description: "Your feed has been updated with new content",
      });
    } catch (error) {
      console.error("Error refreshing feed:", error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div 
      className="w-full relative overflow-auto" 
      ref={refreshContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        style={{ transform: `translateY(${pullMoveY}px)` }}
        className={`absolute left-0 right-0 flex justify-center transition-transform z-10 ${pullMoveY > 0 ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
          <ArrowDownCircle 
            className={`w-6 h-6 transition-all ${refreshTriggered ? 'text-green-500 rotate-180' : 'text-gray-400'} 
            ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} 
          />
        </div>
      </div>

      {/* Refresh button for desktop */}
      <div className="hidden md:flex justify-center mb-4">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowDownCircle className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Feed"}
        </button>
      </div>

      {/* Main content with transform to follow pull distance */}
      <div
        style={{ transform: `translateY(${pullMoveY}px)` }}
        className="transition-transform"
      >
        {children}
      </div>
    </div>
  );
};

export default RefreshableFeed;
