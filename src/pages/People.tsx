
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { Users, User, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const People = () => {
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

  const members = [
    { id: '1', name: 'Admin', username: '@admin', timeAgo: '3 hours ago', isFriend: true },
    { id: '2', name: 'Sephiroth', username: '@seph', timeAgo: '19 days ago', isFriend: true, isHotlist: true },
    { id: '3', name: 'Linda Lohan', username: '@linda', timeAgo: 'a year ago', isLocal: true, isFriend: true },
    { id: '4', name: 'Irina Petrova', username: '@irina', timeAgo: 'a year ago', isLocal: true, isFriend: true },
    { id: '5', name: 'Jennie Ferguson', username: '@jennie', timeAgo: '2 years ago', isHotlist: true },
    { id: '6', name: 'Robert Cook', username: '@robert', timeAgo: '2 years ago', isLocal: true },
    { id: '7', name: 'Sophia Lee', username: '@sophia', timeAgo: '2 years ago', isHotlist: true },
    { id: '8', name: 'John Smith', username: '@john', timeAgo: '3 years ago' },
    { id: '9', name: 'Emma Wilson', username: '@emma', timeAgo: '3 years ago' },
    { id: '10', name: 'Michael Brown', username: '@michael', timeAgo: '3 years ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">People</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search people..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-4">
              <TabsList className="grid grid-cols-4 w-full bg-gray-100 mb-6">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="local" className="text-xs">Local</TabsTrigger>
                <TabsTrigger value="hotlist" className="text-xs">Hotlist</TabsTrigger>
                <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="local">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.filter(member => member.isLocal).map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hotlist">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.filter(member => member.isHotlist).map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="friends">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.filter(member => member.isFriend).map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberCard = ({ member }: { member: any }) => {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition p-4">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-3">
          <User className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="font-medium text-center">{member.name}</h3>
        <p className="text-sm text-gray-500 text-center">{member.username}</p>
        <p className="text-xs text-gray-400 text-center mt-1">Active {member.timeAgo}</p>
        
        <div className="mt-4 flex gap-2">
          <button className="bg-purple-600 text-white px-3 py-1 text-xs rounded-md hover:bg-purple-700 transition">
            {member.isFriend ? 'Message' : 'Add Friend'}
          </button>
          {!member.isFriend && (
            <button className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded-md hover:bg-gray-300 transition">
              Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default People;
