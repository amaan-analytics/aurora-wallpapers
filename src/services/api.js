// Aurora Discovery Platform API Connector
// Integrates Unsplash, Pixabay Video, Giphy, and Pexels APIs with stable mock fallbacks

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

// Mock mode flags
const isPexelsMock = !PEXELS_API_KEY || PEXELS_API_KEY.includes('placeholder') || PEXELS_API_KEY === '';
const isUnsplashMock = !UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY.includes('placeholder') || UNSPLASH_ACCESS_KEY === '';
const isPixabayMock = !PIXABAY_API_KEY || PIXABAY_API_KEY.includes('placeholder') || PIXABAY_API_KEY === '';
const isGiphyMock = !GIPHY_API_KEY || GIPHY_API_KEY.includes('placeholder') || GIPHY_API_KEY === '';

// In-memory cache for shuffled mock results to ensure pagination stability
const mockSessionCache = {};

// Helper to shuffle list
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// NSFW Blocklist for robust content safety
const NSFW_BLOCKLIST = [
  'adult', 'nude', 'nsfw', 'sexual', 'lingerie', 'bikini', 'explicit', 
  'porn', 'erotic', 'sexy', 'boobs', 'naked', 'girl', 'woman', 'model', 
  'sensual', 'butt', 'ass', 'thong', 'panties', 'underwear', 'swimsuit', 
  'cleavage', 'breast', 'hot', 'babe', 'seductive', 'glamour', 'boudoir',
  'lady', 'female', 'male', 'man', 'guy', 'people', 'human', 'couple',
  'romance', 'relationship', 'hug', 'kiss', 'legs', 'waist', 'lips',
  'dance', 'dancing', 'fitness', 'workout', 'strip', 'show', 'exotic',
  'bed', 'bedroom', 'shower', 'bath', 'towel', 'swimwear', 'bra',
  'beauty', 'makeup', 'glam', 'boob', 'tits', 'breastfeeding', 'nackt',
  'sensuelle', 'madchen', 'frauen', 'femme', 'chica', 'chicas', 'hottie',
  'flesh', 'penis', 'vagina', 'vulva'
];

const isSafeContent = (text) => {
  if (!text) return true;
  // Split into clean alphanumeric words to prevent false positive matching on substrings (like "germany" matching "man")
  const words = text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
  return !words.some(word => NSFW_BLOCKLIST.includes(word));
};

const isSafePhotographer = (name) => {
  if (!name) return true;
  const words = name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
  const STRICT_NSFW = ['adult', 'nude', 'nsfw', 'sexual', 'porn', 'erotic', 'sexy', 'naked', 'boobs', 'butt', 'ass', 'sex'];
  return !words.some(word => STRICT_NSFW.includes(word));
};

// ----------------------------------------------------
// 1. IMAGES (Unsplash + Pexels)
// ----------------------------------------------------

let imagesPageOffset = null;

export const resetImagesPageOffset = () => {
  imagesPageOffset = Math.floor(Math.random() * 10);
};

const getImagesPageOffset = () => {
  if (imagesPageOffset === null) {
    imagesPageOffset = Math.floor(Math.random() * 10);
  }
  return imagesPageOffset;
};

