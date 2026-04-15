# 腾讯云配置信息

# 模拟环境配置
TENCENT_CLOUD_CONFIG = {
    "secret_id": "mock_secret_id",  # 腾讯云 SecretId
    "secret_key": "mock_secret_key",  # 腾讯云 SecretKey
    "region": "ap-guangzhou",  # 区域，如 ap-guangzhou、ap-beijing 等
    "cos_bucket": "mock-bucket-1300000000",  # 云存储桶名称
    "cos_region": "ap-guangzhou",  # COS 区域
    "cdn_domain": "mock-cdn.example.com"  # CDN 域名
}

# 数据存储路径
DATA_PATHS = {
    "static": "static",  # 静态数据目录
    "weather": "weather",  # 天气数据目录
    "forecast": "forecast"  # 自然奇观预报数据目录
}

# 缓存时间配置（秒）
CACHE_CONFIG = {
    "static": 86400,  # 静态数据 24 小时
    "weather": 1500,  # 天气数据 25 分钟
    "forecast": 14400,  # 自然奇观预报数据 4 小时
    "version": 300  # 版本清单 5 分钟
}
