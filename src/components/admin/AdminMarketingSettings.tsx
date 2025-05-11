import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Image, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { saveBannerSettings, getBannerSettings } from "@/services/bannerService";

const AdminMarketingSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("banner");
  const [isLoading, setIsLoading] = useState(false);
  
  // Banner state
  const [bannerActive, setBannerActive] = useState(true);
  const [bannerText, setBannerText] = useState("We're in beta! Help us improve by providing feedback.");
  const [bannerLink, setBannerLink] = useState("/feedback");
  const [bannerLinkText, setBannerLinkText] = useState("feedback");
  const [bannerColor, setBannerColor] = useState("purple");
  const [bannerSchedule, setBannerSchedule] = useState(false);
  const [bannerStartDate, setBannerStartDate] = useState<Date | undefined>(new Date());
  const [bannerEndDate, setBannerEndDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );

  // Ad display state
  const [adImage, setAdImage] = useState("https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&h=400");
  const [adTitle, setAdTitle] = useState("Upgrade to Silver or Gold");
  const [adDescription, setAdDescription] = useState("Remove ads and get access to exclusive content with our premium plans.");
  const [adButtonText, setAdButtonText] = useState("View Subscription Plans");
  const [adLink, setAdLink] = useState("/shop");
  
  // Load existing banner settings when component mounts
  useEffect(() => {
    const loadBannerSettings = async () => {
      try {
        const settings = await getBannerSettings();
        setBannerActive(settings.active);
        setBannerText(settings.text);
        setBannerLink(settings.link);
        setBannerLinkText(settings.linkText);
        setBannerColor(settings.color);
        setBannerSchedule(settings.scheduled);
        
        if (settings.startDate) {
          setBannerStartDate(new Date(settings.startDate));
        }
        
        if (settings.endDate) {
          setBannerEndDate(new Date(settings.endDate));
        }
      } catch (error) {
        console.error("Error loading banner settings:", error);
      }
    };
    
    loadBannerSettings();
  }, []);

  const handleSaveBanner = async () => {
    setIsLoading(true);
    try {
      const success = await saveBannerSettings({
        active: bannerActive,
        text: bannerText,
        link: bannerLink,
        linkText: bannerLinkText,
        color: bannerColor,
        scheduled: bannerSchedule,
        startDate: bannerStartDate ? bannerStartDate.toISOString() : null,
        endDate: bannerEndDate ? bannerEndDate.toISOString() : null
      });
      
      if (success) {
        toast({
          title: "Banner Settings Saved",
          description: "Your banner configuration has been updated.",
        });
      } else {
        toast({
          title: "Failed to Save",
          description: "There was a problem saving your banner settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving banner settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving banner settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAd = () => {
    // In a real app, this would save to a database or API
    toast({
      title: "Ad Display Settings Saved",
      description: "Your advertisement configuration has been updated.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Marketing Settings</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 gap-2">
          <TabsTrigger value="banner" className="flex items-center gap-1">
            <Megaphone className="w-4 h-4 mr-2" />
            Banner Configuration
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-1">
            <Image className="w-4 h-4 mr-2" />
            Ad Display Configuration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="banner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banner Settings</CardTitle>
              <CardDescription>
                Configure the announcement banner that appears at the top of the page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Banner</Label>
                  <p className="text-sm text-muted-foreground">
                    Show the announcement banner to all users
                  </p>
                </div>
                <Switch checked={bannerActive} onCheckedChange={setBannerActive} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="banner-text">Banner Text</Label>
                <Textarea 
                  id="banner-text" 
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banner-link">Link Destination</Label>
                  <Input 
                    id="banner-link" 
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    placeholder="/feedback"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-link-text">Link Text</Label>
                  <Input 
                    id="banner-link-text" 
                    value={bannerLinkText}
                    onChange={(e) => setBannerLinkText(e.target.value)}
                    placeholder="feedback"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="banner-color">Banner Color</Label>
                <Select value={bannerColor} onValueChange={setBannerColor}>
                  <SelectTrigger id="banner-color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Schedule Banner</Label>
                  <p className="text-sm text-muted-foreground">
                    Set a date range when the banner should be shown
                  </p>
                </div>
                <Switch checked={bannerSchedule} onCheckedChange={setBannerSchedule} />
              </div>
              
              {bannerSchedule && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bannerStartDate ? format(bannerStartDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={bannerStartDate}
                          onSelect={setBannerStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bannerEndDate ? format(bannerEndDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={bannerEndDate}
                          onSelect={setBannerEndDate}
                          initialFocus
                          disabled={(date) => 
                            bannerStartDate ? date < bannerStartDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
              
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2">Banner Preview</h4>
                <div className={`bg-${bannerColor}-700 dark:bg-${bannerColor}-900 text-white py-2 px-4 rounded flex items-center justify-center shadow-sm`}>
                  <Megaphone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{bannerText} <span className="underline font-medium">{bannerLinkText}</span></span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBanner} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Banner Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Display Settings</CardTitle>
              <CardDescription>
                Configure the advertisement display for non-premium users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ad-image-url">Ad Image URL</Label>
                <Input 
                  id="ad-image-url" 
                  value={adImage}
                  onChange={(e) => setAdImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-muted-foreground">
                  Enter a direct URL to an image. Recommended size: 800x400px
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>Upload New Ad Image</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">Upload Image</Button>
                  <span className="text-sm text-muted-foreground">Max file size: 2MB</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ad-title">Ad Title</Label>
                <Input 
                  id="ad-title" 
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ad-description">Ad Description</Label>
                <Textarea 
                  id="ad-description" 
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad-button-text">Button Text</Label>
                  <Input 
                    id="ad-button-text" 
                    value={adButtonText}
                    onChange={(e) => setAdButtonText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-link">Button Link</Label>
                  <Input 
                    id="ad-link" 
                    value={adLink}
                    onChange={(e) => setAdLink(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2">Ad Preview</h4>
                <div className="relative rounded-md overflow-hidden">
                  <img 
                    src={adImage}
                    alt="Ad preview" 
                    className="w-full h-auto rounded-md object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x400?text=Invalid+Image+URL";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/80 to-transparent p-4">
                    <h3 className="text-white font-semibold mb-2">{adTitle}</h3>
                    <p className="text-white/90 text-sm mb-3">
                      {adDescription}
                    </p>
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-sm">
                      {adButtonText}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAd}>Save Ad Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMarketingSettings;
