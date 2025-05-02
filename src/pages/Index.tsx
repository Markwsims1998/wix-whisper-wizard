
import Header from "@/components/Header";
import MembersList from "@/components/MembersList";
import PostFeed from "@/components/PostFeed";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
          <div className="lg:col-span-2">
            <PostFeed />
          </div>
          <div className="lg:col-span-1">
            <MembersList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
