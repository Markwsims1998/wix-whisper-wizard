
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData } from "@/services/adminUserService";
import { UsersTable } from "./UsersTable";
import { User, Mail, Calendar, Shield, CreditCard } from "lucide-react";

const AdminUsers = () => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground">Manage users, roles and permissions.</p>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="banned">Banned</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <UsersTable onUserSelect={setSelectedUser} />
        </TabsContent>
        <TabsContent value="active">
          <div className="text-center py-10 text-gray-500">
            <p>This tab will show active users only.</p>
            <p className="text-sm mt-2">Coming soon</p>
          </div>
        </TabsContent>
        <TabsContent value="suspended">
          <div className="text-center py-10 text-gray-500">
            <p>This tab will show suspended users only.</p>
            <p className="text-sm mt-2">Coming soon</p>
          </div>
        </TabsContent>
        <TabsContent value="banned">
          <div className="text-center py-10 text-gray-500">
            <p>This tab will show banned users only.</p>
            <p className="text-sm mt-2">Coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Detailed information about {selectedUser.full_name || selectedUser.username}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedUser.full_name || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">@{selectedUser.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{selectedUser.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Subscription</p>
                    <p className="font-medium capitalize">{selectedUser.subscription_tier || 'Free'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {selectedUser.last_sign_in_at 
                        ? new Date(selectedUser.last_sign_in_at).toLocaleDateString() 
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;
