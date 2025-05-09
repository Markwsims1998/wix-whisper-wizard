
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, TrendingUp, TrendingDown, Users, Database, AlertTriangle, CreditCard, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#CBD5E1', '#B45309', '#94A3B8', '#EAB308'];

const AdminDashboard = () => {
  const [period, setPeriod] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeContent: 0,
    reportedItems: 0,
    monthlyRevenue: 0,
    userGrowth: 0,
    contentGrowth: 0,
    reportGrowth: 0,
    revenueGrowth: 0,
  });
  
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [moderationItems, setModerationItems] = useState([]);
  
  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [period]);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;
      
      // Fetch content count (posts)
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      
      if (postsError) throw postsError;
      
      // For demonstration, we'll create some mock stats based on real user counts
      // In a real app, you would query more tables for these metrics
      
      // Set dashboard stats based on real data
      setStats({
        totalUsers: usersCount || 0,
        activeContent: postsCount || 0,
        reportedItems: Math.floor(postsCount * 0.05) || 0, // 5% of posts as reported items for demo
        monthlyRevenue: (usersCount || 0) * 12.5, // $12.5 average revenue per user for demo
        userGrowth: 12, 
        contentGrowth: 8,
        reportGrowth: 15,
        revenueGrowth: 18,
      });
      
      // Generate weekly stats based on real data
      const { data: weeklyPosts, error: weeklyError } = await supabase
        .from('posts')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (weeklyError) throw weeklyError;
      
      // Get counts by day for the week
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyCounts = Array(7).fill(0);
      const userCounts = Array(7).fill(0).map((_, i) => Math.floor(Math.random() * 200) + 200); // Mock user activity
      
      weeklyPosts?.forEach(post => {
        const day = new Date(post.created_at).getDay();
        dailyCounts[day]++;
      });
      
      const weekData = days.map((name, index) => ({
        name,
        content: dailyCounts[index],
        users: userCounts[index],
      }));
      
      setWeeklyStats(weekData);
      
      // Generate revenue data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
      const revenueData = months.map(name => {
        // Mock revenue data based on subscription tiers
        return {
          name,
          bronze: Math.floor(Math.random() * 1500) + 2000,
          silver: Math.floor(Math.random() * 1000) + 1200,
          gold: Math.floor(Math.random() * 800) + 800,
        };
      });
      
      setMonthlyRevenue(revenueData);
      
      // Fetch subscription distribution
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('subscription_tier');
      
      if (profilesError) throw profilesError;
      
      // Count subscription tiers
      const tierCounts = {
        free: 0,
        bronze: 0,
        silver: 0,
        gold: 0,
      };
      
      profiles?.forEach(profile => {
        const tier = profile.subscription_tier || 'free';
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });
      
      const subscriptionChartData = [
        { name: 'Free', value: tierCounts.free || 0 },
        { name: 'Bronze', value: tierCounts.bronze || 0 },
        { name: 'Silver', value: tierCounts.silver || 0 },
        { name: 'Gold', value: tierCounts.gold || 0 },
      ];
      
      setSubscriptionData(subscriptionChartData);
      
      // Fetch recent activity
      const { data: recentPosts, error: recentError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentError) throw recentError;
      
      setRecentActivity(recentPosts || []);
      
      // For moderation items, we'll mock data based on real post content
      // In a production app, you'd have a reports table or similar
      if (recentPosts) {
        const mockModerationItems = recentPosts.map((post, i) => ({
          id: post.id,
          type: i % 2 === 0 ? 'Post' : 'Comment',
          content: post.content,
          reportedAt: new Date(Date.now() - (i * 3 + 2) * 60 * 60 * 1000).toISOString(),
          reportedBy: `user${i+1}@example.com`,
        })).slice(0, 5);
        
        setModerationItems(mockModerationItems);
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Data Loading Error",
        description: "Could not load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshData = () => {
    fetchDashboardData();
    toast({
      title: "Dashboard Refreshed",
      description: "The dashboard data has been updated",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export Data</Button>
          <Button size="sm" onClick={refreshData} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`font-medium ${stats.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.activeContent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`font-medium ${stats.contentGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.contentGrowth >= 0 ? '+' : ''}{stats.contentGrowth}%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.reportedItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`font-medium ${stats.reportGrowth <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.reportGrowth >= 0 ? '+' : ''}{stats.reportGrowth}%
              </span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isLoading ? "..." : stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`font-medium ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
              </span> from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Weekly site activity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">User Activity</TabsTrigger>
                <TabsTrigger value="content">Content Creation</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="space-y-4">
                <div className="h-72">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="users" fill="#8884d8" name="Active Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="content" className="space-y-4">
                <div className="h-72">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="content" fill="#82ca9d" name="Content Created" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Current user subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              {isLoading ? (
                <p className="text-gray-500">Loading chart data...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {subscriptionData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Subscription revenue by tier</CardDescription>
            </div>
            <Tabs defaultValue="7d" onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bronze" stroke="#B45309" strokeWidth={2} name="Bronze" />
                  <Line type="monotone" dataKey="silver" stroke="#94A3B8" strokeWidth={2} name="Silver" />
                  <Line type="monotone" dataKey="gold" stroke="#EAB308" strokeWidth={2} name="Gold" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="text-sm text-muted-foreground">
              Total Revenue for {period === "7d" ? "last 7 days" : period === "30d" ? "last 30 days" : "last 90 days"}
            </div>
            <div className="text-xl font-bold">${isLoading ? "..." : (stats.monthlyRevenue * (period === "7d" ? 0.25 : period === "30d" ? 1 : 3)).toLocaleString()}</div>
          </div>
        </CardFooter>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activity available.
              </div>
            ) : (
              recentActivity.map((activity, i) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {activity.profiles?.avatar_url ? (
                      <img src={activity.profiles.avatar_url} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      User <span className="text-blue-500">{activity.profiles?.full_name || activity.profiles?.username || 'Unknown User'}</span> created a new post
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</span>
                      <Button variant="ghost" size="sm" className="h-7">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button variant="ghost" size="sm">
              View All Activity
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
            <CardDescription>Items requiring review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                      <div className="flex gap-1">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : moderationItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No content requiring moderation.
              </div>
            ) : (
              moderationItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {item.type} needs review
                    </div>
                    <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Flagged {new Date(item.reportedAt).toLocaleString()}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button variant="ghost" size="sm">
              View All Items
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
