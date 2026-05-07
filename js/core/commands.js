const commands = {
    help: {
        execute: () => 'Available commands: help, clear, pwd, whoami, date, echo, nvim, ls, cd, curl, chat, tree, mkdir, touch, rm',
        help: 'Show help message'
    },
    about: {
        execute: () => `╔════════════════════════════════════════════════════════════╗
║  KENNY MAYHUE                                              ║
║  Senior Data Engineer                                      ║
║  Emeryville, CA                                            ║
╚════════════════════════════════════════════════════════════╝

  Building data pipelines that power business decisions.
  Currently: Open to new opportunities
  Previously: EarthOptics, Meta, Williams-Sonoma
  Education: B.S. Mathematics, University of Arizona

  Skills: Python, SQL, BigQuery, dbt, Airflow, Docker, GCP

  Type "help" for available commands.`,
        help: 'Show about information'
    },
    clear: {
        execute: () => ({ clear: true }),
        help: 'Clear terminal'
    },
    pwd: {
        execute: (_, state) => '/home/kenny/' + state.currentDir,
        help: 'Print working directory'
    },
    whoami: {
        execute: () => 'kenny',
        help: 'Display user'
    },
    date: {
        execute: () => new Date().toString(),
        help: 'Show date and time'
    },
    echo: {
        execute: (_, __, args) => args.join(' '),
        help: 'Print text'
    },
    nvim: {
        execute: (args, state) => {
            if (!args[0]) return { error: 'nvim: missing file operand' };

            const path = normalizePath(args[0], state.currentDir);
            const content = getFileContent(path);

            if (content === null) {
                return { error: `nvim: ${args[0]}: No such file or directory` };
            }

            return content;
        },
        help: 'View file (alias: cat)',
        completer: (partial, state) => {
            const items = listDirectory(state.currentDir);
            if (!items) return [];
            const prefix = state.currentDir === '~' ? '~/' : state.currentDir + '/';
            return items.filter(i => i.name.startsWith(partial)).map(i => prefix + i.name);
        }
    },
    cat: {
        execute: (args, state) => commands.nvim.execute(args, state),
        help: 'View file'
    },
    vim: {
        execute: (args, state) => commands.nvim.execute(args, state),
        help: 'View file'
    },
    vi: {
        execute: (args, state) => commands.nvim.execute(args, state),
        help: 'View file'
    },
    ls: {
        execute: (args, state) => {
            const path = args[0] && !args[0].startsWith('-') ? normalizePath(args[0], state.currentDir) : (state.currentDir === '~' ? '~/' : state.currentDir);
            const items = listDirectory(path);

            if (!items) {
                return { error: `ls: cannot access '${path}': No such file or directory` };
            }

            const html = items.map(i => {
                let className = i.isDirectory ? 'directory' : 'file';
                if (i.url) className = 'url-file';
                let name = `<span class="${className}">${i.name}</span>`;
                if (i.isDirectory) name += '/';
                if (i.url) name += '*';
                return name;
            }).join('  ');

            return { html };
        },
        help: 'List directory contents',
        completer: (partial, state) => {
            const items = listDirectory(state.currentDir);
            if (!items) return [];
            const prefix = state.currentDir === '~' ? '~/' : state.currentDir + '/';
            return items.map(i => prefix + i.name);
        }
    },
    cd: {
        execute: (args, state) => {
            const path = args[0] || '~';
            const normalized = normalizePath(path, state.currentDir);

            if (normalized === '~' || normalized === '~/') {
                state.currentDir = '~';
                return '';
            }

            if (isDirectory(normalized)) {
                state.currentDir = normalized;
                return '';
            }

            return { error: `cd: ${path}: No such file or directory` };
        },
        help: 'Change directory',
        completer: (partial, state) => {
            const items = listDirectory(state.currentDir);
            if (!items) return [];
            const prefix = state.currentDir === '~' ? '~/' : state.currentDir + '/';
            return items.filter(i => i.isDirectory).map(i => prefix + i.name);
        }
    },
    curl: {
        execute: (args, state) => {
            if (!args[0]) {
                return { error: 'curl: missing URL operand' };
            }

            const target = args[0].toLowerCase();
            let url = null;

            if (target === 'github.com' || target === 'github') {
                url = 'https://github.com/kmayhue';
            } else if (target === 'linkedin.com' || target === 'linkedin') {
                url = 'https://www.linkedin.com/in/kennethmayhue/';
            } else if (target.startsWith('http')) {
                url = args[0];
            } else {
                const path = normalizePath(args[0], state.currentDir);
                url = getFileUrl(path);
            }

            if (!url) {
                return { error: `curl: could not resolve host: ${args[0]}` };
            }

            return { openUrl: url };
        },
        help: 'Open URL in new tab',
        completer: (partial, state) => {
            const shortcuts = ['github.com', 'github', 'linkedin.com', 'linkedin'];
            const matches = shortcuts.filter(s => s.startsWith(partial));
            if (matches.length) return matches;

            const items = listDirectory(state.currentDir);
            if (!items) return [];
            const prefix = state.currentDir === '~' ? '~/' : state.currentDir + '/';
            return items.filter(i => i.url).map(i => prefix + i.name);
        }
    },
    tree: {
        execute: (args, state) => {
            const path = args[0] ? normalizePath(args[0], state.currentDir) : (state.currentDir === '~' ? '~/' : state.currentDir);
            const tree = getDirectoryTree(path);

            if (!tree || tree.length === 0) {
                return { error: `tree: '${args[0] || path}': No such directory` };
            }

            const html = tree.map(item => {
                return `<span class="${item.type}">${item.text}</span>`;
            }).join('\n');

            return { html };
        },
        help: 'Display directory tree'
    }
};

