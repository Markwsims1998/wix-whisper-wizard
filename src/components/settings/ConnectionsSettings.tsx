
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Link } from "lucide-react";

// Define schema for form validation
const connectionFormSchema = z.object({
  platform: z.string({
    required_error: "Please select a platform",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

type ConnectionFormValues = z.infer<typeof connectionFormSchema>;

// Define platform options
const platforms = [
  { label: "Twitter", value: "twitter" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Discord", value: "discord" },
  { label: "Telegram", value: "telegram" },
];

const ConnectionsSettings = () => {
  const [connections, setConnections] = useState<{id: string, platform: string, username: string}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Set up form with validation
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      platform: "",
      username: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data: ConnectionFormValues) => {
    setIsConnecting(true);
    
    try {
      // Here you would typically handle the connection to the selected platform
      // For now we'll simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new connection to the list
      const newConnection = {
        id: Date.now().toString(),
        platform: data.platform,
        username: data.username,
      };
      
      setConnections([...connections, newConnection]);
      
      // Reset form
      form.reset();
      
      toast({
        title: "Account Connected",
        description: `Successfully connected to ${data.platform} as ${data.username}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "There was a problem connecting your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = (id: string) => {
    // Remove the connection from the list
    setConnections(connections.filter(connection => connection.id !== id));
    
    toast({
      title: "Account Disconnected",
      description: "The account has been disconnected successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage third-party accounts and connections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connections.length > 0 ? (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Link className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{connection.platform}</p>
                    <p className="text-sm text-muted-foreground">{connection.username}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDisconnect(connection.id)}
                >
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No connected accounts yet.</p>
        )}

        {isConnecting ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Connecting to service...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the platform you want to connect.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username on the platform" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your username for the selected platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isConnecting}>
                Connect Account
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionsSettings;
