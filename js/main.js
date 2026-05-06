function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'terminal';

    setMode(mode);

    if (mode === 'ide') {
        showIDEMode();
    } else {
        showTerminalMode();
    }
}

function toggleMode() {
    const currentMode = getState().mode;
    const newMode = currentMode === 'terminal' ? 'ide' : 'terminal';
    setMode(newMode);

    if (newMode === 'ide') {
        showIDEMode();
    } else {
        showTerminalMode();
    }

    updateModeButton();
}

function showTerminalMode() {
    const terminal = document.getElementById('terminal');
    const ide = document.getElementById('ide');

    if (terminal) terminal.classList.remove('hidden');
    if (ide) ide.classList.add('hidden');

    initTerminal();
}

function showIDEMode() {
    const terminal = document.getElementById('terminal');
    const ide = document.getElementById('ide');

    if (terminal) terminal.classList.add('hidden');
    if (ide) ide.classList.remove('hidden');

    initIDE();

    const ideInput = document.getElementById('ideTerminalInput');
    if (ideInput) {
        ideInput.addEventListener('keydown', handleIDEKeydown);
    }
}

function updateModeButton() {
    const btn = document.getElementById('modeBtn');
    if (btn) {
        const mode = getState().mode;
        btn.textContent = `mode: ${mode}`;
    }
}

document.addEventListener('DOMContentLoaded', init);