export const getImages = async (queryText = '', page = 1, perPage = 16) => {
  if (isPixabayMock) {
    // Return high quality mock images from Pixabay mock
    const cacheKey = `images_${queryText.toLowerCase() || 'curated'}`;
    if (page === 1) delete mockSessionCache[cacheKey];

    let list = [];
    if (mockSessionCache[cacheKey]) {
      list = mockSessionCache[cacheKey];
    } else {
      list = MOCK_IMAGES_LIST.filter(img => 
        !queryText || 
        img.title.toLowerCase().includes(queryText.toLowerCase()) || 
        img.category.toLowerCase().includes(queryText.toLowerCase())
      );
      if (list.length === 0) list = MOCK_IMAGES_LIST;
      list = shuffleArray(list).map(item => ({
        ...item,
        id: item.id + Math.floor(Math.random() * 10000)
      }));
      mockSessionCache[cacheKey] = list;
    }

    const startIndex = (page - 1) * perPage;
    
    // Seed extra mock items for infinite scroll simulation if we hit end
    if (startIndex >= list.length && list.length > 0) {
      const neededLoops = Math.ceil((startIndex + perPage) / list.length);
      let expandedList = [];
      for(let i = 0; i < neededLoops; i++) {
        expandedList.push(...list.map(item => ({...item, id: item.id + "_" + i})));
      }
      list = expandedList;
    }

    const paginated = list.slice(startIndex, startIndex + perPage);

    return {
      items: paginated,
      page,
      per_page: perPage,
      total_results: list.length * 10, // Simulated total
      next_page: page + 1
    };
  }

  // Real Mode - fetch from Pixabay
  try {
    let targetPage = page;
    let extraParams = '';
    if (!queryText) {
      extraParams = '&editors_choice=true';
      targetPage = page + getImagesPageOffset();
    }
    const pixabayUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(queryText)}&page=${targetPage}&per_page=${perPage}&image_type=photo&safesearch=true${extraParams}`;
    
    const res = await fetch(pixabayUrl);
    if (!res.ok) throw new Error("Pixabay API Error");
    
    const data = await res.json();
    const items = (data.hits || [])
      .filter(item => isSafeContent(item.tags) && isSafeContent(item.user))
      .map(item => ({
        id: `pixabay_img_${item.id}`,
        type: 'image',
        width: item.imageWidth,
        height: item.imageHeight,
        avg_color: '#15151a',
        photographer: item.user || 'Pixabay Creator',
        photographer_url: `https://pixabay.com/users/${item.user}-${item.user_id}/`,
        src: {
          original: item.largeImageURL,
          large2x: item.largeImageURL,
          large: item.webformatURL,
          medium: item.webformatURL,
          small: item.previewURL,
          thumbnail: item.previewURL
        },
        title: item.tags || 'Creative Image',
        downloadUrl: item.largeImageURL
      }));

    return {
      items,
      page,
      per_page: perPage,
      total_results: data.totalHits || items.length * 5,
      next_page: items.length >= perPage ? page + 1 : null
    };
  } catch (error) {
    console.error("Discovery API Error getting images:", error);
    return { items: [], page, per_page: perPage, total_results: 0, next_page: null };
  }
};

// ----------------------------------------------------
// 2. VIDEOS (Pexels Video + Pixabay Video)
// ----------------------------------------------------

