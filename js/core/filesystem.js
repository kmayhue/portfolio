const filesystem = {
    home: {
        type: 'directory',
        children: {
            'about': {
                type: 'directory',
                children: {
                    'bio.txt': { type: 'file', content: 'Hi, I\'m Kenny\nSenior Data Engineer based in Emeryville, CA' },
                    'skills.md': { type: 'file', content: '# Skills\n\n- Python\n- SQL\n- Data Engineering' },
                    'contact.md': { type: 'file', content: '# Contact\n\n- Email: mayhuek@gmail.com\n- LinkedIn: linkedin.com/in/kennethmayhue' }
                }
            },
            'projects': {
                type: 'directory',
                children: {
                    'data-pipeline.md': { type: 'file', content: '# Data Pipeline\n\nReal-time ETL pipeline project.' },
                    'etl-tool.md': { type: 'file', content: '# ETL Tool\n\nCustom ETL framework in Python.' }
                }
            },
            'resume.md': { type: 'file', content: '# Resume\n\nSenior Data Engineer\n2022 - Present' },
            'linkedin.txt': { type: 'file', content: 'https://www.linkedin.com/in/kennethmayhue/' },
            'github.txt': { type: 'file', content: 'https://github.com/kmayhue' }
        }
    }
};

function resolvePath(path) {
    if (!path) return [];

    let parts;
    if (path.startsWith('/')) {
        parts = path.split('/').filter(p => p);
    } else if (path.startsWith('~/')) {
        parts = path.slice(2).split('/').filter(p => p);
    } else {
        parts = path.split('/').filter(p => p);
    }

    const resolved = [];
    for (const part of parts) {
        if (part === '..') {
            resolved.pop();
        } else if (part !== '.' && part !== '') {
            resolved.push(part);
        }
    }
    return resolved;
}

function getNode(path) {
    const parts = resolvePath(path);
    let current = filesystem.home;

    for (const part of parts) {
        if (current.type !== 'directory' || !current.children || !current.children[part]) {
            return null;
        }
        current = current.children[part];
    }
    return current;
}

function listDirectory(path) {
    const node = getNode(path);
    if (!node || node.type !== 'directory') {
        return null;
    }

    const items = [];
    const children = node.children || {};

    for (const [name, item] of Object.entries(children)) {
        items.push({ name, type: item.type, isDirectory: item.type === 'directory' });
    }

    return items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
    });
}

function getFileContent(path) {
    const node = getNode(path);
    if (!node || node.type !== 'file') {
        return null;
    }
    return node.content || '';
}

function isDirectory(path) {
    const node = getNode(path);
    return node && node.type === 'directory';
}
