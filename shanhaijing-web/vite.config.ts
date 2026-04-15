import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 启用压缩插件
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10KB 以上才压缩
      deleteOriginFile: false,
    }),
    // 同时启用 Brotli 压缩
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // 10KB 以上才压缩
      deleteOriginFile: false,
    }),
  ],
  build: {
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'], // 移除 console.log
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 source map
    sourcemap: false,
    // 配置静态资源命名
    rollupOptions: {
      output: {
        // 静态资源文件名添加哈希值，用于缓存控制
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: 'entry/[name].[hash].js',
        // 代码分割
        manualChunks: {
          // 将 React 相关代码打包到一个 chunk
          react: ['react', 'react-dom'],
          // 将 Three.js 相关代码打包到一个 chunk
          three: ['three'],
        },
      },
    },
  },
  // 配置静态资源服务
  server: {
    headers: {
      // 配置缓存策略
      'Cache-Control': 'public, max-age=31536000, immutable',
      // 启用跨域
      'Access-Control-Allow-Origin': '*',
      // 启用压缩
      'Content-Encoding': 'gzip',
    },
  },
  // 配置 CDN 路径
  base: '/', // 生产环境可配置为 CDN 地址
})
