interface ScenicSpot {
  id: string;
  name: string;
  location: string;
  type: string;
  description: string;
  rating: number;
  ticket_info: string;
  image_url: string;
  coordinates?: {
    longitude: number;
    latitude: number;
  };
}

interface Weather {
  temperature: string;
  description: string;
}

// 模拟 API 数据
const mockScenicSpots: ScenicSpot[] = [
  {
    id: '1',
    name: '大堡礁',
    location: '澳大利亚',
    type: '自然奇观',
    description: '世界最大的珊瑚礁系统',
    rating: 4.8,
    ticket_info: '门票: ¥1200',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great%20Barrier%20Reef%20aerial%20view%20with%20colorful%20coral%20reefs%20and%20clear%20blue%20water&image_size=landscape_16_9',
    coordinates: { longitude: 153.5, latitude: -18.28 }
  },
  {
    id: '2',
    name: '大峡谷',
    location: '美国',
    type: '自然奇观',
    description: '美国亚利桑那州的壮观峡谷',
    rating: 4.9,
    ticket_info: '门票: ¥800',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Grand%20Canyon%20aerial%20view%20with%20red%20rock%20formations%20and%20vast%20landscape&image_size=landscape_16_9',
    coordinates: { longitude: -112.1, latitude: 36.1 }
  },
  {
    id: '3',
    name: '埃菲尔铁塔',
    location: '法国',
    type: '人文景观',
    description: '法国巴黎的标志性建筑',
    rating: 4.7,
    ticket_info: '门票: ¥600',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Eiffel%20Tower%20in%20Paris%20with%20city%20skyline%20at%20sunset&image_size=landscape_16_9',
    coordinates: { longitude: 2.35, latitude: 48.85 }
  },
  {
    id: '4',
    name: '长城',
    location: '中国',
    type: '人文景观',
    description: '中国古代伟大的防御工程',
    rating: 4.9,
    ticket_info: '门票: ¥100',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great%20Wall%20of%20China%20winding%20through%20mountainous%20landscape&image_size=landscape_16_9',
    coordinates: { longitude: 116.4, latitude: 40.4 }
  },
  {
    id: '5',
    name: '金字塔',
    location: '埃及',
    type: '人文景观',
    description: '埃及古代法老的陵墓',
    rating: 4.8,
    ticket_info: '门票: ¥900',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pyramids%20of%20Giza%20with%20Sphinx%20in%20Egyptian%20desert&image_size=landscape_16_9',
    coordinates: { longitude: 31.23, latitude: 29.97 }
  }
];

const mockWeather: Weather = {
  temperature: '25',
  description: '晴天'
};

// 缓存管理
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  get(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cacheManager = new CacheManager();

// 模拟 API 请求
const simulateApiRequest = <T>(data: T, delay: number = 300): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// API 服务
export const apiService = {
  // 获取景点列表
  async getScenicSpots(): Promise<ScenicSpot[]> {
    const cacheKey = 'scenicSpots';
    const cachedData = cacheManager.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await simulateApiRequest(mockScenicSpots);
    cacheManager.set(cacheKey, data);
    return data;
  },

  // 获取天气信息
  async getWeather(): Promise<Weather> {
    const cacheKey = 'weather';
    const cachedData = cacheManager.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await simulateApiRequest(mockWeather, 200);
    cacheManager.set(cacheKey, data);
    return data;
  },

  // 获取单个景点详情
  async getScenicSpotDetail(id: string): Promise<ScenicSpot | null> {
    const cacheKey = `scenicSpot_${id}`;
    const cachedData = cacheManager.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await simulateApiRequest(
      mockScenicSpots.find(spot => spot.id === id) || null
    );
    if (data) {
      cacheManager.set(cacheKey, data);
    }
    return data;
  },

  // 清除缓存
  clearCache(): void {
    cacheManager.clear();
  }
};

export type { ScenicSpot, Weather };