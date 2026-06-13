const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// Check if we are running in mock mode due to placeholder key
const isMockMode = 
  !PEXELS_API_KEY || 
  PEXELS_API_KEY.includes('placeholder') || 
  PEXELS_API_KEY === '';

// Wallpaper categories for random discovery
const DISCOVERY_CATEGORIES = [
  'Nature', 'Abstract', 'Space', 'Cyberpunk', 'Minimalist',
  'Gaming', 'Technology', 'Architecture', 'Mountains', 'Ocean', 'AI Art'
];

// Pick a random category for homepage discovery
export const getRandomCategory = () =>
  DISCOVERY_CATEGORIES[Math.floor(Math.random() * DISCOVERY_CATEGORIES.length)];

// Pick a random page number for fresh results
export const getRandomPage = (max = 100) =>
  Math.floor(Math.random() * max) + 1;

// Fisher-Yates shuffle — used for mock mode randomization
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// In-memory cache for shuffled mock search results to ensure pagination stability
const mockSearchCache = {};

// High quality mock wallpapers from unsplash for developer testing
const MOCK_WALLPAPERS = [
  {
    id: 101,
    width: 3840,
    height: 2400,
    url: "https://unsplash.com/photos/starry-night-sky-photo-yZygskvbb30",
    photographer: "Vincent Ledvina",
    photographer_url: "https://unsplash.com/@vincentledvina",
    avg_color: "#0c0e18",
    src: {
      original: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=400&q=80"
    },
    category: "Space"
  },
  {
    id: 102,
    width: 4000,
    height: 2667,
    url: "https://unsplash.com/photos/pink-and-purple-smoke-illustration-jrkorpa",
    photographer: "Jr Korpa",
    photographer_url: "https://unsplash.com/@jrkorpa",
    avg_color: "#1d152c",
    src: {
      original: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80"
    },
    category: "Abstract"
  },
  {
    id: 103,
    width: 6000,
    height: 4000,
    url: "https://unsplash.com/photos/road-between-green-leafed-trees-hGV2TfOh0ns",
    photographer: "Johny Goerend",
    photographer_url: "https://unsplash.com/@johnygoerend",
    avg_color: "#132115",
    src: {
      original: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80"
    },
    category: "Nature"
  },
  {
    id: 104,
    width: 3840,
    height: 2560,
    url: "https://unsplash.com/photos/cyberpunk-street-alley-night-scans-c99",
    photographer: "Sora Sagano",
    photographer_url: "https://unsplash.com/@sagano",
    avg_color: "#1c0b1f",
    src: {
      original: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=400&q=80"
    },
    category: "Cyberpunk"
  },
  {
    id: 105,
    width: 3000,
    height: 2000,
    url: "https://unsplash.com/photos/fuji-mountain-under-starry-sky-q8",
    photographer: "Sora Sagano",
    photographer_url: "https://unsplash.com/@sagano",
    avg_color: "#182030",
    src: {
      original: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=400&q=80"
    },
    category: "Mountains"
  },
  {
    id: 106,
    width: 3840,
    height: 2160,
    url: "https://unsplash.com/photos/blue-ocean-water-under-cloudy-sky-during-daytime-xV",
    photographer: "Silas Baisch",
    photographer_url: "https://unsplash.com/@silasbaisch",
    avg_color: "#1a2a3a",
    src: {
      original: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=400&q=80"
    },
    category: "Ocean"
  },
  {
    id: 107,
    width: 4500,
    height: 3000,
    url: "https://unsplash.com/photos/a-white-room-with-a-window-and-a-curtain-z5",
    photographer: "Zack Dwyer",
    photographer_url: "https://unsplash.com/@zackdwyer",
    avg_color: "#ececec",
    src: {
      original: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80"
    },
    category: "Minimalist"
  },
  {
    id: 108,
    width: 3840,
    height: 2560,
    url: "https://unsplash.com/photos/white-porsche-coupe-on-gray-asphalt-road-during-daytime-3A",
    photographer: "Campbell",
    photographer_url: "https://unsplash.com/@campbell3a",
    avg_color: "#2c2d30",
    src: {
      original: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80"
    },
    category: "Cars"
  },
  {
    id: 109,
    width: 3840,
    height: 2560,
    url: "https://unsplash.com/photos/black-flat-screen-monitor-turned-on-showing-green-leaves-pc",
    photographer: "Xavier",
    photographer_url: "https://unsplash.com/@xavier",
    avg_color: "#1e1e24",
    src: {
      original: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80"
    },
    category: "Gaming"
  },
  {
    id: 110,
    width: 3840,
    height: 2560,
    url: "https://unsplash.com/photos/high-angle-view-of-skyscrapers-in-city-at-night-aT",
    photographer: "Sora Sagano",
    photographer_url: "https://unsplash.com/@sagano",
    avg_color: "#101018",
    src: {
      original: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80"
    },
    category: "Architecture"
  },
  {
    id: 111,
    width: 3840,
    height: 2560,
    url: "https://unsplash.com/photos/abstract-neon-wireframe-lines-glow-ab",
    photographer: "Google DeepMind",
    photographer_url: "https://unsplash.com/@googledeepmind",
    avg_color: "#0a0718",
    src: {
      original: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80"
    },
    category: "Technology"
  },
  {
    id: 112,
    width: 3840,
    height: 2560,
    url: "https://unsplash.com/photos/3d-render-futuristic-abstract-art-3d",
    photographer: "AI Creator",
    photographer_url: "https://unsplash.com",
    avg_color: "#2a153c",
    src: {
      original: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
    },
    category: "AI Art"
  },
  {
    id: 113,
    width: 3840,
    height: 2560,
    url: "https://unsplash.com/photos/pink-cherry-blossom-flowers-under-white-clouds-ch",
    photographer: "Sora Sagano",
    photographer_url: "https://unsplash.com/@sagano",
    avg_color: "#e8cde0",
    src: {
      original: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=2560&q=100",
      large2x: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1600&q=80",
      large: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1000&q=80",
      medium: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=600&q=80",
      small: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=400&q=80"
    },
    category: "Anime Inspired"
  }
];

