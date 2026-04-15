// app.js
App({
  globalData: {
    userInfo: null,
    staticData: null,
    weatherData: null,
    forecastData: null,
    lastUpdateTime: {
      static: 0,
      weather: 0,
      forecast: 0
    }
  },
  onLaunch() {
    // 初始化数据，先尝试从缓存加载
    this.loadCachedData();
    // 然后异步更新数据
    this.updateAllData();
  },
  
  // 从缓存加载数据
  loadCachedData() {
    try {
      const cachedStaticData = wx.getStorageSync('staticData');
      const cachedWeatherData = wx.getStorageSync('weatherData');
      const cachedForecastData = wx.getStorageSync('forecastData');
      const cachedUpdateTime = wx.getStorageSync('lastUpdateTime');
      
      if (cachedStaticData) {
        this.globalData.staticData = cachedStaticData;
      }
      if (cachedWeatherData) {
        this.globalData.weatherData = cachedWeatherData;
      }
      if (cachedForecastData) {
        this.globalData.forecastData = cachedForecastData;
      }
      if (cachedUpdateTime) {
        this.globalData.lastUpdateTime = cachedUpdateTime;
      }
      
      console.log('从缓存加载数据成功');
    } catch (error) {
      console.error('加载缓存数据失败:', error);
    }
  },
  
  // 保存数据到缓存
  saveDataToCache() {
    try {
      wx.setStorageSync('staticData', this.globalData.staticData);
      wx.setStorageSync('weatherData', this.globalData.weatherData);
      wx.setStorageSync('forecastData', this.globalData.forecastData);
      wx.setStorageSync('lastUpdateTime', this.globalData.lastUpdateTime);
      console.log('数据保存到缓存成功');
    } catch (error) {
      console.error('保存数据到缓存失败:', error);
    }
  },
  
  // 统一的网络请求方法
  requestData(url, successCallback, failCallback) {
    wx.request({
      url,
      timeout: 10000, // 10秒超时
      success: successCallback,
      fail: (err) => {
        console.error(`请求 ${url} 失败:`, err);
        if (failCallback) {
          failCallback(err);
        }
      }
    });
  },
  
  // 加载静态数据
  loadStaticData() {
    this.requestData(
      'https://mock-cdn.example.com/static/version.json',
      (res) => {
        if (res.data && res.data.latest) {
          this.requestData(
            `https://mock-cdn.example.com/static/${res.data.latest}`,
            (dataRes) => {
              this.globalData.staticData = dataRes.data;
              this.globalData.lastUpdateTime.static = Date.now();
              this.saveDataToCache();
              console.log('静态数据加载成功');
            }
          );
        }
      }
    );
  },
  
  // 加载天气数据
  loadWeatherData() {
    this.requestData(
      'https://mock-cdn.example.com/weather/version.json',
      (res) => {
        if (res.data && res.data.latest) {
          this.requestData(
            `https://mock-cdn.example.com/weather/${res.data.latest}`,
            (dataRes) => {
              this.globalData.weatherData = dataRes.data;
              this.globalData.lastUpdateTime.weather = Date.now();
              this.saveDataToCache();
              console.log('天气数据加载成功');
            }
          );
        }
      }
    );
  },
  
  // 加载自然奇观预报数据
  loadForecastData() {
    this.requestData(
      'https://mock-cdn.example.com/forecast/version.json',
      (res) => {
        if (res.data && res.data.latest) {
          this.requestData(
            `https://mock-cdn.example.com/forecast/${res.data.latest}`,
            (dataRes) => {
              this.globalData.forecastData = dataRes.data;
              this.globalData.lastUpdateTime.forecast = Date.now();
              this.saveDataToCache();
              console.log('预报数据加载成功');
            }
          );
        }
      }
    );
  },
  
  // 批量更新所有数据
  updateAllData() {
    // 使用 Promise 并行请求，提高加载速度
    const updatePromises = [];
    
    // 检查并更新静态数据
    if (Date.now() - this.globalData.lastUpdateTime.static > 24 * 60 * 60 * 1000) {
      updatePromises.push(new Promise((resolve) => {
        this.loadStaticData();
        setTimeout(resolve, 100); // 确保异步执行
      }));
    }
    
    // 检查并更新天气数据
    if (Date.now() - this.globalData.lastUpdateTime.weather > 25 * 60 * 1000) {
      updatePromises.push(new Promise((resolve) => {
        this.loadWeatherData();
        setTimeout(resolve, 100);
      }));
    }
    
    // 检查并更新预报数据
    if (Date.now() - this.globalData.lastUpdateTime.forecast > 4 * 60 * 60 * 1000) {
      updatePromises.push(new Promise((resolve) => {
        this.loadForecastData();
        setTimeout(resolve, 100);
      }));
    }
    
    // 等待所有更新完成
    if (updatePromises.length > 0) {
      Promise.all(updatePromises).then(() => {
        console.log('所有数据更新完成');
      });
    }
  },
  
  // 检查数据是否需要更新
  checkDataUpdate() {
    this.updateAllData();
  }
})