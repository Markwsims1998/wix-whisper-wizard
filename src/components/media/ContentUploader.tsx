
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Video, MapPin, Hash, Album, X } from "lucide-react";
import { Badge } from "../ui/badge";

interface ContentUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'photo' | 'video';
}

const ContentUploader = ({ open, onOpenChange, type = 'photo' }: ContentUploaderProps) => {
  const [contentType, setContentType] = useState<'photo' | 'video'>(type);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [album, setAlbum] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  
  // Sample categories
  const categories = {
    photo: ['Events', 'Portraits', 'Fashion', 'Lifestyle', 'Travel'],
    video: ['Events', 'Tutorials', 'Meetups', 'Workshops', 'Interviews']
  };
  
  // Sample albums
  const albums = ['My Album', 'Community Events', 'Workshop Photos', 'Vacation 2025', 'Create New Album...'];
  
  const handleAddHashtag = () => {
    if (hashtagInput && !hashtags.includes(hashtagInput)) {
      setHashtags([...hashtags, hashtagInput]);
      setHashtagInput('');
    }
  };
  
  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hashtagInput) {
      e.preventDefault();
      handleAddHashtag();
    }
  };
  
  const handleSubmit = () => {
    // In a real app, this would upload the content and save metadata
    console.log({
      type: contentType,
      title,
      description,
      category: selectedCategory,
      location,
      album,
      hashtags
    });
    
    // Close the dialog and reset form
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</DialogTitle>
          <DialogDescription>
            Fill in the details for your {contentType}. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={contentType} onValueChange={(value) => setContentType(value as 'photo' | 'video')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="photo" className="flex items-center gap-2">
              <Image className="w-4 h-4" /> Photo
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Video
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photo" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-sm font-medium">Drag and drop your photo here</p>
              <p className="text-xs text-gray-500 mb-4">PNG, JPG or WEBP up to 10MB</p>
              <Button type="button" variant="outline" size="sm">Browse Files</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-sm font-medium">Drag and drop your video here</p>
              <p className="text-xs text-gray-500 mb-4">MP4, MOV or WebM up to 100MB</p>
              <Button type="button" variant="outline" size="sm">Browse Files</Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              placeholder="Enter a title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Write a description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories[contentType].map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="album">Album</Label>
            <div className="flex items-center gap-2">
              <Album className="w-4 h-4 text-gray-500" />
              <Select value={album} onValueChange={setAlbum}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose an album" />
                </SelectTrigger>
                <SelectContent>
                  {albums.map(album => (
                    <SelectItem key={album} value={album}>
                      {album}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <Input 
                id="location" 
                placeholder="Add a location (optional)" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <Input 
                id="hashtags" 
                placeholder="Add hashtags" 
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddHashtag}
              >
                Add
              </Button>
            </div>
            
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map(tag => (
                  <Badge key={tag} className="gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800">
                    #{tag}
                    <button onClick={() => handleRemoveHashtag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !selectedCategory}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploader;
