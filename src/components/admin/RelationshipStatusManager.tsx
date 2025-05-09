import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RelationshipStatus, relationshipStatuses } from "@/data/database";

const RelationshipStatusManager = () => {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<RelationshipStatus[]>(relationshipStatuses);
  const [newStatusName, setNewStatusName] = useState("");
  const [editingStatus, setEditingStatus] = useState<RelationshipStatus | null>(null);

  const handleAddStatus = () => {
    if (!newStatusName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a name for the relationship status.",
        variant: "destructive",
      });
      return;
    }

    const newStatus: RelationshipStatus = {
      id: `${Date.now()}`,
      name: newStatusName.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setStatuses([...statuses, newStatus]);
    setNewStatusName("");

    toast({
      title: "Status Added",
      description: `"${newStatusName}" has been added as a relationship status option.`,
    });
  };

  const handleToggleActive = (id: string) => {
    setStatuses(
      statuses.map((status) =>
        status.id === id ? { ...status, isActive: !status.isActive } : status
      )
    );

    const status = statuses.find((s) => s.id === id);
    if (status) {
      toast({
        title: status.isActive ? "Status Disabled" : "Status Enabled",
        description: `"${status.name}" has been ${status.isActive ? "disabled" : "enabled"}.`,
      });
    }
  };

  const handleEditStatus = () => {
    if (!editingStatus || !editingStatus.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a name for the relationship status.",
        variant: "destructive",
      });
      return;
    }

    setStatuses(
      statuses.map((status) =>
        status.id === editingStatus.id ? { ...editingStatus } : status
      )
    );

    setEditingStatus(null);

    toast({
      title: "Status Updated",
      description: `Relationship status has been updated successfully.`,
    });
  };

  const handleDeleteStatus = (id: string) => {
    const status = statuses.find((s) => s.id === id);
    
    setStatuses(statuses.filter((status) => status.id !== id));

    if (status) {
      toast({
        title: "Status Deleted",
        description: `"${status.name}" has been deleted.`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Relationship Status Options
        </CardTitle>
        <CardDescription>
          Manage relationship status options available to users in their profiles
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new relationship status..."
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
            />
            <Button onClick={handleAddStatus} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Create custom relationship status options for users to select from
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Existing Relationship Statuses</Label>
          
          {statuses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No relationship statuses defined yet. Add your first one!
            </p>
          ) : (
            <div className="space-y-3 mt-2">
              {statuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-card"
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={status.isActive}
                      onCheckedChange={() => handleToggleActive(status.id)}
                    />
                    <span className={!status.isActive ? "text-muted-foreground" : ""}>
                      {status.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingStatus(status)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStatus(status.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {editingStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Relationship Status</CardTitle>
              <CardDescription>
                Update the relationship status name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status Name</Label>
                <Input
                  id="edit-status"
                  value={editingStatus.name}
                  onChange={(e) =>
                    setEditingStatus({ ...editingStatus, name: e.target.value })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setEditingStatus(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditStatus}>Save Changes</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default RelationshipStatusManager;
