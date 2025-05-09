import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Globe, Shield, Bell, Filter, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RelationshipStatusManager from "./RelationshipStatusManager";

const AdminSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `The ${section} settings have been updated successfully.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <Button>Reset to Defaults</Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Manage general settings for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="HK Community" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea 
                  id="site-description" 
                  defaultValue="An inclusive community platform for connecting members and sharing content." 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@example.com" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Take the site offline for maintenance
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new user registration
                  </p>
                </div>
                <Switch id="user-registration" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Guest Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow access to public content without login
                  </p>
                </div>
                <Switch id="guest-access" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("general")}>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Privacy</CardTitle>
              <CardDescription>
                Manage analytics and user privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="analytics-id">Analytics ID</Label>
                <Input id="analytics-id" defaultValue="UA-12345678-1" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect anonymized usage data
                  </p>
                </div>
                <Switch id="enable-analytics" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cookie Consent</Label>
                  <p className="text-sm text-muted-foreground">
                    Require cookie consent banner
                  </p>
                </div>
                <Switch id="cookie-consent" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Retention</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-delete inactive user data after 2 years
                  </p>
                </div>
                <Switch id="data-retention" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("privacy")}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch id="require-2fa" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Policy</Label>
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">
                      Enforce strong passwords
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline">Min 10 chars</Badge>
                      <Badge variant="outline">Special chars</Badge>
                      <Badge variant="outline">Numbers</Badge>
                    </div>
                  </div>
                </div>
                <Switch id="strong-passwords" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input id="session-timeout" defaultValue="60" className="w-16" />
                  <span className="text-sm">minutes</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Attempts</Label>
                  <p className="text-sm text-muted-foreground">
                    Lock account after failed attempts
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input id="login-attempts" defaultValue="5" className="w-16" />
                  <span className="text-sm">attempts</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>API Access</Label>
                <div className="flex items-center gap-2">
                  <Input defaultValue="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" type="password" />
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  API key for admin integrations. Keep this secret.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("security")}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notifications</CardTitle>
              <CardDescription>
                Configure when and how you receive admin notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new users join
                  </p>
                </div>
                <Switch id="new-user-notification" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Content Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about reported content
                  </p>
                </div>
                <Switch id="content-reports" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about security incidents
                  </p>
                </div>
                <Switch id="security-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about system updates
                  </p>
                </div>
                <Switch id="system-updates" />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input id="notification-email" type="email" defaultValue="admin@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label>Notification Channels</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary" className="cursor-pointer">
                    Email
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer">
                    Dashboard
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    SMS
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    Slack
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("notifications")}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                Settings for content filtering and moderation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable automated content filtering
                  </p>
                </div>
                <Switch id="auto-moderation" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profanity Filter</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically filter profanity
                  </p>
                </div>
                <Switch id="profanity-filter" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Image Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    AI-based image content moderation
                  </p>
                </div>
                <Switch id="image-moderation" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pre-Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Require admin approval for new content
                  </p>
                </div>
                <Switch id="pre-approval" />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="custom-keywords">Prohibited Keywords</Label>
                <Textarea 
                  id="custom-keywords" 
                  placeholder="Enter keywords separated by commas"
                  defaultValue="spam, scam, explicit, offensive"
                />
                <p className="text-sm text-muted-foreground">
                  Content containing these keywords will be flagged for review
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Moderation Action</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="action-flag" name="moderation-action" defaultChecked />
                    <Label htmlFor="action-flag">Flag for Review</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="action-hide" name="moderation-action" />
                    <Label htmlFor="action-hide">Hide Automatically</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("moderation")}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="profiles" className="space-y-4">
          <RelationshipStatusManager />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Configure profile settings and options for users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relationship Status Display</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to display their relationship status on profiles
                  </p>
                </div>
                <Switch id="show-relationship-status" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Partner Tagging</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to tag partners in their relationship status
                  </p>
                </div>
                <Switch id="allow-partner-tagging" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Relationships</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow non-friends to see relationship status
                  </p>
                </div>
                <Switch id="public-relationships" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relationship Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require both users to confirm relationships
                  </p>
                </div>
                <Switch id="relationship-verification" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("profile")}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="block mb-2">Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">Upload Logo</Button>
                    <p className="text-xs text-gray-500">PNG or SVG, max 2MB</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="block mb-2">Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">Upload Favicon</Button>
                    <p className="text-xs text-gray-500">ICO or PNG, 32x32px</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Color Scheme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative flex flex-col items-center p-2 border rounded-lg">
                    <div className="w-full h-8 mb-2 rounded bg-purple-600"></div>
                    <span className="text-sm font-medium">Purple</span>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white dark:bg-gray-800 border-2 border-purple-600 rounded-full"></div>
                  </div>
                  <div className="relative flex flex-col items-center p-2 border rounded-lg">
                    <div className="w-full h-8 mb-2 rounded bg-blue-600"></div>
                    <span className="text-sm font-medium">Blue</span>
                  </div>
                  <div className="relative flex flex-col items-center p-2 border rounded-lg">
                    <div className="w-full h-8 mb-2 rounded bg-green-600"></div>
                    <span className="text-sm font-medium">Green</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Custom CSS</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable custom CSS styling
                  </p>
                </div>
                <Switch id="custom-css" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-css-code">Custom CSS Code</Label>
                <Textarea 
                  id="custom-css-code" 
                  placeholder="Enter custom CSS here..."
                  className="font-mono text-sm"
                  disabled
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("branding")}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
