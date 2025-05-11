
import { useState, useRef } from "react";
import { Smile, Send, Paperclip, Image, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import GifPicker from "@/components/media/GifPicker";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageInputProps {
  onSendMessage: (content: { text: string; media?: { type: string; url: string; name?: string } }) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatMessageInput = ({ onSendMessage, disabled = false, placeholder = "Type a message..." }: ChatMessageInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; url: string; name?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addEmoji = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojis(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedMedia({ type: "gif", url: gifUrl });
    setShowGifs(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // For demo purposes, create a local URL
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image/") ? "image" : "file";
    
    setSelectedMedia({ type, url, name: file.name });
    
    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if ((!message.trim() && !selectedMedia) || disabled) return;
    
    onSendMessage({
      text: message,
      media: selectedMedia || undefined
    });
    
    // Reset states
    setMessage("");
    setSelectedMedia(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-t dark:border-gray-700">
      {/* Selected media preview */}
      {selectedMedia && (
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-2">
          <button
            className="absolute top-2 right-2 rounded-full bg-gray-800/70 p-1 text-white"
            onClick={removeMedia}
          >
            &times;
          </button>
          
          {selectedMedia.type === "image" || selectedMedia.type === "gif" ? (
            <img 
              src={selectedMedia.url} 
              alt="Selected media" 
              className="h-32 mx-auto rounded-md object-contain" 
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded">
                <Paperclip size={16} />
              </div>
              <span className="text-sm truncate">{selectedMedia.name || "Attached file"}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-grow relative">
          <Textarea
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[46px] py-3 pr-10 resize-none"
            disabled={disabled}
          />
        </div>
        
        <div className="flex gap-1">
          <Popover open={showEmojis} onOpenChange={setShowEmojis}>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                disabled={disabled}
                className="h-10 w-10 rounded-full"
              >
                <Smile className="h-5 w-5 text-amber-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end" side="top">
              <Picker 
                data={data} 
                onEmojiSelect={addEmoji}
                theme={document.documentElement.classList.contains('dark') ? "dark" : "light"}
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            type="button" 
            size="icon" 
            variant="ghost"
            disabled={disabled}
            className="h-10 w-10 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-5 w-5 text-blue-500" />
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload} 
            />
          </Button>
          
          <Popover open={showGifs} onOpenChange={setShowGifs}>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                disabled={disabled}
                className="h-10 w-10 rounded-full"
              >
                <Gift className="h-5 w-5 text-purple-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="end" side="top">
              <GifPicker onGifSelect={handleGifSelect} />
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={handleSend}
            disabled={(!message.trim() && !selectedMedia) || disabled}
            size="icon"
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageInput;
