
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FriendProfile } from "@/services/userService";
import { User, CheckCircle, XCircle } from "lucide-react";
import { acceptFriendRequest, rejectFriendRequest } from "@/services/friendService";

interface FriendRequestsListProps {
  requests: FriendProfile[];
}

const FriendRequestsList = ({ requests }: FriendRequestsListProps) => {
  const { toast } = useToast();
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [remainingRequests, setRemainingRequests] = useState<FriendProfile[]>(requests);
  
  const handleAccept = async (requesterId: string) => {
    setProcessingIds(prev => [...prev, requesterId]);
    
    try {
      const success = await acceptFriendRequest(requesterId, requesterId);
      
      if (success) {
        setRemainingRequests(prev => prev.filter(request => request.id !== requesterId));
        toast({
          title: "Friend request accepted",
          description: "You are now friends!",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Could not accept friend request. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requesterId));
    }
  };
  
  const handleReject = async (requesterId: string) => {
    setProcessingIds(prev => [...prev, requesterId]);
    
    try {
      const success = await rejectFriendRequest(requesterId, requesterId);
      
      if (success) {
        setRemainingRequests(prev => prev.filter(request => request.id !== requesterId));
        toast({
          title: "Friend request rejected",
          description: "The request has been declined.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Could not reject friend request. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requesterId));
    }
  };
  
  return (
    <div className="space-y-4">
      {remainingRequests.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No pending friend requests
        </div>
      ) : (
        remainingRequests.map((request) => (
          <Card key={request.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${request.id}`}>
                  <Avatar className="h-12 w-12">
                    {request.avatar_url ? (
                      <AvatarImage src={request.avatar_url} alt={request.full_name} />
                    ) : (
                      <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                        {request.full_name && request.full_name[0]?.toUpperCase() || <User size={20} />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/profile/${request.id}`} className="font-medium hover:underline">
                    {request.full_name || 'User'}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {request.username ? `@${request.username}` : ''}
                  </p>
                  <p className="text-sm mt-1">wants to be your friend</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleAccept(request.id)}
                  disabled={processingIds.includes(request.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleReject(request.id)}
                  disabled={processingIds.includes(request.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default FriendRequestsList;