function normalizePath(path, currentDir) {
    if (!path) return currentDir;
    if (path === '~') return '~';
    if (path.startsWith('~/')) return path;
    if (path.startsWith('/')) return path;
    if (path.startsWith('..')) {
        const parts = resolvePath(currentDir + '/' + path);
        return parts.length === 0 ? '~' : '~/' + parts.join('/');
    }
    if (currentDir === '~') return '~/' + path;
    return currentDir + '/' + path;
}

commands.mkdir = {
    execute: (args, state) => {
        if (!args[0]) return { error: 'mkdir: missing operand' };
        const path = normalizePath(args[0], state.currentDir);
        const parts = resolvePath(path);
        const name = parts.pop();
        const parentPath = parts.length === 0 ? '~' : '~/' + parts.join('/');
        const parent = getNode(parentPath);
        if (!parent || parent.type !== 'directory') {
            return { error: `mkdir: cannot create directory '${args[0]}': No such parent directory` };
        }
        if (parent.children && parent.children[name]) {
            return { error: `mkdir: cannot create directory '${args[0]}': File exists` };
        }
        if (!parent.children) parent.children = {};
        parent.children[name] = { type: 'directory', children: {} };
        return '';
    },
    help: 'Create directory'
};

commands.touch = {
    execute: (args, state) => {
        if (!args[0]) return { error: 'touch: missing file operand' };
        const path = normalizePath(args[0], state.currentDir);
        const parts = resolvePath(path);
        const name = parts.pop();
        const parentPath = parts.length === 0 ? '~' : '~/' + parts.join('/');
        const parent = getNode(parentPath);
        if (!parent || parent.type !== 'directory') {
            return { error: `touch: cannot touch '${args[0]}': No such file or directory` };
        }
        if (!parent.children) parent.children = {};
        if (!parent.children[name]) {
            parent.children[name] = { type: 'file', content: '', url: null };
        }
        return '';
    },
    help: 'Create empty file'
};

commands.rm = {
    execute: (args, state) => {
        if (!args[0]) return { error: 'rm: missing operand' };
        const isRecursive = args.includes('-r') || args.includes('-rf');
        const pathArg = args[args.length - 1];
        const path = normalizePath(pathArg, state.currentDir);
        const parts = resolvePath(path);
        const name = parts.pop();
        const parentPath = parts.length === 0 ? '~' : '~/' + parts.join('/');
        const parent = getNode(parentPath);
        if (!parent || !parent.children || !parent.children[name]) {
            return { error: `rm: cannot remove '${pathArg}': No such file or directory` };
        }
        if (parent.children[name].type === 'directory' && !isRecursive) {
            return { error: `rm: cannot remove '${pathArg}': Is a directory` };
        }
        delete parent.children[name];
        return '';
    },
    help: 'Remove file or directory (-r for recursive)'
};

function executeCommand(command, args, state) {
    const cmd = commands[command];
    if (!cmd) {
        return { error: `command not found: ${command}` };
    }

    try {
        const result = cmd.execute(args, state, args);
        return result;
    } catch (e) {
        return { error: `Error: ${e.message}` };
    }
}