export const getVideos = async (queryText = '', page = 1, perPage = 16) => {
  if (isPixabayMock && isPexelsMock) {
    const cacheKey = `videos_${queryText.toLowerCase() || 'curated'}`;
    if (page === 1) delete mockSessionCache[cacheKey];

    let list = [];
    if (mockSessionCache[cacheKey]) {
      list = mockSessionCache[cacheKey];
    } else {
      list = MOCK_VIDEOS_LIST.filter(vid => 
        !queryText || 
        vid.title.toLowerCase().includes(queryText.toLowerCase()) || 
        vid.category.toLowerCase().includes(queryText.toLowerCase())
      );
      if (list.length === 0) list = MOCK_VIDEOS_LIST;
      list = shuffleArray(list).map(item => ({
        ...item,
        id: item.id + Math.floor(Math.random() * 10000)
      }));
      mockSessionCache[cacheKey] = list;
    }

    const startIndex = (page - 1) * perPage;
    
    // Seed extra mock items for infinite scroll simulation
    if (startIndex >= list.length && list.length > 0) {
      const neededLoops = Math.ceil((startIndex + perPage) / list.length);
      let expandedList = [];
      for(let i = 0; i < neededLoops; i++) {
        expandedList.push(...list.map(item => ({...item, id: item.id + "_" + i})));
      }
      list = expandedList;
    }

    const paginated = list.slice(startIndex, startIndex + perPage);

    return {
      items: paginated,
      page,
      per_page: perPage,
      total_results: list.length * 10,
      next_page: page + 1
    };
  }

  // Real Mode
  try {
    const promises = [];

    // Pexels Video call
    if (!isPexelsMock) {
      const pexelsUrl = queryText
        ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(queryText)}&page=${page}&per_page=${Math.ceil(perPage / 2)}`
        : `https://api.pexels.com/videos/popular?page=${page}&per_page=${Math.ceil(perPage / 2)}`;
      
      promises.push(
        fetch(pexelsUrl, { headers: { Authorization: PEXELS_API_KEY } })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!data || !data.videos) return [];
            return data.videos
              .filter(item => isSafeContent(item.url) && isSafePhotographer(item.user?.name))
              .map(item => {
              // Find best MP4 video quality link
              const hdFile = item.video_files?.find(f => f.quality === 'hd' && f.file_type === 'video/mp4') || 
                            item.video_files?.find(f => f.file_type === 'video/mp4') ||
                            item.video_files?.[0];
              return {
                id: `pexels_video_${item.id}`,
                type: 'video',
                width: item.width || 1280,
                height: item.height || 720,
                avg_color: '#15151a',
                preview_url: item.image || item.video_pictures?.[0]?.link || item.video_pictures?.[0]?.picture || '',
                video_url: hdFile?.link || '',
                photographer: item.user?.name || 'Pexels Videographer',
                photographer_url: item.user?.url || 'https://pexels.com',
                title: `Video by ${item.user?.name || 'Creator'}`
              };
            });
          })
          .catch(() => [])
      );
    }

    // Pixabay Video call
    if (!isPixabayMock) {
      const pixabayUrl = queryText
        ? `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(queryText)}&page=${page}&per_page=${Math.ceil(perPage / 2)}&safesearch=true`
        : `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&page=${page}&per_page=${Math.ceil(perPage / 2)}&safesearch=true`;
      
      promises.push(
        fetch(pixabayUrl)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!data || !data.hits) return [];
            return data.hits
              .filter(item => isSafeContent(item.tags) && isSafePhotographer(item.user))
              .map(item => {
              // Map videos
              const videos = item.videos || {};
              const bestVideo = videos.medium || videos.small || videos.large || videos.tiny;
              
              // Generate cover image
              let preview = '';
              if (item.picture_id) {
                preview = `https://i.vimeocdn.com/video/${item.picture_id}_640x360.jpg`;
              } else if (item.thumbnail) {
                preview = item.thumbnail;
              } else if (item.videos?.tiny?.thumbnail) {
                preview = item.videos.tiny.thumbnail;
              }

              return {
                id: `pixabay_video_${item.id}`,
                type: 'video',
                width: bestVideo?.width || 1280,
                height: bestVideo?.height || 720,
                avg_color: '#15151a',
                preview_url: preview,
                video_url: bestVideo?.url || '',
                photographer: item.user || 'Pixabay Creator',
                photographer_url: `https://pixabay.com/users/${item.user}-${item.user_id}/`,
                title: item.tags || 'Creative Footage'
              };
            });
          })
          .catch(() => [])
      );
    }

    const results = await Promise.all(promises);
    const combined = [];
    const maxLen = Math.max(results[0]?.length || 0, results[1]?.length || 0);

    for (let i = 0; i < maxLen; i++) {
      if (results[0] && results[0][i]) combined.push(results[0][i]);
      if (results[1] && results[1][i]) combined.push(results[1][i]);
    }

    return {
      items: combined,
      page,
      per_page: perPage,
      total_results: combined.length * 5,
      next_page: combined.length >= Math.floor(perPage / 2) ? page + 1 : null
    };
  } catch (error) {
    console.error("Discovery API Error getting videos:", error);
    return { items: [], page, per_page: perPage, total_results: 0, next_page: null };
  }
};

// ----------------------------------------------------
// 3. GIFs (Giphy API)
// ----------------------------------------------------

