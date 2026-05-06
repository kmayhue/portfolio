let ideOpenFiles = [];
let ideActiveFile = null;

function initIDE() {
    renderFileTree();
    setupIDEEvents();
    printIDEWelcome();
}

function setupIDEEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            toggleCommandPalette();
        }
    });

    const closeBtn = document.querySelector('.ide-tab-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeCurrentTab();
        });
    }
}

function renderFileTree() {
    const tree = document.getElementById('fileTree');
    if (!tree) return;

    tree.innerHTML = '';

    const homeItems = listDirectory(filesystem.home, '~/');
    if (!homeItems) return;

    homeItems.forEach(item => {
        const itemEl = createFileTreeItem(item.name, item.isDirectory, getState().currentDir);
        tree.appendChild(itemEl);
    });
}

function createFileTreeItem(name, isDirectory, parentPath) {
    const item = document.createElement('div');
    item.className = 'ide-file-item';
    item.dataset.name = name;
    item.dataset.isDirectory = isDirectory;

    const icon = document.createElement('span');
    icon.className = 'ide-file-icon';
    icon.textContent = isDirectory ? '📁' : '📄';
    item.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = name + (isDirectory ? '/' : '');
    item.appendChild(text);

    const fullPath = (parentPath === '~/' ? '~/' : parentPath) + name;

    item.addEventListener('click', () => {
        if (isDirectory) {
            navigateToDirectory(fullPath + '/');
        } else {
            openFileInIDE(fullPath);
        }
    });

    return item;
}

function navigateToDirectory(path) {
    setCurrentDir(path);
    updateIDETerminalPrompt();
    const tree = document.getElementById('fileTree');
    tree.innerHTML = '';

    const items = listDirectory(filesystem.home, path);
    if (!items) return;

    items.forEach(item => {
        const itemEl = createFileTreeItem(item.name, item.isDirectory, path);
        tree.appendChild(itemEl);
    });
}

function openFileInIDE(path) {
    if (!ideOpenFiles.includes(path)) {
        ideOpenFiles.push(path);
    }

    ideActiveFile = path;
    renderTabs();
    renderEditor(path);
    highlightActiveFile(path);
}

function closeTab(path) {
    const index = ideOpenFiles.indexOf(path);
    if (index > -1) {
        ideOpenFiles.splice(index, 1);

        if (ideActiveFile === path) {
            ideActiveFile = ideOpenFiles[Math.min(index, ideOpenFiles.length - 1)];
        }

        renderTabs();
        if (ideActiveFile) {
            renderEditor(ideActiveFile);
        } else {
            clearEditor();
        }
    }
}

function closeCurrentTab() {
    if (ideActiveFile) {
        closeTab(ideActiveFile);
    }
}

function renderTabs() {
    const tabsContainer = document.getElementById('ideTabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    ideOpenFiles.forEach(path => {
        const name = path.replace(/^~\//, '');
        const tab = document.createElement('div');
        tab.className = 'ide-tab' + (path === ideActiveFile ? ' active' : '');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        tab.appendChild(nameSpan);

        const closeBtn = document.createElement('span');
        closeBtn.className = 'ide-tab-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(path);
        });
        tab.appendChild(closeBtn);

        tab.addEventListener('click', () => {
            ideActiveFile = path;
            renderTabs();
            renderEditor(path);
            highlightActiveFile(path);
        });

        tabsContainer.appendChild(tab);
    });
}

function renderEditor(path) {
    const editor = document.getElementById('ideEditorContent');
    if (!editor) return;

    const content = getFileContent(filesystem.home, path);

    if (content === null) {
        editor.innerHTML = '<div class="ide-editor-empty">File not found</div>';
        return;
    }

    let html = content
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)$/gm, '<p>• $1</p>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    editor.innerHTML = `<div class="ide-editor-content">${html}</div>`;
}

