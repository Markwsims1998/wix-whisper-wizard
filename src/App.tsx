
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Photos from "./pages/Photos";
import Activity from "./pages/Activity";
import Videos from "./pages/Videos"; // Renamed from Watch
import People from "./pages/People";
import Notifications from "./pages/Notifications";
import Shop from "./pages/Shop";
import Basket from "./pages/Basket";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Feedback from "./pages/Feedback"; // New feedback page
import HomePage from "./pages/HomePage"; // New homepage
import Admin from "./pages/Admin"; // Admin portal
import { ThemeProvider } from "./contexts/ThemeContext";
import Footer from "./components/Footer";

// Create a query client
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // In a real app, you would check admin status from user object or backend
  // For demo purposes, we assume authentication is sufficient
  
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
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
    // In a real application, this would call an API to record the activity

    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Extended loading time for better UX

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
      <Route path="/home" element={
        <Layout>
          <ProtectedRoute><Index /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/profile" element={
        <Layout>
          <ProtectedRoute><Profile /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/photos" element={
        <Layout>
          <ProtectedRoute><Photos /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/activity" element={
        <Layout>
          <ProtectedRoute><Activity /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/videos" element={
        <Layout>
          <ProtectedRoute><Videos /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/people" element={
        <Layout>
          <ProtectedRoute><People /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/notifications" element={
        <Layout>
          <ProtectedRoute><Notifications /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/shop" element={
        <Layout>
          <ProtectedRoute><Shop /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/basket" element={
        <Layout>
          <ProtectedRoute><Basket /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/settings" element={
        <Layout>
          <ProtectedRoute><Settings /></ProtectedRoute>
        </Layout>
      } />
      <Route path="/messages" element={
        <Layout>
          <ProtectedRoute><Messages /></ProtectedRoute>
        </Layout>
      } />
      {/* Admin Portal Route */}
      <Route path="/admin/*" element={
        <AdminRoute><Admin /></AdminRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={
        <Layout>
          <ProtectedRoute><NotFound /></ProtectedRoute>
        </Layout>
      } />
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
