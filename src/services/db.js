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

// Helper to normalize any media item type (wallpaper, image, video, gif) to a standardized db schema
const normalizeMediaItem = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    type: item.type || 'wallpaper',
    imageUrl: item.preview_url || item.src?.large2x || item.src?.original || item.gif_url || '',
    src: item.src || { 
      original: item.downloadUrl || item.video_url || item.gif_url || '',
      large2x: item.preview_url || item.gif_url || '',
      large: item.preview_url || item.gif_url || '',
      medium: item.preview_url || item.gif_url || '',
      small: item.preview_url || item.gif_url || ''
    },
    photographer: item.photographer || item.author || 'Artist',
    photographerUrl: item.photographer_url || item.photographerUrl || item.authorUrl || 'https://aurora.com',
    avgColor: item.avg_color || item.avgColor || '#15151a',
    width: item.width || 1280,
    height: item.height || 720,
    category: item.category || 'General',
    title: item.title || 'Visual Artwork'
  };
};

export const addFavorite = async (userId, mediaItem) => {
  const normalized = normalizeMediaItem(mediaItem);
  if (!normalized) return false;

  const favData = {
    userId,
    wallpaperId: normalized.id, // maintain compatibility with existing profile grids
    type: normalized.type,
    imageUrl: normalized.imageUrl,
    src: normalized.src,
    photographer: normalized.photographer,
    photographerUrl: normalized.photographerUrl,
    avgColor: normalized.avgColor,
    width: normalized.width,
    height: normalized.height,
    category: normalized.category,
    title: normalized.title,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const favId = `${userId}_${normalized.id}`;
      await setDoc(doc(db, 'favorites', favId), favData);
      return true;
    } catch (error) {
      console.error("Aurora DB: Error adding favorite:", error);
      throw error;
    }
  } else {
    // Mock Favorite Save
    const favorites = JSON.parse(localStorage.getItem('aurora-mock-favorites') || '[]');
    const exists = favorites.some(f => f.userId === userId && f.wallpaperId === normalized.id);
    if (!exists) {
      favorites.push(favData);
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

export const addDownload = async (userId, mediaItem) => {
  const normalized = normalizeMediaItem(mediaItem);
  if (!normalized) return false;

  const downloadData = {
    userId: userId || 'anonymous',
    wallpaperId: normalized.id,
    type: normalized.type,
    imageUrl: normalized.imageUrl,
    src: normalized.src,
    photographer: normalized.photographer,
    photographerUrl: normalized.photographerUrl,
    avgColor: normalized.avgColor,
    width: normalized.width,
    height: normalized.height,
    category: normalized.category,
    title: normalized.title,
    downloadDate: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const downloadId = `${userId || 'anon'}_${normalized.id}_${Date.now()}`;
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
