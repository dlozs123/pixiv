// 全局配置
window.CDN_BASE = 'https://p1.dlozs.top/';
// 新增：角色头像CDN地址
window.CHARACTER_AVATAR_BASE = 'https://r4.dlozs.top/character/';

let jsonData = [];
let groupedData = [];
let categoriesData = {}; 
let categoryStructure = [];

// ========== 角色管理变量 ==========
let allCharacters = [];     
let currentCharacter = '';
// ========== 新增结束 ==========

// 页面加载时
window.addEventListener('DOMContentLoaded', function() {
    loadUserList();
});

// ========== 新增：加载角色列表 ==========
async function loadUserList() {
    try {
        const res = await fetch('json/user.json');
        if (!res.ok) throw new Error('无法加载角色列表');
        
        allCharacters = await res.json();
        
        if (allCharacters.length === 0) {
            throw new Error('角色列表为空');
        }

        const urlParams = new URLSearchParams(window.location.search);
        currentCharacter = urlParams.get('character') || allCharacters[0];

        renderSwitcher();
        document.getElementById('characterSwitcher').style.display = 'block';

        loadJSON(currentCharacter);

    } catch (error) {
        document.getElementById('artistGrid').innerHTML = 
            `<div class="loading">初始化失败: ${error.message}</div>`;
    }
}

// 获取角色头像URL
function getCharacterAvatarUrl(characterName) {
    const encodedName = encodeURIComponent(characterName);
    return `${window.CHARACTER_AVATAR_BASE}${encodedName}.jpg`;
}

// 渲染角色切换下拉菜单（糖葫芦头像）
function renderSwitcher() {
    const dropdown = document.getElementById('switcherDropdown');
    const btnAvatar = document.getElementById('currentCharAvatar');
    const btnName = document.getElementById('currentCharName');
    
    // 更新主按钮
    btnAvatar.src = getCharacterAvatarUrl(currentCharacter);
    btnAvatar.onerror = function() {
        // 头像加载失败时显示默认占位符
        this.style.display = 'none';
    };
    btnName.textContent = currentCharacter;

    // 生成糖葫芦式下拉列表
    dropdown.innerHTML = allCharacters.map(char => `
        <div class="char-item ${char === currentCharacter ? 'active' : ''}" 
             data-name="${char}"
             onclick="switchToCharacter('${char}')"
             title="${char}">
            <img src="${getCharacterAvatarUrl(char)}" 
                 alt="${char}"
                 onerror="this.style.display='none'">
        </div>
    `).join('');
}

// 切换角色
function switchToCharacter(char) {
    if (char === currentCharacter) return;
    
    closeDropdown();
    loadJSON(char);
}
// ========== 新增结束 ==========

