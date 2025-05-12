
import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PostFeed from "@/components/PostFeed";
import MembersList from "@/components/MembersList";
import FriendsSidebar from "@/components/FriendsSidebar";
import { useAuth } from "@/contexts/auth/AuthProvider";
import AdDisplay from "@/components/AdDisplay";
import Footer from "@/components/Footer";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      {/* Main content */}
      <div className="pt-16 pb-10 pr-4 transition-all duration-300" style={{
        paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 py-6">
            {/* Left Sidebar */}
            <div className="md:w-64 space-y-6">
              <MembersList />
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <PostFeed />
            </div>
            
            {/* Right Sidebar */}
            <div className="md:w-72 space-y-6">
              <FriendsSidebar />
              <AdDisplay />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