export const getGIFs = async (queryText = '', category = 'Trending', page = 1, perPage = 16) => {
  if (isGiphyMock) {
    const cacheKey = `gifs_${category.toLowerCase()}_${queryText.toLowerCase() || 'default'}`;
    if (page === 1) delete mockSessionCache[cacheKey];

    let list = [];
    if (mockSessionCache[cacheKey]) {
      list = mockSessionCache[cacheKey];
    } else {
      const filterTag = queryText || (category === 'Trending' ? '' : category);
      list = MOCK_GIFS_LIST.filter(gif => 
        !filterTag || 
        gif.title.toLowerCase().includes(filterTag.toLowerCase()) ||
        gif.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
      );
      if (list.length === 0) list = MOCK_GIFS_LIST;
      list = shuffleArray(list).map(item => ({
        ...item,
        id: item.id + Math.floor(Math.random() * 10000)
      }));
      mockSessionCache[cacheKey] = list;
    }

    const startIndex = (page - 1) * perPage;
    
    // Seed extra mock items for infinite scroll simulation
    if (startIndex >= list.length && list.length > 0) {
      const neededLoops = Math.ceil((startIndex + perPage) / list.length);
      let expandedList = [];
      for(let i = 0; i < neededLoops; i++) {
        expandedList.push(...list.map(item => ({...item, id: item.id + "_" + i})));
      }
      list = expandedList;
    }

    const paginated = list.slice(startIndex, startIndex + perPage);

    return {
      items: paginated,
      page,
      per_page: perPage,
      total_results: list.length * 10,
      next_page: page + 1
    };
  }

  // Real Mode
  try {
    const offset = (page - 1) * perPage;
    // Map keywords for category selections if no custom search is requested
    const targetQuery = queryText || (category === 'Trending' ? '' : category);
    
    const giphyUrl = targetQuery
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(targetQuery)}&limit=${perPage}&offset=${offset}&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${perPage}&offset=${offset}&rating=g`;

    const res = await fetch(giphyUrl);
    if (!res.ok) throw new Error("Giphy API Error");
    
    const data = await res.json();
    const items = (data.data || []).map(item => ({
      id: `giphy_${item.id}`,
      type: 'gif',
      width: parseInt(item.images?.original?.width || '400'),
      height: parseInt(item.images?.original?.height || '300'),
      avg_color: '#120c1f',
      preview_url: item.images?.fixed_width?.url || item.images?.original?.url,
      gif_url: item.images?.original?.url,
      photographer: item.username || item.user?.display_name || 'Giphy Creator',
      photographer_url: item.url || 'https://giphy.com',
      title: item.title || 'Animated GIF'
    }));

    return {
      items,
      page,
      per_page: perPage,
      total_results: data.pagination?.total_count || items.length * 5,
      next_page: offset + perPage < (data.pagination?.total_count || 500) ? page + 1 : null
    };
  } catch (error) {
    console.error("Discovery API Error getting gifs:", error);
    return { items: [], page, per_page: perPage, total_results: 0, next_page: null };
  }
};

// ----------------------------------------------------
// 4. EXPLORE (Trending Aggregated Blends)
// ----------------------------------------------------

export const getExploreContent = async (queryText = '', page = 1, perPage = 16) => {
  // Queries Wallpapers (Pexels), Images (Pexels/Unsplash), Videos, and GIFs together and shuffles
  try {
    const limitPerSource = Math.max(4, Math.ceil(perPage / 4));
    
    const promises = [
      // 1. Wallpapers (Pexels)
      import('./pexels').then(m => m.searchWallpapers(queryText, page, limitPerSource, '', true)).then(res => 
        (res.photos || []).map(img => ({ ...img, type: 'wallpaper', category: img.category || 'Wallpapers' }))
      ),
      // 2. Images (Pixabay)
      getImages(queryText, page, limitPerSource).then(res => 
        res.items.map(img => ({ ...img, type: 'image' }))
      ),
      // 3. Videos
      getVideos(queryText, page, limitPerSource).then(res => res.items),
      // 4. GIFs
      getGIFs(queryText, 'Trending', page, limitPerSource).then(res => res.items)
    ];

    const results = await Promise.all(promises);
    
    // Merge/Interleave them
    const combined = [];
    const maxLen = Math.max(...results.map(r => r.length));
    
    for (let i = 0; i < maxLen; i++) {
      if (results[0][i]) combined.push(results[0][i]);
      if (results[1][i]) combined.push(results[1][i]);
      if (results[2][i]) combined.push(results[2][i]);
      if (results[3][i]) combined.push(results[3][i]);
    }

    // Shuffle the page results slightly for visual delight, but stably within the page
    const finalItems = page === 1 ? shuffleArray(combined) : combined;

    return {
      items: finalItems,
      page,
      per_page: perPage,
      total_results: finalItems.length * 5,
      next_page: finalItems.length >= 8 ? page + 1 : null
    };
  } catch (error) {
    console.error("Discovery API Error in Explore:", error);
    return { items: [], page, per_page: perPage, total_results: 0, next_page: null };
  }
};

export const getImageById = async (id) => {
  if (isPixabayMock || id.startsWith('mock_img_')) {
    const baseId = id.split('_').slice(0, 3).join('_');
    return MOCK_IMAGES_LIST.find(img => img.id === baseId) || MOCK_IMAGES_LIST[0];
  }

  if (id.startsWith('pixabay_img_')) {
    const rawId = id.replace('pixabay_img_', '');
    try {
      const pixabayUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&id=${rawId}`;
      const res = await fetch(pixabayUrl);
      if (!res.ok) throw new Error("Pixabay API Error");
      const data = await res.json();
      const item = data.hits?.[0];
      if (!item) return null;
      return {
        id: `pixabay_img_${item.id}`,
        type: 'image',
        width: item.imageWidth,
        height: item.imageHeight,
        avg_color: '#15151a',
        photographer: item.user || 'Pixabay Creator',
        photographer_url: `https://pixabay.com/users/${item.user}-${item.user_id}/`,
        src: {
            original: item.largeImageURL,
            large2x: item.largeImageURL,
            large: item.webformatURL,
            medium: item.webformatURL,
            small: item.previewURL,
            thumbnail: item.previewURL
          },
        title: item.tags || 'Creative Image',
        downloadUrl: item.largeImageURL
      };
    } catch (error) {
      console.error("getImageById error:", error);
      return null;
    }
  }

  return MOCK_IMAGES_LIST.find(img => img.id === id) || MOCK_IMAGES_LIST[0];
};

