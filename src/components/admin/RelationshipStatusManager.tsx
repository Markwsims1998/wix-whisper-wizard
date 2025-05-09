
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RelationshipStatus, relationshipStatuses } from "@/data/database";
import StatusList from "@/components/admin/relationship/StatusList";
import EditStatusDialog from "@/components/admin/relationship/EditStatusDialog";

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

  const handleEditStatus = (updatedStatus: RelationshipStatus) => {
    if (!updatedStatus.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a name for the relationship status.",
        variant: "destructive",
      });
      return;
    }

    setStatuses(
      statuses.map((status) =>
        status.id === updatedStatus.id ? { ...updatedStatus } : status
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
          <StatusList 
            statuses={statuses}
            onToggleActive={handleToggleActive}
            onEditStatus={setEditingStatus}
            onDeleteStatus={handleDeleteStatus}
          />
        </div>
      </CardContent>

      {editingStatus && (
        <EditStatusDialog 
          status={editingStatus}
          onSave={handleEditStatus}
          onCancel={() => setEditingStatus(null)}
        />
      )}
    </Card>
  );
};

export default RelationshipStatusManager;
