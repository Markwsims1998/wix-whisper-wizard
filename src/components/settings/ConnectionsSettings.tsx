
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ConnectionsSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage third-party accounts and connections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">No connected accounts yet.</p>
      </CardContent>
      <CardFooter>
        <Button>Connect an Account</Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionsSettings;
