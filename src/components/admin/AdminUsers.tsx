
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, User, MoreHorizontal, Shield, Ban, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { fetchAllUsers, banUser, unbanUser, updateUserRole, UserProfile } from "@/services/adminService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch users with React Query
  const { 
    data: users = [],
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAllUsers,
  });
  
  // Mutations for user operations
  const banUserMutation = useMutation({
    mutationFn: (userId: string) => banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
  
  const unbanUserMutation = useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) => 
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
  
  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchQuery && !user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.username?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }
    // Subscription filter
    if (subscriptionFilter !== 'all' && user.subscription_tier !== subscriptionFilter) {
      return false;
    }
    return true;
  });
  
  const handleBanUser = (userId: string, userName: string) => {
    banUserMutation.mutate(userId, {
      onSuccess: () => {
        toast({
          title: "User Banned",
          description: `${userName} has been banned from the platform.`,
          variant: "destructive",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to ban user: ${error}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleUnbanUser = (userId: string, userName: string) => {
    unbanUserMutation.mutate(userId, {
      onSuccess: () => {
        toast({
          title: "User Unbanned",
          description: `${userName} has been unbanned and can now access the platform.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to unban user: ${error}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handlePromoteUser = (userId: string, userName: string, role: 'admin' | 'moderator') => {
    updateRoleMutation.mutate({ userId, role }, {
      onSuccess: () => {
        toast({
          title: `User ${role === 'admin' ? 'Promoted to Admin' : 'Made Moderator'}`,
          description: `${userName} has been ${role === 'admin' ? 'promoted to admin' : 'made a moderator'}.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update user role: ${error}`,
          variant: "destructive",
        });
      }
    });
  };
  
  if (isError) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold">Error Loading Users</h3>
            <p className="mt-2 text-sm text-gray-500">{error?.toString() || "Failed to load users"}</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button>Add New User</Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage users and their permissions</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role-filter" className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status-filter" className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subscription-filter" className="text-sm font-medium">Subscription</label>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger id="subscription-filter">
                  <SelectValue placeholder="Filter by subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full py-24 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 [&_tr]:border-b">
                    <tr className="border-b transition-colors">
                      <th className="h-12 px-4 text-left align-middle font-medium">User</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Subscription</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Last Active</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Joined</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.full_name || user.username}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 
                            user.role === 'moderator' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                            'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            user.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                            'bg-red-100 text-red-800 hover:bg-red-200'
                          }>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            user.subscription_tier === 'free' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 
                            user.subscription_tier === 'bronze' ? 'bg-amber-700 text-white hover:bg-amber-800' : 
                            user.subscription_tier === 'silver' ? 'bg-gray-400 text-white hover:bg-gray-500' : 
                            'bg-yellow-500 text-white hover:bg-yellow-600'
                          }>
                            {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                        </td>
                        <td className="p-4 align-middle text-sm">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                        </td>
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
                                <User className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              {user.role !== 'admin' && (
                                <DropdownMenuItem onClick={() => handlePromoteUser(user.id, user.full_name || user.username, 'admin')}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  <span>Make Admin</span>
                                </DropdownMenuItem>
                              )}
                              {user.role !== 'admin' && user.role !== 'moderator' && (
                                <DropdownMenuItem onClick={() => handlePromoteUser(user.id, user.full_name || user.username, 'moderator')}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  <span>Make Moderator</span>
                                </DropdownMenuItem>
                              )}
                              {user.status === 'active' ? (
                                <DropdownMenuItem onClick={() => handleBanUser(user.id, user.full_name || user.username)} className="text-red-500 focus:text-red-500">
                                  <Ban className="mr-2 h-4 w-4" />
                                  <span>Ban User</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUnbanUser(user.id, user.full_name || user.username)}>
                                  <User className="mr-2 h-4 w-4" />
                                  <span>Unban User</span>
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
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminUsers;
