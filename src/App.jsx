import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
import { Wallpapers } from './pages/Wallpapers';
import { Images } from './pages/Images';
import { Videos } from './pages/Videos';
import { GIFs } from './pages/GIFs';
import { Explore } from './pages/Explore';
import { Detail } from './pages/Detail';
import { VideoDetail } from './pages/VideoDetail';
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

            {/* Main Content */}
            <main className="flex-grow">
              <Routes>

                {/* Home */}
                <Route path="/" element={<Home />} />
                <Route path="/wallpapers" element={<Wallpapers />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/gifs" element={<GIFs />} />
                <Route path="/explore" element={<Explore />} />

                {/* SEO Category Pages */}
                <Route path="/gaming-wallpapers" element={<Wallpapers />} />
                <Route path="/minimalist-wallpapers" element={<Wallpapers />} />
                <Route path="/abstract-wallpapers" element={<Wallpapers />} />
                <Route path="/anime-wallpapers" element={<Wallpapers />} />
                <Route path="/nature-wallpapers" element={<Wallpapers />} />
                <Route path="/cars-wallpapers" element={<Wallpapers />} />
                <Route path="/cyberpunk-wallpapers" element={<Wallpapers />} />
                <Route path="/space-wallpapers" element={<Wallpapers />} />
                <Route path="/technology-wallpapers" element={<Wallpapers />} />
                <Route path="/architecture-wallpapers" element={<Wallpapers />} />
                <Route path="/mountains-wallpapers" element={<Wallpapers />} />
                <Route path="/ocean-wallpapers" element={<Wallpapers />} />
                <Route path="/ai-art-wallpapers" element={<Wallpapers />} />

                {/* Wallpaper Detail */}
                <Route path="/wallpaper/:id" element={<Detail />} />
                
                {/* Video Detail */}
                <Route path="/video/:id" element={<VideoDetail />} />

                {/* Auth Pages */}
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

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Home />} />

              </Routes>
            </main>

            {/* Mobile Navigation */}
            <MobileBottomNav />

            {/* Footer */}
            <footer className="w-full border-t border-border-theme/30 bg-card-theme/10 pt-10 pb-28 md:pb-10 text-center transition-all duration-300">
              <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-3 group/footer">

                <div className="flex items-center justify-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-300">
                  <span>Built with</span>
                  <span className="text-red-500 animate-pulse inline-block mx-0.5 select-none text-base">
                    ❤️
                  </span>
                  <span>by</span>
                  <span className="font-bold bg-gradient-to-r from-accent-theme via-[#a890ff] to-[#dfd5ff] bg-clip-text text-transparent transition-all duration-300 group-hover/footer:drop-shadow-[0_0_12px_rgba(124,92,255,0.6)]">
                    Amaan Ul Haq
                  </span>
                </div>

                <div className="text-xs text-text-secondary/80 font-normal">
                  Aurora &copy; 2026
                </div>

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