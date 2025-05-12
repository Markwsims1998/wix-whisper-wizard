
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "./components/ui/toaster";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Messages from "./pages/Messages";
import Activity from "./pages/Activity";
import Comments from "./pages/Comments";
import Settings from "./pages/Settings";
import Videos from "./pages/Videos";
import Photos from "./pages/Photos";
import People from "./pages/People";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";
import Watch from "./pages/Watch";
import Basket from "./pages/Basket";
import Notifications from "./pages/Notifications";
import Feedback from "./pages/Feedback";
import Winks from "./pages/Winks";
import Friends from "./pages/Friends";
import MediaDetail from "./pages/MediaDetail";
import { useAuth } from "@/contexts/auth/AuthProvider";
import Footer from "./components/Footer";
import { useEffect } from "react";

function App() {
  const { isAuthenticated, loading } = useAuth();
  
  // Update sidebar width variable on load and resize
  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('.sidebar') || document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Initial update
    updateSidebarWidth();
    
    // Add resize listener
    window.addEventListener('resize', updateSidebarWidth);
    
    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, []);
  
  // Show loading indicator if we're checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            {/* Redirect root based on authentication status */}
            <Route path="/" element={isAuthenticated ? <Index /> : <Navigate to="/home" replace />} />
            
            {/* Landing page - redirect to dashboard if authenticated */}
            <Route path="/home" element={isAuthenticated ? <Navigate to="/" replace /> : <HomePage />} />
            
            {/* Profile routes - both for current user and specific users */}
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
            <Route path="/profile/:userId" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
            
            {/* Media detail page */}
            <Route path="/media/:id" element={isAuthenticated ? <MediaDetail /> : <Navigate to="/login" replace />} />
            
            {/* Protected routes - redirect to login if not authenticated */}
            <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" replace />} />
            <Route path="/activity" element={isAuthenticated ? <Activity /> : <Navigate to="/login" replace />} />
            <Route path="/comments" element={isAuthenticated ? <Comments /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />} />
            <Route path="/videos" element={isAuthenticated ? <Videos /> : <Navigate to="/login" replace />} />
            <Route path="/photos" element={isAuthenticated ? <Photos /> : <Navigate to="/login" replace />} />
            <Route path="/people" element={isAuthenticated ? <People /> : <Navigate to="/login" replace />} />
            <Route path="/shop" element={isAuthenticated ? <Shop /> : <Navigate to="/login" replace />} />
            <Route path="/admin" element={isAuthenticated ? <Admin /> : <Navigate to="/login" replace />} />
            <Route path="/watch" element={isAuthenticated ? <Watch /> : <Navigate to="/login" replace />} />
            <Route path="/basket" element={isAuthenticated ? <Basket /> : <Navigate to="/login" replace />} />
            <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" replace />} />
            <Route path="/winks" element={isAuthenticated ? <Winks /> : <Navigate to="/login" replace />} />
            <Route path="/friends" element={isAuthenticated ? <Friends /> : <Navigate to="/login" replace />} />
            <Route path="/friends/:userId" element={isAuthenticated ? <Friends /> : <Navigate to="/login" replace />} />
            
            {/* Public routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
