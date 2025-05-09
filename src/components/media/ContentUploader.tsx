import { useState, useEffect } from 'react';
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
import { Image, Video, MapPin, Hash, Album, X, Tag, Smile } from "lucide-react";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useToast } from "@/hooks/use-toast";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface ContentUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'photo' | 'video';
}

// Mock users for tagging
const suggestedUsers = [
  { id: 1, name: "Alex Johnson", username: "alex_j", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Samantha Lee", username: "samlee", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Marcus Wright", username: "marc_wright", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: 4, name: "Jamie Rodriguez", username: "jamierod", avatar: "https://randomuser.me/api/portraits/women/17.jpg" },
  { id: 5, name: "Taylor Kim", username: "t_kim", avatar: "https://randomuser.me/api/portraits/women/28.jpg" }
];

const ContentUploader = ({ open, onOpenChange, type = 'photo' }: ContentUploaderProps) => {
  const [contentType, setContentType] = useState<'photo' | 'video'>(type);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [album, setAlbum] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [createNewAlbum, setCreateNewAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);

  const { toast } = useToast();
  
  // Sample categories
  const categories = {
    photo: ['Events', 'Portraits', 'Fashion', 'Lifestyle', 'Travel'],
    video: ['Events', 'Tutorials', 'Meetups', 'Workshops', 'Interviews']
  };
  
  // Sample albums
  const albums = ['My Album', 'Community Events', 'Workshop Photos', 'Vacation 2025'];
  
  // Check form validity
  useEffect(() => {
    const isValid = 
      title.trim() !== '' && 
      selectedCategory !== '' &&
      selectedFile !== null;
    
    setFormValid(isValid);
  }, [title, description, selectedCategory, selectedFile]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
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
  
  const handleTagUser = (user: any) => {
    if (!taggedUsers.find(u => u.id === user.id)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };
  
  const handleRemoveTag = (userId: number) => {
    setTaggedUsers(taggedUsers.filter(user => user.id !== userId));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowTagSuggestions(e.target.value.length > 0);
  };

  const handleAlbumChange = (value: string) => {
    if (value === 'create_new') {
      setCreateNewAlbum(true);
      setAlbum('');
    } else {
      setCreateNewAlbum(false);
      setAlbum(value);
    }
  };

  const addEmoji = (emoji: any) => {
    setDescription(prev => prev + emoji.native);
  };

  const filteredUsers = tagInput.length > 0
    ? suggestedUsers.filter(user => 
        user.name.toLowerCase().includes(tagInput.toLowerCase()) || 
        user.username.toLowerCase().includes(tagInput.toLowerCase())
      )
    : [];
  
  const handleSubmit = () => {
    // In a real app, this would upload the content and save metadata
    console.log({
      type: contentType,
      title,
      description,
      category: selectedCategory,
      location,
      album: createNewAlbum ? newAlbumName : album,
      hashtags,
      taggedUsers,
      file: selectedFile
    });
    
    // Show toast
    toast({
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Uploaded`,
      description: "Your content has been successfully uploaded.",
    });
    
    // Close the dialog and reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedCategory('');
    setLocation('');
    setAlbum('');
    setHashtags([]);
    setHashtagInput('');
    setTaggedUsers([]);
    setTagInput('');
    setCreateNewAlbum(false);
    setNewAlbumName('');
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative ${filePreview ? 'pt-0' : ''}`}
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              {filePreview ? (
                <div className="mb-4">
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="mx-auto max-h-48 rounded-lg shadow-sm" 
                  />
                  <button 
                    type="button" 
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilePreview(null);
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              )}
              <p className="mb-2 text-sm font-medium">{filePreview ? "Click to change photo" : "Drag and drop your photo here"}</p>
              <p className="text-xs text-gray-500 mb-4">{filePreview ? "PNG, JPG or WEBP up to 10MB"}</p>
              <Button type="button" variant="outline" size="sm">Browse Files</Button>
              <input 
                id="photo-upload" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative ${filePreview ? 'pt-0' : ''}`}
              onClick={() => document.getElementById('video-upload')?.click()}
            >
              {filePreview ? (
                <div className="mb-4">
                  {contentType === 'video' ? (
                    <video 
                      src={filePreview} 
                      className="mx-auto max-h-48 rounded-lg shadow-sm" 
                      controls
                    />
                  ) : (
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      className="mx-auto max-h-48 rounded-lg shadow-sm" 
                    />
                  )}
                  <button 
                    type="button" 
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilePreview(null);
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              )}
              <p className="mb-2 text-sm font-medium">{filePreview ? "Click to change video" : "Drag and drop your video here"}</p>
              <p className="text-xs text-gray-500 mb-4">{filePreview ? "MP4, MOV or WebM up to 100MB"}</p>
              <Button type="button" variant="outline" size="sm">Browse Files</Button>
              <input 
                id="video-upload" 
                type="file" 
                className="hidden" 
                accept="video/*" 
                onChange={handleFileChange}
              />
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
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Description</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Smile className="h-4 w-4" />
                    Emoji
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" side="top">
                  <Picker 
                    data={data} 
                    onEmojiSelect={addEmoji} 
                    theme="light" 
                  />
                </PopoverContent>
              </Popover>
            </div>
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
            {!createNewAlbum ? (
              <div className="flex items-center gap-2">
                <Album className="w-4 h-4 text-gray-500" />
                <Select value={album} onValueChange={handleAlbumChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose an album" />
                  </SelectTrigger>
                  <SelectContent>
                    {albums.map(album => (
                      <SelectItem key={album} value={album}>
                        {album}
                      </SelectItem>
                    ))}
                    <SelectItem value="create_new">➕ Create New Album</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Album className="w-4 h-4 text-gray-500" />
                <Input 
                  placeholder="New album name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCreateNewAlbum(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
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
            <Label htmlFor="tags">Tag People</Label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <Input 
                  id="tags" 
                  placeholder="Tag people with @" 
                  value={tagInput}
                  onChange={handleInputChange}
                  onFocus={() => tagInput && setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                />
              </div>
              
              {showTagSuggestions && filteredUsers.length > 0 && (
                <div className="absolute z-10 bg-white shadow-lg rounded-md mt-1 left-0 right-0 border border-gray-200 max-h-48 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleTagUser(user)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {taggedUsers.map(user => (
                  <Badge key={user.id} className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full overflow-hidden">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      @{user.username}
                      <button onClick={() => handleRemoveTag(user.id)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </Badge>
                ))}
              </div>
            )}
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
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formValid}>
            Upload {contentType === 'photo' ? 'Photo' : 'Video'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploader;
