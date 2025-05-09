
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ThemeProvider } from "./contexts/ThemeContext";
import Footer from "./components/Footer";

// Import pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Photos from "./pages/Photos";
import Activity from "./pages/Activity";
import Videos from "./pages/Videos";
import People from "./pages/People";
import Notifications from "./pages/Notifications";
import Shop from "./pages/Shop";
import Basket from "./pages/Basket";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Feedback from "./pages/Feedback";
import HomePage from "./pages/HomePage";
import Admin from "./pages/Admin";

// Create a query client
const queryClient = new QueryClient();

// Simple auth context provider that doesn't require authentication
const SimpleAuthProvider = ({ children }) => {
  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Log initial app load
    console.log("User activity: Application loaded");
    
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Reduced loading time

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 animate-spin flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">HK</span>
            </div>
          </div>
          <p className="text-white font-medium mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/feedback" element={<Feedback />} />
      {/* Remove ProtectedRoute wrappers */}
      <Route path="/home" element={<Layout><Index /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/photos" element={<Layout><Photos /></Layout>} />
      <Route path="/activity" element={<Layout><Activity /></Layout>} />
      <Route path="/videos" element={<Layout><Videos /></Layout>} />
      <Route path="/people" element={<Layout><People /></Layout>} />
      <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
      <Route path="/shop" element={<Layout><Shop /></Layout>} />
      <Route path="/basket" element={<Layout><Basket /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/messages" element={<Layout><Messages /></Layout>} />
      {/* Admin route without protection */}
      <Route path="/admin/*" element={<Admin />} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <ThemeProvider>
          <SimpleAuthProvider>
            <SubscriptionProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </SubscriptionProvider>
          </SimpleAuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
