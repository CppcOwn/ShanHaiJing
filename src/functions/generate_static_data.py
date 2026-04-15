import json
import os
import sys
import time

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.config.cos_utils import COSUtils
from src.config.config import DATA_PATHS

class GenerateStaticData:
    def __init__(self):
        self.cos = COSUtils()
    
    def generate_data(self, update_type="full"):
        """
        生成静态数据
        :param update_type: 更新类型，full（全量）或 incremental（增量）
        :return: 数据文件路径
        """
        # 生成数据
        if update_type == "full":
            data = self._generate_full_data()
        else:
            data = self._generate_incremental_data()
        
        # 生成文件路径
        timestamp = int(time.time())
        file_name = f"static_data_{update_type}_{timestamp}.json"
        local_file_path = f"/tmp/{file_name}"
        cos_file_path = f"{DATA_PATHS['static']}/{file_name}"
        
        # 确保临时目录存在
        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
        
        # 写入文件
        with open(local_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 上传到 COS
        self.cos.upload_file(local_file_path, cos_file_path)
        
        # 更新版本清单
        self.update_version_list("static", file_name, update_type)
        
        return cos_file_path
    
    def _generate_full_data(self):
        """
        生成全量静态数据
        :return: 完整的静态数据
        """
        # 景区信息
        scenic_spots = [
            {
                "id": "1",
                "name": "黄山云海",
                "type": "云海",
                "location": "安徽省黄山市",
                "coordinates": {
                    "latitude": 30.1333,
                    "longitude": 118.1667
                },
                "description": "黄山云海是黄山四绝之一，每当云雾缭绕时，山峰若隐若现，如仙境一般。",
                "best_season": "春秋两季",
                "ticket_info": "门票230元/人",
                "official_website": "https://www.huangshan.com/",
                "opening_hours": "全天开放",
                "contact_phone": "0559-5580316",
                "rating": 4.8,
                "image_url": "https://example.com/huangshan.jpg"
            },
            {
                "id": "2",
                "name": "泰山日出",
                "type": "日出",
                "location": "山东省泰安市",
                "coordinates": {
                    "latitude": 36.2607,
                    "longitude": 117.1038
                },
                "description": "泰山日出是泰山最著名的景观之一，每天清晨，太阳从东方升起，光芒万丈。",
                "best_season": "全年",
                "ticket_info": "门票125元/人",
                "official_website": "https://www.mount-taishan.com/",
                "opening_hours": "全天开放",
                "contact_phone": "0538-96008888",
                "rating": 4.7,
                "image_url": "https://example.com/taishan.jpg"
            },
            {
                "id": "3",
                "name": "茶卡盐湖星空",
                "type": "星空",
                "location": "青海省海西蒙古族藏族自治州",
                "coordinates": {
                    "latitude": 36.9047,
                    "longitude": 99.0183
                },
                "description": "茶卡盐湖星空是中国最美的星空观测地之一，夜晚繁星点点，倒映在盐湖中，如梦幻般美丽。",
                "best_season": "夏季",
                "ticket_info": "门票60元/人",
                "official_website": "https://www.chaka盐湖.com/",
                "opening_hours": "全天开放",
                "contact_phone": "0977-8246999",
                "rating": 4.9,
                "image_url": "https://example.com/chaka.jpg"
            }
        ]
        
        # 观测点位信息
        observation_points = [
            {
                "id": "op1",
                "name": "黄山光明顶观测点",
                "type": "云海观测点",
                "location": "安徽省黄山市黄山风景区",
                "coordinates": {
                    "latitude": 30.1389,
                    "longitude": 118.1733
                },
                "altitude": 1860,
                "description": "黄山最高点，视野开阔，是观测云海的最佳位置。",
                "facilities": ["休息区", "观景台", "气象站"],
                "access_info": "从黄山景区南门乘坐缆车到达",
                "scenic_spot_id": "1"
            },
            {
                "id": "op2",
                "name": "泰山日观峰观测点",
                "type": "日出观测点",
                "location": "山东省泰安市泰山风景区",
                "coordinates": {
                    "latitude": 36.2611,
                    "longitude": 117.1056
                },
                "altitude": 1532,
                "description": "泰山最佳日出观测点，每天吸引大量游客前来观赏。",
                "facilities": ["观景台", "休息区"],
                "access_info": "从泰山中天门徒步或乘坐缆车到达",
                "scenic_spot_id": "2"
            },
            {
                "id": "op3",
                "name": "茶卡盐湖湖心观测点",
                "type": "星空观测点",
                "location": "青海省海西蒙古族藏族自治州茶卡盐湖景区",
                "coordinates": {
                    "latitude": 36.9056,
                    "longitude": 99.0194
                },
                "altitude": 3059,
                "description": "茶卡盐湖中心位置，无遮挡，是观测星空的理想地点。",
                "facilities": ["观景台", "休息区"],
                "access_info": "从景区入口乘坐小火车到达",
                "scenic_spot_id": "3"
            }
        ]
        
        return {
            "scenic_spots": scenic_spots,
            "observation_points": observation_points,
            "update_type": "full",
            "timestamp": int(time.time()),
            "version": "1.0"
        }
    
    def _generate_incremental_data(self):
        """
        生成增量静态数据
        :return: 增量静态数据
        """
        # 模拟增量数据（实际应用中应从数据源获取变更）
        incremental_data = {
            "updated_scenic_spots": [
                {
                    "id": "1",
                    "name": "黄山云海",
                    "ticket_info": "门票240元/人",  # 价格更新
                    "rating": 4.9  # 评分更新
                }
            ],
            "new_observation_points": [
                {
                    "id": "op4",
                    "name": "黄山始信峰观测点",
                    "type": "云海观测点",
                    "location": "安徽省黄山市黄山风景区",
                    "coordinates": {
                        "latitude": 30.1417,
                        "longitude": 118.1767
                    },
                    "altitude": 1683,
                    "description": "始信峰是黄山观赏云海的著名地点，以奇松怪石著称。",
                    "facilities": ["观景台", "休息区"],
                    "access_info": "从北海景区徒步到达",
                    "scenic_spot_id": "1"
                }
            ],
            "deleted_items": {
                "scenic_spots": [],
                "observation_points": []
            },
            "update_type": "incremental",
            "timestamp": int(time.time()),
            "version": "1.1"
        }
        
        return incremental_data
    
    def update_version_list(self, data_type, file_name, update_type):
        """
        更新版本清单
        :param data_type: 数据类型
        :param file_name: 文件名
        :param update_type: 更新类型
        """
        # 生成版本清单
        version_list = {
            "latest": file_name,
            "latest_full": file_name if update_type == "full" else None,
            "latest_incremental": file_name if update_type == "incremental" else None,
            "timestamp": int(time.time()),
            "history": [file_name],
            "full_history": [file_name] if update_type == "full" else [],
            "incremental_history": [file_name] if update_type == "incremental" else []
        }
        
        # 读取现有版本清单
        version_file_path = f"{DATA_PATHS[data_type]}/version.json"
        existing_versions = self.cos.list_files(DATA_PATHS[data_type])
        
        if f"{DATA_PATHS[data_type]}/version.json" in existing_versions:
            # 下载并更新版本清单
            local_version_path = f"/tmp/version.json"
            self.cos.download_file(version_file_path, local_version_path)
            
            with open(local_version_path, 'r', encoding='utf-8') as f:
                version_list = json.load(f)
            
            # 添加到历史记录
            if file_name not in version_list["history"]:
                version_list["history"].append(file_name)
            
            # 添加到对应类型的历史记录
            if update_type == "full" and file_name not in version_list.get("full_history", []):
                if "full_history" not in version_list:
                    version_list["full_history"] = []
                version_list["full_history"].append(file_name)
                version_list["latest_full"] = file_name
            elif update_type == "incremental" and file_name not in version_list.get("incremental_history", []):
                if "incremental_history" not in version_list:
                    version_list["incremental_history"] = []
                version_list["incremental_history"].append(file_name)
                version_list["latest_incremental"] = file_name
            
            # 更新最新版本和时间戳
            version_list["latest"] = file_name
            version_list["timestamp"] = int(time.time())
        
        # 上传更新后的版本清单
        local_version_path = f"/tmp/version.json"
        with open(local_version_path, 'w', encoding='utf-8') as f:
            json.dump(version_list, f, ensure_ascii=False, indent=2)
        
        self.cos.upload_file(local_version_path, version_file_path)

# 云函数入口
def main_handler(event, context):
    # 从事件中获取更新类型，默认为全量更新
    update_type = event.get("update_type", "full")
    
    generator = GenerateStaticData()
    file_path = generator.generate_data(update_type)
    return {
        "code": 0,
        "message": f"静态数据{update_type}更新成功",
        "data": {
            "file_path": file_path,
            "update_type": update_type,
            "timestamp": int(time.time())
        }
    }

# 测试函数
def test_generate_data():
    """
    测试数据生成和推送流程
    """
    generator = GenerateStaticData()
    
    # 测试全量更新
    print("测试全量更新...")
    full_path = generator.generate_data("full")
    print(f"全量更新文件路径: {full_path}")
    
    # 测试增量更新
    print("\n测试增量更新...")
    incremental_path = generator.generate_data("incremental")
    print(f"增量更新文件路径: {incremental_path}")
    
    print("\n测试完成！")

if __name__ == "__main__":
    test_generate_data()
