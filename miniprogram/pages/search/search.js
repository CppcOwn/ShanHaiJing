// search.js
Page({
  data: {
    searchQuery: '',
    searchResults: [],
    searchHistory: [],
    hotSearch: ['黄山云海', '泰山日出', '茶卡盐湖星空', '云海', '日出', '星空'],
    loading: false
  },
  onLoad() {
    // 加载搜索历史
    this.loadSearchHistory();
  },
  loadSearchHistory() {
    // 从本地存储加载搜索历史
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({
      searchHistory: history
    });
  },
  saveSearchHistory(query) {
    // 保存搜索历史
    let history = wx.getStorageSync('searchHistory') || [];
    // 移除重复项
    history = history.filter(item => item !== query);
    // 添加到历史记录开头
    history.unshift(query);
    // 限制历史记录数量
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    // 保存到本地存储
    wx.setStorageSync('searchHistory', history);
    this.setData({
      searchHistory: history
    });
  },
  onSearchInput(e) {
    // 输入搜索关键词
    this.setData({
      searchQuery: e.detail.value
    });
  },
  onSearch() {
    // 执行搜索
    const query = this.data.searchQuery.trim();
    if (!query) return;
    
    this.setData({
      loading: true
    });
    
    // 保存搜索历史
    this.saveSearchHistory(query);
    
    // 模拟搜索延迟
    setTimeout(() => {
      const app = getApp();
      const scenicSpots = app.globalData.staticData?.scenic_spots || [];
      
      // 搜索逻辑
      const results = scenicSpots.filter(spot => 
        spot.name.includes(query) || 
        spot.type.includes(query) || 
        spot.location.includes(query) || 
        spot.description.includes(query)
      );
      
      this.setData({
        searchResults: results,
        loading: false
      });
    }, 500);
  },
  onHistoryItemTap(e) {
    // 点击历史记录项
    const query = e.currentTarget.dataset.item;
    this.setData({
      searchQuery: query
    });
    this.onSearch();
  },
  onHistoryDelete(e) {
    // 删除历史记录项
    const index = e.currentTarget.dataset.index;
    let history = this.data.searchHistory;
    history.splice(index, 1);
    wx.setStorageSync('searchHistory', history);
    this.setData({
      searchHistory: history
    });
  },
  onHistoryClear() {
    // 清除历史记录
    wx.removeStorageSync('searchHistory');
    this.setData({
      searchHistory: []
    });
  },
  onHotSearchTap(e) {
    // 点击热门搜索项
    const query = e.currentTarget.dataset.item;
    this.setData({
      searchQuery: query
    });
    this.onSearch();
  }
})