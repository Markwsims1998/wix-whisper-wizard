
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ThemeProvider } from "./contexts/ThemeContext";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/auth/AuthProvider";

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

// Layout component that includes the footer
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <Footer />
    </div>
  );
};

// Route guard component to protect routes
const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check for auth status from localStorage for quick UI decision
    const checkAuth = async () => {
      try {
        const session = localStorage.getItem('supabase.auth.token');
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
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
      
      {/* Protected Routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Layout><Index /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/photos" 
        element={
          <ProtectedRoute>
            <Layout><Photos /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/activity" 
        element={
          <ProtectedRoute>
            <Layout><Activity /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/videos" 
        element={
          <ProtectedRoute>
            <Layout><Videos /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/people" 
        element={
          <ProtectedRoute>
            <Layout><People /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Layout><Notifications /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/shop" 
        element={
          <ProtectedRoute>
            <Layout><Shop /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/basket" 
        element={
          <ProtectedRoute>
            <Layout><Basket /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <Layout><Messages /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
