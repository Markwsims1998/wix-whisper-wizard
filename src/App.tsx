
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "./components/ui/toaster";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Messages from "./pages/Messages";
import Activity from "./pages/Activity";
import Comments from "./pages/Comments";
import Settings from "./pages/Settings";
import Videos from "./pages/Videos";
import Photos from "./pages/Photos";
import People from "./pages/People";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";
import Watch from "./pages/Watch";
import Basket from "./pages/Basket";
import Notifications from "./pages/Notifications";
import Feedback from "./pages/Feedback";
import Banner from "./components/Banner";

function App() {
  return (
    <ThemeProvider>
      <Banner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/people" element={<People />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
