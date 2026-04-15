# CDN 缓存配置指南

## 缓存策略配置

### 1. 静态资源缓存

对于静态资源（CSS、JavaScript、图片、字体等），建议使用长期缓存策略：

```
# 静态资源缓存规则
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  access_log off;
  try_files $uri =404;
}
```

### 2. HTML 文件缓存

对于 HTML 文件，建议使用短期缓存或不缓存，以确保内容更新时能及时获取：

```
# HTML 文件缓存规则
location ~* \.html$ {
  expires 10m;
  add_header Cache-Control "public, max-age=600";
}
```

### 3. API 请求缓存

对于 API 请求，根据数据更新频率设置合理的缓存时间：

```
# API 缓存规则
location /api/ {
  expires 5m;
  add_header Cache-Control "public, max-age=300";
}
```

## CDN 配置建议

### 1. 启用 GZIP/Brotli 压缩

```
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_vary on;
gzip_comp_level 6;
gzip_min_length 256;

# 启用 Brotli 压缩（如果 CDN 支持）
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
brotli_comp_level 6;
```

### 2. 配置 HTTP/2

```
listen 443 ssl http2;
```

### 3. 启用 OCSP Stapling

```
ssl_stapling on;
ssl_stapling_verify on;
```

### 4. 配置 CORS

```
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type, Authorization";
```

## 部署建议

1. **资源版本控制**：使用文件哈希值作为文件名，确保资源更新时能及时生效
2. **预热缓存**：新部署后，主动请求关键资源以预热 CDN 缓存
3. **监控缓存命中率**：定期检查 CDN 缓存命中率，优化缓存策略
4. **使用多区域 CDN**：根据用户分布选择合适的 CDN 节点，提高全球访问速度

## 注意事项

- 确保静态资源文件名包含哈希值，以便在内容更新时能自动失效缓存
- 对于频繁更新的资源，设置较短的缓存时间
- 对于不常更新的资源，设置较长的缓存时间以提高性能
- 定期清理 CDN 缓存，确保用户能获取到最新内容