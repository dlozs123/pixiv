// 全局配置
window.CDN_BASE = 'https://p1.dlozs.top/';
const MAX_ITEMS_BEFORE_EXPAND = 50;
const ARTISTS_PER_PAGE = 6;

// 全局变量
let jsonData = [];
let groupedData = [];
let currentPage = 1;
let expandedArtists = new Set();

// 模态框相关
let currentViewingList = [];
let currentViewingIndex = -1;

// 懒加载观察器
let imageObserver;

// 页面加载时自动读取 data.json
window.addEventListener('DOMContentLoaded', function() {
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
        rootMargin: '200px' // 提前200px开始加载
    });
}

// 渲染页面
function renderPage() {
    const totalPages = Math.ceil(groupedData.length / ARTISTS_PER_PAGE) || 1;
    document.getElementById('currentPageNum').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('pagination').style.display = totalPages > 1 ? 'flex' : 'none';

    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';

    if (groupedData.length === 0) {
        contentDiv.innerHTML = '<div class="loading">没有数据</div>';
        return;
    }

    const start = (currentPage - 1) * ARTISTS_PER_PAGE;
    const end = start + ARTISTS_PER_PAGE;
    const pageData = groupedData.slice(start, end);

    pageData.forEach((group) => {
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
            
            // 创建图片元素（视频也用图片作为封面）
            const img = document.createElement('img');
            img.className = 'preview-media loading';
            img.dataset.src = generateFileName(item);
            
            // 添加到观察器
            imageObserver.observe(img);
            
            mediaWrapper.appendChild(img);
            
            // 如果是视频，添加标识
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
            
            // 点击预览图放大
            previewDiv.onclick = () => openPreview(group.items, item._originalIndex);
            
            gridDiv.appendChild(previewDiv);
        });

        // 如果有更多内容且未展开，添加展开按钮
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
    });
}

// 打开预览（模态框）
function openPreview(items, startIndex) {
    const modal = document.getElementById('imageModal');
    currentViewingList = items;
    // 在items中找到对应的索引
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

    // 更新标题
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
    const totalPages = Math.ceil(groupedData.length / ARTISTS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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