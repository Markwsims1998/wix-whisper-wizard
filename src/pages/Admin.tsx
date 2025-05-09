
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Settings, Database, Activity, AlertTriangle, Ban, Shield, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminContent from "@/components/admin/AdminContent";
import AdminReports from "@/components/admin/AdminReports";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);

  // Simulate checking if user is an admin
  useEffect(() => {
    // In a real app, this would check server-side authorization
    const checkAdminStatus = async () => {
      try {
        // Simulating an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo purposes, we'll consider the user is an admin
        setIsAdmin(true);
        
        // In a real application, you would verify admin status with backend
        // If not an admin, redirect
        if (false) { // Change to !isAdmin in real app
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin portal.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to verify admin status:", error);
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!isAdmin) {
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminHeader />
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" 
        style={{ paddingLeft: 'var(--admin-sidebar-width, 280px)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate("/")} 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
              <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
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
