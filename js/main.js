const output = document.getElementById('output');
const input = document.getElementById('commandInput');
const promptEl = document.getElementById('prompt');

const state = {
    currentDir: '~',
    history: [],
    historyIndex: -1,
    chatState: null
};

function getPrompt() {
    const dir = state.currentDir === '~' ? '~' : state.currentDir.replace(/^~\//, '~/');
    return `kenny@portfolio:${dir}$`;
}

function updatePrompt() {
    promptEl.textContent = getPrompt();
}

function updateStatusBar() {
    const winbarPath = document.getElementById('winbarPath');
    const statusDir = document.getElementById('statusDir');
    const statusMode = document.getElementById('statusMode');

    const dir = state.currentDir === '~' ? '~' : state.currentDir.replace(/^~\//, '~/');
    if (winbarPath) winbarPath.textContent = dir;
    if (statusDir) statusDir.textContent = dir;

    if (state.chatState) {
        if (statusMode) statusMode.textContent = 'INSERT';
    } else {
        if (statusMode) statusMode.textContent = 'NORMAL';
    }
}

function scrollToBottom() {
    const wrapper = document.querySelector('.output-wrapper');
    if (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight;
    }
}

function print(text, type = 'result') {
    if (text === '' || text === undefined) return;

    const line = document.createElement('div');
    line.className = type;

    if (typeof text === 'object' && text.error) {
        line.className = 'error';
        line.textContent = text.error;
    } else if (typeof text === 'object' && text.html) {
        line.innerHTML = text.html;
    } else if (type === 'command') {
        line.innerHTML = `<span class="prompt-text">${text.split('$')[0]}$</span>${text.split('$').slice(1).join('$')}`;
    } else {
        line.textContent = text;
    }

    output.appendChild(line);
    scrollToBottom();
}

function handleCommand(cmd) {
    if (state.chatState) {
        handleChatInput(cmd);
        return;
    }

    const fullPrompt = getPrompt();
    print(`${fullPrompt} ${cmd}`, 'command');

    const { command, args } = parseCommand(cmd);

    if (!command) {
        updatePrompt();
        return;
    }

    if (command === 'chat') {
        if (cmd.trim()) {
            state.history.push(cmd.trim());
            state.historyIndex = state.history.length;
        }
        startChat();
        return;
    }

    if (cmd.trim()) {
        state.history.push(cmd.trim());
        state.historyIndex = state.history.length;
    }

    const result = executeCommand(command, args, state);

    if (result && result.clear) {
        output.innerHTML = '';
    } else if (result && result.openUrl) {
        print(`Opening ${result.openUrl}...`, 'result');
        window.open(result.openUrl, '_blank');
    } else if (result && result.error) {
        print(result.error, 'error');
    } else if (result) {
        print(result);
    }

    updatePrompt();
    updateStatusBar();
}

function startChat() {
    state.chatState = { step: 'name', data: {} };
    print('', 'result');
    print('--- Send me a message ---', 'result');
    print('Enter your name:', 'prompt');
    promptEl.textContent = 'Name: ';
}

function handleChatInput(value) {
    if (state.chatState.step === 'name') {
        state.chatState.data.name = value;
        state.chatState.step = 'message';
        print('Enter your message:', 'prompt');
        promptEl.textContent = 'Message: ';
    } else if (state.chatState.step === 'message') {
        state.chatState.data.message = value;
        state.chatState.step = 'done';

        const { name, message } = state.chatState.data;
        print('', 'result');
        print('--- Message Preview ---', 'result');
        print(`Name: ${name}`, 'result');
        print(`Message: ${message}`, 'result');
        print('', 'result');

        const subject = encodeURIComponent('Portfolio Message from ' + name);
        const body = encodeURIComponent(`Name: ${name}\n\nMessage:\n${message}`);
        const mailtoUrl = `mailto:mayhuek@gmail.com?subject=${subject}&body=${body}`;

        print('Opening email client...', 'result');
        window.open(mailtoUrl, '_blank');

        state.chatState = null;
        updatePrompt();
    }
}

input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        input.value = '';
        print('^C', 'result');
        state.chatState = null;
        updatePrompt();
    } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        output.innerHTML = '';
        updatePrompt();
    } else if (e.key === 'Enter') {
        const cmd = input.value;
        input.value = '';
        handleCommand(cmd);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.chatState) return;
        if (state.historyIndex > 0) {
            state.historyIndex--;
            input.value = state.history[state.historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.chatState) return;
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            input.value = state.history[state.historyIndex];
        } else {
            state.historyIndex = state.history.length;
            input.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        if (state.chatState) return;
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
        if (partial === '' && completions.length === 0) {
            completions = Object.keys(commands);
        }
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

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const action = link.dataset.action;
        if (action) {
            const commands = action.split(';').map(c => c.trim());
            commands.forEach(cmd => handleCommand(cmd));
        }
    });
});

handleCommand('nvim about.txt');
updatePrompt();
