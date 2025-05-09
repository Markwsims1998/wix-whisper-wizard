import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Bell, 
  CreditCard, 
  Key, 
  Lock, 
  MessageSquare, 
  Moon, 
  Shield, 
  User, 
  UserCog,
  Eye,
  UserPlus,
  Database
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import FeaturedContentSettings from "@/components/settings/FeaturedContentSettings";
import BottomNavSettings from "@/components/settings/BottomNavSettings";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionTier, subscriptionDetails, upgradeSubscription } = useSubscription();
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

  const saveSettings = (section: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated.`,
    });
    console.log(`User activity: Updated ${section} settings`);
  };

  const cancelSubscription = () => {
    // Update the subscription to free tier
    upgradeSubscription('free');
    
    // Show toast notification
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled successfully.",
      variant: "default",
    });
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
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your basic account details here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name || "Alex Johnson"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username?.slice(1) || "alexjohnson"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="alex.johnson@example.com" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings("account")}>Save Changes</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Edit your profile information that is visible to others.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" defaultValue="Digital enthusiast, photography lover, and coffee addict. Always looking for the next adventure!" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue="San Francisco, CA" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings("profile")}>Save Profile</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control who can see your content and profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profile-visibility">Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose who can view your profile
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select className="bg-transparent border rounded p-1">
                        <option value="public">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="post-visibility">Post Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose who can see your posts by default
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select className="bg-transparent border rounded p-1">
                        <option value="public">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Only Me</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Search Engine Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow search engines to index your profile
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="search-engine" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings("privacy")}>Save Privacy Settings</Button>
                </CardFooter>
              </Card>
              
              <FeaturedContentSettings />
            </TabsContent>
            
            {/* Other tabs with similar structures */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Customize how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications on your device
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="push-notifications" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Friend Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new friend requests
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="friend-request-notifications" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new messages
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="message-notifications" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings("notifications")}>Save Notification Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>
                    Manage your subscription plan and billing details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="font-medium">Current Plan: {subscriptionTier === "free" ? "Free" : subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1)}</div>
                      {subscriptionTier !== "free" ? (
                        <>
                          <p className="text-sm text-muted-foreground mt-1">
                            {subscriptionDetails.messageResetTime ? 
                              `Next reset: ${new Date(subscriptionDetails.messageResetTime).toLocaleDateString()}` : 
                              'Unlimited messages'}
                          </p>
                          <div className="mt-4 flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>Change Plan</Button>
                            <Button variant="destructive" size="sm" onClick={cancelSubscription}>Cancel Subscription</Button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-4">
                          <Button onClick={() => navigate('/shop')}>Upgrade Now</Button>
                        </div>
                      )}
                    </div>
                    
                    {subscriptionTier !== "free" && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Payment Method</h3>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard />
                            <div>
                              <div>Visa ending in 4242</div>
                              <div className="text-sm text-muted-foreground">Expires 04/25</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance tab */}
            <TabsContent value="appearance" className="space-y-4">
              <AppearanceSettings />
              <BottomNavSettings />
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and login options.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="2fa" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings("security")}>Save Security Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Stub content for remaining tabs */}
            <TabsContent value="connections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>
                    Manage third-party accounts and connections.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No connected accounts yet.</p>
                </CardContent>
                <CardFooter>
                  <Button>Connect an Account</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Data</CardTitle>
                  <CardDescription>
                    Manage your personal data and account information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Database className="w-4 h-4" />
                    Download Your Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-amber-600">
                    <Eye className="w-4 h-4" />
                    View Activity Log
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-red-600">
                    <UserCog className="w-4 h-4" />
                    Deactivate Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
