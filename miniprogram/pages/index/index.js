// index.js
Page({
  data: {
    scenicSpots: [],
    currentWeather: null,
    loading: true,
    error: null
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
    
    // 加载静态数据
    if (app.globalData.staticData) {
      this.setData({
        scenicSpots: app.globalData.staticData.scenic_spots || []
      });
    }
    
    // 加载天气数据
    if (app.globalData.weatherData) {
      this.setData({
        currentWeather: app.globalData.weatherData.current || null
      });
    }
    
    // 如果数据未加载，显示错误信息
    if (!app.globalData.staticData && !app.globalData.weatherData) {
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
  onPullDownRefresh() {
    // 下拉刷新时重新加载数据
    const app = getApp();
    app.loadStaticData();
    app.loadWeatherData();
    app.loadForecastData();
    
    // 模拟网络请求延迟
    setTimeout(() => {
      this.loadData();
      wx.stopPullDownRefresh();
    }, 1000);
  }
})