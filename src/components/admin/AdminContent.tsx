
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, Eye, Trash, Check, X } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mock content data
const mockPosts = Array(15).fill(null).map((_, index) => ({
  id: `post-${index + 1}`,
  title: `Post ${index + 1}`,
  author: `User ${Math.floor(Math.random() * 20) + 1}`,
  type: ['text', 'photo', 'video', 'gif'][index % 4],
  status: index % 10 === 0 ? 'flagged' : (index % 7 === 0 ? 'pending' : 'published'),
  published: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  views: Math.floor(Math.random() * 10000),
  likes: Math.floor(Math.random() * 1000),
  thumbnail: index % 4 === 1 || index % 4 === 2 ? `https://picsum.photos/id/${(index * 5) % 100}/200/200` : null
}));

const mockComments = Array(20).fill(null).map((_, index) => ({
  id: `comment-${index + 1}`,
  content: `This is comment ${index + 1}. ${index % 3 === 0 ? 'It might contain some flagged content that needs review.' : 'Regular comment content.'}`,
  author: `User ${Math.floor(Math.random() * 20) + 1}`,
  post: `Post ${Math.floor(Math.random() * 15) + 1}`,
  status: index % 8 === 0 ? 'flagged' : (index % 5 === 0 ? 'pending' : 'published'),
  published: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toLocaleDateString(),
}));

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  
  const filteredPosts = mockPosts.filter(post => {
    // Search filter
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.author.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Type filter
    if (typeFilter !== 'all' && post.type !== typeFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && post.status !== statusFilter) {
      return false;
    }
    return true;
  });
  
  const filteredComments = mockComments.filter(comment => {
    // Search filter
    if (searchQuery && !comment.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !comment.author.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !comment.post.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && comment.status !== statusFilter) {
      return false;
    }
    return true;
  });
  
  const handleApprove = (id: string, type: 'post' | 'comment') => {
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Approved`,
      description: `The ${type} has been approved and published.`,
    });
  };
  
  const handleReject = (id: string, type: 'post' | 'comment') => {
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Rejected`,
      description: `The ${type} has been rejected and removed.`,
      variant: "destructive",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <Button>Create Content</Button>
      </div>
      
      <Card>
        <CardHeader>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage posts, comments, and media</CardDescription>
              </div>
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder={activeTab === "posts" ? "Search posts..." : "Search comments..."}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {activeTab === "posts" && (
                <div className="w-40">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="gif">GIF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="posts" className="space-y-4 mt-0">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 [&_tr]:border-b">
                    <tr className="border-b transition-colors">
                      <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Author</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Published</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Views / Likes</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredPosts.map(post => (
                      <tr key={post.id} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            {post.thumbnail && (
                              <div className="h-10 w-10 rounded overflow-hidden">
                                <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div className="font-medium">{post.title}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            post.type === 'photo' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                            post.type === 'video' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 
                            post.type === 'gif' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                            'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }>
                            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">{post.author}</td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            post.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                            post.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                            'bg-red-100 text-red-800 hover:bg-red-200'
                          }>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-sm">{post.published}</td>
                        <td className="p-4 align-middle text-right">
                          <span className="text-sm">{post.views} views / {post.likes} likes</span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-1">
                            {post.status !== 'published' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(post.id, 'post')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(post.id, 'post')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4 mt-0">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 [&_tr]:border-b">
                    <tr className="border-b transition-colors">
                      <th className="h-12 px-4 text-left align-middle font-medium">Content</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Author</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Post</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredComments.map(comment => (
                      <tr key={comment.id} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 align-middle">
                          <div className="max-w-xs truncate">{comment.content}</div>
                        </td>
                        <td className="p-4 align-middle">{comment.author}</td>
                        <td className="p-4 align-middle">{comment.post}</td>
                        <td className="p-4 align-middle">
                          <Badge className={
                            comment.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                            comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                            'bg-red-100 text-red-800 hover:bg-red-200'
                          }>
                            {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-sm">{comment.published}</td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-1">
                            {comment.status !== 'published' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(comment.id, 'comment')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(comment.id, 'comment')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">
              {activeTab === "posts" ? filteredPosts.length : filteredComments.length}
            </span> of <span className="font-medium">
              {activeTab === "posts" ? mockPosts.length : mockComments.length}
            </span> {activeTab}
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

export default AdminContent;
