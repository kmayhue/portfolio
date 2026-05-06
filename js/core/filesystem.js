const filesystem = {
    home: {
        type: 'directory',
        children: {
            'about': {
                type: 'directory',
                children: {
                    'bio.txt': { type: 'file', content: `Hi, I'm Kenny
Senior Data Engineer based in Emeryville, CA

I specialize in building data pipelines, ETL processes, and
turning raw data into actionable insights.

Currently open to new opportunities in data engineering
and related fields.` },
                    'skills.md': { type: 'file', content: `# Technical Skills

## Languages
- Python (Advanced)
- SQL (Advanced)
- JavaScript (Intermediate)

## Tools & Frameworks
- Pandas, NumPy
- SQLAlchemy
- Apache Airflow
- Docker
- AWS (S3, Lambda, ECS)
- PostgreSQL, MySQL
- Git

## Data Engineering
- ETL Pipeline Design
- Data Modeling
- Data Warehousing
- Stream Processing` },
                    'contact.md': { type: 'file', content: `# Contact Information

## Email
mayhuek@gmail.com

## LinkedIn
https://www.linkedin.com/in/kennethmayhue/

## GitHub
https://github.com/kmayhue

## Location
Emeryville, CA` }
                }
            },
            'projects': {
                type: 'directory',
                children: {
                    'data-pipeline.md': { type: 'file', content: `# Real-time Data Pipeline

## Description
Built a real-time data pipeline processing 1M+ events daily using Apache Airflow, PostgreSQL, and Python.

## Tech Stack
- Python, Apache Airflow, PostgreSQL, AWS

## Features
- Real-time event processing
- Data validation and transformation
- Automated scheduling
- Monitoring and alerting` },
                    'etl-tool.md': { type: 'file', content: `# Custom ETL Framework

## Description
Developed a modular ETL framework in Python supporting multiple data sources and destinations.

## Tech Stack
- Python, SQLAlchemy, Pandas

## Features
- Extensible data connectors
- Transformation templates
- Error handling and retry logic
- Audit logging` },
                    'analytics-dashboard.md': { type: 'file', content: `# Analytics Dashboard

## Description
Created an interactive analytics dashboard for business KPIs using SQL and visualization tools.

## Tech Stack
- SQL, Python, Plotly

## Features
- Real-time metrics
- Customizable views
- Export capabilities` }
                }
            },
            'resume.md': { type: 'file', content: `# Resume

## Experience

### Senior Data Engineer
**Tech Company** | 2022 - Present
- Built and maintained data pipelines processing 10M+ records daily
- Reduced data processing time by 60% through optimization
- Implemented data quality checks and monitoring

### Data Engineer
**Startup Inc** | 2020 - 2022
- Designed ETL pipelines using Airflow
- Created dbt models for analytics
- Led migration to cloud infrastructure

---

## Skills

| Category | Skills |
|----------|--------|
| Languages | Python, SQL, JavaScript |
| Databases | PostgreSQL, MySQL, MongoDB |
| Cloud | AWS, GCP |
| Tools | Airflow, dbt, Docker, Git |

---

## Education

### BS Computer Science
University of California | 2020` },
            'archive': {
                type: 'directory',
                children: {
                    'old-projects.md': { type: 'file', content: `# Archived Projects

Here are some older projects from earlier in my career:

- Web scraper (2019)
- Chat bot (2019)
- Portfolio v1 (2018)` }
                }
            },
            'linkedin.txt': { type: 'file', content: 'https://www.linkedin.com/in/kennethmayhue/' },
            'github.txt': { type: 'file', content: 'https://github.com/kmayhue' },
            'email.txt': { type: 'file', content: 'mayhuek@gmail.com' }
        }
    }
};

