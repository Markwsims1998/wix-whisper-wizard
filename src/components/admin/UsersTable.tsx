
import React, { useState, useEffect } from "react";
import { fetchUsers, updateUserStatus, updateUser, UserData } from "@/services/adminUserService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, SearchIcon } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UsersTableProps {
  onUserSelect: (user: UserData) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;
  
  useEffect(() => {
    loadUsers();
  }, [page, searchQuery]);
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers(page, pageSize, { searchQuery });
      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const totalPages = Math.ceil(totalUsers / pageSize);
  
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };
  
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  
  const handleUserClick = (user: UserData) => {
    onUserSelect(user);
  };
  
  const handleStatusChange = async (userId: string, newStatus: string) => {
    const success = await updateUser(userId, { status: newStatus });
    
    if (success) {
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    }
  };
  
  const handleRoleChange = async (userId: string, newRole: string) => {
    const success = await updateUser(userId, { role: newRole });
    
    if (success) {
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    }
  };
  
  const getInitials = (name: string | null, username: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name[0]?.toUpperCase() || username[0]?.toUpperCase() || 'U';
    }
    return username[0]?.toUpperCase() || 'U';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'suspended':
        return 'bg-yellow-500';
      case 'banned':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow 
                  key={user.id} 
                  onClick={() => handleUserClick(user)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user.full_name, user.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || user.username}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "outline" : "secondary"}>
                      {user.role || "user"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                      <span>{user.status || "active"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.subscription_tier === "free" ? "secondary" : "outline"}>
                      {user.subscription_tier || "free"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")}>
                          Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id, "suspended")}>
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id, "banned")}>
                          Ban User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                          Set as User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                          Make Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {users.length} of {totalUsers} users
        </p>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousPage}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
