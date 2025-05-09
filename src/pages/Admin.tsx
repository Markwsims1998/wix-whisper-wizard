
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Settings, Database, Activity, AlertTriangle, Ban, Shield, CreditCard, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminContent from "@/components/admin/AdminContent";
import AdminReports from "@/components/admin/AdminReports";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminMarketingSettings from "@/components/admin/AdminMarketingSettings";

// Add CSS variables for the admin sidebar
const initAdminStyles = () => {
  document.documentElement.style.setProperty('--admin-sidebar-width', '280px');
  
  // Add media query listener for responsive design
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  
  const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      // Mobile view - start with sidebar closed
      document.documentElement.style.setProperty('--admin-sidebar-width', '0px');
    } else {
      // Desktop view - sidebar open
      document.documentElement.style.setProperty('--admin-sidebar-width', '280px');
    }
  };
  
  // Set initial value
  handleMediaQueryChange(mediaQuery);
  
  // Add listener for changes
  mediaQuery.addEventListener('change', handleMediaQueryChange);
  
  // Clean up function
  return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
};

const Admin = () => {
  const { user, isAuthenticated, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize admin styles
  useEffect(() => {
    const cleanup = initAdminStyles();
    return cleanup;
  }, []);

  // Refresh user profile when component mounts to ensure we have latest data
  useEffect(() => {
    const refreshProfile = async () => {
      if (isAuthenticated) {
        await refreshUserProfile();
      }
    };
    
    refreshProfile();
  }, [isAuthenticated, refreshUserProfile]);

  // Check if user is an admin with improved session handling
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // First check if the user exists and is authenticated
        if (!isAuthenticated || !user) {
          console.log("User not authenticated, redirecting from Admin page");
          setIsAdmin(false);
          
          toast({
            title: "Authentication Required",
            description: "Please log in to continue.",
            variant: "destructive",
          });
          
          navigate("/login");
          return;
        }
        
        console.log("Checking admin status for user:", user.id, "Role:", user.role);
        
        // Check if user role is admin
        if (user.role === 'admin') {
          console.log("User is confirmed as admin");
          setIsAdmin(true);
        } else {
          console.log("User is not admin. Current role:", user.role);
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin portal.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to verify admin status:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify your admin access. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast, user, isAuthenticated]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h1 className="mt-4 text-lg font-semibold">Verifying Admin Status</h1>
          <p className="mt-2 text-sm text-gray-500">Please wait while we verify your credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ban className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold">Access Denied</h1>
          <p className="mt-2 text-sm text-gray-500 mb-4">You don't have permission to access the admin portal</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminHeader />
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" 
        style={{ paddingLeft: 'var(--admin-sidebar-width, 280px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate("/")} 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-label="Back to site"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Site</span>
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Logged in as: <span className="font-medium text-gray-700 dark:text-gray-300">{user?.name || "Admin"}</span>
              </p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <ScrollArea className="w-full mb-6 border rounded-lg bg-white dark:bg-gray-800 p-1">
              <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
                <TabsTrigger value="dashboard" className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="marketing" className="flex items-center gap-1">
                  <Megaphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Marketing</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Subscriptions</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>
            
            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>
            
            <TabsContent value="content">
              <AdminContent />
            </TabsContent>

            <TabsContent value="marketing">
              <AdminMarketingSettings />
            </TabsContent>
            
            <TabsContent value="reports">
              <AdminReports />
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <AdminSubscriptions />
            </TabsContent>
            
            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
