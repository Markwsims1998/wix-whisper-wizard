
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RelationshipStatus } from "@/data/database";

interface EditStatusDialogProps {
  status: RelationshipStatus | null;
  onSave: (status: RelationshipStatus) => void;
  onCancel: () => void;
}

const EditStatusDialog = ({ status, onSave, onCancel }: EditStatusDialogProps) => {
  const [editedStatus, setEditedStatus] = useState<RelationshipStatus | null>(status);
  
  if (!status || !editedStatus) return null;

  return (
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
              value={editedStatus.name}
              onChange={(e) =>
                setEditedStatus({ ...editedStatus, name: e.target.value })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedStatus)}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditStatusDialog;