// ========== 修改：加载数据 (支持角色路径 + 过渡动画) ==========
async function loadJSON(character) {
    const gridDiv = document.getElementById('artistGrid');
    
    gridDiv.classList.add('fading');
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        currentCharacter = character;
        const basePath = `json/${character}/`;

        const [indexRes, catRes] = await Promise.all([
            fetch(`${basePath}index.json`),
            fetch(`${basePath}categories.json`).catch(() => ({ ok: false }))
        ]);

        if (!indexRes.ok) {
            throw new Error(`无法加载角色 [${character}] 的数据`);
        }
        
        const indexData = await indexRes.json();
        
        if (!indexData.files || indexData.files.length === 0) {
            jsonData = [];
        } else {
            const dataPromises = indexData.files.map(fileName => 
                fetch(`${basePath}${fileName}`)
                    .then(response => {
                        if (!response.ok) {
                            console.warn(`部分文件加载失败: ${fileName}`);
                            return [];
                        }
                        return response.json();
                    })
                    .catch(() => [])
            );
            
            const dataArrays = await Promise.all(dataPromises);
            jsonData = dataArrays.flat();
        }
        
        if (catRes.ok) {
            categoriesData = await catRes.json();
        } else {
            categoriesData = {};
        }

        groupByUser();
        buildCategoryTree();
        
        renderArtistGrid();
        
        history.pushState({}, '', `index.html?character=${character}`);
        
        // 更新主按钮头像
        document.getElementById('currentCharAvatar').src = getCharacterAvatarUrl(character);
        document.getElementById('currentCharName').textContent = character;
        
        // 更新下拉列表高亮状态
        const items = document.querySelectorAll('.char-item');
        items.forEach(item => {
            if (item.dataset.name === character) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        gridDiv.classList.remove('fading');
        
    } catch (error) {
        gridDiv.innerHTML = `<div class="loading">加载失败: ${error.message}</div>`;
        gridDiv.classList.remove('fading');
    }
}
// ========== 修改结束 ==========

// 按用户分组 (保持不变)
function groupByUser() {
    const groups = {};
    jsonData.forEach((item, index) => {
        item._originalIndex = index;
        if (!groups[item.userId]) {
            groups[item.userId] = { 
                user: item.user, 
                userId: item.userId, 
                items: [],
                avatar: null
            };
        }
        groups[item.userId].items.push(item);
    });
    groupedData = Object.values(groups);
}

// 构建分类树 (保持不变)
function buildCategoryTree() {
    const buckets = {};
    buckets["未分类"] = [];

    for (let cat in categoriesData) {
        buckets[cat] = [];
    }

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

    categoryStructure = Object.keys(buckets).map(key => ({
        name: key,
        groups: buckets[key]
    })).sort((a, b) => {
        if (a.name === "未分类") return 1;
        if (b.name === "未分类") return -1;
        return a.name.localeCompare(b.name, 'zh-CN');
    });
}

// ========== 修改：渲染画师网格 (更新内页跳转链接) ==========
function renderArtistGrid() {
    const gridDiv = document.getElementById('artistGrid');
    gridDiv.innerHTML = '';

    if (categoryStructure.length === 0 || groupedData.length === 0) {
        gridDiv.innerHTML = '<div class="loading">暂无数据</div>';
        return;
    }

    categoryStructure.forEach(cat => {
        if (cat.groups.length === 0) return;

        const catHeader = document.createElement('div');
        catHeader.className = 'category-header';
        catHeader.innerHTML = `
            <h2>${cat.name}</h2>
            <span class="category-count">${cat.groups.length} 位画师</span>
        `;
        gridDiv.appendChild(catHeader);

        const artistGrid = document.createElement('div');
        artistGrid.className = 'artist-grid-inner';

        cat.groups.forEach(group => {
            const card = document.createElement('div');
            card.className = 'artist-card';
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'artist-avatar';
            
            if (group.avatar) {
                const img = document.createElement('img');
                img.src = group.avatar;
                img.alt = group.user;
                avatarDiv.appendChild(img);
            } else {
                avatarDiv.classList.add('placeholder');
            }
            card.appendChild(avatarDiv);
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'artist-name';
            nameDiv.textContent = group.user;
            card.appendChild(nameDiv);
            
            const countDiv = document.createElement('div');
            countDiv.className = 'artist-count';
            countDiv.textContent = `${group.items.length} 张作品`;
            card.appendChild(countDiv);
            
            card.onclick = () => {
                window.location.href = `gallery.html?character=${encodeURIComponent(currentCharacter)}&artist=${group.userId}`;
            };
            
            artistGrid.appendChild(card);
        });

        gridDiv.appendChild(artistGrid);
    });
}
// ========== 修改结束 ==========

// ========== UI交互逻辑 ==========

document.getElementById('switcherBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('switcherDropdown');
    const btn = this;
    
    dropdown.classList.toggle('show');
    btn.classList.toggle('active');
});

function closeDropdown() {
    const dropdown = document.getElementById('switcherDropdown');
    const btn = document.getElementById('switcherBtn');
    dropdown.classList.remove('show');
    btn.classList.remove('active');
}

document.addEventListener('click', function(e) {
    const switcher = document.getElementById('characterSwitcher');
    if (!switcher.contains(e.target)) {
        closeDropdown();
    }
});

window.addEventListener('popstate', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const char = urlParams.get('character');
    if (char && char !== currentCharacter) {
        loadJSON(char);
    }
});
