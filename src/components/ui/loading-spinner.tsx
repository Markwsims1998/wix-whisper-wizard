
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-purple-300 blur-lg animate-pulse"></div>
            <div className={cn("animate-spin text-[#8B5CF6]", sizeClasses[size])}>
              <Loader className="w-full h-full" />
            </div>
          </div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("animate-spin text-[#8B5CF6]", sizeClasses[size], className)}>
      <Loader className="w-full h-full" />
    </div>
  );
}
