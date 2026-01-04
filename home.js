// 全局配置
window.CDN_BASE = 'https://p1.dlozs.top/';

let jsonData = [];
let groupedData = [];

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
            renderArtistGrid();
        })
        .catch(error => {
            document.getElementById('artistGrid').innerHTML = 
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
                items: [],
                avatar: null // 暂时为空，未来可以添加
            };
        }
        groups[item.userId].items.push(item);
    });
    groupedData = Object.values(groups);
}

// 渲染画师网格
function renderArtistGrid() {
    const gridDiv = document.getElementById('artistGrid');
    gridDiv.innerHTML = '';

    if (groupedData.length === 0) {
        gridDiv.innerHTML = '<div class="loading">没有数据</div>';
        return;
    }

    groupedData.forEach((group, index) => {
        const card = document.createElement('div');
        card.className = 'artist-card';
        
        // 头像
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'artist-avatar';
        
        if (group.avatar) {
            const img = document.createElement('img');
            img.src = group.avatar;
            img.alt = group.user;
            avatarDiv.appendChild(img);
        } else {
            // 无头像时显示渐变圆圈
            avatarDiv.classList.add('placeholder');
        }
        
        card.appendChild(avatarDiv);
        
        // 画师名称
        const nameDiv = document.createElement('div');
        nameDiv.className = 'artist-name';
        nameDiv.textContent = group.user;
        card.appendChild(nameDiv);
        
        // 作品数量
        const countDiv = document.createElement('div');
        countDiv.className = 'artist-count';
        countDiv.textContent = `${group.items.length} 张作品`;
        card.appendChild(countDiv);
        
        // 点击跳转到内页
        card.onclick = () => {
            window.location.href = `gallery.html?artist=${group.userId}`;
        };
        
        gridDiv.appendChild(card);
    });
}