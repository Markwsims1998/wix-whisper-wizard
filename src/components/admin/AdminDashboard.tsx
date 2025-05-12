
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { 
  fetchDashboardStats, 
  fetchWeeklyActivityData,
  getSubscriptionDistribution,
  fetchRevenueData,
  fetchRecentActivity,
  DashboardStats,
  DataPoint
} from "@/services/adminAnalyticsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<DataPoint[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<DataPoint[]>([]);
  const [revenueData, setRevenueData] = useState<DataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load dashboard stats
        const dashboardStats = await fetchDashboardStats();
        setStats(dashboardStats);
        
        // Load weekly activity data
        const weeklyActivity = await fetchWeeklyActivityData();
        setActivityData(weeklyActivity);
        
        // Load subscription distribution
        const subscriptions = await getSubscriptionDistribution();
        setSubscriptionData(subscriptions);
        
        // Load revenue data
        const revenue = await fetchRevenueData();
        setRevenueData(revenue);
        
        // Load recent activity
        const activity = await fetchRecentActivity();
        setRecentActivity(activity);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  const getActivityTypeIcon = (type: string) => {
    switch(type) {
      case 'post':
        return '📝';
      case 'comment':
        return '💬';
      case 'subscription':
        return '⭐';
      default:
        return '📌';
    }
  };
  
  const getActivityTypeText = (type: string, content: string) => {
    switch(type) {
      case 'post':
        return `Created a new post: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`;
      case 'comment':
        return `Left a comment: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`;
      case 'subscription':
        return `Upgraded to ${content} subscription`;
      default:
        return content;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your platform's performance and activity.
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.newUsersThisWeek || 0} this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.premiumUsers.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% of total users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPosts.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +120 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageSessionTime || 0} min</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={activityData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>
                  Breakdown of user subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user actions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentActivity.map((activity) => (
                    <div className="flex items-start" key={activity.id}>
                      <div className="flex items-center justify-center w-8 h-8 mr-4 rounded-full bg-blue-100 text-blue-600">
                        {getActivityTypeIcon(activity.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={activity.user?.avatar_url} alt={activity.user?.username} />
                            <AvatarFallback>
                              {activity.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium leading-none">
                            {activity.user?.username || 'Unknown user'}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getActivityTypeText(activity.type, activity.content)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Actions Needed</CardTitle>
                <CardDescription>
                  Items requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                    <h4 className="font-medium mb-1">Content Reports</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      7 reports need review
                    </p>
                    <Button variant="outline" size="sm">
                      View Reports
                    </Button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                    <h4 className="font-medium mb-1">Pending Verifications</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      3 users awaiting verification
                    </p>
                    <Button variant="outline" size="sm">
                      Review Users
                    </Button>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-3">
                    <h4 className="font-medium mb-1">Security Updates</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Database security policy needs review
                    </p>
                    <Button variant="outline" size="sm">
                      View Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="text-center py-10 text-gray-500">
            <p>User analytics coming soon</p>
            <p className="text-sm mt-2">Switch to the Users Management tab to view user data</p>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="text-center py-10 text-gray-500">
            <p>Content analytics coming soon</p>
            <p className="text-sm mt-2">Switch to the Content Management tab to view content data</p>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly subscription revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
