
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Bell, CreditCard, Key, Lock, Moon, Shield, User, Database, UserPlus } from "lucide-react";

// Import our newly created settings components
import AccountSettings from "@/components/settings/AccountSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SubscriptionSettings from "@/components/settings/SubscriptionSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import ConnectionsSettings from "@/components/settings/ConnectionsSettings";
import DataSettings from "@/components/settings/DataSettings";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  // Check URL for tab parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }

    // Log user activity
    console.log("User activity: Accessed settings page");
    if (tab) {
      console.log(`User activity: Viewed ${tab} settings`);
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/settings?tab=${value}`, { replace: true });
    console.log(`User activity: Switched to ${value} settings tab`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 py-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-xl font-semibold">Settings</h1>
            </button>
          </div>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            <ScrollArea className="w-full mb-4 border rounded-lg bg-white dark:bg-gray-800 p-1">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
                <TabsTrigger value="account" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Subscription</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-1">
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-1">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Connections</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Data</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
            
            {/* Account Settings */}
            <TabsContent value="account" className="space-y-4">
              <AccountSettings />
            </TabsContent>
            
            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-4">
              <PrivacySettings />
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings />
            </TabsContent>
            
            {/* Subscription Settings */}
            <TabsContent value="subscription" className="space-y-4">
              <SubscriptionSettings />
            </TabsContent>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-4">
              <AppearanceSettings />
            </TabsContent>
            
            {/* Security Settings */}
            <TabsContent value="security" className="space-y-4">
              <SecuritySettings />
            </TabsContent>
            
            {/* Connections Settings */}
            <TabsContent value="connections" className="space-y-4">
              <ConnectionsSettings />
            </TabsContent>
            
            {/* Data Settings */}
            <TabsContent value="data" className="space-y-4">
              <DataSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
