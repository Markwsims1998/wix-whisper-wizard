
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RelationshipStatus } from "@/data/database";
import { useToast } from "@/hooks/use-toast";

interface StatusListProps {
  statuses: RelationshipStatus[];
  onToggleActive: (id: string) => void;
  onEditStatus: (status: RelationshipStatus) => void;
  onDeleteStatus: (id: string) => void;
}

const StatusList = ({ statuses, onToggleActive, onEditStatus, onDeleteStatus }: StatusListProps) => {
  const { toast } = useToast();
  
  const handleDeleteConfirm = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteStatus(id);
    }
  };

  return (
    <div className="space-y-3 mt-2">
      {statuses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No relationship statuses defined yet. Add your first one!
        </p>
      ) : (
        <>
          {statuses.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between p-2 border rounded-md bg-card"
            >
              <div className="flex items-center gap-2">
                <Switch
                  checked={status.isActive}
                  onCheckedChange={() => onToggleActive(status.id)}
                />
                <span className={!status.isActive ? "text-muted-foreground" : ""}>
                  {status.name}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditStatus(status)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteConfirm(status.id, status.name)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default StatusList;
