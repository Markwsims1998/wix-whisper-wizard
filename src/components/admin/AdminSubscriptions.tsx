
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, Edit, MoreHorizontal, CreditCard } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { subscriptionPlans, SubscriptionTier } from "@/contexts/SubscriptionContext";

// Mock subscriptions data
const mockSubscriptions = Array(20).fill(null).map((_, index) => ({
  id: `sub-${index + 1}`,
  user: `User ${Math.floor(Math.random() * 20) + 1}`,
  email: `user${Math.floor(Math.random() * 20) + 1}@example.com`,
  tier: ['free', 'bronze', 'silver', 'gold'][index % 4] as SubscriptionTier,
  status: ['active', 'canceled', 'expired'][index % 3],
  startDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  renewalDate: ['active'].includes(['active', 'canceled', 'expired'][index % 3]) ? 
    new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString() : 
    '-',
  amount: ['free', 'bronze', 'silver', 'gold'][index % 4] === 'free' ? 
    '£0' : 
    ['bronze', 'silver', 'gold'].map(tier => subscriptionPlans[tier as SubscriptionTier]?.price || '£0')[[0, 1, 2, 3][index % 4] - 1]
}));

const AdminSubscriptions = () => {
  const [activeTab, setActiveTab] = useState("subscribers");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  
  const filteredSubscriptions = mockSubscriptions.filter(sub => {
    // Search filter
    if (searchQuery && !sub.user.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !sub.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Tier filter
    if (tierFilter !== 'all' && sub.tier !== tierFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && sub.status !== statusFilter) {
      return false;
    }
    return true;
  });
  
  const handleCancelSubscription = (id: string, user: string) => {
    toast({
      title: "Subscription Cancelled",
      description: `${user}'s subscription has been cancelled.`,
      variant: "default",
    });
  };
  
  const handleChangeTier = (id: string, user: string, newTier: string) => {
    toast({
      title: "Subscription Updated",
      description: `${user}'s subscription has been updated to ${newTier}.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Subscription Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab("plans")}>
            Edit Plans
          </Button>
          <Button>Add Subscription</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-yellow-500">42</CardTitle>
            <CardDescription>Gold Subscribers</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-gray-400">78</CardTitle>
            <CardDescription>Silver Subscribers</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-amber-700">124</CardTitle>
            <CardDescription>Bronze Subscribers</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">296</CardTitle>
            <CardDescription>Free Tier</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Manage subscription plans and subscribers</CardDescription>
              </div>
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          
          <TabsContent value="subscribers" className="mt-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search subscribers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="w-40">
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </CardHeader>
        <CardContent>
          <TabsContent value="subscribers" className="mt-0">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 [&_tr]:border-b">
                    <tr className="border-b transition-colors">
                      <th className="h-12 px-4 text-left align-middle font-medium">Subscriber</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Tier</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Start Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Renewal Date</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Amount</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredSubscriptions.map(sub => (
                      <tr key={sub.id} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 align-middle">
                          <div>
                            <div className="font-medium">{sub.user}</div>
                            <div className="text-xs text-gray-500">{sub.email}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            sub.tier === 'gold' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                            sub.tier === 'silver' ? 'bg-gray-400 hover:bg-gray-500' : 
                            sub.tier === 'bronze' ? 'bg-amber-700 hover:bg-amber-800' : 
                            'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }>
                            {sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            sub.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                            sub.status === 'canceled' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                            'bg-red-100 text-red-800 hover:bg-red-200'
                          }>
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-sm">{sub.startDate}</td>
                        <td className="p-4 align-middle text-sm">{sub.renewalDate}</td>
                        <td className="p-4 align-middle text-right font-medium">{sub.amount}</td>
                        <td className="p-4 align-middle text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>View Billing</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Change Tier</DropdownMenuItem>
                              {sub.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleCancelSubscription(sub.id, sub.user)} className="text-red-600">
                                  Cancel Subscription
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="plans" className="mt-0 space-y-6">
            <Card>
              <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-yellow-500"></span> 
                    Gold Tier
                  </CardTitle>
                  <Badge className="bg-yellow-500">Recommended</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-baseline mb-4">
                  <div className="text-3xl font-bold">{subscriptionPlans.gold.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Unlimited messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Full photo access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Full video access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Featured content control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Priority support</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">42 subscribers</span>
                  <Button variant="outline">Edit Plan</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-gray-400"></span> 
                  Silver Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-baseline mb-4">
                  <div className="text-3xl font-bold">{subscriptionPlans.silver.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>{subscriptionPlans.silver.maxMessages} messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Full photo access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Full video access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Featured content control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Priority support</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">78 subscribers</span>
                  <Button variant="outline">Edit Plan</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
                <CardTitle className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-amber-700"></span> 
                  Bronze Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-baseline mb-4">
                  <div className="text-3xl font-bold">{subscriptionPlans.bronze.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>{subscriptionPlans.bronze.maxMessages} messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Full photo access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Full video access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Featured content control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Priority support</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">124 subscribers</span>
                  <Button variant="outline">Edit Plan</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-gray-200"></span> 
                  Free Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-baseline mb-4">
                  <div className="text-3xl font-bold">{subscriptionPlans.free.price}</div>
                  <div className="text-sm text-muted-foreground">forever</div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>{subscriptionPlans.free.maxMessages} messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Basic photo access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Video access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Featured content control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Priority support</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">296 subscribers</span>
                  <Button variant="outline">Edit Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500">
            {activeTab === "subscribers" && (
              <>
                Showing <span className="font-medium">{filteredSubscriptions.length}</span> of <span className="font-medium">{mockSubscriptions.length}</span> subscriptions
              </>
            )}
          </div>
          {activeTab === "subscribers" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
