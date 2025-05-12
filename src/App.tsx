
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Index from "@/pages/Index";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import People from "@/pages/People";
import Photos from "@/pages/Photos";
import Settings from "@/pages/Settings";
import Videos from "@/pages/Videos";
import Watch from "@/pages/Watch";
import Shop from "@/pages/Shop";
import Basket from "@/pages/Basket";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import Comments from "@/pages/Comments";
import Notifications from "@/pages/Notifications";
import Activity from "@/pages/Activity";
import Winks from "@/pages/Winks";
import Feedback from "@/pages/Feedback";
import Friends from "@/pages/Friends";

import "@/App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/people" element={<People />} />
                <Route path="/photos" element={<Photos />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/watch" element={<Watch />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/basket" element={<Basket />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/comments/:postId" element={<Comments />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/winks" element={<Winks />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
