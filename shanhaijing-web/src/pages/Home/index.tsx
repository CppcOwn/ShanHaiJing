import React, { useState, useEffect } from 'react';
import './index.css';
import { apiService, ScenicSpot, Weather } from '../../services/api';

const Home: React.FC = () => {
  const [scenicSpots, setScenicSpots] = useState<ScenicSpot[]>([]);
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigateTo = (page: string) => {
    console.log(`导航到: ${page}`);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 并行请求数据，提高加载速度
      const [spots, weather] = await Promise.all([
        apiService.getScenicSpots(),
        apiService.getWeather()
      ]);
      
      setScenicSpots(spots);
      setCurrentWeather(weather);
    } catch (err) {
      setError('数据加载失败，请稍后重试');
      console.error('数据加载错误:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 加载状态
  if (loading) {
    return (
      <div className="container loading-container">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container error-container">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={fetchData}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 顶部搜索栏 */}
      <div className="search-bar">
        <button className="search-input-wrapper" onClick={() => navigateTo('/search')}>
          <span className="search-icon">🔍</span>
          <span className="search-placeholder">搜索自然奇观</span>
        </button>
      </div>

      {/* 轮播图 */}
      <div className="section">
        <div className="swiper">
          {scenicSpots.map((item) => (
            <div key={item.id} className="swiper-item" onClick={() => navigateTo(`/detail?id=${item.id}`)}>
              <img 
                src={item.image_url} 
                className="swiper-image" 
                alt={item.name}
                loading="lazy"
              />
              <div className="swiper-overlay">
                <div className="swiper-title">{item.name}</div>
                <div className="swiper-subtitle">{item.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 自然奇观列表 */}
      <div className="section">
        <div className="section-title">自然奇观</div>
        {scenicSpots.map((item) => (
          <div key={item.id} className="card" onClick={() => navigateTo(`/detail?id=${item.id}`)}>
            <div className="card-content-wrapper">
              <img 
                src={item.image_url} 
                className="card-image" 
                alt={item.name}
                loading="lazy"
              />
              <div className="card-info">
                <div className="card-title">{item.name}</div>
                <div className="card-subtitle">{item.type} · {item.location}</div>
                <div className="card-description">{item.description}</div>
                <div className="card-footer">
                  <div className="card-rating">⭐ {item.rating}</div>
                  <div className="card-ticket">{item.ticket_info}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 天气预报 */}
      <div className="section">
        <div className="section-title">天气预报</div>
        <div className="weather-preview">
          <button className="weather-preview-item" onClick={() => navigateTo('/weather')}>
            <div className="weather-icon">🌤️</div>
            <div className="weather-info">
              <div className="weather-temp">{currentWeather?.temperature || '25'}°C</div>
              <div className="weather-desc">{currentWeather?.description || '晴天'}</div>
            </div>
            <div className="weather-arrow">→</div>
          </button>
        </div>
      </div>

      {/* 地图入口 */}
      <div className="section">
        <div className="section-title">探索地图</div>
        <button className="map-entry" onClick={() => navigateTo('/map')}>
          <div className="map-entry-content">
            <div className="map-icon">🗺️</div>
            <div className="map-text">查看 3D 地球仪/中国地图</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;