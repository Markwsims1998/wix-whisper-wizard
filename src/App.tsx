
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Photos from './pages/Photos';
import Photo from './pages/Photo';
import Video from './pages/Video';
import Videos from './pages/Videos';
import Posts from './pages/Posts';
import Post from './pages/Post';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import People from './pages/People';
import Shop from './pages/Shop';
import ProfileCompletion from './pages/ProfileCompletion';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile-completion" element={<ProfileCompletion />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/photo" element={<Photo />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/video" element={<Video />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/post" element={<Post />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/people" element={<People />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
