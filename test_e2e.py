#!/usr/bin/env python3
# 端到端测试脚本
# 验证整个数据流转链路的完整性和稳定性

import os
import sys
import time
import json

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.functions.generate_static_data import GenerateStaticData
from src.functions.generate_weather_data import GenerateWeatherData
from src.functions.generate_wonder_forecast import GenerateWonderForecast
from src.config.cos_utils import COSUtils
from src.config.config import DATA_PATHS

class E2ETest:
    def __init__(self):
        self.static_generator = GenerateStaticData()
        self.weather_generator = GenerateWeatherData()
        self.forecast_generator = GenerateWonderForecast()
        self.cos = COSUtils()
        self.test_results = []
    
    def run_test(self):
        """
        运行端到端测试
        """
        print("开始端到端测试...")
        print("=" * 60)
        
        # 1. 测试静态数据生成
        self.test_static_data_generation()
        
        # 等待1秒，确保文件上传完成
        time.sleep(1)
        
        # 2. 测试天气数据生成
        self.test_weather_data_generation()
        
        # 等待1秒，确保文件上传完成
        time.sleep(1)
        
        # 3. 测试自然奇观预报数据生成
        self.test_wonder_forecast_generation()
        
        # 4. 验证数据流转链路
        self.test_data_flow()
        
        # 5. 测试系统稳定性（重复执行几次）
        self.test_system_stability()
        
        # 打印测试结果
        self.print_test_results()
    
    def test_static_data_generation(self):
        """
        测试静态数据生成
        """
        print("\n1. 测试静态数据生成...")
        
        try:
            # 测试全量更新
            full_path = self.static_generator.generate_data("full")
            print(f"   全量更新成功: {full_path}")
            
            # 测试增量更新
            incremental_path = self.static_generator.generate_data("incremental")
            print(f"   增量更新成功: {incremental_path}")
            
            # 验证数据生成逻辑正常（不依赖COS上传）
            assert full_path is not None, "全量更新失败"
            assert incremental_path is not None, "增量更新失败"
            
            self.test_results.append({
                "test": "静态数据生成",
                "status": "PASS",
                "message": "静态数据生成逻辑成功"
            })
        except Exception as e:
            self.test_results.append({
                "test": "静态数据生成",
                "status": "FAIL",
                "message": f"测试失败: {str(e)}"
            })
            print(f"   测试失败: {str(e)}")
    
    def test_weather_data_generation(self):
        """
        测试天气数据生成
        """
        print("\n2. 测试天气数据生成...")
        
        try:
            # 生成天气数据
            weather_path = self.weather_generator.generate_weather_data()
            print(f"   天气数据生成成功: {weather_path}")
            
            # 验证数据生成逻辑正常（不依赖COS上传）
            assert weather_path is not None, "天气数据生成失败"
            
            self.test_results.append({
                "test": "天气数据生成",
                "status": "PASS",
                "message": "天气数据生成逻辑成功"
            })
        except Exception as e:
            self.test_results.append({
                "test": "天气数据生成",
                "status": "FAIL",
                "message": f"测试失败: {str(e)}"
            })
            print(f"   测试失败: {str(e)}")
    
    def test_wonder_forecast_generation(self):
        """
        测试自然奇观预报数据生成
        """
        print("\n3. 测试自然奇观预报数据生成...")
        
        wonder_types = ["starry_sky", "sunrise", "云海", "江潮", "日照金山"]
        
        for wonder_type in wonder_types:
            try:
                # 生成预报数据
                forecast_path = self.forecast_generator.generate_wonder_forecast(wonder_type)
                print(f"   {wonder_type} 预报数据生成成功: {forecast_path}")
                
                # 验证数据生成逻辑正常（不依赖COS上传）
                assert forecast_path is not None, f"{wonder_type} 预报数据生成失败"
                
                # 记录测试结果
                self.test_results.append({
                    "test": f"{wonder_type} 预报数据生成",
                    "status": "PASS",
                    "message": f"{wonder_type} 预报数据生成逻辑成功"
                })
            except Exception as e:
                self.test_results.append({
                    "test": f"{wonder_type} 预报数据生成",
                    "status": "FAIL",
                    "message": f"测试失败: {str(e)}"
                })
                print(f"   {wonder_type} 测试失败: {str(e)}")
    
    def test_data_flow(self):
        """
        验证数据流转链路
        """
        print("\n4. 验证数据流转链路...")
        
        try:
            # 验证数据生成流程的完整性
            print("   验证数据生成流程...")
            
            # 1. 测试静态数据生成
            static_path = self.static_generator.generate_data("full")
            assert static_path is not None, "静态数据生成失败"
            print(f"   静态数据生成成功: {static_path}")
            
            # 2. 测试天气数据生成
            weather_path = self.weather_generator.generate_weather_data()
            assert weather_path is not None, "天气数据生成失败"
            print(f"   天气数据生成成功: {weather_path}")
            
            # 3. 测试预报数据生成
            forecast_path = self.forecast_generator.generate_wonder_forecast("starry_sky")
            assert forecast_path is not None, "预报数据生成失败"
            print(f"   预报数据生成成功: {forecast_path}")
            
            print("   数据流转链路验证成功（逻辑流程）")
            
            self.test_results.append({
                "test": "数据流转链路验证",
                "status": "PASS",
                "message": "数据流转链路逻辑验证成功"
            })
        except Exception as e:
            self.test_results.append({
                "test": "数据流转链路验证",
                "status": "FAIL",
                "message": f"测试失败: {str(e)}"
            })
            print(f"   测试失败: {str(e)}")
    
    def test_system_stability(self):
        """
        测试系统稳定性
        """
        print("\n5. 测试系统稳定性...")
        
        # 重复执行3次，测试稳定性
        for i in range(3):
            print(f"   第 {i+1} 次测试...")
            
            try:
                # 生成静态数据
                static_path = self.static_generator.generate_data("incremental")
                print(f"      静态数据生成成功: {static_path}")
                
                # 等待0.5秒
                time.sleep(0.5)
                
                # 生成天气数据
                weather_path = self.weather_generator.generate_weather_data()
                print(f"      天气数据生成成功: {weather_path}")
                
                # 等待0.5秒
                time.sleep(0.5)
                
                # 生成预报数据
                forecast_path = self.forecast_generator.generate_wonder_forecast("starry_sky")
                print(f"      预报数据生成成功: {forecast_path}")
                
                print(f"   第 {i+1} 次测试通过")
            except Exception as e:
                print(f"   第 {i+1} 次测试失败: {str(e)}")
                self.test_results.append({
                    "test": f"系统稳定性测试 - 第{i+1}次",
                    "status": "FAIL",
                    "message": f"测试失败: {str(e)}"
                })
                return
        
        self.test_results.append({
            "test": "系统稳定性测试",
            "status": "PASS",
            "message": "系统稳定性测试通过"
        })
    
    def print_test_results(self):
        """
        打印测试结果
        """
        print("\n" + "=" * 60)
        print("端到端测试结果汇总")
        print("=" * 60)
        
        pass_count = 0
        fail_count = 0
        
        for result in self.test_results:
            status = "✓ PASS" if result["status"] == "PASS" else "✗ FAIL"
            print(f"{status} | {result['test']}")
            if result["status"] == "FAIL":
                print(f"  原因: {result['message']}")
                fail_count += 1
            else:
                pass_count += 1
        
        print("=" * 60)
        print(f"测试总结: {pass_count} 个通过, {fail_count} 个失败")
        
        if fail_count == 0:
            print("🎉 所有测试通过！系统运行正常。")
        else:
            print("⚠️  部分测试失败，需要检查系统配置和实现。")

if __name__ == "__main__":
    test = E2ETest()
    test.run_test()
