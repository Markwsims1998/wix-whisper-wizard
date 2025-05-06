
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Photos from "./pages/Photos";
import Activity from "./pages/Activity";
import Watch from "./pages/Watch";
import People from "./pages/People";
import Notifications from "./pages/Notifications";
import Shop from "./pages/Shop";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import { ThemeProvider } from "./contexts/ThemeContext";
import Footer from "./components/Footer";

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
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
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
      <Route path="/watch" element={
        <Layout>
          <ProtectedRoute><Watch /></ProtectedRoute>
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
