// 工具函数集合

function replaceDotBeforeExt(name) {
    const lastDotIdx = name.lastIndexOf('.');
    if (lastDotIdx === -1) return name;
    const beforeExtDotIdx = lastDotIdx - 1;
    if (beforeExtDotIdx >= 0 && name[beforeExtDotIdx] === '.') {
        return name.substring(0, beforeExtDotIdx) + '．' + name.substring(beforeExtDotIdx + 1);
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

function generateFileName(item) {
    const fileName = `${item.id}-${item.title}.${item.ext}`;
    const normalized = normalizeName(fileName);
    const encoded = encodeURIComponent(normalized).replace(/%2F/g, '/');
    
    // 处理#号问题：URL中#后面的内容会被浏览器当作锚点截断
    // 需要在生成URL时就截断#及之后的部分
    const hashIndex = encoded.indexOf('#');
    const finalEncoded = hashIndex !== -1 ? encoded.substring(0, hashIndex) : encoded;
    
    return window.CDN_BASE + finalEncoded;
}

function getImageTitle(item) {
    return item.title; // 只返回标题，不含扩展名
}