export const getVideoById = async (id) => {
  if (id.startsWith('pexels_video_')) {
    const rawId = id.replace('pexels_video_', '');
    if (isPexelsMock) return MOCK_VIDEOS_LIST.find(v => v.id === id) || MOCK_VIDEOS_LIST[0];
    
    try {
      const res = await fetch(`https://api.pexels.com/videos/videos/${rawId}`, { headers: { Authorization: PEXELS_API_KEY } });
      if (!res.ok) throw new Error("Pexels fetch failed");
      const item = await res.json();
      
      const hdFile = item.video_files?.find(f => f.quality === 'hd' && f.file_type === 'video/mp4') || 
                    item.video_files?.find(f => f.file_type === 'video/mp4') ||
                    item.video_files?.[0];
      return {
        id: `pexels_video_${item.id}`,
        type: 'video',
        width: item.width || 1280,
        height: item.height || 720,
        avg_color: '#15151a',
        preview_url: item.video_pictures?.[0]?.link || '',
        video_url: hdFile?.link || '',
        photographer: item.user?.name || 'Pexels Videographer',
        photographer_url: item.user?.url || 'https://pexels.com',
        title: `Video by ${item.user?.name || 'Creator'}`
      };
    } catch (err) {
      console.warn("getVideoById error:", err);
      return null;
    }
  }
  
  if (id.startsWith('pixabay_video_')) {
    const rawId = id.replace('pixabay_video_', '');
    if (isPixabayMock) return MOCK_VIDEOS_LIST.find(v => v.id === id) || MOCK_VIDEOS_LIST[0];
    
    try {
      const res = await fetch(`https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&id=${rawId}`);
      if (!res.ok) throw new Error("Pixabay fetch failed");
      const data = await res.json();
      const item = data.hits?.[0];
      if (!item) return null;
      
      const videos = item.videos || {};
      const bestVideo = videos.medium || videos.small || videos.large || videos.tiny;
      const preview = `https://i.vimeocdn.com/video/${item.picture_id}_640x360.jpg`;
      return {
        id: `pixabay_video_${item.id}`,
        type: 'video',
        width: bestVideo?.width || 1280,
        height: bestVideo?.height || 720,
        avg_color: '#15151a',
        preview_url: preview,
        video_url: bestVideo?.url || '',
        photographer: item.user || 'Pixabay Creator',
        photographer_url: `https://pixabay.com/users/${item.user}-${item.user_id}/`,
        title: item.tags || 'Creative Footage'
      };
    } catch (err) {
      console.warn("getVideoById error:", err);
      return null;
    }
  }
  
  // mock fallback
  return MOCK_VIDEOS_LIST.find(v => v.id === id || id.startsWith(v.id)) || MOCK_VIDEOS_LIST[0];
};

// ----------------------------------------------------
// HIGH QUALITY STATIC MOCK DATA
// ----------------------------------------------------

