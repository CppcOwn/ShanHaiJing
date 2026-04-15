import { Component } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import './weather.css';

interface WeatherData {
  date: string;
  day: string;
  temperature: string;
  description: string;
  icon: string;
  humidity: string;
  wind: string;
}

class Weather extends Component {
  state = {
    currentWeather: {
      temperature: '25',
      description: '晴天',
      icon: '🌤️',
      humidity: '45%',
      wind: '东北风 3级',
      date: '2026-04-15',
      day: '星期一'
    },
    forecast: [
      {
        date: '2026-04-16',
        day: '星期二',
        temperature: '26°C',
        description: '多云',
        icon: '⛅',
        humidity: '40%',
        wind: '东风 2级'
      },
      {
        date: '2026-04-17',
        day: '星期三',
        temperature: '24°C',
        description: '小雨',
        icon: '🌧️',
        humidity: '65%',
        wind: '东南风 4级'
      },
      {
        date: '2026-04-18',
        day: '星期四',
        temperature: '23°C',
        description: '阴',
        icon: '☁️',
        humidity: '55%',
        wind: '南风 3级'
      },
      {
        date: '2026-04-19',
        day: '星期五',
        temperature: '25°C',
        description: '晴天',
        icon: '☀️',
        humidity: '40%',
        wind: '西南风 2级'
      },
      {
        date: '2026-04-20',
        day: '星期六',
        temperature: '27°C',
        description: '晴天',
        icon: '☀️',
        humidity: '35%',
        wind: '西风 3级'
      }
    ],
    loading: false,
    error: ''
  };

  componentDidMount() {
    // 这里可以从API获取天气数据
    // 目前使用模拟数据
  }

  render() {
    const { currentWeather, forecast, loading, error } = this.state;

    if (loading) {
      return (
        <View className="loading">
          <Text>加载中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="error">
          <Text>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView className="weather-container">
        {/* 当前天气 */}
        <View className="current-weather">
          <View className="current-weather-header">
            <Text className="current-date">{currentWeather.date} {currentWeather.day}</Text>
          </View>
          <View className="current-weather-content">
            <View className="current-weather-main">
              <Text className="current-icon">{currentWeather.icon}</Text>
              <Text className="current-temperature">{currentWeather.temperature}°C</Text>
              <Text className="current-description">{currentWeather.description}</Text>
            </View>
            <View className="current-weather-details">
              <View className="weather-detail-item">
                <Text className="weather-detail-label">湿度</Text>
                <Text className="weather-detail-value">{currentWeather.humidity}</Text>
              </View>
              <View className="weather-detail-item">
                <Text className="weather-detail-label">风向</Text>
                <Text className="weather-detail-value">{currentWeather.wind}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 天气预报 */}
        <View className="forecast-section">
          <Text className="forecast-title">5天预报</Text>
          <View className="forecast-list">
            {forecast.map((item, index) => (
              <View key={index} className="forecast-item">
                <Text className="forecast-date">{item.date}</Text>
                <Text className="forecast-day">{item.day}</Text>
                <Text className="forecast-icon">{item.icon}</Text>
                <Text className="forecast-temperature">{item.temperature}</Text>
                <Text className="forecast-description">{item.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default Weather;