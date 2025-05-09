
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Eye, UserCog } from "lucide-react";

const DataSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Data</CardTitle>
        <CardDescription>
          Manage your personal data and account information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Database className="w-4 h-4" />
          Download Your Data
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 text-amber-600">
          <Eye className="w-4 h-4" />
          View Activity Log
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 text-red-600">
          <UserCog className="w-4 h-4" />
          Deactivate Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataSettings;