const MOCK_IMAGES_LIST = [
  {
    id: 'mock_img_1',
    type: 'image',
    width: 1920,
    height: 1200,
    avg_color: '#1a1f18',
    photographer: 'Elianna Gill',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Autumn path covered with golden leaves in green forest',
    category: 'Nature'
  },
  {
    id: 'mock_img_2',
    type: 'image',
    width: 1600,
    height: 1200,
    avg_color: '#0e0b12',
    photographer: 'Velasquez Art',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=100',
      large2x: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Vibrant abstract oil painting fluid dynamic colors texture',
    category: 'Abstract'
  },
  {
    id: 'mock_img_3',
    type: 'image',
    width: 2560,
    height: 1440,
    avg_color: '#080d19',
    photographer: 'NASA Scientific',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Earth globe illuminated satellite mapping telecommunications',
    category: 'Space'
  },
  {
    id: 'mock_img_4',
    type: 'image',
    width: 1920,
    height: 1080,
    avg_color: '#15061c',
    photographer: 'Takahashi Ken',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Neon lit glowing arcade cyberpunk game station console',
    category: 'Cyberpunk'
  },
  {
    id: 'mock_img_5',
    type: 'image',
    width: 1920,
    height: 1200,
    avg_color: '#2a282f',
    photographer: 'Sora Tanaka',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Integrated circuit board processor technology microchip hardware',
    category: 'Technology'
  },
  {
    id: 'mock_img_6',
    type: 'image',
    width: 2560,
    height: 1600,
    avg_color: '#1f100a',
    photographer: 'Evelyn Wood',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Misty mountain range peaks landscape sky clouds scenic',
    category: 'Mountains'
  },
  {
    id: 'mock_img_7',
    type: 'image',
    width: 2560,
    height: 1600,
    avg_color: '#1a2a3a',
    photographer: 'Silas Baisch',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Blue ocean water under cloudy sky during daytime',
    category: 'Nature'
  },
  {
    id: 'mock_img_8',
    type: 'image',
    width: 1920,
    height: 1200,
    avg_color: '#2c2d30',
    photographer: 'Campbell',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'
    },
    title: 'White porsche coupe on gray asphalt road',
    category: 'Cars'
  },
  {
    id: 'mock_img_9',
    type: 'image',
    width: 2560,
    height: 1440,
    avg_color: '#1e1e24',
    photographer: 'Xavier',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Black flat screen monitor turned on showing green leaves',
    category: 'Gaming'
  },
  {
    id: 'mock_img_10',
    type: 'image',
    width: 1920,
    height: 1200,
    avg_color: '#101018',
    photographer: 'Sora Sagano',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
    },
    title: 'High angle view of skyscrapers in city at night',
    category: 'Architecture'
  },
  {
    id: 'mock_img_11',
    type: 'image',
    width: 2560,
    height: 1440,
    avg_color: '#0a0718',
    photographer: 'DeepMind',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Abstract neon wireframe lines glow',
    category: 'Technology'
  },
  {
    id: 'mock_img_12',
    type: 'image',
    width: 1920,
    height: 1200,
    avg_color: '#e8cde0',
    photographer: 'Sora Sagano',
    photographer_url: 'https://unsplash.com',
    src: {
      original: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1920&q=100',
      large2x: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1200&q=80',
      large: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1000&q=80',
      medium: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=600&q=80',
      small: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=400&q=80'
    },
    title: 'Pink cherry blossom flowers under white clouds',
    category: 'Nature'
  }
];

