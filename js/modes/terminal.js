function initTerminal() {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;

    const input = document.getElementById('terminalInput');
    if (!input) return;

    input.addEventListener('keydown', handleTerminalKeydown);

    input.addEventListener('click', () => {
        input.focus();
    });

    terminal.addEventListener('click', (e) => {
        if (e.target === terminal) {
            input.focus();
        }
    });

    printWelcome();
}

function handleTerminalKeydown(e) {
    const input = e.target;

    if (e.key === 'Enter') {
        const cmd = input.value;
        input.value = '';
        executeTerminalCommand(cmd);
        resetHistoryIndex();
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
        handleTabCompletion(input);
    } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        printOutput('^C', 'result');
        printPrompt();
    } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        clearTerminal();
        printPrompt();
    } else if (e.key === 'a' && e.ctrlKey) {
        e.preventDefault();
        input.setSelectionRange(0, 0);
    } else if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        input.setSelectionRange(input.value.length, input.value.length);
    } else if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        if (input.value === '') {
            printOutput('exit', 'result');
        }
    }
}

function executeTerminalCommand(cmd) {
    if (!cmd.trim()) {
        printPrompt();
        return;
    }

    addToHistory(cmd);
    const prompt = getPrompt();
    printOutput(`${prompt} ${cmd}`, 'command');

    const { command, args } = parseCommand(cmd);
    const result = executeCommand(command, args);

    if (result.clear) {
        clearTerminal();
    } else if (result.exit) {
        printOutput('Goodbye!', 'result');
    } else if (result.error) {
        printOutput(result.error, 'error');
    } else if (result.output) {
        result.output.forEach(line => {
            printOutput(line.text, line.type);
        });
    }

    if (!result.clear) {
        scrollToBottom();
        printPrompt();
    }
}

function printWelcome() {
    printOutput('Welcome to kenny@portfolio', 'result');
    printOutput('Type "help" to see available commands', 'result');
    printOutput('', 'result');
    printPrompt();
}

function printPrompt() {
    const prompt = getPrompt();
    const promptEl = document.getElementById('terminalPrompt');
    if (promptEl) {
        promptEl.textContent = prompt;
    }
    const input = document.getElementById('terminalInput');
    if (input) {
        input.focus();
    }
}

function printOutput(text, type = 'result') {
    const output = document.getElementById('terminalOutput');
    if (!output) return;

    const line = document.createElement('div');
    line.className = type;
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
}

function clearTerminal() {
    const output = document.getElementById('terminalOutput');
    if (output) {
        output.innerHTML = '';
    }
}

function scrollToBottom() {
    const output = document.getElementById('terminalOutput');
    if (output) {
        output.scrollTop = output.scrollHeight;
    }
}

function handleTabCompletion(input) {
    const cursorPos = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPos);
    const textAfterCursor = input.value.substring(cursorPos);

    const parts = textBeforeCursor.split(/\s+/);
    const partial = parts[parts.length - 1];

    const completions = getCompletions(partial, getState());

    if (completions.length === 0) {
        return;
    }

    if (completions.length === 1) {
        parts[parts.length - 1] = completions[0];
    } else {
        printOutput(partial + completions.join('  '), 'result');
        setTabCompletion(completions, partial);
    }

    input.value = parts.join(' ') + textAfterCursor;
    input.setSelectionRange(cursorPos, cursorPos);
}

function runTerminalCommand(cmd) {
    const { command, args } = parseCommand(cmd);
    const result = executeCommand(command, args);

    if (result.clear) {
        clearTerminal();
    } else if (result.exit) {
    } else if (result.error) {
        printOutput(result.error, 'error');
    } else if (result.output) {
        result.output.forEach(line => {
            printOutput(line.text, line.type);
        });
    }

    return result;
}
