import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { AudioProvider } from './context/AudioContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Signup = React.lazy(() => import('./pages/auth/Signup'));
const Home = React.lazy(() => import('./pages/home/Home'));
const Search = React.lazy(() => import('./pages/search/Search'));
const Library = React.lazy(() => import('./pages/library/Library'));
const Podcasts = React.lazy(() => import('./pages/podcasts/Podcasts'));
const PodcastDetail = React.lazy(() => import('./pages/podcasts/PodcastDetail'));

const PlaylistDetail = React.lazy(() => import('./pages/playlist/PlaylistDetail'));
const AdminUpload = React.lazy(() => import('./pages/admin/AdminUpload'));
const ShaderDemo = React.lazy(() => import('./pages/demo/ShaderDemo'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;

  return (
    <AudioProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            <Route path="/search" element={user ? <Search /> : <Navigate to="/login" />} />
            <Route path="/library" element={user ? <Library /> : <Navigate to="/login" />} />
            <Route path="/podcasts" element={user ? <Podcasts /> : <Navigate to="/login" />} />
            <Route path="/podcast/:id" element={user ? <PodcastDetail /> : <Navigate to="/login" />} />
            <Route path="/playlist/:id" element={user ? <PlaylistDetail /> : <Navigate to="/login" />} />
            <Route path="/admin/upload" element={user ? <AdminUpload /> : <Navigate to="/login" />} />
            <Route path="/shader-demo" element={<ShaderDemo />} />
          </Routes>
        </Suspense>
      </Router>
    </AudioProvider>
  );
}

export default App;

