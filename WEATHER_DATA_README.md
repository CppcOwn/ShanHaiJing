# 天气数据处理系统

## 功能说明

本系统集成了第三方天气 API（OpenWeatherMap），实现了以下功能：

1. **天气数据获取**：根据观测点的经纬度获取实时天气数据
2. **定时更新**：每 25 分钟自动更新天气数据
3. **数据存储**：将天气数据存储到腾讯云 COS
4. **版本控制**：维护天气数据的版本清单，支持历史数据查询
5. **数据清理**：自动清理超过保留期的旧数据

## 系统架构

- **云函数**：`generate-weather-data`，负责获取和处理天气数据
- **定时触发器**：每 25 分钟触发一次云函数
- **存储**：腾讯云 COS，用于存储天气数据和版本清单
- **API**：OpenWeatherMap API，用于获取天气数据

## 部署步骤

1. **配置环境变量**：
   - `TENCENT_SECRET_ID`：腾讯云 SecretId
   - `TENCENT_SECRET_KEY`：腾讯云 SecretKey
   - `OPENWEATHER_API_KEY`：OpenWeatherMap API 密钥

2. **配置 `config.py`**：
   - 填写腾讯云配置信息
   - 确认数据存储路径和缓存时间配置

3. **安装依赖**：
   ```bash
   pip install -r requirements.txt
   ```

4. **部署云函数**：
   使用 Serverless Framework 部署：
   ```bash
   serverless deploy
   ```

## 数据结构

### 天气数据文件

文件名格式：`weather_data_{timestamp}.json`

示例内容：
```json
{
  "weather_data": [
    {
      "observation_point_id": "op1",
      "observation_point_name": "黄山光明顶观测点",
      "weather": {
        "temperature": 22.5,
        "humidity": 65,
        "pressure": 1013,
        "wind_speed": 5.5,
        "wind_deg": 180,
        "weather_main": "晴",
        "weather_description": "晴朗",
        "weather_icon": "01d",
        "visibility": 10000,
        "sunrise": 1620000000,
        "sunset": 1620043200
      },
      "timestamp": 1620000000
    }
  ],
  "timestamp": 1620000000,
  "version": "1.0"
}
```

### 版本清单文件

路径：`weather/version.json`

示例内容：
```json
{
  "latest": "weather_data_1620000000.json",
  "timestamp": 1620000000,
  "history": [
    "weather_data_1619991000.json",
    "weather_data_1620000000.json"
  ],
  "retention_days": 7
}
```

## 代码说明

### `generate_weather_data.py`

- **GenerateWeatherData 类**：
  - `generate_weather_data()`：生成天气数据的主方法
  - `_get_observation_points()`：获取观测点信息
  - `_get_weather_by_coordinates()`：根据经纬度获取天气数据
  - `update_version_list()`：更新版本清单

- **main_handler 函数**：云函数入口
- **test_generate_weather_data 函数**：测试函数

### `serverless.yml`

配置了云函数和定时触发器，每 25 分钟执行一次天气数据更新。

## 注意事项

1. **API 密钥**：需要在 OpenWeatherMap 官网注册并获取 API 密钥
2. **腾讯云配置**：需要填写正确的腾讯云 SecretId、SecretKey 和 COS 配置
3. **数据保留**：系统默认保留 7 天的天气数据，超过保留期的旧数据会被自动清理
4. **定时更新**：系统设置为每 25 分钟更新一次天气数据，符合需求中的 20-30 分钟范围

## 测试方法

运行测试函数：
```bash
python src/functions/generate_weather_data.py
```

## 扩展建议

1. **支持更多天气 API**：可以扩展代码以支持多个天气 API 提供商
2. **增加天气预报**：可以添加获取天气预报的功能
3. **数据可视化**：可以开发前端页面，展示天气数据的变化趋势
4. **异常处理**：可以增加更完善的异常处理机制，确保系统稳定运行
