
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminUser, fetchUsers, updateUserStatus, updateUserRole } from "@/services/adminUserService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Search, UserX } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface UsersTableProps {
  onUserSelect?: (user: AdminUser) => void;
}

export const UsersTable = ({ onUserSelect }: UsersTableProps) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers(page, pageSize, sortBy, sortOrder, searchQuery);
      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, sortBy, sortOrder]);

  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    loadUsers();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const success = await updateUserStatus(userId, newStatus);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        toast({
          title: "Status Updated",
          description: "User status has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status. Please try again.",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const success = await updateUserRole(userId, newRole);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        toast({
          title: "Role Updated",
          description: "User role has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Suspended</Badge>;
      case 'banned':
        return <Badge className="bg-red-500 hover:bg-red-600">Banned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Moderator</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  const getSubscriptionBadge = (tier?: string) => {
    switch (tier) {
      case 'gold':
        return <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">Gold</Badge>;
      case 'silver':
        return <Badge className="bg-gray-400 hover:bg-gray-500">Silver</Badge>;
      case 'bronze':
        return <Badge className="bg-amber-700 hover:bg-amber-800">Bronze</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);
  
  // Handle the case where no users are found
  const renderContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
              <span className="text-gray-500">Loading users...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (users.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-10">
            <div className="flex flex-col items-center">
              <UserX className="h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No users found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? "Try adjusting your search or filter." : "There are no users in the system yet."}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return users.map((user) => (
      <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => onUserSelect?.(user)}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || ''} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.full_name || user.username}</div>
              <div className="text-xs text-gray-500">@{user.username}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>{getStatusBadge(user.status)}</TableCell>
        <TableCell>{getRoleBadge(user.role)}</TableCell>
        <TableCell>{getSubscriptionBadge(user.subscription_tier)}</TableCell>
        <TableCell>{user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}</TableCell>
        <TableCell>{user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy') : 'Never'}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Select 
              value={user.status} 
              onValueChange={(value) => handleStatusChange(user.id, value)}
              onOpenChange={(open) => {
                if (open) {
                  // Stop propagation when opening the select to prevent triggering row click
                  event?.stopPropagation();
                }
              }}
            >
              <SelectTrigger className="w-[100px]" onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspend</SelectItem>
                <SelectItem value="banned">Ban</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={user.role} 
              onValueChange={(value) => handleRoleChange(user.id, value)}
              onOpenChange={(open) => {
                if (open) {
                  // Stop propagation when opening the select to prevent triggering row click
                  event?.stopPropagation();
                }
              }}
            >
              <SelectTrigger className="w-[100px]" onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="rounded-md border dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[75px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500 dark:text-gray-400">users per page</span>
        </div>
        
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search users..." 
            className="pl-10 w-[250px]" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            variant="ghost" 
            className="ml-2" 
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderContent()}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalUsers > 0 ? (
            <>Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalUsers)} of {totalUsers} users</>
          ) : (
            <>No users found</>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1 || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
