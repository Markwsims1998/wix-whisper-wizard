
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Eye, Check, X, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock reports data
const mockReports = Array(18).fill(null).map((_, index) => ({
  id: `report-${index + 1}`,
  contentType: ['post', 'comment', 'user', 'photo', 'video'][index % 5],
  contentId: `content-${index + 1}`,
  contentPreview: `${['post', 'comment'].includes(['post', 'comment', 'user', 'photo', 'video'][index % 5]) ? 
    'This is a preview of the reported content...' : 'Visual content'}`,
  reporter: `User ${Math.floor(Math.random() * 20) + 1}`,
  reason: ['inappropriate', 'spam', 'harassment', 'misinformation', 'other'][index % 5],
  status: ['pending', 'reviewing', 'resolved'][index % 3],
  reportedAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  details: "The user reported this content because it violates community guidelines. This needs immediate review."
}));

const AdminReports = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  
  const { toast } = useToast();
  
  const filteredReports = mockReports.filter(report => {
    if (statusFilter !== 'all' && report.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'all' && report.contentType !== typeFilter) {
      return false;
    }
    if (reasonFilter !== 'all' && report.reason !== reasonFilter) {
      return false;
    }
    return true;
  });
  
  const handleApproveReport = (id: string) => {
    toast({
      title: "Report Approved",
      description: "The reported content has been removed.",
      variant: "default",
    });
  };
  
  const handleDismissReport = (id: string) => {
    toast({
      title: "Report Dismissed",
      description: "The report has been dismissed as invalid.",
      variant: "default",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Content Reports</h1>
        <Button>Moderation Settings</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">18</CardTitle>
            <CardDescription>Total Reports</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-amber-600">12</CardTitle>
            <CardDescription>Pending Review</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">6</CardTitle>
            <CardDescription>Resolved Today</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Reports Queue</CardTitle>
              <CardDescription>Handle user-submitted content reports</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="photo">Photos</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start">
                  <div className="p-4 md:p-5 md:flex-1">
                    <div className="flex justify-between mb-2">
                      <Badge className={
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                        report.status === 'reviewing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                        'bg-green-100 text-green-800 hover:bg-green-200'
                      }>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      <Badge className={
                        report.contentType === 'post' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 
                        report.contentType === 'comment' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                        report.contentType === 'user' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        report.contentType === 'photo' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                        'bg-red-100 text-red-800 hover:bg-red-200'
                      }>
                        {report.contentType.charAt(0).toUpperCase() + report.contentType.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="mb-2">
                      <h3 className="font-medium">Report #{report.id.split('-')[1]} by {report.reporter}</h3>
                      <p className="text-sm text-gray-500">{report.reportedAt}</p>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1">Reason:</div>
                      <Badge variant="outline" className="font-normal">
                        {report.reason.charAt(0).toUpperCase() + report.reason.slice(1)}
                      </Badge>
                      <p className="mt-2 text-sm">{report.details}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-4">
                      <div className="text-sm font-medium mb-1">Reported Content:</div>
                      {report.contentType === 'photo' || report.contentType === 'video' ? (
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Eye className="h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-sm text-gray-500">View {report.contentType}</span>
                        </div>
                      ) : (
                        <p className="text-sm italic">"{report.contentPreview}"</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-5 md:w-48 flex md:flex-col items-center justify-between md:border-l">
                    <Button 
                      className="w-full text-green-700 bg-green-100 hover:bg-green-200 mb-2"
                      onClick={() => handleApproveReport(report.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Take Action
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => handleDismissReport(report.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Dismiss
                    </Button>
                    
                    <div className="hidden md:block border-t w-full my-4"></div>
                    
                    <Button variant="ghost" className="w-full mt-2 justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredReports.length}</span> of <span className="font-medium">{mockReports.length}</span> reports
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminReports;
