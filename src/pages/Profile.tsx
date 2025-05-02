
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Edit, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Profile</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Cover and Profile Picture */}
          <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="bg-white rounded-full p-1 w-24 h-24 flex items-center justify-center">
                <User className="w-20 h-20 text-gray-400" strokeWidth={1} />
              </div>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="pt-16 px-6 pb-6">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">Alex Johnson</h1>
                <p className="text-gray-500">@alexjohnson</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-700">
                Digital enthusiast, photography lover, and coffee addict. Always looking for the next adventure!
              </p>
              
              <div className="flex flex-wrap gap-4 mt-3 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined January 2022</span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-4">
                <div>
                  <span className="font-bold">245</span>
                  <span className="text-gray-500 ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold">12.4K</span>
                  <span className="text-gray-500 ml-1">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            <Separator className="mb-4" />
            
            {/* Sample Posts */}
            {[1, 2, 3].map((post) => (
              <div key={post} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <p className="mb-2">
                  {post === 1 && "Just finished reading an amazing book about artificial intelligence. Highly recommend! 📚"}
                  {post === 2 && "Beautiful day for a hike! The views were absolutely breathtaking today. 🏔️"}
                  {post === 3 && "Anyone else excited for the upcoming tech conference next month? Looking forward to connecting with like-minded people!"}
                </p>
                <p className="text-sm text-gray-500">
                  {post === 1 ? "2 days ago" : post === 2 ? "1 week ago" : "2 weeks ago"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
