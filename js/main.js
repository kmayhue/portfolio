const output = document.getElementById('output');
const input = document.getElementById('commandInput');
const promptEl = document.getElementById('prompt');

const state = {
    currentDir: '~',
    history: [],
    historyIndex: -1
};

function getPrompt() {
    const dir = state.currentDir === '~' ? '~' : state.currentDir.replace(/^~\//, '~/');
    return `kenny@portfolio:${dir}$`;
}

function updatePrompt() {
    promptEl.textContent = getPrompt();
}

function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
}

function print(text, type = 'result') {
    if (text === '' || text === undefined) return;

    const line = document.createElement('div');
    line.className = type;

    if (typeof text === 'object' && text.error) {
        line.className = 'error';
        line.textContent = text.error;
    } else {
        line.textContent = text;
    }

    output.appendChild(line);
    scrollToBottom();
}

function handleCommand(cmd) {
    const fullPrompt = getPrompt();
    print(`${fullPrompt} ${cmd}`, 'command');

    const { command, args } = parseCommand(cmd);

    if (!command) {
        updatePrompt();
        return;
    }

    if (cmd.trim()) {
        state.history.push(cmd.trim());
        state.historyIndex = state.history.length;
    }

    const result = executeCommand(command, args, state);

    if (result && result.clear) {
        output.innerHTML = '';
    } else if (result && result.error) {
        print(result.error, 'error');
    } else if (result) {
        print(result);
    }

    updatePrompt();
}

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = input.value;
        input.value = '';
        handleCommand(cmd);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.historyIndex > 0) {
            state.historyIndex--;
            input.value = state.history[state.historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            input.value = state.history[state.historyIndex];
        } else {
            state.historyIndex = state.history.length;
            input.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTabCompletion();
    }
});

function handleTabCompletion() {
    const cursorPos = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPos);
    const parts = textBeforeCursor.split(/\s+/);
    const partial = parts[parts.length - 1];

    let completions = [];

    if (parts.length === 1) {
        completions = Object.keys(commands).filter(c => c.startsWith(partial));
    } else {
        const cmd = parts[0];
        if (commands[cmd] && commands[cmd].completer) {
            completions = commands[cmd].completer(partial, state);
        }
    }

    if (completions.length === 1) {
        parts[parts.length - 1] = completions[0];
        input.value = parts.join(' ');
    } else if (completions.length > 1) {
        print(completions.join('  '), 'result');
    }
}

input.addEventListener('click', () => input.focus());
document.addEventListener('click', (e) => {
    if (e.target !== input) input.focus();
});

print('Welcome to kenny@portfolio');
print('Type "help" for available commands');
print('');
updatePrompt();
