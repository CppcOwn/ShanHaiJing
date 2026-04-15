// map.js
Page({
  data: {
    mapType: 'globe', // globe 或 china
    scenicSpots: [],
    loading: true,
    map: null
  },
  onLoad() {
    this.loadData();
    this.initMap();
  },
  onShow() {
    // 每次显示页面时检查数据是否需要更新
    const app = getApp();
    app.checkDataUpdate();
    this.loadData();
  },
  loadData() {
    const app = getApp();
    if (app.globalData.staticData) {
      this.setData({
        scenicSpots: app.globalData.staticData.scenic_spots || [],
        loading: false
      });
    }
  },
  initMap() {
    // 模拟初始化3D地球仪/中国地图
    // 实际项目中可以使用腾讯地图API或其他地图库
    setTimeout(() => {
      this.setData({
        loading: false
      });
      console.log('地图初始化完成');
    }, 1000);
  },
  switchMapType() {
    // 切换地图类型（地球仪/中国地图）
    this.setData({
      mapType: this.data.mapType === 'globe' ? 'china' : 'globe'
    });
    console.log('切换地图类型为:', this.data.mapType);
  },
  zoomIn() {
    // 地图放大
    console.log('地图放大');
  },
  zoomOut() {
    // 地图缩小
    console.log('地图缩小');
  },
  resetMap() {
    // 重置地图
    console.log('重置地图');
  },
  showScenicSpotDetail(e) {
    // 显示自然奇观详情
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
})