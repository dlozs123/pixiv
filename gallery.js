// 全局配置
window.CDN_BASE = 'https://p1.dlozs.top/';
const MAX_ITEMS_BEFORE_EXPAND = 50;
const ARTISTS_PER_PAGE = 1; // 每页显示1个画师

// 全局变量
let jsonData = [];
let groupedData = [];
let currentPage = 1;
let expandedArtists = new Set();
let targetArtistId = null;

// 模态框相关
let currentViewingList = [];
let currentViewingIndex = -1;

// 懒加载观察器
let imageObserver;

// 侧边栏状态
let sidebarCollapsed = true; // 默认收起

// 页面加载时自动读取 data.json
window.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    targetArtistId = urlParams.get('artist');
    
    loadJSON();
});

// 加载JSON数据
function loadJSON() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载 data.json');
            }
            return response.json();
        })
        .then(data => {
            jsonData = data;
            groupByUser();
            initLazyLoad();
            renderSidebar();
            
            // 如果有指定画师，跳转到该画师所在页
            if (targetArtistId) {
                const artistIndex = groupedData.findIndex(g => g.userId == targetArtistId);
                if (artistIndex !== -1) {
                    currentPage = artistIndex + 1;
                }
            }
            
            renderPage();
        })
        .catch(error => {
            document.getElementById('content').innerHTML = 
                `<div class="loading">加载失败: ${error.message}<br>请确保 data.json 文件存在</div>`;
        });
}

// 按用户分组
function groupByUser() {
    const groups = {};
    jsonData.forEach((item, index) => {
        item._originalIndex = index;
        if (!groups[item.userId]) {
            groups[item.userId] = { 
                user: item.user, 
                userId: item.userId, 
                items: [] 
            };
        }
        groups[item.userId].items.push(item);
    });
    groupedData = Object.values(groups);
}

// 渲染侧边栏
function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    nav.innerHTML = '';
    
    groupedData.forEach((group, index) => {
        const item = document.createElement('div');
        item.className = 'nav-item';
        item.dataset.userId = group.userId;
        item.dataset.page = index + 1;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'nav-item-name';
        nameDiv.textContent = group.user;
        
        const countDiv = document.createElement('div');
        countDiv.className = 'nav-item-count';
        countDiv.textContent = `${group.items.length} 张`;
        
        item.appendChild(nameDiv);
        item.appendChild(countDiv);
        
        item.onclick = () => {
            goToPage(index + 1);
            // 移动端点击后自动收起侧边栏
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        };
        
        nav.appendChild(item);
    });
    
    updateSidebarActive();
}

// 更新侧边栏激活状态
function updateSidebarActive() {
    document.querySelectorAll('.nav-item').forEach(item => {
        const page = parseInt(item.dataset.page);
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 切换侧边栏
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainWrapper = document.querySelector('.main-wrapper');
    
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        mainWrapper.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        mainWrapper.classList.remove('expanded');
    }
}

// 初始化懒加载
function initLazyLoad() {
    if (imageObserver) imageObserver.disconnect();
    
    imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.classList.remove('loading');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '400px' // 提前更多距离加载
    });
}

