const commands = {
    help: {
        execute: () => 'Available commands: help, clear, pwd, whoami, date, echo, nvim, ls, cd, curl',
        help: 'Show help message'
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

            return items.map(i => {
                let name = i.name + (i.isDirectory ? '/' : '');
                if (i.url) name += '*';
                return name;
            }).join('  ');
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