function clearEditor() {
    const editor = document.getElementById('ideEditorContent');
    if (editor) {
        editor.innerHTML = '<div class="ide-editor-empty">Select a file to view</div>';
    }
}

function highlightActiveFile(path) {
    document.querySelectorAll('.ide-file-item').forEach(item => {
        item.classList.remove('active');
    });

    const name = path.replace(/^~\//, '').split('/').pop();
    document.querySelectorAll('.ide-file-item').forEach(item => {
        if (item.dataset.name === name) {
            item.classList.add('active');
        }
    });
}

function updateIDETerminalPrompt() {
    const prompt = getShortPrompt();
    const promptEl = document.getElementById('ideTerminalPrompt');
    if (promptEl) {
        promptEl.textContent = prompt;
    }

    const statusDir = document.getElementById('statusDir');
    if (statusDir) {
        statusDir.textContent = getState().currentDir;
    }
}

function printIDEWelcome() {
    const output = document.getElementById('ideTerminalOutput');
    if (!output) return;

    output.innerHTML = '';
    printIDEOutput('Welcome to kenny@portfolio', 'result');
    printIDEOutput('Type "help" to see available commands', 'result');
    printIDEOutput('', 'result');
    updateIDETerminalPrompt();
}

function printIDEOutput(text, type = 'result') {
    const output = document.getElementById('ideTerminalOutput');
    if (!output) return;

    const line = document.createElement('div');
    line.className = type;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearIDETerminal() {
    const output = document.getElementById('ideTerminalOutput');
    if (output) {
        output.innerHTML = '';
    }
}

function runIDECommand(cmd) {
    if (!cmd.trim()) {
        return;
    }

    const prompt = getShortPrompt();
    printIDEOutput(`${prompt} ${cmd}`, 'command');

    const { command, args } = parseCommand(cmd);
    const result = executeCommand(command, args);

    if (result.clear) {
        clearIDETerminal();
    } else if (result.error) {
        printIDEOutput(result.error, 'error');
    } else if (result.output) {
        result.output.forEach(line => {
            printIDEOutput(line.text, line.type);
        });
    }

    const output = document.getElementById('ideTerminalOutput');
    if (output) {
        output.scrollTop = output.scrollHeight;
    }

    updateIDETerminalPrompt();

    if (command === 'cd' && result.output === undefined && !result.error) {
        renderFileTree();
    }
}

function handleIDEKeydown(e) {
    const input = e.target;

    if (e.key === 'Enter') {
        const cmd = input.value;
        input.value = '';
        runIDECommand(cmd);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = getHistoryPrevious();
        input.value = prev;
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = getHistoryNext();
        input.value = next;
    } else if (e.key === 'Tab') {
        e.preventDefault();
        handleIDETabCompletion(input);
    } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        printIDEOutput('^C', 'result');
    } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        clearIDETerminal();
    }
}

function handleIDETabCompletion(input) {
    const cursorPos = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPos);
    const textAfterCursor = input.value.substring(cursorPos);

    const parts = textBeforeCursor.split(/\s+/);
    const partial = parts[parts.length - 1];

    const completions = getCompletions(partial, getState());

    if (completions.length === 0) return;

    if (completions.length === 1) {
        parts[parts.length - 1] = completions[0];
    }

    input.value = parts.join(' ') + textAfterCursor;
    input.setSelectionRange(cursorPos, cursorPos);
}

function toggleCommandPalette() {
    const palette = document.getElementById('commandPalette');
    if (palette) {
        palette.classList.toggle('hidden');
        if (!palette.classList.contains('hidden')) {
            const input = document.getElementById('paletteInput');
            if (input) input.focus();
        }
    }
}

function hideCommandPalette() {
    const palette = document.getElementById('commandPalette');
    if (palette) {
        palette.classList.add('hidden');
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.ide-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleIDETerminal() {
    const panel = document.querySelector('.ide-terminal-panel');
    if (panel) {
        panel.classList.toggle('collapsed');
    }
}
