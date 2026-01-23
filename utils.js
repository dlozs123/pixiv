// 工具函数集合

function replaceDotBeforeExt(name) {
    const lastDotIdx = name.lastIndexOf('.');
    if (lastDotIdx === -1) return name;
    const beforeExtDotIdx = lastDotIdx - 1;
    if (beforeExtIdx >= 0 && name[beforeExtIdx] === '.') {
        return name.substring(0, beforeExtIdx) + '．' + name.substring(beforeExtIdx + 1);
    }
    return name;
}

function getUnicodeCategory(char) {
    const code = char.charCodeAt(0);
    if (code < 32 || (code >= 127 && code <= 159)) return 'Cc';
    if (code >= 0x200B && code <= 0x200F) return 'Cf';
    if (code >= 0x202A && code <= 0x202E) return 'Cf';
    return 'Other';
}

function normalizeName(name) {
    let nameNoControl = name.split('').filter(c => {
        const cat = getUnicodeCategory(c);
        return cat !== 'Cc' && cat !== 'Cf';
    }).join('');
    
    const table = { 
        '\\': '＼', '/': '／', ':': '：', '*': '＊', 
        '?': '？', '"': '＂', '<': '＜', '>': '＞', '|': '｜' 
    };
    
    let replaced = nameNoControl.split('').map(c => table[c] || c).join('');
    replaced = replaced.replace(/~/g, '～');
    replaced = replaced.replace(/%/g, '_');
    replaced = replaceDotBeforeExt(replaced);
    
    const lastDotIdx = replaced.lastIndexOf('.');
    if (lastDotIdx !== -1 && lastDotIdx > 0 && replaced[lastDotIdx - 1] === '　') {
        replaced = replaced.substring(0, lastDotIdx - 1) + replaced.substring(lastDotIdx);
    }
    
    if (replaced.includes('🈁⬛')) {
        replaced = replaced.replace(/🈁⬛/g, '🈁‍⬛');
    }
    
    return replaced;
}

// ========== 修改部分：简化 generateFileName ==========
function generateFileName(item) {
    // 如果是演示模式，使用 Picsum
    if (window.DEMO_MODE) {
        return `https://picsum.photos/id/${item.idNum % 1000}/800/800`;
    }

    // 新规则：将 "68454894_p2" 转换为 "68454894-2.{ext}"
    // R2 桶中的图片名格式: {id主号}-{序号}.{ext}
    const fileName = item.id.replace('_p', '-') + '.' + item.ext;
    
    // 命名已简化，不需要复杂的 normalizeName 处理
    return window.CDN_BASE + fileName;
}
// ========== 修改结束 ==========

function getImageTitle(item) {
    return item.title; // 只返回标题，不含扩展名
}
