
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Messages from './pages/Messages';
import Activity from './pages/Activity';
import Notifications from './pages/Notifications';
import People from './pages/People';
import Videos from './pages/Videos';
import Watch from './pages/Watch';
import Photos from './pages/Photos';
import Shop from './pages/Shop';
import Basket from './pages/Basket';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import Feedback from './pages/Feedback';
import { Toaster } from "@/components/ui/toaster"
import Profile from './pages/profile';
import { AuthProvider } from './contexts/auth/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/people" element={<People />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
