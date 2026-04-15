import json
import os
import sys
import time
import requests

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.config.cos_utils import COSUtils
from src.config.config import DATA_PATHS, CACHE_CONFIG

class GenerateWeatherData:
    def __init__(self):
        self.cos = COSUtils()
        # 从环境变量中读取 OpenWeatherMap API 密钥
        self.weather_api_key = os.environ.get("OPENWEATHER_API_KEY", "YOUR_OPENWEATHER_API_KEY")
        self.weather_api_base_url = "https://api.openweathermap.org/data/2.5"
    
    def generate_weather_data(self):
        """
        生成天气数据
        :return: 天气数据文件路径
        """
        # 获取观测点信息
        observation_points = self._get_observation_points()
        
        # 获取每个观测点的天气数据
        weather_data = []
        for point in observation_points:
            point_weather = self._get_weather_by_coordinates(
                point['coordinates']['latitude'],
                point['coordinates']['longitude']
            )
            if point_weather:
                weather_data.append({
                    "observation_point_id": point['id'],
                    "observation_point_name": point['name'],
                    "weather": point_weather,
                    "timestamp": int(time.time())
                })
        
        # 生成文件路径
        timestamp = int(time.time())
        file_name = f"weather_data_{timestamp}.json"
        local_file_path = f"/tmp/{file_name}"
        cos_file_path = f"{DATA_PATHS['weather']}/{file_name}"
        
        # 确保临时目录存在
        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
        
        # 写入文件
        data = {
            "weather_data": weather_data,
            "timestamp": timestamp,
            "version": "1.0"
        }
        
        with open(local_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 上传到 COS
        self.cos.upload_file(local_file_path, cos_file_path)
        
        # 更新版本清单
        self.update_version_list("weather", file_name)
        
        return cos_file_path
    
    def _get_observation_points(self):
        """
        获取观测点信息
        :return: 观测点列表
        """
        # 这里从静态数据中获取观测点信息，实际应用中可能需要从其他数据源获取
        # 先尝试从 COS 下载最新的静态数据
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
    
    def _get_weather_by_coordinates(self, latitude, longitude):
        """
        根据经纬度获取天气数据
        :param latitude: 纬度
        :param longitude: 经度
        :return: 天气数据
        """
        try:
            url = f"{self.weather_api_base_url}/weather"
            params = {
                "lat": latitude,
                "lon": longitude,
                "appid": self.weather_api_key,
                "units": "metric",  # 使用摄氏度
                "lang": "zh_cn"  # 使用中文
            }
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                weather_data = response.json()
                # 提取需要的天气信息
                return {
                    "temperature": weather_data.get("main", {}).get("temp"),
                    "humidity": weather_data.get("main", {}).get("humidity"),
                    "pressure": weather_data.get("main", {}).get("pressure"),
                    "wind_speed": weather_data.get("wind", {}).get("speed"),
                    "wind_deg": weather_data.get("wind", {}).get("deg"),
                    "weather_main": weather_data.get("weather", [{}])[0].get("main"),
                    "weather_description": weather_data.get("weather", [{}])[0].get("description"),
                    "weather_icon": weather_data.get("weather", [{}])[0].get("icon"),
                    "visibility": weather_data.get("visibility"),
                    "sunrise": weather_data.get("sys", {}).get("sunrise"),
                    "sunset": weather_data.get("sys", {}).get("sunset")
                }
        except Exception as e:
            print(f"获取天气数据失败: {e}")
        return None
    
    def update_version_list(self, data_type, file_name):
        """
        更新版本清单
        :param data_type: 数据类型
        :param file_name: 文件名
        """
        # 生成版本清单
        version_list = {
            "latest": file_name,
            "timestamp": int(time.time()),
            "history": [file_name],
            "retention_days": 7  # 保留7天的数据
        }
        
        # 读取现有版本清单
        version_file_path = f"{DATA_PATHS[data_type]}/version.json"
        existing_versions = self.cos.list_files(DATA_PATHS[data_type])
        
        if f"{DATA_PATHS[data_type]}/version.json" in existing_versions:
            # 下载并更新版本清单
            local_version_path = f"/tmp/weather_version.json"
            self.cos.download_file(version_file_path, local_version_path)
            
            with open(local_version_path, 'r', encoding='utf-8') as f:
                version_list = json.load(f)
            
            # 添加到历史记录
            if file_name not in version_list["history"]:
                version_list["history"].append(file_name)
            
            # 保持历史记录不超过保留天数对应的文件数（每25分钟更新一次，每天48次，7天336次）
            max_history = 336
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
        local_version_path = f"/tmp/weather_version.json"
        with open(local_version_path, 'w', encoding='utf-8') as f:
            json.dump(version_list, f, ensure_ascii=False, indent=2)
        
        self.cos.upload_file(local_version_path, version_file_path)

# 云函数入口
def main_handler(event, context):
    generator = GenerateWeatherData()
    file_path = generator.generate_weather_data()
    return {
        "code": 0,
        "message": "天气数据更新成功",
        "data": {
            "file_path": file_path,
            "timestamp": int(time.time())
        }
    }

# 测试函数
def test_generate_weather_data():
    """
    测试天气数据生成和推送流程
    """
    generator = GenerateWeatherData()
    print("测试天气数据生成...")
    file_path = generator.generate_weather_data()
    print(f"天气数据文件路径: {file_path}")
    print("测试完成！")

if __name__ == "__main__":
    test_generate_weather_data()