// Helper to construct Pexels endpoints request
const pexelsRequest = async (endpoint, params = {}) => {
  const url = new URL(endpoint);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Pexels fetch error:", error);
    throw error;
  }
};

// -----------------------------
// Pexels API Exposed Services
// -----------------------------

export const getCuratedWallpapers = async (page = 1, perPage = 20, shuffle = false) => {
  if (isMockMode) {
    const cacheKey = `curated_${shuffle ? 'shuffled' : 'stable'}`;
    
    if (page === 1) {
      delete mockSearchCache[cacheKey];
    }

    let filtered;
    if (mockSearchCache[cacheKey]) {
      filtered = mockSearchCache[cacheKey];
    } else {
      filtered = [...MOCK_WALLPAPERS];
      if (shuffle) {
        filtered = shuffleArray(filtered).map(item => ({
          ...item,
          id: item.id + Math.floor(Math.random() * 10000)
        }));
      }
      mockSearchCache[cacheKey] = filtered;
    }

    const totalResults = filtered.length;
    const startIndex = (page - 1) * perPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + perPage);
    
    // Seed extra mock items for infinite scroll simulation
    if (paginatedItems.length === 0 && page <= 5) {
      // Loop mock items with new IDs
      const seeded = filtered.map((item, idx) => ({
        ...item,
        id: item.id + (page * 100)
      }));
      return {
        photos: seeded.slice(0, perPage),
        page,
        per_page: perPage,
        total_results: totalResults * 5,
        next_page: page < 5 ? page + 1 : null
      };
    }

    return {
      photos: paginatedItems,
      page,
      per_page: perPage,
      total_results: totalResults,
      next_page: startIndex + perPage < totalResults ? page + 1 : null
    };
  }

  // Real Curated Endpoint
  return pexelsRequest('https://api.pexels.com/v1/curated', {
    page,
    per_page: perPage
  });
};

