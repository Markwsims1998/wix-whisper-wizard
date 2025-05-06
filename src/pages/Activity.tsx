
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Activity as ActivityIcon, User, Heart, MessageCircle, Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ActivityType = 'photo' | 'comment' | 'like' | 'share' | 'join' | 'profile';

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  time: string;
  actionIcon: ActivityType;
}

const Activity = () => {
  const [activeFilters, setActiveFilters] = useState<ActivityType[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);

  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Initial update
    updateHeaderPosition();

    // Set up observer to detect sidebar width changes
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, []);

  const activities = [
    { id: 1, user: 'Admin', action: 'posted a new photo', time: '15 minutes ago', actionIcon: 'photo' as ActivityType },
    { id: 2, user: 'Sephiroth', action: 'commented on your post', time: '2 hours ago', actionIcon: 'comment' as ActivityType },
    { id: 3, user: 'Linda Lohan', action: 'liked your photo', time: '4 hours ago', actionIcon: 'like' as ActivityType },
    { id: 4, user: 'Irina Petrova', action: 'shared your post', time: '1 day ago', actionIcon: 'share' as ActivityType },
    { id: 5, user: 'Robert Cook', action: 'joined the group', time: '2 days ago', actionIcon: 'join' as ActivityType },
    { id: 6, user: 'Jennie Ferguson', action: 'updated their profile', time: '3 days ago', actionIcon: 'profile' as ActivityType }
  ];

  // Filter activities based on active filters
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => 
        activeFilters.includes(activity.actionIcon)
      ));
    }
  }, [activeFilters]);

  const handleFilterChange = (type: ActivityType) => {
    setActiveFilters(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Activity</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`flex items-center gap-2 ${activeFilters.length > 0 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'} px-4 py-2 rounded-lg hover:bg-opacity-90 transition`}>
                    <Filter className="w-5 h-5" />
                    <span>Filter {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Filter Activities</h3>
                      {activeFilters.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearFilters}
                          className="h-8 text-xs text-gray-500 flex items-center"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-photos" 
                          checked={activeFilters.includes('photo')} 
                          onCheckedChange={() => handleFilterChange('photo')}
                        />
                        <Label htmlFor="filter-photos">Photos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-comments" 
                          checked={activeFilters.includes('comment')} 
                          onCheckedChange={() => handleFilterChange('comment')}
                        />
                        <Label htmlFor="filter-comments">Comments</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-likes" 
                          checked={activeFilters.includes('like')} 
                          onCheckedChange={() => handleFilterChange('like')}
                        />
                        <Label htmlFor="filter-likes">Likes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-shares" 
                          checked={activeFilters.includes('share')} 
                          onCheckedChange={() => handleFilterChange('share')}
                        />
                        <Label htmlFor="filter-shares">Shares</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-joins" 
                          checked={activeFilters.includes('join')} 
                          onCheckedChange={() => handleFilterChange('join')}
                        />
                        <Label htmlFor="filter-joins">Group Joins</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-profiles" 
                          checked={activeFilters.includes('profile')} 
                          onCheckedChange={() => handleFilterChange('profile')}
                        />
                        <Label htmlFor="filter-profiles">Profile Updates</Label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-4">
              {filteredActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-md font-medium">{activity.user}</h3>
                      <span className="text-sm text-gray-500 ml-2">{activity.action}</span>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="flex gap-2">
                    {activity.actionIcon === 'like' && <Heart className="w-4 h-4 text-red-500" />}
                    {activity.actionIcon === 'comment' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
              ))}
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No activities match your filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
