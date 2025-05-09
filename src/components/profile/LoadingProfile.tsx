
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const LoadingProfile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      <div className="pl-[280px] pt-24 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
          <span className="ml-3 text-lg text-gray-700">Loading profile...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingProfile;
