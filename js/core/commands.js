const commands = {
    help: {
        execute: () => {
            return {
                output: [
                    { text: 'Available commands:', type: 'result' },
                    { text: '  help              Show this help message', type: 'help-cmd' },
                    { text: '  ls [options]       List directory contents', type: 'help-cmd' },
                    { text: '  cd <dir>           Change directory', type: 'help-cmd' },
                    { text: '  pwd                Print working directory', type: 'help-cmd' },
                    { text: '  cat <file>         Display file contents', type: 'help-cmd' },
                    { text: '  tree [dir]         Display directory tree', type: 'help-cmd' },
                    { text: '  mkdir <dir>        Create directory', type: 'help-cmd' },
                    { text: '  touch <file>       Create empty file', type: 'help-cmd' },
                    { text: '  rm <path>          Remove file or directory', type: 'help-cmd' },
                    { text: '  cp <src> <dst>     Copy file', type: 'help-cmd' },
                    { text: '  mv <src> <dst>     Move/rename file', type: 'help-cmd' },
                    { text: '  clear              Clear terminal', type: 'help-cmd' },
                    { text: '  whoami             Display user info', type: 'help-cmd' },
                    { text: '  date               Display current date', type: 'help-cmd' },
                    { text: '  echo <text>        Print text', type: 'help-cmd' },
                    { text: '  which <cmd>        Locate command', type: 'help-cmd' },
                    { text: '  uname              System information', type: 'help-cmd' },
                    { text: '  history            Show command history', type: 'help-cmd' },
                    { text: '  exit               Exit terminal', type: 'help-cmd' },
                    { text: '', type: 'result' },
                    { text: 'Tips:', type: 'result' },
                    { text: '  - Use Tab for completion', type: 'result' },
                    { text: '  - Use Up/Down arrows for history', type: 'result' },
                    { text: '  - Use cd ~ to go home, cd .. to go up', type: 'result' }
                ]
            };
        },
        help: 'Show this help message',
        completer: () => []
    },

    ls: {
        execute: (args) => {
            const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
            const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
            const pathArg = args.find(a => !a.startsWith('-'));

            const path = pathArg || getState().currentDir;
            const items = listDirectory(filesystem.home, path);

            if (!items) {
                return { error: `ls: cannot access '${path}': No such file or directory` };
            }

            if (longFormat) {
                const lines = [];
                items.forEach(item => {
                    const perms = item.isDirectory ? 'drwxr-xr-x' : '-rw-r--r--';
                    const size = item.isDirectory ? 4096 : (getFileContent(filesystem.home, normalizePath(path + '/' + item.name, getState().currentDir) || '').length);
                    const type = item.isDirectory ? 'directory' : 'file';
                    lines.push({ text: `${perms}  1 kenny  staff  ${size.toString().padStart(5)}  ${item.name}${item.isDirectory ? '/' : ''}`, type });
                });
                return { output: lines };
            } else {
                const lines = items.map(item => ({
                    text: item.name + (item.isDirectory ? '/' : ''),
                    type: item.isDirectory ? 'directory' : 'file'
                }));
                return { output: lines };
            }
        },
        help: 'List directory contents',
        completer: (partial, state) => {
            const path = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : state.currentDir;
            const prefix = partial.includes('/') ? partial.slice(partial.lastIndexOf('/') + 1) : partial;

            const items = listDirectory(filesystem.home, path);
            if (!items) return [];

            return items
                .filter(item => item.name.startsWith(prefix))
                .map(item => (path === '~/'' ? '' : path.replace('~/', '~/')) + item.name + (item.isDirectory ? '/' : ''));
        }
    },

    cd: {
        execute: (args) => {
            const path = args[0] || '~';
            const normalizedPath = normalizePath(path, getState().currentDir);

            if (normalizedPath === '~' || normalizedPath === '~/') {
                setCurrentDir('~/');
                return { output: [] };
            }

            if (isDirectory(filesystem.home, normalizedPath)) {
                setCurrentDir(normalizedPath);
                return { output: [] };
            }

            return { error: `cd: ${path}: No such file or directory` };
        },
        help: 'Change directory',
        completer: (partial, state) => {
            const basePath = state.currentDir;
            const searchPath = partial || basePath;
            const items = listDirectory(filesystem.home, searchPath);
            if (!items) return [];

            const prefix = partial.startsWith('/') ? '' : (basePath === '~/' ? '~/' : basePath + '/');
            return items.filter(i => i.isDirectory).map(i => prefix + i.name);
        }
    },

    pwd: {
        execute: () => {
            return { output: [{ text: getState().currentDir, type: 'result' }] };
        },
        help: 'Print working directory',
        completer: () => []
    },

    cat: {
        execute: (args) => {
            if (!args[0]) {
                return { error: 'cat: missing file operand' };
            }

            const path = normalizePath(args[0], getState().currentDir);
            const content = getFileContent(filesystem.home, path);

            if (content === null) {
                return { error: `cat: ${args[0]}: No such file or directory` };
            }

            return { output: [{ text: content, type: 'result' }] };
        },
        help: 'Display file contents',
        completer: (partial, state) => {
            const path = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : state.currentDir;
            const prefix = partial.includes('/') ? partial.slice(partial.lastIndexOf('/') + 1) : partial;

            const items = listDirectory(filesystem.home, path);
            if (!items) return [];

            const resultPath = path === '~/'' ? '~/' : path;
            return items
                .filter(item => item.name.startsWith(prefix) && item.type === 'file')
                .map(item => resultPath + item.name);
        }
    },

    tree: {
        execute: (args) => {
            const path = args[0] ? normalizePath(args[0], getState().currentDir) : getState().currentDir;
            const tree = getDirectoryTree(filesystem.home, path);

            if (tree.length === 0) {
                return { error: `tree: '${args[0] || path}': No such directory` };
            }

            return { output: tree };
        },
        help: 'Display directory tree',
        completer: (partial, state) => {
            const basePath = state.currentDir;
            const searchPath = partial || basePath;
            const items = listDirectory(filesystem.home, searchPath);
            if (!items) return [];

            const prefix = searchPath === '~/'' ? '~/' : searchPath + '/';
            return items.filter(i => i.isDirectory).map(i => prefix + i.name);
        }
    },

    mkdir: {
        execute: (args) => {
            if (!args[0]) {
                return { error: 'mkdir: missing operand' };
            }

            const path = normalizePath(args[0], getState().currentDir);
            const result = createDirectory(filesystem.home, path);

            if (!result.success) {
                return { error: result.error };
            }

            return { output: [] };
        },
        help: 'Create directory',
        completer: (partial, state) => {
            const path = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : state.currentDir;
            const prefix = partial.includes('/') ? partial.slice(partial.lastIndexOf('/') + 1) : partial;

            const items = listDirectory(filesystem.home, path);
            if (!items) return [];

            const resultPath = path === '~/'' ? '~/' : path;
            return items.filter(i => i.isDirectory && i.name.startsWith(prefix)).map(i => resultPath + i.name);
        }
    },

    touch: {
        execute: (args) => {
            if (!args[0]) {
                return { error: 'touch: missing file operand' };
            }

            const path = normalizePath(args[0], getState().currentDir);
            const result = createFile(filesystem.home, path, '');

            if (!result.success) {
                return { error: result.error };
            }

            return { output: [] };
        },
        help: 'Create empty file',
        completer: (partial, state) => {
            const path = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : state.currentDir;
            const items = listDirectory(filesystem.home, path);
            if (!items) return [];

            const resultPath = path === '~/'' ? '~/' : path;
            return items.map(i => resultPath + i.name);
        }
    },

    rm: {
        execute: (args) => {
            if (!args[0]) {
                return { error: 'rm: missing operand' };
            }

            const force = args.includes('-f');
            const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
            const pathArg = args.find(a => !a.startsWith('-'));
            const path = normalizePath(pathArg, getState().currentDir);

            const result = removeItem(filesystem.home, path);

            if (!result.success) {
                if (force) return { output: [] };
                return { error: result.error };
            }

            return { output: [] };
        },
        help: 'Remove file or directory',
        completer: (partial, state) => {
            const items = listDirectory(filesystem.home, state.currentDir);
            if (!items) return [];

            const prefix = state.currentDir === '~/' ? '~/' : state.currentDir + '/';
            return items.map(i => prefix + i.name);
        }
    },

    cp: {
        execute: (args) => {
            if (args.length < 2) {
                return { error: 'cp: missing destination file operand' };
            }

            const src = normalizePath(args[0], getState().currentDir);
            const dst = normalizePath(args[1], getState().currentDir);

            const content = getFileContent(filesystem.home, src);
            if (content === null) {
                return { error: `cp: cannot stat '${args[0]}': No such file or directory` };
            }

            const result = createFile(filesystem.home, dst, content);
            if (!result.success) {
                return { error: result.error };
            }

            return { output: [] };
        },
        help: 'Copy file',
        completer: (partial, state) => {
            const items = listDirectory(filesystem.home, state.currentDir);
            if (!items) return [];

            const prefix = state.currentDir === '~/' ? '~/' : state.currentDir + '/';
            return items.filter(i => i.type === 'file').map(i => prefix + i.name);
        }
    },

    mv: {
        execute: (args) => {
            if (args.length < 2) {
                return { error: 'mv: missing destination file operand' };
            }

            const src = normalizePath(args[0], getState().currentDir);
            const dst = normalizePath(args[1], getState().currentDir);

            const content = getFileContent(filesystem.home, src);
            if (content === null) {
                return { error: `mv: cannot stat '${args[0]}': No such file or directory` };
            }

            const result = createFile(filesystem.home, dst, content);
            if (!result.success) {
                return { error: result.error };
            }

            removeItem(filesystem.home, src);
            return { output: [] };
        },
        help: 'Move/rename file',
        completer: (partial, state) => {
            const items = listDirectory(filesystem.home, state.currentDir);
            if (!items) return [];

            const prefix = state.currentDir === '~/' ? '~/' : state.currentDir + '/';
            return items.map(i => prefix + i.name);
        }
    },

    clear: {
        execute: () => {
            return { clear: true };
        },
        help: 'Clear terminal',
        completer: () => []
    },

    whoami: {
        execute: () => {
            return { output: [{ text: 'kenny', type: 'result' }] };
        },
        help: 'Display user info',
        completer: () => []
    },

    date: {
        execute: () => {
            return { output: [{ text: new Date().toString(), type: 'result' }] };
        },
        help: 'Display current date',
        completer: () => []
    },

    echo: {
        execute: (args) => {
            return { output: [{ text: args.join(' '), type: 'result' }] };
        },
        help: 'Print text',
        completer: () => []
    },

    which: {
        execute: (args) => {
            if (!args[0]) {
                return { error: 'which: missing argument' };
            }

            if (commands[args[0]]) {
                return { output: [{ text: `/usr/bin/${args[0]}`, type: 'result' }] };
            }

            return { error: `${args[0]} not found` };
        },
        help: 'Locate command',
        completer: () => Object.keys(commands)
    },

    uname: {
        execute: (args) => {
            if (args.includes('-a')) {
                return { output: [{ text: 'Darwin Kennys-MacBook-Pro 23.0.0 Darwin Kernel Version 23.0.0 x86_64', type: 'result' }] };
            }
            return { output: [{ text: 'Darwin', type: 'result' }] };
        },
        help: 'System information',
        completer: () => ['-a', '-s', '-r', '-v', '-m']
    },

    history: {
        execute: (args) => {
            const history = getState().commandHistory;
            const lines = history.map((cmd, i) => ({
                text: `  ${i + 1}  ${cmd}`,
                type: 'result'
            }));
            return { output: lines };
        },
        help: 'Show command history',
        completer: () => []
    },

    exit: {
        execute: () => {
            return { exit: true };
        },
        help: 'Exit terminal',
        completer: () => []
    }
};

function executeCommand(cmd, args = []) {
    const command = commands[cmd];
    if (!command) {
        return { error: `kenny-cli: command not found: ${cmd}` };
    }

    try {
        return command.execute(args);
    } catch (e) {
        return { error: `Error: ${e.message}` };
    }
}

function getCommandCompletions(partial, state) {
    const parts = partial.split(' ');
    const cmd = parts[0];

    if (parts.length === 1) {
        const allCommands = Object.keys(commands);
        return allCommands.filter(c => c.startsWith(partial));
    }

    if (commands[cmd] && commands[cmd].completer) {
        const lastPartial = parts[parts.length - 1];
        return commands[cmd].completer(lastPartial, state);
    }

    return [];
}

function getCompletions(partial, state) {
    return getCommandCompletions(partial, state);
}
