// detail.js
Page({
  data: {
    scenicSpot: null,
    observationPoints: [],
    relatedSpots: [],
    weather: null,
    weatherIcon: '🌤️',
    loading: true,
    error: null
  },
  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadScenicSpotDetail(id);
    } else {
      this.setData({
        error: '未找到景点信息',
        loading: false
      });
    }
  },
  loadScenicSpotDetail(id) {
    const app = getApp();
    
    // 加载静态数据
    if (app.globalData.staticData) {
      const scenicSpots = app.globalData.staticData.scenic_spots || [];
      const scenicSpot = scenicSpots.find(spot => spot.id === id);
      
      if (scenicSpot) {
        this.setData({
          scenicSpot
        });
        
        // 加载观测点位信息
        this.loadObservationPoints(id);
        
        // 加载相关推荐
        this.loadRelatedSpots(id, scenicSpot.type);
        
        // 生成天气信息
        this.generateWeatherInfo();
        
        this.setData({
          loading: false
        });
      } else {
        this.setData({
          error: '未找到景点信息',
          loading: false
        });
      }
    } else {
      this.setData({
        error: '数据加载失败，请稍后重试',
        loading: false
      });
    }
  },
  loadObservationPoints(scenicSpotId) {
    const app = getApp();
    if (app.globalData.staticData) {
      const observationPoints = app.globalData.staticData.observation_points || [];
      const filteredPoints = observationPoints.filter(point => point.scenic_spot_id === scenicSpotId);
      this.setData({
        observationPoints: filteredPoints
      });
    }
  },
  loadRelatedSpots(currentId, currentType) {
    const app = getApp();
    if (app.globalData.staticData) {
      const scenicSpots = app.globalData.staticData.scenic_spots || [];
      const relatedSpots = scenicSpots
        .filter(spot => spot.id !== currentId && spot.type === currentType)
        .slice(0, 4);
      this.setData({
        relatedSpots
      });
    }
  },
  generateWeatherInfo() {
    // 生成模拟天气信息
    const weather = {
      temperature: Math.floor(Math.random() * 10) + 15,
      weather: ['晴天', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)]
    };
    
    // 更新天气图标
    let icon = '🌤️';
    if (weather.weather.includes('雨')) {
      icon = '🌧️';
    } else if (weather.weather.includes('云')) {
      icon = '☁️';
    } else if (weather.weather.includes('晴')) {
      icon = '☀️';
    }
    
    this.setData({
      weather,
      weatherIcon: icon
    });
  }
})