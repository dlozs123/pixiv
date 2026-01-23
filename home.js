// 全局配置
window.CDN_BASE = 'https://p1.dlozs.top/';

let jsonData = [];
let groupedData = [];
let categoriesData = {}; // 新增：存储分类数据
let categoryStructure = []; // 新增：分类树结构

// 页面加载时自动读取数据
window.addEventListener('DOMContentLoaded', function() {
    loadJSON();
});

// ========== 修改部分：支持多文件加载 + 分类 ==========
// 加载JSON数据
async function loadJSON() {
    try {
        // 并行加载：数据索引、分类数据
        const [indexRes, catRes] = await Promise.all([
            fetch('json/index.json'),
            fetch('json/categories.json').catch(() => ({ ok: false })) // 分类文件可能不存在
        ]);

        if (!indexRes.ok) {
            throw new Error('无法加载 json/index.json');
        }
        const indexData = await indexRes.json();
        
        if (!indexData.files || indexData.files.length === 0) {
            throw new Error('index.json 中没有文件列表');
        }

        // 加载分类数据
        if (catRes.ok) {
            categoriesData = await catRes.json();
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
        buildCategoryTree(); // 新增：构建分类树
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

// ========== 新增：构建分类树 ==========
function buildCategoryTree() {
    // 1. 初始化分类桶
    const buckets = {};
    buckets["未分类"] = [];

    // 2. 将 categoriesData 中的分类初始化
    for (let cat in categoriesData) {
        buckets[cat] = [];
    }

    // 3. 将画师分配到桶中
    const userToCategory = {};
    for (let cat in categoriesData) {
        categoriesData[cat].forEach(uid => {
            userToCategory[uid] = cat;
        });
    }

    groupedData.forEach(group => {
        const catName = userToCategory[group.userId] || "未分类";
        buckets[catName].push(group);
    });

    // 4. 转换为数组以便渲染
    categoryStructure = Object.keys(buckets).map(key => ({
        name: key,
        groups: buckets[key]
    })).sort((a, b) => {
        if (a.name === "未分类") return 1;
        if (b.name === "未分类") return -1;
        return a.name.localeCompare(b.name, 'zh-CN');
    });
}
// ========== 新增结束 ==========

// ========== 修改：按分类渲染画师网格 ==========
function renderArtistGrid() {
    const gridDiv = document.getElementById('artistGrid');
    gridDiv.innerHTML = '';

    if (categoryStructure.length === 0) {
        gridDiv.innerHTML = '<div class="loading">没有数据</div>';
        return;
    }

    categoryStructure.forEach(cat => {
        // 如果分类下没有画师，跳过
        if (cat.groups.length === 0) return;

        // 添加分类标题
        const catHeader = document.createElement('div');
        catHeader.className = 'category-header';
        catHeader.innerHTML = `
            <h2>${cat.name}</h2>
            <span class="category-count">${cat.groups.length} 位画师</span>
        `;
        gridDiv.appendChild(catHeader);

        // 添加该分类下的画师网格
        const artistGrid = document.createElement('div');
        artistGrid.className = 'artist-grid-inner';

        cat.groups.forEach(group => {
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
            
            artistGrid.appendChild(card);
        });

        gridDiv.appendChild(artistGrid);
    });
}
// ========== 修改结束 ==========
