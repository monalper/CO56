import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import UserProfiles from './pages/UserProfiles';
import Settings from './pages/Settings';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import Layout from './components/Layout';

import { TermsPage, PrivacyPage, CookiesPage, AccessibilityPage, AdsInfoPage } from './pages/StaticPages';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/admin/dash"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<UserProfiles />} />
        <Route path="/:username" element={<UserProfiles />} />
        <Route path="/:username/status/:postId" element={<PostDetailPage />} />
        <Route path="/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/edit/:postId" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/ads-info" element={<AdsInfoPage />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

