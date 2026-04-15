import { Component } from 'react';
import { View, Text, Image, Navigator, Swiper, SwiperItem } from '@tarojs/components';
import './index.css';

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

class Index extends Component {
  state = {
    scenicSpots: [
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
    ],
    currentWeather: {
      temperature: '25',
      description: '晴天'
    },
    loading: false,
    error: ''
  };

  render() {
    const { scenicSpots, currentWeather, loading, error } = this.state;

    return (
      <View className="container">
        {/* 顶部搜索栏 */}
        <View className="search-bar">
          <Navigator url="/pages/search/search" className="search-input-wrapper">
            <View className="search-icon">🔍</View>
            <View className="search-placeholder">搜索自然奇观</View>
          </Navigator>
        </View>

        {/* 轮播图 */}
        <View className="section">
          <Swiper autoplay interval={3000} circular indicatorDots>
            {scenicSpots.map((item) => (
              <SwiperItem key={item.id}>
                <Navigator url={`/pages/detail/detail?id=${item.id}`}>
                  <Image src={item.image_url} className="swiper-image" mode="aspectFill" />
                  <View className="swiper-overlay">
                    <View className="swiper-title">{item.name}</View>
                    <View className="swiper-subtitle">{item.location}</View>
                  </View>
                </Navigator>
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        {/* 自然奇观列表 */}
        <View className="section">
          <View className="section-title">自然奇观</View>
          {scenicSpots.map((item) => (
            <View key={item.id} className="card">
              <Navigator url={`/pages/detail/detail?id=${item.id}`}>
                <View className="card-content-wrapper">
                  <Image src={item.image_url} className="card-image" mode="aspectFill" />
                  <View className="card-info">
                    <View className="card-title">{item.name}</View>
                    <View className="card-subtitle">{item.type} · {item.location}</View>
                    <View className="card-description">{item.description}</View>
                    <View className="card-footer">
                      <View className="card-rating">⭐ {item.rating}</View>
                      <View className="card-ticket">{item.ticket_info}</View>
                    </View>
                  </View>
                </View>
              </Navigator>
            </View>
          ))}
        </View>

        {/* 天气预报 */}
        <View className="section">
          <View className="section-title">天气预报</View>
          <View className="weather-preview">
            <Navigator url="/pages/weather/weather">
              <View className="weather-preview-item">
                <View className="weather-icon">🌤️</View>
                <View className="weather-info">
                  <View className="weather-temp">{currentWeather?.temperature || '25'}°C</View>
                  <View className="weather-desc">{currentWeather?.description || '晴天'}</View>
                </View>
                <View className="weather-arrow">→</View>
              </View>
            </Navigator>
          </View>
        </View>

        {/* 地图入口 */}
        <View className="section">
          <View className="section-title">探索地图</View>
          <Navigator url="/pages/map/map" className="map-entry">
            <View className="map-entry-content">
              <View className="map-icon">🗺️</View>
              <View className="map-text">查看 3D 地球仪/中国地图</View>
            </View>
          </Navigator>
        </View>

        {/* 加载中 */}
        {loading && (
          <View className="loading">
            <Text>加载中...</Text>
          </View>
        )}

        {/* 错误提示 */}
        {error && (
          <View className="error">
            <Text>{error}</Text>
          </View>
        )}
      </View>
    );
  }
}

export default Index;