const MOCK_VIDEOS_LIST = [
  {
    id: 'mock_vid_1',
    type: 'video',
    width: 640,
    height: 360,
    avg_color: '#05070e',
    photographer: 'Vance Woods',
    photographer_url: 'https://pexels.com',
    preview_url: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=format&fit=crop&w=640',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-of-digital-code-background-32697-large.mp4',
    title: 'Green digital matrices matrix code flow technology animation',
    category: 'Technology'
  },
  {
    id: 'mock_vid_2',
    type: 'video',
    width: 640,
    height: 360,
    avg_color: '#071018',
    photographer: 'Stargazer Films',
    photographer_url: 'https://pexels.com',
    preview_url: 'https://images.pexels.com/photos/733475/pexels-photo-733475.jpeg?auto=format&fit=crop&w=640',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-nebula-in-space-background-31627-large.mp4',
    title: 'Space cosmic dust pink nebula starry sky rotation background',
    category: 'Space'
  },
  {
    id: 'mock_vid_3',
    type: 'video',
    width: 640,
    height: 360,
    avg_color: '#0b160b',
    photographer: 'Forest Cinematic',
    photographer_url: 'https://pexels.com',
    preview_url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=format&fit=crop&w=640',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-under-water-view-of-sunbeams-33989-large.mp4',
    title: 'Underwater sunlight rays beam flow marine deep water loop',
    category: 'Nature'
  },
  {
    id: 'mock_vid_4',
    type: 'video',
    width: 640,
    height: 360,
    avg_color: '#151322',
    photographer: 'Neon Dreamer',
    photographer_url: 'https://pexels.com',
    preview_url: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=format&fit=crop&w=640',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-neon-light-background-42173-large.mp4',
    title: 'Cyberpunk purple neon laser line scan abstract grid loops',
    category: 'Cyberpunk'
  },
  {
    id: 'mock_vid_5',
    type: 'video',
    width: 640,
    height: 360,
    avg_color: '#0b0c10',
    photographer: 'Pixel Art',
    photographer_url: 'https://pexels.com',
    preview_url: 'https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=format&fit=crop&w=640',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-clock-counting-down-from-ten-42028-large.mp4',
    title: 'Glow countdown numbers 10 to 1 timer clock neon animation',
    category: 'Gaming'
  }
];

const MOCK_GIFS_LIST = [
  {
    id: 'mock_gif_1',
    type: 'gif',
    width: 480,
    height: 480,
    preview_url: 'https://media.giphy.com/media/ICOgX4SiYCfeM/giphy.gif',
    gif_url: 'https://media.giphy.com/media/ICOgX4SiYCfeM/giphy.gif',
    photographer: 'CatLover',
    photographer_url: 'https://giphy.com',
    title: 'Cute cat waving paw greetings hello funny animation',
    tags: ['Funny', 'Cat', 'Reaction']
  },
  {
    id: 'mock_gif_2',
    type: 'gif',
    width: 480,
    height: 360,
    preview_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2ptbXp5ZWFwOGFodGxtNDBmaDF0ejl1dHF6Z3o1M3QydmxjNXQ3NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/t3s3xLfcrPTP0qvqnl/giphy.gif',
    gif_url: 'https://media.giphy.com/media/t3s3xLfcrPTP0qvqnl/giphy.gif',
    photographer: 'MemeMaster',
    photographer_url: 'https://giphy.com',
    title: 'Thinking smart head tap big brain meme reaction',
    tags: ['Memes', 'Reaction', 'Funny']
  },
  {
    id: 'mock_gif_3',
    type: 'gif',
    width: 480,
    height: 270,
    preview_url: 'https://media.giphy.com/media/xT0xezQGU5xCDSK3dQ/giphy.gif',
    gif_url: 'https://media.giphy.com/media/xT0xezQGU5xCDSK3dQ/giphy.gif',
    photographer: 'NeonArtist',
    photographer_url: 'https://giphy.com',
    title: 'Retro neon loop grid tunnel horizon synthwave wave',
    tags: ['Reactions', 'Trending', 'Space']
  },
  {
    id: 'mock_gif_4',
    type: 'gif',
    width: 480,
    height: 270,
    preview_url: 'https://media.giphy.com/media/l41YhWbJboTNLCkmA/giphy.gif',
    gif_url: 'https://media.giphy.com/media/l41YhWbJboTNLCkmA/giphy.gif',
    photographer: 'LifeCoach',
    photographer_url: 'https://giphy.com',
    title: 'Motivating work hard keep going champion thumbs up',
    tags: ['Motivation', 'Reactions', 'Trending']
  },
  {
    id: 'mock_gif_5',
    type: 'gif',
    width: 480,
    height: 360,
    preview_url: 'https://media.giphy.com/media/3o7TKSj06tqgZaXC5G/giphy.gif',
    gif_url: 'https://media.giphy.com/media/3o7TKSj06tqgZaXC5G/giphy.gif',
    photographer: 'GiphyStudio',
    photographer_url: 'https://giphy.com',
    title: 'Excited cheering hands up crowd celebration party',
    tags: ['Trending', 'Reactions', 'Funny']
  }
];