/**
 * Fetch fresh random wallpapers for homepage discovery.
 * Uses a random category + random page so every refresh shows new content.
 */
export const getRandomWallpapers = async (perPage = 20) => {
  const randomCategory = getRandomCategory();
  const randomPage = getRandomPage(50);

  if (isMockMode) {
    // Shuffle the mock array so order changes on every call
    const shuffled = shuffleArray(MOCK_WALLPAPERS).map((item, idx) => ({
      ...item,
      id: item.id + Math.floor(Math.random() * 1000) // unique IDs per refresh
    }));
    return {
      photos: shuffled.slice(0, perPage),
      page: 1,
      per_page: perPage,
      total_results: MOCK_WALLPAPERS.length * 5,
      next_page: 2,
      _category: randomCategory
    };
  }

  const response = await pexelsRequest('https://api.pexels.com/v1/search', {
    query: randomCategory,
    page: randomPage,
    per_page: perPage
  });

  return { ...response, _category: randomCategory };
};

export const searchWallpapers = async (queryText, page = 1, perPage = 20, orientation = '', shuffle = false) => {
  if (!queryText) {
    return getCuratedWallpapers(page, perPage, shuffle);
  }

  if (isMockMode) {
    const normalizedQuery = queryText.toLowerCase();
    const cacheKey = `${normalizedQuery}_${shuffle ? 'shuffled' : 'stable'}`;
    
    // Reset the cache for page 1 to allow fresh randomization on refresh
    if (page === 1) {
      delete mockSearchCache[cacheKey];
    }

    let filtered;
    if (mockSearchCache[cacheKey]) {
      filtered = mockSearchCache[cacheKey];
    } else {
      filtered = MOCK_WALLPAPERS.filter(item => 
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.photographer.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(item.category.toLowerCase())
      );

      if (filtered.length === 0) {
        filtered = MOCK_WALLPAPERS;
      }

      if (shuffle) {
        filtered = shuffleArray(filtered).map(item => ({
          ...item,
          id: item.id + Math.floor(Math.random() * 10000) // Ensure unique IDs per refresh
        }));
      }

      mockSearchCache[cacheKey] = filtered;
    }

    const startIndex = (page - 1) * perPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

    return {
      photos: paginatedItems,
      page,
      per_page: perPage,
      total_results: filtered.length,
      next_page: startIndex + perPage < filtered.length ? page + 1 : null
    };
  }

  // Real Search Endpoint
  const params = {
    query: queryText,
    page,
    per_page: perPage
  };
  
  if (orientation) {
    params.orientation = orientation; // 'landscape', 'portrait', 'square'
  }

  return pexelsRequest('https://api.pexels.com/v1/search', params);
};

export const getWallpaperById = async (id) => {
  const parsedId = Number(id);

  if (isMockMode || isNaN(parsedId)) {
    // Find mock item
    const wallpaper = MOCK_WALLPAPERS.find(w => w.id === parsedId) || MOCK_WALLPAPERS[0];
    return wallpaper;
  }

  try {
    return await pexelsRequest(`https://api.pexels.com/v1/photos/${id}`);
  } catch (error) {
    // If real fetch fails, fall back to mock item
    console.warn("Real Pexels fetch failed, falling back to mock wallpaper details.");
    return MOCK_WALLPAPERS.find(w => w.id === parsedId) || MOCK_WALLPAPERS[0];
  }
};

