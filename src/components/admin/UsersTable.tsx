
import { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { UserData, fetchUsers, updateUser } from "@/services/adminUserService";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, ChevronRight, MoreHorizontal, Search,
  UserCheck, UserX, Crown, User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface UsersTableProps {
  onUserSelect: (user: UserData) => void;
}

export const UsersTable = ({ onUserSelect }: UsersTableProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  const pageSize = 10;
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      const { users: fetchedUsers, total } = await fetchUsers(page, pageSize, { searchQuery });
      setUsers(fetchedUsers);
      setTotalUsers(total);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, [page, searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };
  
  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await updateUser(userId, { role });
      
      // Optimistically update the UI
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
      
      toast({
        title: "Role Updated",
        description: `User role has been changed to ${role}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      await updateUser(userId, { status });
      
      // Optimistically update the UI
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
      
      toast({
        title: "Status Updated",
        description: `User status has been changed to ${status}`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };
  
  const totalPages = Math.ceil(totalUsers / pageSize);
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} onClick={() => onUserSelect(user)} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {user.avatar_url || user.profile_picture_url ? (
                          <AvatarImage src={user.avatar_url || user.profile_picture_url || ''} />
                        ) : (
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? "destructive" : user.role === 'moderator' ? "outline" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? "success" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.subscription_tier === 'gold' ? "premium" : 
                      user.subscription_tier === 'silver' ? "default" : 
                      user.subscription_tier === 'bronze' ? "secondary" : 
                      "outline"
                    }>
                      {user.subscription_tier || 'free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateUserRole(user.id, 'admin');
                        }}>
                          <Crown className="mr-2 h-4 w-4" /> Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateUserRole(user.id, 'moderator');
                        }}>
                          <UserCheck className="mr-2 h-4 w-4" /> Make Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateUserRole(user.id, 'user');
                        }}>
                          <User className="mr-2 h-4 w-4" /> Reset to User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          const newStatus = user.status === 'active' ? 'banned' : 'active';
                          handleUpdateUserStatus(user.id, newStatus);
                        }}>
                          {user.status === 'active' ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" /> Ban User
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" /> Unban User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
