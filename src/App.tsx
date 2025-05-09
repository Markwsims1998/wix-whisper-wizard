import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { Toaster } from './components/ui/toaster';

// Layout components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Index from './pages/Index';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Messages from './pages/Messages';
import Photos from './pages/Photos';
import Videos from './pages/Videos';
import People from './pages/People';
import Notifications from './pages/Notifications';
import Shop from './pages/Shop';
import Basket from './pages/Basket';
import Activity from './pages/Activity';
import Feedback from './pages/Feedback';
import Watch from './pages/Watch';

// CSS
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
              <div className="flex flex-grow">
                <Sidebar />
                <div className="flex-grow md:ml-[280px] pt-0 transition-all duration-300 min-h-screen">
                  <Header />
                  <main className="pb-20 md:pb-0">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/admin/*" element={<Admin />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:userId" element={<Profile />} />
                      <Route path="/settings/*" element={<Settings />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/photos" element={<Photos />} />
                      <Route path="/videos" element={<Videos />} />
                      <Route path="/people" element={<People />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/basket" element={<Basket />} />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/watch/:videoId" element={<Watch />} />
                      <Route path="/watch" element={<Navigate to="/videos" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </div>
            </div>
            <Toaster />
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
