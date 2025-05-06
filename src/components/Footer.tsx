
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2B2A33] text-gray-300 dark:bg-gray-900 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">HappyKinks</h3>
            <p className="text-sm text-gray-400">
              A safe and inclusive space for the kink community to connect, share, and explore.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/photos" className="hover:text-white transition-colors">Photos</Link></li>
              <li><Link to="/watch" className="hover:text-white transition-colors">Watch</Link></li>
              <li><Link to="/people" className="hover:text-white transition-colors">People</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Membership</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/settings?tab=subscription" className="hover:text-white transition-colors">Manage Subscription</Link></li>
              <li><Link to="/settings?tab=privacy" className="hover:text-white transition-colors">Privacy Settings</Link></li>
              <li><Link to="/settings?tab=notifications" className="hover:text-white transition-colors">Email Preferences</Link></li>
              <li><Link to="/settings" className="hover:text-white transition-colors">Account Settings</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© {currentYear} HappyKinks. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
