import json
import os
import sys
import time
import requests
from functools import lru_cache

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.cos_utils import COSUtils
from src.config.config import DATA_PATHS, CACHE_CONFIG

class GenerateWeatherData:
    def __init__(self):
        self.cos = COSUtils()
        # 从环境变量中读取 OpenWeatherMap API 密钥
        self.weather_api_key = os.environ.get("OPENWEATHER_API_KEY", "YOUR_OPENWEATHER_API_KEY")
        self.weather_api_base_url = "https://api.openweathermap.org/data/2.5"
        # 本地缓存目录
        self.cache_dir = "/tmp/cache"
        os.makedirs(self.cache_dir, exist_ok=True)
        # 缓存过期时间（秒）
        self.cache_expiry = 300  # 5分钟
    
    def generate_weather_data(self):
        """
        生成天气数据
        :return: 天气数据文件路径
        """
        # 获取观测点信息（带缓存）
        observation_points = self._get_observation_points()
        
        # 批量获取天气数据
        weather_data = self._batch_get_weather_data(observation_points)
        
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
        获取观测点信息（带缓存）
        :return: 观测点列表
        """
        cache_key = "observation_points"
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        # 检查缓存
        if os.path.exists(cache_file):
            cache_time = os.path.getmtime(cache_file)
            if time.time() - cache_time < self.cache_expiry:
                try:
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except Exception as e:
                    print(f"读取缓存失败: {e}")
        
        # 从 COS 下载最新的静态数据
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
                    observation_points = static_data.get('observation_points', [])
                    
                    # 保存到缓存
                    try:
                        with open(cache_file, 'w', encoding='utf-8') as f:
                            json.dump(observation_points, f, ensure_ascii=False, indent=2)
                    except Exception as e:
                        print(f"保存缓存失败: {e}")
                    
                    return observation_points
        
        # 如果无法从 COS 获取，返回默认观测点
        default_points = [
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
        
        # 保存默认观测点到缓存
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(default_points, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存默认观测点缓存失败: {e}")
        
        return default_points
    
    def _batch_get_weather_data(self, observation_points):
        """
        批量获取天气数据
        :param observation_points: 观测点列表
        :return: 天气数据列表
        """
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
        
        return weather_data
    
    @lru_cache(maxsize=100)
    def _get_weather_by_coordinates(self, latitude, longitude):
        """
        根据经纬度获取天气数据（带缓存）
        :param latitude: 纬度
        :param longitude: 经度
        :return: 天气数据
        """
        # 生成缓存键
        cache_key = f"weather_{latitude:.4f}_{longitude:.4f}"
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        # 检查缓存
        if os.path.exists(cache_file):
            cache_time = os.path.getmtime(cache_file)
            if time.time() - cache_time < self.cache_expiry:
                try:
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except Exception as e:
                    print(f"读取天气缓存失败: {e}")
        
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
                result = {
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
                
                # 保存到缓存
                try:
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(result, f, ensure_ascii=False, indent=2)
                except Exception as e:
                    print(f"保存天气缓存失败: {e}")
                
                return result
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
            local_version_path = f"/tmp/{data_type}_version.json"
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
                
                # 异步删除旧文件，减少函数执行时间
                import threading
                def delete_old_files():
                    for old_file in old_files:
                        old_file_path = f"{DATA_PATHS[data_type]}/{old_file}"
                        try:
                            self.cos.delete_file(old_file_path)
                        except Exception as e:
                            print(f"删除旧文件失败 {old_file_path}: {e}")
                
                # 启动线程删除旧文件
                delete_thread = threading.Thread(target=delete_old_files)
                delete_thread.daemon = True
                delete_thread.start()
            
            # 更新最新版本和时间戳
            version_list["latest"] = file_name
            version_list["timestamp"] = int(time.time())
        
        # 上传更新后的版本清单
        local_version_path = f"/tmp/{data_type}_version.json"
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