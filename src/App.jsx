import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Pages
import { Home } from './pages/Home';
import { Detail } from './pages/Detail';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background-theme text-text-primary transition-colors duration-300">
            {/* Navigation Header */}
            <Navbar />

            {/* Main Content Workspace */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/wallpaper/:id" element={<Detail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Only Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  } 
                />
                
                {/* Fallback to Home */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-border-theme/40 bg-card-theme/30 py-8 text-center text-xs text-text-secondary">
              <div className="max-w-7xl mx-auto px-4 space-y-3">
                <div className="flex justify-center items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-accent-theme to-[#a890ff] flex items-center justify-center text-white">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="font-extrabold text-sm text-text-primary tracking-tight">Aurora</span>
                </div>
                <p>
                  &copy; {new Date().getFullYear()} Aurora Wallpapers. All rights reserved. 
                  Images sourced via Pexels API.
                </p>
                <p className="flex items-center justify-center gap-1 text-[10px]">
                  Crafted with <Heart className="w-3 h-3 text-rose-500 fill-current" /> as a premium Progressive Web App.
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