function resolvePath(path, relativeTo = '~/') {
    if (!path) return [];

    let parts;
    if (path.startsWith('/')) {
        parts = path.split('/').filter(p => p);
    } else if (path.startsWith('~/')) {
        parts = path.slice(2).split('/').filter(p => p);
    } else {
        const relParts = relativeTo.replace('~/', '').split('/').filter(p => p);
        parts = [...relParts, ...path.split('/')].filter(p => p);
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

function getNode(root, path) {
    const parts = resolvePath(path);
    let current = root;

    for (const part of parts) {
        if (current.type !== 'directory' || !current.children || !current.children[part]) {
            return null;
        }
        current = current.children[part];
    }
    return current;
}

function getParentNode(root, path) {
    const parts = resolvePath(path);
    const fileName = parts.pop();
    let current = root;

    for (const part of parts) {
        if (current.type !== 'directory' || !current.children || !current.children[part]) {
            return null;
        }
        current = current.children[part];
    }
    return { node: current, name: fileName };
}

function listDirectory(root, path) {
    const node = getNode(root, path);
    if (!node || node.type !== 'directory') {
        return null;
    }

    const items = [];
    const children = node.children || {};

    for (const [name, item] of Object.entries(children)) {
        items.push({
            name,
            type: item.type,
            isDirectory: item.type === 'directory'
        });
    }

    return items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
    });
}

function getAbsolutePath(pathParts) {
    return '~/' + pathParts.join('/');
}

function normalizePath(path, currentDir = '~/') {
    if (path === '~' || path === '~/') {
        return '~/';
    }
    if (path.startsWith('/')) {
        return path;
    }
    if (path.startsWith('~/')) {
        return path;
    }
    return currentDir.replace(/\/$/, '') + '/' + path;
}

function fileExists(root, path) {
    return getNode(root, path) !== null;
}

function isDirectory(root, path) {
    const node = getNode(root, path);
    return node && node.type === 'directory';
}

function getFileContent(root, path) {
    const node = getNode(root, path);
    if (!node || node.type !== 'file') {
        return null;
    }
    return node.content || '';
}

function createDirectory(root, path) {
    const { node: parent, name } = getParentNode(root, path);
    if (!parent || parent.type !== 'directory') {
        return { success: false, error: `cannot create directory '${path}': No such parent directory` };
    }
    if (parent.children[name]) {
        return { success: false, error: `cannot create directory '${path}': File exists` };
    }
    parent.children[name] = { type: 'directory', children: {} };
    return { success: true };
}

function createFile(root, path, content = '') {
    const { node: parent, name } = getParentNode(root, path);
    if (!parent || parent.type !== 'directory') {
        return { success: false, error: `cannot create file '${path}': No such parent directory` };
    }
    parent.children[name] = { type: 'file', content };
    return { success: true };
}

function removeItem(root, path) {
    const { node: parent, name } = getParentNode(root, path);
    if (!parent || parent.type !== 'directory') {
        return { success: false, error: `cannot remove '${path}': No such file or directory` };
    }
    if (!parent.children[name]) {
        return { success: false, error: `cannot remove '${path}': No such file or directory` };
    }
    delete parent.children[name];
    return { success: true };
}

function getDirectoryTree(root, path = '~/', indent = '', showAll = true) {
    const items = listDirectory(root, path);
    if (!items) return [];

    const lines = [];
    const lastIndex = items.length - 1;

    items.forEach((item, index) => {
        const isLast = index === lastIndex;
        const prefix = indent + (isLast ? '└─' : '├─');
        const itemPath = (path === '~/' ? '~/' : path) + item.name;

        if (item.isDirectory) {
            lines.push({ text: prefix + item.name + '/', type: 'directory', path: itemPath });
            if (showAll) {
                const subLines = getDirectoryTree(root, itemPath + '/', indent + (isLast ? '  ' : '│ '));
                lines.push(...subLines);
            }
        } else {
            lines.push({ text: prefix + item.name, type: 'file', path: itemPath });
        }
    });

    return lines;
}
