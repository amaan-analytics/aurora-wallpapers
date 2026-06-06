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
import { MobileBottomNav } from './components/MobileBottomNav';

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

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />

            {/* Footer */}
            <footer className="w-full border-t border-border-theme/30 bg-card-theme/10 pt-10 pb-28 md:pb-10 text-center transition-all duration-300">
              <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-3 group/footer">
                
                {/* Creator line */}
                <div className="flex items-center justify-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-300">
                  <span>Built with</span>
                  <span className="text-red-500 animate-pulse inline-block mx-0.5 select-none text-base">❤️</span>
                  <span>by</span>
                  <span className="font-bold bg-gradient-to-r from-accent-theme via-[#a890ff] to-[#dfd5ff] bg-clip-text text-transparent transition-all duration-300 group-hover/footer:drop-shadow-[0_0_12px_rgba(124,92,255,0.6)]">
                    Amaan Ul Haq
                  </span>
                </div>

                {/* Copyright line */}
                <div className="text-xs text-text-secondary/80 font-normal">
                  Aurora Wallpapers &copy; 2026
                </div>

                {/* Subtle Neon Underline bar */}
                <div className="w-10 h-0.5 bg-gradient-to-r from-accent-theme to-[#a890ff] rounded-full scale-x-75 opacity-20 group-hover/footer:scale-x-150 group-hover/footer:opacity-100 group-hover/footer:shadow-[0_0_10px_rgba(124,92,255,0.8)] transition-all duration-500" />
                
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