// Extract a smart search keyword from a wallpaper object
const extractKeyword = (wallpaper) => {
  // Prefer explicit category
  if (wallpaper.category) return wallpaper.category;

  // Extract meaningful words from alt text
  if (wallpaper.alt) {
    const stopWords = new Set([
      // Articles & Conjunctions
      'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
      // Prepositions
      'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at',
      'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by',
      'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'like', 'near',
      'of', 'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'since', 'through',
      'throughout', 'till', 'to', 'toward', 'under', 'underneath', 'until', 'up', 'upon',
      'with', 'within', 'without',
      // Pronouns
      'i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves', 'you', 'your',
      'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her',
      'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'this', 'that', 'these', 'those', 'which', 'who', 'whom', 'whose', 'what', 'whatever',
      // Verbs (common/auxiliary/action filler)
      'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
      'do', 'does', 'did', 'doing', 'can', 'could', 'will', 'would', 'shall', 'should',
      'may', 'might', 'must', 'get', 'got', 'getting', 'go', 'goes', 'going', 'went', 'gone',
      'make', 'makes', 'making', 'made', 'take', 'takes', 'taking', 'took', 'taken',
      'standing', 'sitting', 'lying', 'laying', 'runs', 'running', 'walk', 'walks', 'walking',
      'fly', 'flying', 'swim', 'swimming', 'jump', 'jumping', 'look', 'looks', 'looking',
      'face', 'faces', 'facing', 'show', 'shows', 'showing', 'shown', 'depict', 'depicts',
      'depicting', 'capture', 'captures', 'capturing', 'feature', 'features', 'featuring',
      'contain', 'contains', 'containing', 'display', 'displays', 'displaying', 'illustrate',
      'illustrates', 'illustrating', 'represent', 'represents', 'representing', 'seen', 'saw',
      // Photography/image descriptors
      'photo', 'image', 'picture', 'photography', 'photograph', 'pic', 'shot', 'view',
      'background', 'foreground', 'focus', 'focused', 'blur', 'blurred', 'depth', 'field',
      'angle', 'scene', 'subject', 'portrait', 'landscape', 'horizontal', 'vertical',
      'high', 'low', 'top', 'bottom', 'left', 'right', 'middle', 'center', 'framed',
      'closeup', 'close-up', 'close', 'macro', 'zoom', 'zoomed', 'captured', 'taken',
      // Non-descriptive adjectives/quantifiers
      'several', 'some', 'many', 'lot', 'lots', 'few', 'little', 'much', 'more', 'most',
      'good', 'bad', 'great', 'awesome', 'beautiful', 'pretty', 'nice', 'gorgeous', 'stunning',
      'various', 'different', 'single', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
      'eight', 'nine', 'ten', 'first', 'second', 'third', 'next', 'last', 'another', 'other',
      'others', 'only', 'own', 'same', 'such', 'very'
    ]);

    const words = wallpaper.alt
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    if (words.length > 0) {
      const query = words.slice(0, 3).join(' ');
      if (query.trim()) return query;
    }
  }

  // Fallback to photographer name or a default
  return wallpaper.photographer ? `${wallpaper.photographer} wallpaper` : 'nature wallpaper';
};

export const getSimilarWallpapers = async (wallpaper, limitCount = 8) => {
  if (isMockMode) {
    // Return MOCK items that share the category, excluding current id
    const matched = MOCK_WALLPAPERS.filter(w => 
      w.category === wallpaper.category && w.id !== wallpaper.id
    );
    
    if (matched.length > 0) {
      return matched.slice(0, limitCount);
    }
    
    return MOCK_WALLPAPERS.filter(w => w.id !== wallpaper.id).slice(0, limitCount);
  }

  try {
    const queryTerm = extractKeyword(wallpaper);
    const response = await searchWallpapers(queryTerm, 1, limitCount + 2);
    
    // Filter out the current wallpaper itself
    return response.photos.filter(p => p.id !== wallpaper.id).slice(0, limitCount);
  } catch (error) {
    console.warn('getSimilarWallpapers failed:', error);
    return [];
  }
};
