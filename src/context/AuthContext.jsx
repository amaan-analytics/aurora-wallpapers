import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is an Admin
  const checkAdminRole = async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    
    // Developer bypass: email contains admin@aurora.com or admin@gmail.com
    if (currentUser.email === 'admin@aurora.com' || currentUser.email === 'admin@gmail.com') {
      setIsAdmin(true);
      return;
    }
    
    if (isFirebaseConfigured && db) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching user admin status:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        await checkAdminRole(currentUser);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Authentication from LocalStorage for easy out-of-the-box local testing
      const savedUser = localStorage.getItem('aurora-mock-user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        checkAdminRole(parsedUser);
      }
      setLoading(false);
    }
  }, []);

  // Email-based Sign Up
  const signup = async (email, password, displayName) => {
    if (isFirebaseConfigured && auth) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (db) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          name: displayName || email.split('@')[0],
          email: email,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${result.user.uid}`,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
      return result.user;
    } else {
      const mockUser = {
        uid: `mock_${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
      };
      
      const mockUsers = JSON.parse(localStorage.getItem('aurora-mock-users') || '[]');
      mockUsers.push({ 
        ...mockUser, 
        role: email === 'admin@aurora.com' ? 'admin' : 'user', 
        createdAt: new Date().toISOString() 
      });
      localStorage.setItem('aurora-mock-users', JSON.stringify(mockUsers));
      
      setUser(mockUser);
      localStorage.setItem('aurora-mock-user', JSON.stringify(mockUser));
      await checkAdminRole(mockUser);
      return mockUser;
    }
  };

  // Email-based Sign In
  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } else {
      const mockUsers = JSON.parse(localStorage.getItem('aurora-mock-users') || '[]');
      const matchedUser = mockUsers.find(u => u.email === email);
      
      if (matchedUser) {
        setUser(matchedUser);
        localStorage.setItem('aurora-mock-user', JSON.stringify(matchedUser));
        await checkAdminRole(matchedUser);
        return matchedUser;
      } else {
        // Standard mockup credentials creation (easy to try)
        const mockUser = {
          uid: email === 'admin@aurora.com' ? 'mock_admin' : `mock_${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
          role: email === 'admin@aurora.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };
        mockUsers.push(mockUser);
        localStorage.setItem('aurora-mock-users', JSON.stringify(mockUsers));
        setUser(mockUser);
        localStorage.setItem('aurora-mock-user', JSON.stringify(mockUser));
        await checkAdminRole(mockUser);
        return mockUser;
      }
    }
  };

  // Google OAuth popup
  const googleLogin = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      if (db) {
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: result.user.uid,
            name: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            role: 'user',
            createdAt: new Date().toISOString()
          });
        }
      }
      return result.user;
    } else {
      const mockUser = {
        uid: 'mock_google_user',
        email: 'googleuser@gmail.com',
        displayName: 'Google User',
        photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=google'
      };
      setUser(mockUser);
      localStorage.setItem('aurora-mock-user', JSON.stringify(mockUser));
      await checkAdminRole(mockUser);
      return mockUser;
    }
  };

  // Password reset email
  const resetPassword = async (email) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`Mock reset password email request: sent to ${email}`);
    }
  };

  // Log Out
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem('aurora-mock-user');
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, googleLogin, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
