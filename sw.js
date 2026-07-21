// 简单的 Service Worker 占位脚本，用于满足 PWA 安装条件
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 保持默认网络请求，不影响现有的 CDN 图片加载
  return;
});