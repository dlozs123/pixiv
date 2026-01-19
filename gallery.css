* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: "Microsoft YaHei", Arial, sans-serif;
    background: #f5f5f5;
    overflow-x: hidden;
}

/* 侧边栏 */
.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 260px;
    height: 100vh;
    background: white;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    z-index: 900;
    overflow-y: auto;
    transform: translateX(-260px); /* 默认收起 */
}

.sidebar.show {
    transform: translateX(0); /* 展开状态 */
}

.sidebar-header {
    padding: 20px;
    background: #2196F3;
    color: white;
}

.sidebar-header h3 {
    font-size: 18px;
    font-weight: 600;
}

.sidebar-nav {
    padding: 10px 0;
}

.nav-item {
    padding: 12px 20px;
    cursor: pointer;
    transition: background 0.2s;
    border-left: 3px solid transparent;
}

.nav-item:hover {
    background: #f5f5f5;
}

.nav-item.active {
    background: #e3f2fd;
    border-left-color: #2196F3;
    color: #2196F3;
    font-weight: 600;
}

.nav-item-name {
    font-size: 14px;
    color: #333;
    margin-bottom: 3px;
}

.nav-item.active .nav-item-name {
    color: #2196F3;
}

.nav-item-count {
    font-size: 12px;
    color: #999;
}

/* 浮动按钮 */
.sidebar-toggle {
    position: fixed;
    left: 20px;
    top: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #2196F3;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 901;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.sidebar-toggle:hover {
    background: #1976D2;
    transform: scale(1.1);
}

.toggle-icon {
    font-size: 24px;
}

/* 主内容区域 */
.main-wrapper {
    margin-left: 0; /* 默认侧边栏收起，不留边距 */
    transition: margin-left 0.3s ease;
    padding: 20px;
    min-height: 100vh;
}

.main-wrapper.sidebar-open {
    margin-left: 260px; /* 侧边栏展开时留边距 */
}

.container {
    max-width: 1600px;
    margin: 0 auto;
}

/* 顶部导航 */
.top-nav {
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.back-btn {
    color: #2196F3;
    text-decoration: none;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s;
}

.back-btn:hover {
    color: #1976D2;
}

/* 主内容区 - 单个画师占满 */
.main-content {
    min-height: 500px;
}

/* 画师卡片 */
.artist-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.artist-header {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
    border-bottom: 2px solid #eee;
}

.artist-name {
    font-weight: bold;
    font-size: 18px;
    color: #333;
}

.artist-id {
    font-size: 13px;
    color: #999;
    margin-left: 10px;
}

.artist-count {
    margin-left: 10px;
    color: #666;
    font-size: 13px;
}

/* 预览网格 */
.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    padding: 15px;
}

.preview-item {
    position: relative;
    overflow: hidden;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 6px;
    transition: transform 0.2s;
}

.preview-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.preview-item:hover .preview-media {
    transform: scale(1.08);
}

.preview-media-wrapper {
    position: relative;
    padding-top: 100%;
    overflow: hidden;
}

.preview-media {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
    background: #e0e0e0;
}

.preview-media.loading {
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* 视频标识 */
.video-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
    z-index: 10;
    pointer-events: none;
}

.video-play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 10;
}

.video-play-icon::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 18px solid white;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    margin-left: 4px;
}

/* 图片标题 */
.image-title {
    padding: 10px;
    font-size: 13px;
    color: #666;
    word-break: break-word;
    line-height: 1.5;
    min-height: 45px;
    background: #fafafa;
    border-top: 1px solid #eee;
}

/* 展开按钮 */
.expand-btn {
    grid-column: 1 / -1;
    padding: 20px;
    background: #f5f5f5;
    border: 2px dashed #ddd;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    color: #666;
    font-size: 15px;
    transition: all 0.2s;
    font-weight: 500;
}

.expand-btn:hover {
    background: #e8f4fd;
    border-color: #2196F3;
    color: #2196F3;
}

/* 模态框 */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.95);
    justify-content: center;
    align-items: center;
}

.modal.show { 
    display: flex; 
}

.modal-content-wrapper {
    position: relative;
    max-width: 90%;
    max-height: 90vh;
    display: flex;
    align-items: center;
}

.modal-content {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    display: block;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.modal-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.2);
    color: white;
    border: none;
    font-size: 40px;
    padding: 20px;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.3s;
    z-index: 1002;
}

.modal-nav:hover { 
    background: rgba(255,255,255,0.4); 
}

.modal-nav.prev { 
    left: -60px; 
}

.modal-nav.next { 
    right: -60px; 
}

.modal-close {
    position: absolute;
    top: -40px;
    right: 0;
    color: #ccc;
    font-size: 30px;
    cursor: pointer;
    z-index: 1001;
}

.modal-close:hover { 
    color: white; 
}

.modal-title {
    position: absolute;
    bottom: -40px;
    left: 0;
    right: 0;
    color: white;
    text-align: center;
    font-size: 14px;
    z-index: 1001;
}

/* 分页 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination button {
    padding: 10px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    background: #2196F3;
    color: white;
    font-weight: 500;
}

.pagination button:hover:not(:disabled) {
    background: #1976D2;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.pagination button:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

.page-info {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.loading { 
    text-align: center; 
    padding: 60px 20px; 
    color: #666; 
    font-size: 16px;
    width: 100%; 
}

/* 响应式 */
@media (max-width: 1200px) {
    .preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
}

@media (max-width: 768px) {
    .sidebar {
        width: 220px;
        transform: translateX(-220px); /* 移动端默认也是收起 */
    }
    
    .sidebar.show {
        transform: translateX(0);
    }
    
    .main-wrapper {
        margin-left: 0;
    }
    
    .main-wrapper.sidebar-open {
        margin-left: 0; /* 移动端侧边栏展开时不留边距，覆盖在内容上 */
    }
    
    .preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
    }
    
    .sidebar-toggle {
        left: 10px;
        top: 10px;
        width: 45px;
        height: 45px;
    }
    
    .artist-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
