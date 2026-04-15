// weather.js
Page({
  data: {
    currentWeather: null,
    forecastData: null,
    scenicWeatherList: [],
    loading: true,
    error: null,
    weatherIcon: '🌤️'
  },
  onLoad() {
    this.loadData();
  },
  onShow() {
    // 每次显示页面时检查数据是否需要更新
    const app = getApp();
    app.checkDataUpdate();
    this.loadData();
  },
  loadData() {
    const app = getApp();
    
    // 加载天气数据
    if (app.globalData.weatherData) {
      this.setData({
        currentWeather: app.globalData.weatherData.current || null,
        forecastData: app.globalData.weatherData.forecast || null
      });
    }
    
    // 加载静态数据并生成景区天气数据
    if (app.globalData.staticData) {
      const scenicSpots = app.globalData.staticData.scenic_spots || [];
      const scenicWeatherList = scenicSpots.map(spot => ({
        id: spot.id,
        name: spot.name,
        temperature: Math.floor(Math.random() * 10) + 15,
        weather: ['晴天', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)]
      }));
      this.setData({
        scenicWeatherList
      });
    }
    
    // 更新天气图标
    this.updateWeatherIcon();
    
    // 如果数据未加载，显示错误信息
    if (!app.globalData.weatherData && !app.globalData.staticData) {
      this.setData({
        error: '数据加载失败，请稍后重试',
        loading: false
      });
    } else {
      this.setData({
        loading: false
      });
    }
  },
  updateWeatherIcon() {
    // 根据天气描述更新天气图标
    const weatherDesc = this.data.currentWeather?.description || '晴天';
    let icon = '🌤️';
    
    if (weatherDesc.includes('雨')) {
      icon = '🌧️';
    } else if (weatherDesc.includes('云')) {
      icon = '☁️';
    } else if (weatherDesc.includes('雪')) {
      icon = '❄️';
    } else if (weatherDesc.includes('雾')) {
      icon = '🌫️';
    } else if (weatherDesc.includes('晴')) {
      icon = '☀️';
    }
    
    this.setData({
      weatherIcon: icon
    });
  },
  getWeatherIcon(weather) {
    // 根据天气描述返回对应的图标
    if (weather.includes('雨')) {
      return '🌧️';
    } else if (weather.includes('云')) {
      return '☁️';
    } else if (weather.includes('雪')) {
      return '❄️';
    } else if (weather.includes('雾')) {
      return '🌫️';
    } else if (weather.includes('晴')) {
      return '☀️';
    }
    return '🌤️';
  },
  onPullDownRefresh() {
    // 下拉刷新时重新加载数据
    const app = getApp();
    app.loadWeatherData();
    app.loadStaticData();
    
    // 模拟网络请求延迟
    setTimeout(() => {
      this.loadData();
      wx.stopPullDownRefresh();
    }, 1000);
  }
})