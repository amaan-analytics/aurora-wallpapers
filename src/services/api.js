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

// ----------------------------------------------------
// 1. IMAGES (Unsplash + Pexels)
// ----------------------------------------------------

export const getImages = async (queryText = '', page = 1, perPage = 16) => {
  if (isUnsplashMock && isPexelsMock) {
    // Return high quality mock images from unsplash (static URLs)
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
    const paginated = list.slice(startIndex, startIndex + perPage);

    return {
      items: paginated,
      page,
      per_page: perPage,
      total_results: list.length,
      next_page: startIndex + perPage < list.length ? page + 1 : null
    };
  }

  // Real Mode - fetch from Pexels & Unsplash concurrently
  try {
    const promises = [];
    
    // Unsplash call
    if (!isUnsplashMock) {
      const unsplashUrl = queryText 
        ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queryText)}&page=${page}&per_page=${Math.ceil(perPage / 2)}`
        : `https://api.unsplash.com/photos?page=${page}&per_page=${Math.ceil(perPage / 2)}`;
      
      promises.push(
        fetch(unsplashUrl, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!data) return [];
            const rawItems = queryText ? (data.results || []) : data;
            return rawItems.map(item => ({
              id: `unsplash_${item.id}`,
              type: 'image',
              width: item.width,
              height: item.height,
              avg_color: item.color || '#15151a',
              photographer: item.user?.name || 'Unsplash Artist',
              photographer_url: item.user?.portfolio_url || 'https://unsplash.com',
              src: {
                original: item.urls?.raw,
                large2x: item.urls?.regular,
                large: item.urls?.regular,
                medium: item.urls?.small,
                small: item.urls?.small
              },
              title: item.alt_description || item.description || 'Creative Image',
              downloadUrl: item.links?.download || item.urls?.raw
            }));
          })
          .catch(() => [])
      );
    }

    // Pexels call
    if (!isPexelsMock) {
      const pexelsUrl = queryText
        ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(queryText)}&page=${page}&per_page=${Math.ceil(perPage / 2)}`
        : `https://api.pexels.com/v1/curated?page=${page}&per_page=${Math.ceil(perPage / 2)}`;
      
      promises.push(
        fetch(pexelsUrl, { headers: { Authorization: PEXELS_API_KEY } })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!data || !data.photos) return [];
            return data.photos.map(item => ({
              id: `pexels_${item.id}`,
              type: 'image',
              width: item.width,
              height: item.height,
              avg_color: item.avg_color || '#15151a',
              photographer: item.photographer,
              photographer_url: item.photographer_url,
              src: item.src,
              title: item.alt || 'Pexels Image',
              downloadUrl: item.src.original
            }));
          })
          .catch(() => [])
      );
    }

    const results = await Promise.all(promises);
    const combined = [];
    const maxLen = Math.max(results[0]?.length || 0, results[1]?.length || 0);
    
    // Interleave Pexels and Unsplash results for balanced variety
    for (let i = 0; i < maxLen; i++) {
      if (results[0] && results[0][i]) combined.push(results[0][i]);
      if (results[1] && results[1][i]) combined.push(results[1][i]);
    }

    return {
      items: combined,
      page,
      per_page: perPage,
      total_results: combined.length * 5, // Simulated total
      next_page: combined.length >= Math.floor(perPage / 2) ? page + 1 : null
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
    const paginated = list.slice(startIndex, startIndex + perPage);

    return {
      items: paginated,
      page,
      per_page: perPage,
      total_results: list.length,
      next_page: startIndex + perPage < list.length ? page + 1 : null
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
            return data.videos.map(item => {
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
                preview_url: item.video_pictures?.[0]?.link || '',
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
      const pixabayUrl = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(queryText)}&page=${page}&per_page=${Math.ceil(perPage / 2)}`;
      
      promises.push(
        fetch(pixabayUrl)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!data || !data.hits) return [];
            return data.hits.map(item => {
              // Map videos
              const videos = item.videos || {};
              const bestVideo = videos.medium || videos.small || videos.large || videos.tiny;
              
              // Generate cover image
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
    const paginated = list.slice(startIndex, startIndex + perPage);

    return {
      items: paginated,
      page,
      per_page: perPage,
      total_results: list.length,
      next_page: startIndex + perPage < list.length ? page + 1 : null
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
      // 1. Wallpapers (Simulated from images)
      getImages(queryText, page, limitPerSource).then(res => 
        res.items.map(img => ({ ...img, type: 'wallpaper', category: img.category || 'Wallpapers' }))
      ),
      // 2. Images
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
