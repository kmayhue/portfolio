const filesystem = {
    home: {
        type: 'directory',
        children: {
            'about.txt': {
                type: 'file',
                content: `╔════════════════════════════════════════════════════════════╗
║  KENNY MAYHUE                                              ║
║  Senior Data Engineer                                      ║
║  Emeryville, CA                                            ║
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
            'resume.md': { type: 'file', content: `# Kenny Mayhue
Senior Data Engineer | Emeryville, CA | kmayhue@outlook.com | linkedin.com/in/kennethmayhue

---

## Summary

- Architected and owned EarthOptics' BigQuery data warehouse end-to-end — designing pipelines for sensor, satellite, and geospatial data — establishing it as the company's authoritative source of truth for analytics and ML workflows.
- Delivered scalable, production-grade data infrastructure across three industries (AgTech, AdTech, retail), building ETL systems on GCP, AWS, Databricks, and Hadoop that processed millions of records daily and powered critical business dashboards.
- Brought data engineering expertise to a Meta contract role, architecting high-throughput ad-data pipelines using Python and internal Meta frameworks, directly powering Unidash dashboards used for cross-functional analysis and decision-making.

## Core Skills

**Languages:** Python, SQL, Bash, HTML, CSS  
**Cloud & Infra:** GCP, BigQuery, Docker, Kubernetes, Airflow, AWS DynamoDB, Google Cloud Storage  
**Data Engineering:** dbt, Pandas, GeoPandas, PySpark, Jinja, PostgreSQL, Hadoop HDFS  
**BI & Visualization:** Looker Studio, Power BI, Unidash, Superset  
**Other:** Databricks, Teradata, HiveQL, Spark SQL, MS Access, VBA

## Experience

### EarthOptics (Full-Time)
**Oct 2022 – Dec 2025** | Senior Data Engineer (Mar 2024 – Dec 2025) | Data Engineer (Oct 2022 – Mar 2024)  
*AgTech startup (~50 employees) • Soil sensing & satellite imagery for precision agriculture.*

- Led development, management, and optimization of the company's BigQuery data warehouse, establishing it as the central source of truth for analytics and business intelligence.
- Built and maintained critical BI dashboards and reports using dbt for data transformation/modeling and Looker Studio for visualization, enabling data-driven decision-making across teams.
- Designed and implemented production-grade data pipelines (Python, SQL, GCP) for diverse datasets, including sensor data and satellite imagery, ensuring high data quality for analysis and ML.
- Automated Kubernetes job deployments (Bash) for complex data processing workflows, significantly streamlining operations and reducing manual effort.

### Meta (Contract)
**Sep 2021 – Sep 2022** | Data Engineer III  
*Big tech (~70,000 employees) • Parent of Facebook, Instagram & WhatsApp; revenue driven by digital advertising.*

- Architected and deployed scalable data pipelines using Python, SQL, and internal Meta frameworks to process user ad data, powering critical Unidash dashboards used for analysis and decision-making.
- Led data validation efforts across pipelines and dashboards, implementing checks and collaborating with stakeholders on data integrity.

### Adoya (Contract)
**May 2021 – Dec 2021** | Data Engineer  
*Early-stage AdTech startup (~15 employees) • Apple Search Ads management tools for mobile app growth teams.*

- Developed Python scripts leveraging Pandas to automate data synchronization from the Apple Search Ads API, ensuring data consistency and timeliness for the ad reporting platform.
- Designed and implemented optimized NoSQL data models using AWS DynamoDB for efficient storage and retrieval of ad performance data.

### Williams-Sonoma
**Mar 2019 – Apr 2021** | Data Analyst  
*Fortune 500 retailer (~30,000 employees) • Williams-Sonoma, Pottery Barn & West Elm brands across e-commerce and retail.*

- Developed and implemented ETL scripts using Python, SQL, and Shell, orchestrated via cron and Databricks, to support marketing operations and reporting requirements.
- Performed ad-hoc analysis using Teradata, Databricks, and Power BI, and supported the migration of legacy processes to a modern Customer Data Platform (CDP).

## Selected Prior Experience

### Nielsen — Data Analyst
**Jul 2018 – Mar 2019**  
Built ETL pipelines (Python, Shell) to ingest web API data into Hadoop HDFS; delivered ad-hoc insights via HiveQL and Spark SQL for a major retail client (Walmart).

### The Fontana Group — Data Analyst
**Jun 2017 – May 2018**  
Developed Python scripts to extract geocoding and traffic data from external APIs; built MS Access/SQL/VBA database applications to automate reporting workflows.

## Education

**University of Arizona, Tucson, AZ**  
B.S. Mathematics, Minor in Economics | 2017` },
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
    if (path === '~') return [];

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
