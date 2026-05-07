const filesystem = {
    home: {
        type: 'directory',
        children: {
            'about.txt': {
                type: 'file',
                content: `╔════════════════════════════════════════════════════════════╗
║  KENNY MAYHUE                                             ║
║  Senior Data Engineer                                     ║
║  Emeryville, CA                                           ║
╚════════════════════════════════════════════════════════════╝

  Building data pipelines that power business decisions.
  Currently: Open to new opportunities
  Previously: EarthOptics, Meta, Williams-Sonoma
  Education: B.S. Mathematics, University of Arizona

  Skills: Python, SQL, BigQuery, dbt, Airflow, Docker, GCP`,
                url: null
            },
            'portfolio.txt': {
                type: 'file',
                content: 'https://kmayhue.github.io/portfolio/',
                url: 'https://kmayhue.github.io/portfolio/'
            },
            'projects': {
                type: 'directory',
                children: {
                    'portfolio.txt': {
                        type: 'file',
                        content: 'https://kmayhue.github.io/portfolio/',
                        url: 'https://kmayhue.github.io/portfolio/'
                    }
                }
            },
            'resume.md': { type: 'file', content: '# Resume\n\nSenior Data Engineer\n2022 - Present' },
            'linkedin.txt': {
                type: 'file',
                content: 'https://www.linkedin.com/in/kennethmayhue/',
                url: 'https://www.linkedin.com/in/kennethmayhue/'
            },
            'github.txt': {
                type: 'file',
                content: 'https://github.com/kmayhue',
                url: 'https://github.com/kmayhue'
            },
            'email.txt': {
                type: 'file',
                content: 'mayhuek@gmail.com',
                url: 'mailto:mayhuek@gmail.com'
            }
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
        items.push({
            name,
            type: item.type,
            isDirectory: item.type === 'directory',
            url: item.url || null
        });
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

function getFileUrl(path) {
    const node = getNode(path);
    if (!node || node.type !== 'file') {
        return null;
    }
    return node.url || null;
}

function getDirectoryTree(path, prefix = '', isLast = true) {
    const items = listDirectory(path);
    if (!items) return [];

    const lines = [];
    const lastIndex = items.length - 1;

    items.forEach((item, index) => {
        const isLastItem = index === lastIndex;
        const connector = isLastItem ? '└── ' : '├── ';
        const currentPath = (path === '~/' ? '~/' : path) + item.name;

        if (item.isDirectory) {
            lines.push({ text: prefix + connector + item.name + '/', type: 'directory', path: currentPath });
            const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
            const subTree = getDirectoryTree(currentPath + '/', newPrefix, true);
            lines.push(...subTree);
        } else {
            const type = item.url ? 'url-file' : 'file';
            lines.push({ text: prefix + connector + item.name, type, path: currentPath });
        }
    });

    return lines;
}
