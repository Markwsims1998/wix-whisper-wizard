
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Settings as SettingsIcon, User, Bell, Shield, Key, Eye, Globe, CreditCard, BadgeDollarSign, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionTier, subscriptionDetails, getTierBadge } = useSubscription();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || 'profile';

  // Local distance settings
  const [postalCode, setPostalCode] = useState("SW1A 1AA");
  const [distanceKm, setDistanceKm] = useState(25);

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showOnline: true,
    allowMessages: true,
    showActivity: true,
    allowFriendRequests: true,
    showSubscription: true
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    navigate(`/settings?tab=${value}`);
  };

  // Handle cancel subscription
  const handleCancelSubscription = () => {
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will remain active until the end of the current billing period.",
    });
  };

  // Update settings
  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `Your ${section} settings have been updated successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center py-4">
            <h1 className="text-2xl font-semibold flex items-center">
              <SettingsIcon className="mr-2 h-6 w-6" />
              Settings
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Tabs defaultValue={defaultTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="language">Language</TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Profile Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user?.name || "Alex Johnson"} />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={user?.username || "@alexjohnson"} />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email || "alex@example.com"} />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input id="phone" type="tel" placeholder="Enter your phone number" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        defaultValue="Digital enthusiast, photography lover, and coffee addict. Always looking for the next adventure!"
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => handleSaveSettings('profile')}>Save Changes</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Subscription Settings */}
              <TabsContent value="subscription" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Subscription Details</h2>
                  
                  {subscriptionTier !== "free" ? (
                    <>
                      <Alert className="bg-green-50 border-green-200">
                        <BadgeDollarSign className="h-5 w-5 text-green-600" />
                        <AlertTitle className="flex items-center">
                          <span className="mr-2">Active Subscription: {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Tier</span> 
                          {getTierBadge(subscriptionTier)}
                        </AlertTitle>
                        <AlertDescription>
                          You're currently on our {subscriptionTier} plan with all its benefits.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Subscription Benefits</h3>
                        <ul className="space-y-2">
                          {subscriptionTier === "gold" && (
                            <>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>Unlimited messages</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>Full access to all photos and videos</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>No watermarks on photos</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>Priority support</span>
                              </li>
                            </>
                          )}
                          {subscriptionTier === "silver" && (
                            <>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>1,000 messages per month</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>Full access to all photos and videos</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>Standard support</span>
                              </li>
                            </>
                          )}
                          {subscriptionTier === "bronze" && (
                            <>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>500 messages per month</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>Full access to all photos and videos</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span>Basic support</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                      
                      <div className="pt-4 flex justify-between items-center">
                        <div className="text-sm">
                          <p className="font-medium">Next billing date: June 5, 2025</p>
                          <p className="text-gray-500">
                            You will be charged £{
                              subscriptionTier === 'gold' ? '24.99' : 
                              subscriptionTier === 'silver' ? '14.99' : '9.99'
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full">Change Plan</Button>
                          <button 
                            className="text-red-600 text-sm hover:underline w-full text-center"
                            onClick={handleCancelSubscription}
                          >
                            Cancel subscription
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTitle>Free Plan</AlertTitle>
                        <AlertDescription>
                          You're currently on our free plan with limited features.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Free Plan Limitations</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                            <span>100 messages per day</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                            <span>Limited photo access</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-amber-500 flex-shrink-0"></div>
                            <span>No video access</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-amber-500 flex-shrink-0"></div>
                            <span>Watermarks on shared photos</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button 
                          onClick={() => navigate('/shop')}
                          className="gap-2"
                        >
                          <span>Upgrade Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Friend Requests</Label>
                        <p className="text-sm text-gray-500">Get notified when someone sends you a friend request</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Messages</Label>
                        <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Tags</Label>
                        <p className="text-sm text-gray-500">Get notified when you're tagged in a post or comment</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">System Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified about account activity and announcements</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => handleSaveSettings('notifications')}>Save Preferences</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profile-visibility" className="text-base">Profile Visibility</Label>
                      <Select 
                        defaultValue={privacySettings.profileVisibility}
                        onValueChange={(value) => setPrivacySettings({...privacySettings, profileVisibility: value})}
                      >
                        <SelectTrigger id="profile-visibility" className="w-full mt-1">
                          <SelectValue placeholder="Who can see your profile" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public (Everyone)</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private (Only You)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 mt-1">Control who can see your profile information</p>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Online Status</Label>
                        <p className="text-sm text-gray-500">Show when you're online</p>
                      </div>
                      <Switch 
                        checked={privacySettings.showOnline}
                        onCheckedChange={(checked) => setPrivacySettings({...privacySettings, showOnline: checked})}
                      />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Direct Messages</Label>
                        <p className="text-sm text-gray-500">Allow people to send you messages</p>
                      </div>
                      <Switch 
                        checked={privacySettings.allowMessages}
                        onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowMessages: checked})}
                      />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Activity Status</Label>
                        <p className="text-sm text-gray-500">Show your recent activity</p>
                      </div>
                      <Switch 
                        checked={privacySettings.showActivity}
                        onCheckedChange={(checked) => setPrivacySettings({...privacySettings, showActivity: checked})}
                      />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Friend Requests</Label>
                        <p className="text-sm text-gray-500">Allow people to send you friend requests</p>
                      </div>
                      <Switch 
                        checked={privacySettings.allowFriendRequests}
                        onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowFriendRequests: checked})}
                      />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Show Subscription Badge</Label>
                        <p className="text-sm text-gray-500">Display your subscription badge on your profile</p>
                      </div>
                      <Switch 
                        checked={privacySettings.showSubscription}
                        onCheckedChange={(checked) => setPrivacySettings({...privacySettings, showSubscription: checked})}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => handleSaveSettings('privacy')}>Save Privacy Settings</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" placeholder="Enter current password" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" placeholder="Enter new password" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Login Sessions</h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-gray-500">London, UK • Chrome on Windows • May 6, 2025</p>
                      </div>
                      <Button variant="outline" className="mt-3" size="sm">Logout of All Other Sessions</Button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => handleSaveSettings('security')}>Update Security Settings</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Location Settings */}
              <TabsContent value="location" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Location Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input 
                        id="postal-code" 
                        value={postalCode} 
                        onChange={(e) => setPostalCode(e.target.value)} 
                        placeholder="Enter your postal code" 
                      />
                      <p className="text-sm text-gray-500">Used to show you local content and members</p>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="distance">Search Distance (km)</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          id="distance" 
                          type="number" 
                          value={distanceKm} 
                          onChange={(e) => setDistanceKm(Number(e.target.value))}
                          min={1}
                          max={100}
                        />
                        <span>km</span>
                      </div>
                      <p className="text-sm text-gray-500">Maximum distance for local members and content</p>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Location Services</Label>
                        <p className="text-sm text-gray-500">Allow access to your precise location</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => handleSaveSettings('location')}>Save Location Settings</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Language Settings */}
              <TabsContent value="language" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Language & Region</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="it">Italian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="region">Region</Label>
                      <Select defaultValue="gb">
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gb">United Kingdom</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="eu">European Union</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select defaultValue="london">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="london">London (GMT+1)</SelectItem>
                          <SelectItem value="newyork">New York (GMT-4)</SelectItem>
                          <SelectItem value="losangeles">Los Angeles (GMT-7)</SelectItem>
                          <SelectItem value="tokyo">Tokyo (GMT+9)</SelectItem>
                          <SelectItem value="sydney">Sydney (GMT+10)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => handleSaveSettings('language')}>Save Language Settings</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
