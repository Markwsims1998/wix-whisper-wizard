
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Key, Eye, Globe } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Settings = () => {
  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Initial update
    updateHeaderPosition();

    // Set up observer to detect sidebar width changes
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">Settings</h1>
              <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
            </div>
            
            <Tabs defaultValue="account" className="mb-4">
              <TabsList className="grid grid-cols-5 w-full bg-gray-100 mb-6">
                <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
                <TabsTrigger value="privacy" className="text-xs">Privacy</TabsTrigger>
                <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
                <TabsTrigger value="display" className="text-xs">Display</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <User className="h-12 w-12 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">Profile Photo</h3>
                    <p className="text-sm text-gray-500 mb-3">Upload a new profile photo</p>
                    <div className="flex gap-2">
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm">Upload New</button>
                      <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 text-sm">Remove</button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Alex Johnson"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        defaultValue="@alexjohnson"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue="alex@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        rows={5}
                        defaultValue="Member of HappyKinks community since 2023. I enjoy participating in various community events and discussions."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">Save Changes</button>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center"><Bell className="h-5 w-5 mr-2" /> Notification Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Friend Requests</h4>
                      <p className="text-sm text-gray-500">Get notified when someone sends you a friend request</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">New Comments</h4>
                      <p className="text-sm text-gray-500">Get notified when someone comments on your post</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Event Reminders</h4>
                      <p className="text-sm text-gray-500">Get notified about upcoming events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center"><Shield className="h-5 w-5 mr-2" /> Privacy Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-gray-500">Who can see your profile information</p>
                    </div>
                    <select className="border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>Everyone</option>
                      <option>Friends Only</option>
                      <option>Only Me</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Post Visibility</h4>
                      <p className="text-sm text-gray-500">Who can see your posts</p>
                    </div>
                    <select className="border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>Everyone</option>
                      <option>Friends Only</option>
                      <option>Only Me</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center"><Key className="h-5 w-5 mr-2" /> Security Settings</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium mb-1">Change Password</h4>
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      <input
                        type="password"
                        placeholder="Current Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full">Update Password</button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="display" className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center"><Eye className="h-5 w-5 mr-2" /> Display Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-gray-500">Choose your preferred theme</p>
                    </div>
                    <select className="border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-gray-500">Select your preferred language</p>
                    </div>
                    <select className="border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
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
