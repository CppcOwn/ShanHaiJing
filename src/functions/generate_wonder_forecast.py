import json
import os
import sys
import time
import math

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.config.cos_utils import COSUtils
from src.config.config import DATA_PATHS, CACHE_CONFIG

class GenerateWonderForecast:
    def __init__(self):
        self.cos = COSUtils()
    
    def generate_wonder_forecast(self, wonder_type):
        """
        生成自然奇观预报数据
        :param wonder_type: 奇观类型 (starry_sky, sunrise,云海,江潮,日照金山)
        :return: 预报数据文件路径
        """
        # 获取观测点信息
        observation_points = self._get_observation_points()
        
        # 获取最新的天气数据
        weather_data = self._get_latest_weather_data()
        
        # 生成预报数据
        forecast_data = []
        for point in observation_points:
            # 获取该观测点的天气数据
            point_weather = None
            for weather_item in weather_data:
                if weather_item['observation_point_id'] == point['id']:
                    point_weather = weather_item['weather']
                    break
            
            if point_weather:
                # 根据奇观类型和天气数据生成预报
                forecast = self._generate_forecast_for_wonder(point, point_weather, wonder_type)
                if forecast:
                    forecast_data.append(forecast)
        
        # 生成文件路径
        timestamp = int(time.time())
        file_name = f"wonder_forecast_{wonder_type}_{timestamp}.json"
        local_file_path = f"/tmp/{file_name}"
        cos_file_path = f"{DATA_PATHS['forecast']}/{file_name}"
        
        # 确保临时目录存在
        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
        
        # 写入文件
        data = {
            "forecast_data": forecast_data,
            "wonder_type": wonder_type,
            "timestamp": timestamp,
            "version": "1.0"
        }
        
        with open(local_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 上传到 COS
        self.cos.upload_file(local_file_path, cos_file_path)
        
        # 更新版本清单
        self.update_version_list("forecast", file_name, wonder_type)
        
        return cos_file_path
    
    def _get_observation_points(self):
        """
        获取观测点信息
        :return: 观测点列表
        """
        # 尝试从 COS 下载最新的静态数据
        static_version_file = f"{DATA_PATHS['static']}/version.json"
        local_version_path = f"/tmp/static_version.json"
        
        if self.cos.download_file(static_version_file, local_version_path):
            with open(local_version_path, 'r', encoding='utf-8') as f:
                version_data = json.load(f)
            
            latest_static_file = version_data.get('latest')
            if latest_static_file:
                local_static_path = f"/tmp/{latest_static_file}"
                if self.cos.download_file(f"{DATA_PATHS['static']}/{latest_static_file}", local_static_path):
                    with open(local_static_path, 'r', encoding='utf-8') as f:
                        static_data = json.load(f)
                    return static_data.get('observation_points', [])
        
        # 如果无法从 COS 获取，返回默认观测点
        return [
            {
                "id": "op1",
                "name": "黄山光明顶观测点",
                "coordinates": {
                    "latitude": 30.1389,
                    "longitude": 118.1733
                }
            },
            {
                "id": "op2",
                "name": "泰山日观峰观测点",
                "coordinates": {
                    "latitude": 36.2611,
                    "longitude": 117.1056
                }
            },
            {
                "id": "op3",
                "name": "茶卡盐湖湖心观测点",
                "coordinates": {
                    "latitude": 36.9056,
                    "longitude": 99.0194
                }
            }
        ]
    
    def _get_latest_weather_data(self):
        """
        获取最新的天气数据
        :return: 天气数据
        """
        # 尝试从 COS 下载最新的天气数据
        weather_version_file = f"{DATA_PATHS['weather']}/version.json"
        local_version_path = f"/tmp/weather_version.json"
        
        if self.cos.download_file(weather_version_file, local_version_path):
            with open(local_version_path, 'r', encoding='utf-8') as f:
                version_data = json.load(f)
            
            latest_weather_file = version_data.get('latest')
            if latest_weather_file:
                local_weather_path = f"/tmp/{latest_weather_file}"
                if self.cos.download_file(f"{DATA_PATHS['weather']}/{latest_weather_file}", local_weather_path):
                    with open(local_weather_path, 'r', encoding='utf-8') as f:
                        weather_data = json.load(f)
                    return weather_data.get('weather_data', [])
        
        # 如果无法从 COS 获取，返回空列表
        return []
    
    def _generate_forecast_for_wonder(self, point, weather, wonder_type):
        """
        根据奇观类型和天气数据生成预报
        :param point: 观测点信息
        :param weather: 天气数据
        :param wonder_type: 奇观类型
        :return: 预报数据
        """
        forecast = {
            "observation_point_id": point['id'],
            "observation_point_name": point['name'],
            "wonder_type": wonder_type,
            "probability": 0,
            "best_time": [],
            "conditions": {},
            "timestamp": int(time.time())
        }
        
        # 根据奇观类型生成预报
        if wonder_type == "starry_sky":
            forecast['probability'] = self._calculate_starry_sky_probability(weather)
            forecast['best_time'] = self._calculate_starry_sky_best_time(weather)
            forecast['conditions'] = {
                "cloud_cover": weather.get('weather_main') == "Clear",
                "visibility": weather.get('visibility', 0) > 10000,
                "moon_phase": self._estimate_moon_phase()
            }
        elif wonder_type == "sunrise":
            forecast['probability'] = self._calculate_sunrise_probability(weather)
            forecast['best_time'] = self._calculate_sunrise_best_time(weather)
            forecast['conditions'] = {
                "cloud_cover": weather.get('weather_main') in ["Clear", "Few clouds"],
                "humidity": weather.get('humidity', 100) < 80
            }
        elif wonder_type == "云海":
            forecast['probability'] = self._calculate_sea_of_clouds_probability(weather)
            forecast['best_time'] = self._calculate_sea_of_clouds_best_time()
            forecast['conditions'] = {
                "humidity": weather.get('humidity', 0) > 70,
                "temperature": weather.get('temperature', 0) < 15,
                "wind_speed": weather.get('wind_speed', 10) < 5
            }
        elif wonder_type == "江潮":
            forecast['probability'] = self._calculate_tidal_bore_probability(weather)
            forecast['best_time'] = self._calculate_tidal_bore_best_time()
            forecast['conditions'] = {
                "wind_speed": weather.get('wind_speed', 10) < 3,
                "visibility": weather.get('visibility', 0) > 5000
            }
        elif wonder_type == "日照金山":
            forecast['probability'] = self._calculate_golden_mountain_probability(weather)
            forecast['best_time'] = self._calculate_golden_mountain_best_time(weather)
            forecast['conditions'] = {
                "cloud_cover": weather.get('weather_main') == "Clear",
                "time_of_day": "日出或日落时分"
            }
        
        return forecast
    
    def _calculate_starry_sky_probability(self, weather):
        """
        计算星空观测概率
        :param weather: 天气数据
        :return: 概率 (0-100)
        """
        probability = 0
        
        # 晴朗的天气
        if weather.get('weather_main') == "Clear":
            probability += 40
        elif weather.get('weather_main') == "Few clouds":
            probability += 20
        
        # 能见度
        visibility = weather.get('visibility', 0)
        if visibility > 10000:
            probability += 30
        elif visibility > 5000:
            probability += 15
        
        # 湿度
        humidity = weather.get('humidity', 100)
        if humidity < 60:
            probability += 20
        elif humidity < 80:
            probability += 10
        
        # 风速
        wind_speed = weather.get('wind_speed', 10)
        if wind_speed < 3:
            probability += 10
        
        return min(probability, 100)
    
    def _calculate_sunrise_probability(self, weather):
        """
        计算日出观测概率
        :param weather: 天气数据
        :return: 概率 (0-100)
        """
        probability = 0
        
        # 晴朗或少云的天气
        if weather.get('weather_main') == "Clear":
            probability += 50
        elif weather.get('weather_main') == "Few clouds":
            probability += 30
        
        # 湿度
        humidity = weather.get('humidity', 100)
        if humidity < 70:
            probability += 20
        elif humidity < 85:
            probability += 10
        
        # 风速
        wind_speed = weather.get('wind_speed', 10)
        if wind_speed < 4:
            probability += 20
        elif wind_speed < 6:
            probability += 10
        
        # 能见度
        visibility = weather.get('visibility', 0)
        if visibility > 8000:
            probability += 10
        
        return min(probability, 100)
    
    def _calculate_sea_of_clouds_probability(self, weather):
        """
        计算云海观测概率
        :param weather: 天气数据
        :return: 概率 (0-100)
        """
        probability = 0
        
        # 湿度
        humidity = weather.get('humidity', 0)
        if humidity > 80:
            probability += 40
        elif humidity > 70:
            probability += 25
        
        # 温度
        temperature = weather.get('temperature', 0)
        if temperature < 10:
            probability += 30
        elif temperature < 15:
            probability += 15
        
        # 风速
        wind_speed = weather.get('wind_speed', 10)
        if wind_speed < 3:
            probability += 20
        elif wind_speed < 5:
            probability += 10
        
        # 天气状况
        if weather.get('weather_main') in ["Clouds", "Mist"]:
            probability += 10
        
        return min(probability, 100)
    
    def _calculate_tidal_bore_probability(self, weather):
        """
        计算江潮观测概率
        :param weather: 天气数据
        :return: 概率 (0-100)
        """
        probability = 0
        
        # 风速
        wind_speed = weather.get('wind_speed', 10)
        if wind_speed < 2:
            probability += 40
        elif wind_speed < 3:
            probability += 20
        
        # 能见度
        visibility = weather.get('visibility', 0)
        if visibility > 8000:
            probability += 30
        elif visibility > 5000:
            probability += 15
        
        # 天气状况
        if weather.get('weather_main') in ["Clear", "Few clouds"]:
            probability += 30
        
        return min(probability, 100)
    
    def _calculate_golden_mountain_probability(self, weather):
        """
        计算日照金山观测概率
        :param weather: 天气数据
        :return: 概率 (0-100)
        """
        probability = 0
        
        # 晴朗的天气
        if weather.get('weather_main') == "Clear":
            probability += 60
        elif weather.get('weather_main') == "Few clouds":
            probability += 30
        
        # 能见度
        visibility = weather.get('visibility', 0)
        if visibility > 10000:
            probability += 20
        elif visibility > 8000:
            probability += 10
        
        # 湿度
        humidity = weather.get('humidity', 100)
        if humidity < 60:
            probability += 20
        
        return min(probability, 100)
    
    def _calculate_starry_sky_best_time(self, weather):
        """
        计算星空观测最佳时间
        :param weather: 天气数据
        :return: 最佳观测时间列表
        """
        # 夜晚时间（22:00 - 04:00）
        return ["22:00-00:00", "00:00-02:00", "02:00-04:00"]
    
    def _calculate_sunrise_best_time(self, weather):
        """
        计算日出观测最佳时间
        :param weather: 天气数据
        :return: 最佳观测时间列表
        """
        # 日出前后
        sunrise_time = weather.get('sunrise', int(time.time()))
        sunrise_hour = time.strftime('%H:%M', time.localtime(sunrise_time))
        
        # 解析日出时间
        hour, minute = map(int, sunrise_hour.split(':'))
        
        # 计算最佳观测时间（日出前30分钟到日出后15分钟）
        best_start_hour = hour
        best_start_minute = minute - 30
        if best_start_minute < 0:
            best_start_hour -= 1
            best_start_minute += 60
        
        best_end_hour = hour
        best_end_minute = minute + 15
        if best_end_minute >= 60:
            best_end_hour += 1
            best_end_minute -= 60
        
        best_start = f"{best_start_hour:02d}:{best_start_minute:02d}"
        best_end = f"{best_end_hour:02d}:{best_end_minute:02d}"
        
        return [f"{best_start}-{best_end}"]
    
    def _calculate_sea_of_clouds_best_time(self):
        """
        计算云海观测最佳时间
        :return: 最佳观测时间列表
        """
        # 早晨和傍晚
        return ["05:00-07:00", "17:00-19:00"]
    
    def _calculate_tidal_bore_best_time(self):
        """
        计算江潮观测最佳时间
        :return: 最佳观测时间列表
        """
        # 每日特定时间（根据实际潮汐规律调整）
        return ["12:00-14:00", "23:00-01:00"]
    
    def _calculate_golden_mountain_best_time(self, weather):
        """
        计算日照金山观测最佳时间
        :param weather: 天气数据
        :return: 最佳观测时间列表
        """
        # 日出和日落时分
        sunrise_time = weather.get('sunrise', int(time.time()))
        sunset_time = weather.get('sunset', int(time.time()))
        
        sunrise_hour = time.strftime('%H:%M', time.localtime(sunrise_time))
        sunset_hour = time.strftime('%H:%M', time.localtime(sunset_time))
        
        return [f"{sunrise_hour}-{int(sunrise_hour.split(':')[0])+1:02d}:00", 
                f"{int(sunset_hour.split(':')[0])-1:02d}:00-{sunset_hour}"]
    
    def _estimate_moon_phase(self):
        """
        估算月相
        :return: 月相描述
        """
        # 简单的月相估算
        days_since_new_moon = int(time.time() / 86400) % 29.5
        if days_since_new_moon < 3:
            return "新月"
        elif days_since_new_moon < 7:
            return "上弦月"
        elif days_since_new_moon < 15:
            return "满月"
        elif days_since_new_moon < 22:
            return "下弦月"
        else:
            return "残月"
    
    def update_version_list(self, data_type, file_name, wonder_type):
        """
        更新版本清单
        :param data_type: 数据类型
        :param file_name: 文件名
        :param wonder_type: 奇观类型
        """
        # 生成版本清单
        version_list = {
            "latest": file_name,
            "timestamp": int(time.time()),
            "history": [file_name],
            "retention_days": 7  # 保留7天的数据
        }
        
        # 读取现有版本清单
        version_file_path = f"{DATA_PATHS[data_type]}/{wonder_type}_version.json"
        existing_versions = self.cos.list_files(DATA_PATHS[data_type])
        
        if f"{DATA_PATHS[data_type]}/{wonder_type}_version.json" in existing_versions:
            # 下载并更新版本清单
            local_version_path = f"/tmp/{wonder_type}_version.json"
            self.cos.download_file(version_file_path, local_version_path)
            
            with open(local_version_path, 'r', encoding='utf-8') as f:
                version_list = json.load(f)
            
            # 添加到历史记录
            if file_name not in version_list["history"]:
                version_list["history"].append(file_name)
            
            # 根据奇观类型设置不同的历史记录保留数量
            if wonder_type in ["starry_sky", "sunrise"]:
                # 每日更新，保留7天
                max_history = 7
            else:
                # 每4小时更新，每天6次，保留7天
                max_history = 42
            
            if len(version_list["history"]) > max_history:
                # 删除多余的历史记录
                old_files = version_list["history"][:-max_history]
                version_list["history"] = version_list["history"][-max_history:]
                
                # 删除旧文件
                for old_file in old_files:
                    old_file_path = f"{DATA_PATHS[data_type]}/{old_file}"
                    self.cos.delete_file(old_file_path)
            
            # 更新最新版本和时间戳
            version_list["latest"] = file_name
            version_list["timestamp"] = int(time.time())
        
        # 上传更新后的版本清单
        local_version_path = f"/tmp/{wonder_type}_version.json"
        with open(local_version_path, 'w', encoding='utf-8') as f:
            json.dump(version_list, f, ensure_ascii=False, indent=2)
        
        self.cos.upload_file(local_version_path, version_file_path)

# 云函数入口
def main_handler(event, context):
    generator = GenerateWonderForecast()
    wonder_type = event.get('wonder_type', 'starry_sky')
    file_path = generator.generate_wonder_forecast(wonder_type)
    return {
        "code": 0,
        "message": f"{wonder_type} 预报数据更新成功",
        "data": {
            "file_path": file_path,
            "timestamp": int(time.time())
        }
    }

# 测试函数
def test_generate_wonder_forecast():
    """
    测试自然奇观预报数据生成和推送流程
    """
    generator = GenerateWonderForecast()
    wonder_types = ["starry_sky", "sunrise", "云海", "江潮", "日照金山"]
    
    for wonder_type in wonder_types:
        print(f"测试 {wonder_type} 预报数据生成...")
        file_path = generator.generate_wonder_forecast(wonder_type)
        print(f"{wonder_type} 预报数据文件路径: {file_path}")
    
    print("测试完成！")

if __name__ == "__main__":
    test_generate_wonder_forecast()
