import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, TrendingUp, TrendingDown, Users, Database, AlertTriangle, CreditCard, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Sample data for charts
const weeklyStats = [
  { name: 'Mon', users: 400, content: 240 },
  { name: 'Tue', users: 300, content: 138 },
  { name: 'Wed', users: 520, content: 380 },
  { name: 'Thu', users: 500, content: 240 },
  { name: 'Fri', users: 430, content: 320 },
  { name: 'Sat', users: 250, content: 150 },
  { name: 'Sun', users: 300, content: 200 },
];

const monthlyRevenue = [
  { name: 'Jan', bronze: 4000, silver: 2400, gold: 1200 },
  { name: 'Feb', bronze: 3500, silver: 2500, gold: 1300 },
  { name: 'Mar', bronze: 4200, silver: 2800, gold: 1500 },
  { name: 'Apr', bronze: 3800, silver: 2600, gold: 1400 },
  { name: 'May', bronze: 5000, silver: 3000, gold: 1800 },
  { name: 'Jun', bronze: 4500, silver: 2900, gold: 1700 },
  { name: 'Jul', bronze: 3200, silver: 2200, gold: 1100 },
  { name: 'Aug', bronze: 5500, silver: 3200, gold: 1900 },
];

const subscriptionData = [
  { name: 'Free', value: 540 },
  { name: 'Bronze', value: 310 },
  { name: 'Silver', value: 180 },
  { name: 'Gold', value: 120 },
];

const COLORS = ['#CBD5E1', '#B45309', '#94A3B8', '#EAB308'];

const AdminDashboard = () => {
  const [period, setPeriod] = useState("7d");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export Data</Button>
          <Button size="sm">Refresh</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,742</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+8%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 font-medium">+15%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,580</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+18%</span> from last month
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
                </div>
              </TabsContent>
              <TabsContent value="content" className="space-y-4">
                <div className="h-72">
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
          <div className="flex items-center justify-between">
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
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              Total Revenue for {period === "7d" ? "last 7 days" : period === "30d" ? "last 30 days" : "last 90 days"}
            </div>
            <div className="text-xl font-bold">$42,580</div>
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    User <span className="text-blue-500">John Doe</span> {i % 2 === 0 ? 'uploaded a new photo' : 'created a new post'}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{i * 2 + 1} hours ago</span>
                    <Button variant="ghost" size="sm" className="h-7">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {['Post', 'Photo', 'Comment', 'Video', 'User Report'][i]} needs review
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">Flagged {i * 3 + 2} hours ago</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50">
                        Reject
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-green-500 hover:text-green-700 hover:bg-green-50">
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
