import React from 'react';
import './index.css';

interface WeatherData {
  date: string;
  day: string;
  temperature: string;
  description: string;
  icon: string;
  humidity: string;
  wind: string;
}

const Weather: React.FC = () => {
  const currentWeather: WeatherData = {
    temperature: '25',
    description: '晴天',
    icon: '🌤️',
    humidity: '45%',
    wind: '东北风 3级',
    date: '2026-04-15',
    day: '星期一'
  };

  const forecast: WeatherData[] = [
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
  ];

  return (
    <div className="weather-container">
      {/* 当前天气 */}
      <div className="current-weather">
        <div className="current-weather-header">
          <h2 className="current-date">{currentWeather.date} {currentWeather.day}</h2>
        </div>
        <div className="current-weather-content">
          <div className="current-weather-main">
            <span className="current-icon">{currentWeather.icon}</span>
            <h1 className="current-temperature">{currentWeather.temperature}°C</h1>
            <p className="current-description">{currentWeather.description}</p>
          </div>
          <div className="current-weather-details">
            <div className="weather-detail-item">
              <span className="weather-detail-label">湿度</span>
              <span className="weather-detail-value">{currentWeather.humidity}</span>
            </div>
            <div className="weather-detail-item">
              <span className="weather-detail-label">风向</span>
              <span className="weather-detail-value">{currentWeather.wind}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 天气预报 */}
      <div className="forecast-section">
        <h2 className="forecast-title">5天预报</h2>
        <div className="forecast-list">
          {forecast.map((item, index) => (
            <div key={index} className="forecast-item">
              <span className="forecast-date">{item.date}</span>
              <span className="forecast-day">{item.day}</span>
              <span className="forecast-icon">{item.icon}</span>
              <span className="forecast-temperature">{item.temperature}</span>
              <span className="forecast-description">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Weather;