// 渲染页面
function renderPage() {
    const totalPages = groupedData.length;
    document.getElementById('currentPageNum').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('pagination').style.display = totalPages > 1 ? 'flex' : 'none';

    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';

    if (groupedData.length === 0) {
        contentDiv.innerHTML = '<div class="loading">没有数据</div>';
        return;
    }

    // 只渲染当前页的画师
    const group = groupedData[currentPage - 1];
    if (!group) {
        contentDiv.innerHTML = '<div class="loading">页面不存在</div>';
        return;
    }

    const isExpanded = expandedArtists.has(group.userId);
    const hasMore = group.items.length > MAX_ITEMS_BEFORE_EXPAND;
    const displayItems = (isExpanded || !hasMore) ? group.items : group.items.slice(0, MAX_ITEMS_BEFORE_EXPAND);
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'artist-card';
    cardDiv.dataset.userId = group.userId;

    // 构建头部
    const headerDiv = document.createElement('div');
    headerDiv.className = 'artist-header';
    headerDiv.innerHTML = `
        <div>
            <span class="artist-name">${group.user}</span>
            <span class="artist-id">(ID: ${group.userId})</span>
            <span class="artist-count">共 ${group.items.length} 张</span>
        </div>
    `;
    cardDiv.appendChild(headerDiv);

    // 构建预览网格
    const gridDiv = document.createElement('div');
    gridDiv.className = 'preview-grid';
    
    displayItems.forEach((item) => {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'preview-item';
        
        const mediaWrapper = document.createElement('div');
        mediaWrapper.className = 'preview-media-wrapper';
        
        const ext = item.ext.toLowerCase();
        const isVideo = ext === 'webm';
        
        // 创建图片元素
        const img = document.createElement('img');
        img.className = 'preview-media loading';
        img.dataset.src = generateFileName(item);
        
        imageObserver.observe(img);
        
        mediaWrapper.appendChild(img);
        
        // 视频标识
        if (isVideo) {
            const badge = document.createElement('div');
            badge.className = 'video-badge';
            badge.textContent = 'VIDEO';
            mediaWrapper.appendChild(badge);
            
            const playIcon = document.createElement('div');
            playIcon.className = 'video-play-icon';
            mediaWrapper.appendChild(playIcon);
        }
        
        previewDiv.appendChild(mediaWrapper);
        
        // 图片标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'image-title';
        titleDiv.textContent = getImageTitle(item);
        previewDiv.appendChild(titleDiv);
        
        // 点击预览
        previewDiv.onclick = () => openPreview(group.items, item._originalIndex);
        
        gridDiv.appendChild(previewDiv);
    });

    // 展开按钮
    if (hasMore && !isExpanded) {
        const expandBtn = document.createElement('div');
        expandBtn.className = 'expand-btn';
        expandBtn.textContent = `展开剩余 ${group.items.length - MAX_ITEMS_BEFORE_EXPAND} 张图片`;
        expandBtn.onclick = () => {
            expandedArtists.add(group.userId);
            renderPage();
        };
        gridDiv.appendChild(expandBtn);
    }

    cardDiv.appendChild(gridDiv);
    contentDiv.appendChild(cardDiv);
    
    // 更新侧边栏激活状态
    updateSidebarActive();
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 打开预览
function openPreview(items, startIndex) {
    const modal = document.getElementById('imageModal');
    currentViewingList = items;
    currentViewingIndex = items.findIndex(item => item._originalIndex === startIndex);
    if (currentViewingIndex === -1) currentViewingIndex = 0;
    updateModalContent();
    modal.classList.add('show');
}

// 更新模态框内容
function updateModalContent() {
    const container = document.getElementById('modalContentContainer');
    container.innerHTML = ''; 

    const item = currentViewingList[currentViewingIndex];
    const ext = item.ext.toLowerCase();
    let mediaEl;

    if (ext === 'webm') {
        mediaEl = document.createElement('video');
        mediaEl.controls = true;
        mediaEl.autoplay = true;
        mediaEl.loop = true;
        mediaEl.playsInline = true;
    } else {
        mediaEl = document.createElement('img');
    }

    mediaEl.className = 'modal-content';
    mediaEl.src = generateFileName(item);
    container.appendChild(mediaEl);

    document.getElementById('modalTitle').textContent = getImageTitle(item);

    if(ext === 'webm') {
        mediaEl.play().catch(()=>{});
    }
}

// 切换图片
function changeImage(direction) {
    if (!currentViewingList || currentViewingList.length === 0) return;
    const newIndex = currentViewingIndex + direction;
    if (newIndex >= 0 && newIndex < currentViewingList.length) {
        currentViewingIndex = newIndex;
        updateModalContent();
    }
}

// 关闭模态框
function closeModal(event) {
    if (event.target.id === 'imageModal') performClose();
}

function closeModalDirect() { 
    performClose(); 
}

function performClose() {
    const container = document.getElementById('modalContentContainer');
    const video = container.querySelector('video');
    if (video) {
        video.pause();
        video.src = '';
    }
    container.innerHTML = ''; 
    document.getElementById('imageModal').classList.remove('show');
}

// 翻页
function goToPage(page) {
    const totalPages = groupedData.length;
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPage();
}

// 键盘监听
window.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    const isModalOpen = modal.classList.contains('show');

    if (isModalOpen) {
        if (e.key === 'ArrowLeft') changeImage(-1);
        else if (e.key === 'ArrowRight') changeImage(1);
        else if (e.key === 'Escape') performClose();
    }
});
