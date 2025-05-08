
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();

  return (
    <footer 
      className={`bg-[#2B2A33] text-gray-300 dark:bg-gray-900 w-full z-10 ${isMobile ? 'relative' : 'fixed bottom-0 left-0 right-0'}`} 
      style={!isMobile ? { marginLeft: 'var(--sidebar-width, 280px)', width: 'calc(100% - var(--sidebar-width, 280px))', transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out' } : {}}
    >
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className={`${isMobile ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 md:grid-cols-4 gap-8'}`}>
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
          
          {!isMobile && (
            <>
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
                  <li><Link to="/help/support" className="hover:text-white transition-colors">Support Center</Link></li>
                  <li><Link to="/help/guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
                  <li><Link to="/help/safety" className="hover:text-white transition-colors">Safety Tips</Link></li>
                  <li><Link to="/help/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© {currentYear} HappyKinks. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 md:mt-0 text-sm">
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
