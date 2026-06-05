import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

// ---------------------
// Favorites Management
// ---------------------

export const addFavorite = async (userId, wallpaper) => {
  if (isFirebaseConfigured && db) {
    try {
      const favId = `${userId}_${wallpaper.id}`;
      await setDoc(doc(db, 'favorites', favId), {
        userId,
        wallpaperId: wallpaper.id,
        imageUrl: wallpaper.src.large2x || wallpaper.src.original,
        src: wallpaper.src,
        photographer: wallpaper.photographer,
        photographerUrl: wallpaper.photographer_url,
        avgColor: wallpaper.avg_color,
        width: wallpaper.width,
        height: wallpaper.height,
        category: wallpaper.category || 'General',
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Aurora DB: Error adding favorite:", error);
      throw error;
    }
  } else {
    // Mock Favorite Save
    const favorites = JSON.parse(localStorage.getItem('aurora-mock-favorites') || '[]');
    const exists = favorites.some(f => f.userId === userId && f.wallpaperId === wallpaper.id);
    if (!exists) {
      favorites.push({
        userId,
        wallpaperId: wallpaper.id,
        imageUrl: wallpaper.src.large2x || wallpaper.src.original,
        src: wallpaper.src,
        photographer: wallpaper.photographer,
        photographerUrl: wallpaper.photographer_url,
        avgColor: wallpaper.avg_color,
        width: wallpaper.width,
        height: wallpaper.height,
        category: wallpaper.category || 'General',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('aurora-mock-favorites', JSON.stringify(favorites));
    }
    return true;
  }
};

export const removeFavorite = async (userId, wallpaperId) => {
  if (isFirebaseConfigured && db) {
    try {
      const favId = `${userId}_${wallpaperId}`;
      await deleteDoc(doc(db, 'favorites', favId));
      return true;
    } catch (error) {
      console.error("Aurora DB: Error removing favorite:", error);
      throw error;
    }
  } else {
    // Mock Favorite Delete
    let favorites = JSON.parse(localStorage.getItem('aurora-mock-favorites') || '[]');
    favorites = favorites.filter(f => !(f.userId === userId && f.wallpaperId === wallpaperId));
    localStorage.setItem('aurora-mock-favorites', JSON.stringify(favorites));
    return true;
  }
};

export const getUserFavorites = async (userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const favsRef = collection(db, 'favorites');
      const q = query(favsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const favs = [];
      querySnapshot.forEach((doc) => {
        favs.push(doc.data());
      });
      return favs;
    } catch (error) {
      console.error("Aurora DB: Error getting user favorites (retrying unordered):", error);
      try {
        // Fallback query if Firestore index hasn't built yet
        const favsRef = collection(db, 'favorites');
        const q = query(favsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const favs = [];
        querySnapshot.forEach((doc) => {
          favs.push(doc.data());
        });
        return favs;
      } catch (err) {
        return [];
      }
    }
  } else {
    const favorites = JSON.parse(localStorage.getItem('aurora-mock-favorites') || '[]');
    return favorites
      .filter(f => f.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

// ---------------------
// Downloads History
// ---------------------

export const addDownload = async (userId, wallpaper) => {
  const downloadData = {
    userId: userId || 'anonymous',
    wallpaperId: wallpaper.id,
    imageUrl: wallpaper.src.large2x || wallpaper.src.original,
    src: wallpaper.src,
    photographer: wallpaper.photographer,
    photographerUrl: wallpaper.photographer_url,
    avgColor: wallpaper.avg_color,
    width: wallpaper.width,
    height: wallpaper.height,
    downloadDate: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const downloadId = `${userId || 'anon'}_${wallpaper.id}_${Date.now()}`;
      await setDoc(doc(db, 'downloads', downloadId), downloadData);
      return true;
    } catch (error) {
      console.error("Aurora DB: Error logging download record:", error);
      return false;
    }
  } else {
    // Mock Download Logging
    const downloads = JSON.parse(localStorage.getItem('aurora-mock-downloads') || '[]');
    downloads.push(downloadData);
    localStorage.setItem('aurora-mock-downloads', JSON.stringify(downloads));
    return true;
  }
};

export const getUserDownloads = async (userId) => {
  if (!userId) return [];
  if (isFirebaseConfigured && db) {
    try {
      const downloadsRef = collection(db, 'downloads');
      const q = query(downloadsRef, where('userId', '==', userId), orderBy('downloadDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const downloads = [];
      querySnapshot.forEach((doc) => {
        downloads.push(doc.data());
      });
      return downloads;
    } catch (error) {
      console.error("Aurora DB: Error getting user downloads (retrying unordered):", error);
      try {
        const downloadsRef = collection(db, 'downloads');
        const q = query(downloadsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const downloads = [];
        querySnapshot.forEach((doc) => {
          downloads.push(doc.data());
        });
        return downloads;
      } catch (err) {
        return [];
      }
    }
  } else {
    const downloads = JSON.parse(localStorage.getItem('aurora-mock-downloads') || '[]');
    return downloads
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.downloadDate) - new Date(a.downloadDate));
  }
};

// ---------------------
// Profile Management
// ---------------------

export const updateUserProfile = async (userId, name, photoURL) => {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { name, photoURL });
      return true;
    } catch (error) {
      console.error("Aurora DB: Error updating profile:", error);
      throw error;
    }
  } else {
    // Mock Update Profile
    const mockUsers = JSON.parse(localStorage.getItem('aurora-mock-users') || '[]');
    const userIndex = mockUsers.findIndex(u => u.uid === userId);
    
    if (userIndex > -1) {
      mockUsers[userIndex].displayName = name;
      mockUsers[userIndex].photoURL = photoURL;
      localStorage.setItem('aurora-mock-users', JSON.stringify(mockUsers));
      
      const currentUser = JSON.parse(localStorage.getItem('aurora-mock-user') || '{}');
      if (currentUser.uid === userId) {
        currentUser.displayName = name;
        currentUser.photoURL = photoURL;
        localStorage.setItem('aurora-mock-user', JSON.stringify(currentUser));
      }
    }
    return true;
  }
};

// ---------------------
// Admin Analytics
// ---------------------

export const getAdminStats = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const favsSnap = await getDocs(collection(db, 'favorites'));
      const downloadsSnap = await getDocs(collection(db, 'downloads'));
      
      return {
        totalUsers: usersSnap.size,
        totalFavorites: favsSnap.size,
        totalDownloads: downloadsSnap.size,
        users: usersSnap.docs.map(d => d.data()),
        recentDownloads: downloadsSnap.docs.slice(0, 10).map(d => d.data())
      };
    } catch (error) {
      console.error("Aurora DB: Error loading admin metrics:", error);
      return {
        totalUsers: 0,
        totalFavorites: 0,
        totalDownloads: 0,
        users: [],
        recentDownloads: []
      };
    }
  } else {
    // Mock Statistics
    const mockUsers = JSON.parse(localStorage.getItem('aurora-mock-users') || '[]');
    const favorites = JSON.parse(localStorage.getItem('aurora-mock-favorites') || '[]');
    const downloads = JSON.parse(localStorage.getItem('aurora-mock-downloads') || '[]');
    
    return {
      totalUsers: Math.max(mockUsers.length, 3),
      totalFavorites: favorites.length,
      totalDownloads: downloads.length,
      users: mockUsers.length ? mockUsers : [
        { uid: 'seed1', name: 'Aria Bennett', email: 'aria@aurora.com', role: 'user', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { uid: 'seed2', name: 'Marcus Vance', email: 'marcus@gmail.com', role: 'user', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
        { uid: 'mock_admin', name: 'System Admin', email: 'admin@aurora.com', role: 'admin', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() }
      ],
      recentDownloads: downloads.slice(0, 10)
    };
  }
};
