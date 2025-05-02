
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Edit, MapPin, User, Image, Video, Heart, MessageSquare, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-2 py-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-xl font-semibold">My Profile</h1>
            </Link>
          </div>

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
          
          {/* Create Post Area */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <input 
                  type="text"
                  placeholder="Share something on your profile..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="flex border-t pt-3">
              <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                <Image className="w-5 h-5 text-green-500" />
                <span className="text-sm">Photo</span>
              </button>
              <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                <Video className="w-5 h-5 text-red-500" />
                <span className="text-sm">Video</span>
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Your Recent Posts</h2>
              <Separator className="mb-4" />
              
              {/* Sample Posts */}
              {[1, 2, 3].map((post) => (
                <div key={post} className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Alex Johnson</p>
                      <p className="text-xs text-gray-500">
                        {post === 1 ? "2 days ago" : post === 2 ? "1 week ago" : "2 weeks ago"}
                      </p>
                    </div>
                  </div>
                  
                  <p className="mb-4">
                    {post === 1 && "Just finished reading an amazing book about artificial intelligence. Highly recommend! 📚"}
                    {post === 2 && "Beautiful day for a hike! The views were absolutely breathtaking today. 🏔️"}
                    {post === 3 && "Anyone else excited for the upcoming tech conference next month? Looking forward to connecting with like-minded people!"}
                  </p>
                  
                  {post === 2 && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img src="https://via.placeholder.com/600x300" alt="Post" className="w-full" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600">
                      <Heart className="h-4 w-4" /> 24
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600">
                      <MessageSquare className="h-4 w-4" /> 8
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600">
                      <Share2 className="h-4 w-4" /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
