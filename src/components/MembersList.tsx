
import { User } from "lucide-react";

type Member = {
  id: string;
  name: string;
  username: string;
  timeAgo: string;
  avatar?: string;
};

const members: Member[] = [
  { id: '1', name: 'Admin', username: '@admin', timeAgo: '3 hours ago' },
  { id: '2', name: 'Sephiroth', username: '@seph', timeAgo: '19 days ago' },
  { id: '3', name: 'Linda Lohan', username: '@linda', timeAgo: 'a year ago' },
  { id: '4', name: 'Irina Petrova', username: '@irina', timeAgo: 'a year ago' },
  { id: '5', name: 'Jennie Ferguson', username: '@jennie', timeAgo: '2 years ago' },
  { id: '6', name: 'Robert Cook', username: '@robert', timeAgo: '2 years ago' },
  { id: '7', name: 'Sophia Lee', username: '@sophia', timeAgo: '2 years ago' },
];

const MembersList = () => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">Members</h2>
      <div className="border-b-2 border-purple-500 w-12 mb-4"></div>
      
      <div className="flex gap-2 mb-4">
        <span className="text-sm">Newest</span>
        <span className="text-sm font-medium">|</span>
        <span className="text-sm">Active</span>
        <span className="text-sm font-medium">|</span>
        <span className="text-sm">Popular</span>
      </div>
      
      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium">{member.name}</h3>
              <p className="text-xs text-gray-500">{member.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Hashtags</h2>
        <div className="border-b-2 border-purple-500 w-12 mb-4"></div>
        
        <div className="flex flex-wrap gap-2">
          <HashTag name="beehive" count={4} />
          <HashTag name="social" count={4} />
          <HashTag name="wordpress" count={1} />
          <HashTag name="photos" count={1} />
          <HashTag name="network" count={1} />
          <HashTag name="shop" count={1} />
          <HashTag name="videos" count={1} />
          <HashTag name="community" count={1} />
          <HashTag name="theme" count={1} />
          <HashTag name="awesome" count={1} />
        </div>
      </div>
    </div>
  );
};

const HashTag = ({ name, count }: { name: string; count: number }) => (
  <div className="flex items-center gap-1">
    <span className="text-sm text-purple-600">#{name}</span>
    <span className="text-xs text-gray-500">{count}</span>
  </div>
);

export default MembersList;
