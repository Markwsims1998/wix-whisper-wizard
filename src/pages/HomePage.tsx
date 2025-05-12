import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  MessageCircle, 
  Image, 
  Video, 
  Lock, 
  Heart, 
  Globe
} from "lucide-react";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // We removed the redirect if already authenticated as this is our landing page
  // Users can navigate to the index page ("/") from here if they want

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 text-gray-800 dark:text-white overflow-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isScrolled ? "bg-white/90 dark:bg-gray-900/90 shadow-md backdrop-blur-md" : ""
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                <span className="font-bold text-purple-600 dark:text-purple-400">HK</span>
              </div>
            </div>
            <span className="ml-2 text-xl font-bold">HappyKinks</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/feedback" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm">
              Beta Feedback
            </Link>
            {isAuthenticated ? (
              <Button 
                onClick={() => navigate("/")} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => navigate("/login")}
                  variant="outline" 
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => navigate("/login?tab=signup")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:pt-40 md:pb-32 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Connect with Your Community Like Never Before
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Join HappyKinks, the premier social platform designed for unique communities 
            to connect, share, and grow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/login")}
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate("/home")}
              size="lg"
              variant="outline"
              className="border-purple-400 dark:border-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-lg px-8 py-6"
            >
              Skip Login (Demo)
            </Button>
          </div>
        </div>

        {/* Abstract decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Everything You Need</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform provides all the tools you need to build meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageCircle className="h-10 w-10 text-purple-600 dark:text-purple-400" />}
              title="Messaging"
              description="Connect with community members through real-time messaging and group chats."
            />
            <FeatureCard 
              icon={<Image className="h-10 w-10 text-purple-600 dark:text-purple-400" />}
              title="Photo Sharing"
              description="Share your moments with high-quality photo uploads and curated albums."
            />
            <FeatureCard 
              icon={<Video className="h-10 w-10 text-purple-600 dark:text-purple-400" />}
              title="Video Content"
              description="Upload and stream videos to share experiences and tutorials."
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-purple-600 dark:text-purple-400" />}
              title="Community Groups"
              description="Find like-minded people and join specialized interest groups."
            />
            <FeatureCard 
              icon={<Globe className="h-10 w-10 text-purple-600 dark:text-purple-400" />}
              title="Events"
              description="Discover and organize local and online events for your community."
            />
            <FeatureCard 
              icon={<Lock className="h-10 w-10 text-purple-600 dark:text-purple-400" />}
              title="Privacy Controls"
              description="Control what you share and with whom through advanced privacy settings."
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">What Our Community Says</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="HappyKinks has helped me find my people in a way I never thought possible."
              name="Jamie L."
              role="Community Member"
            />
            <TestimonialCard
              quote="The privacy controls are exceptional, I feel safe sharing with my trusted circles."
              name="Alex T."
              role="Group Organizer"
            />
            <TestimonialCard
              quote="Finding events and connecting with like-minded individuals has never been easier."
              name="Sam K."
              role="Event Planner"
            />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Join Our Growing Community Today</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get started for free and see why thousands of people trust HappyKinks for their community needs.
          </p>
          <Button 
            onClick={() => navigate("/login")}
            size="lg" 
            className="bg-white hover:bg-gray-100 text-purple-700 hover:text-purple-800"
          >
            Create Your Account
            <Heart className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-gray-950 text-white/70 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-xs">HK</span>
                  </div>
                </div>
                <span className="ml-2 text-lg font-bold text-white">HappyKinks</span>
              </div>
              <p className="text-sm">
                Connecting unique communities and fostering inclusivity since 2025.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/login" className="hover:text-white">Features</Link></li>
                <li><Link to="/feedback" className="hover:text-white">Beta Feedback</Link></li>
                <li><Link to="/login" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">About Us</Link></li>
                <li><Link to="/login" className="hover:text-white">Careers</Link></li>
                <li><Link to="/login" className="hover:text-white">Blog</Link></li>
                <li><Link to="/login" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/login" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/login" className="hover:text-white">Cookie Policy</Link></li>
                <li><Link to="/login" className="hover:text-white">Community Guidelines</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2025 HappyKinks. All rights reserved.</p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              <SocialIcon name="Facebook" />
              <SocialIcon name="Twitter" />
              <SocialIcon name="Instagram" />
              <SocialIcon name="LinkedIn" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-600 transition-all duration-300 hover:shadow-md group">
      <div className="mb-4 transform transition-transform group-hover:scale-110">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="mb-4">
        <svg className="h-8 w-8 text-purple-500" fill="currentColor" viewBox="0 0 32 32">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{quote}</p>
      <div className="font-medium text-gray-900 dark:text-white">{name}</div>
      <div className="text-sm text-purple-600 dark:text-purple-400">{role}</div>
    </div>
  );
};

const SocialIcon = ({ name }: { name: string }) => {
  return (
    <a 
      href="#" 
      className="text-white/70 hover:text-white transition-colors"
      aria-label={name}
    >
      <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
        <span className="sr-only">{name}</span>
        {/* Simplified icon representation */}
        <div className="w-4 h-4 bg-current rounded-sm"></div>
      </div>
    </a>
  );
};

export default HomePage;
