// 全局配置
window.CDN_BASE = 'https://p1.dlozs.top/';

let jsonData = [];
let groupedData = [];

// 页面加载时自动读取数据
window.addEventListener('DOMContentLoaded', function() {
    loadJSON();
});

// ========== 修改部分：支持多文件加载 ==========
// 加载JSON数据
async function loadJSON() {
    try {
        // 步骤1：读取 json/index.json 获取文件列表
        const indexResponse = await fetch('json/index.json');
        if (!indexResponse.ok) {
            throw new Error('无法加载 json/index.json');
        }
        const indexData = await indexResponse.json();
        
        if (!indexData.files || indexData.files.length === 0) {
            throw new Error('index.json 中没有文件列表');
        }
        
        // 步骤2：并行加载所有数据文件
        const dataPromises = indexData.files.map(fileName => 
            fetch(`json/${fileName}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`无法加载 ${fileName}`);
                    }
                    return response.json();
                })
        );
        
        // 步骤3：等待所有文件加载完成
        const dataArrays = await Promise.all(dataPromises);
        
        // 步骤4：合并所有数据
        jsonData = dataArrays.flat();
        
        groupByUser();
        renderArtistGrid();
        
    } catch (error) {
        document.getElementById('artistGrid').innerHTML = 
            `<div class="loading">加载失败: ${error.message}</div>`;
    }
}
// ========== 修改结束 ==========

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
