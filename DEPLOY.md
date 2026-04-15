# 腾讯云 Serverless 部署指南

## 项目结构

```
/workspace
├── src/
│   ├── config/
│   │   ├── config.py          # 腾讯云配置信息
│   │   └── cos_utils.py       # COS 工具类
│   └── functions/
│       └── generate_static_data.py  # 生成静态数据的云函数
├── requirements.txt           # 项目依赖
└── DEPLOY.md                 # 部署指南
```

## 配置步骤

### 1. 配置腾讯云 API 密钥

在 `src/config/config.py` 文件中填写您的腾讯云 API 密钥信息：

```python
TENCENT_CLOUD_CONFIG = {
    "secret_id": "YOUR_SECRET_ID",  # 腾讯云 SecretId
    "secret_key": "YOUR_SECRET_KEY",  # 腾讯云 SecretKey
    "region": "ap-guangzhou",  # 区域，如 ap-guangzhou、ap-beijing 等
    "cos_bucket": "YOUR_COS_BUCKET",  # 云存储桶名称
    "cos_region": "ap-guangzhou",  # COS 区域
    "cdn_domain": "YOUR_CDN_DOMAIN"  # CDN 域名
}
```

### 2. 创建云存储桶 (COS)

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **对象存储 COS** 服务
3. 点击 **创建存储桶**，填写以下信息：
   - 存储桶名称：使用您在配置文件中设置的 `cos_bucket` 值
   - 区域：选择与 `cos_region` 一致的区域
   - 访问权限：选择 **公有读私有写**
4. 点击 **确定** 创建存储桶

### 3. 配置 CDN 加速

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **内容分发网络 CDN** 服务
3. 点击 **添加域名**，填写以下信息：
   - 加速域名：填写您的自定义域名
   - 源站类型：选择 **对象存储 COS**
   - 源站域名：选择您创建的 COS 存储桶
4. 点击 **下一步**，配置缓存规则：
   - 静态数据：缓存时间 24 小时
   - 天气数据：缓存时间 25 分钟
   - 自然奇观预报数据：缓存时间 4 小时
   - 版本清单：缓存时间 5 分钟
5. 点击 **提交** 完成配置

### 4. 部署云函数

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **云函数 SCF** 服务
3. 点击 **创建函数**，填写以下信息：
   - 函数名称：`generate-static-data`
   - 运行环境：Python 3.9
   - 函数代码：选择 **本地 Zip 文件上传**
4. 打包项目代码：
   ```bash
   cd /workspace
   zip -r function.zip src requirements.txt
   ```
5. 上传打包好的 `function.zip` 文件
6. 配置函数入口：
   - 处理程序：`src.functions.generate_static_data.main_handler`
7. 配置环境变量：
   - 可以选择在云函数控制台中设置环境变量，覆盖配置文件中的值
8. 配置触发器：
   - 选择 **定时触发器**
   - 触发周期：`0 0 * * *`（每天凌晨执行）
9. 点击 **完成** 部署云函数

## 测试部署

1. 在云函数控制台中，点击 **测试** 按钮
2. 输入测试事件（可以使用默认值）
3. 点击 **运行**，查看执行结果
4. 登录 COS 控制台，检查是否生成了静态数据文件

## 监控与维护

1. **日志监控**：在云函数控制台查看执行日志
2. **CDN 监控**：在 CDN 控制台查看访问统计和缓存命中率
3. **COS 监控**：在 COS 控制台查看存储使用情况和访问统计

## 扩展建议

1. **添加更多云函数**：
   - `generate_weather_data.py`：生成天气数据
   - `generate_wonder_forecast.py`：生成自然奇观预报数据

2. **优化缓存策略**：
   - 根据实际访问情况调整 CDN 缓存时间
   - 使用更精细的缓存规则

3. **添加错误处理**：
   - 增加异常捕获和重试机制
   - 配置告警通知

4. **自动化部署**：
   - 使用 CI/CD 工具自动部署代码
   - 配置环境变量管理
