const state = {
    mode: 'terminal',
    currentDir: '~/',
    commandHistory: [],
    historyIndex: -1,
    environment: {
        HOME: '~',
        USER: 'kenny',
        HOST: 'portfolio',
        PATH: '/usr/bin:/bin',
        LANG: 'en_US.UTF-8',
        SHELL: 'kenny-cli'
    },
    chatState: null,
    tabCompletion: {
        partial: '',
        matches: [],
        matchIndex: 0
    },
    lastCommand: ''
};

function getState() {
    return state;
}

function setMode(mode) {
    state.mode = mode;
}

function setCurrentDir(dir) {
    state.currentDir = dir;
}

function addToHistory(command) {
    if (command.trim()) {
        state.commandHistory.push(command.trim());
        state.historyIndex = state.commandHistory.length;
    }
}

function getHistoryPrevious() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        return state.commandHistory[state.historyIndex];
    }
    return '';
}

function getHistoryNext() {
    if (state.historyIndex < state.commandHistory.length - 1) {
        state.historyIndex++;
        return state.commandHistory[state.historyIndex];
    }
    state.historyIndex = state.commandHistory.length;
    return '';
}

function resetHistoryIndex() {
    state.historyIndex = state.commandHistory.length;
}

function setTabCompletion(matches, partial = '') {
    state.tabCompletion.partial = partial;
    state.tabCompletion.matches = matches;
    state.tabCompletion.matchIndex = 0;
}

function getNextCompletion() {
    if (state.tabCompletion.matches.length === 0) return null;
    const match = state.tabCompletion.matches[state.tabCompletion.matchIndex];
    state.tabCompletion.matchIndex = (state.tabCompletion.matchIndex + 1) % state.tabCompletion.matches.length;
    return match;
}

function resetTabCompletion() {
    state.tabCompletion = { partial: '', matches: [], matchIndex: 0 };
}

function getPrompt() {
    const dir = state.currentDir === '~' ? '~' : state.currentDir.replace(/^~\//, '~/');
    return `${state.environment.USER}@${state.environment.HOST}:${dir}$`;
}

function getShortPrompt() {
    const dir = state.currentDir === '~' ? '~' : state.currentDir.replace(/^~\//, '~/');
    return `${state.environment.USER}@${state.environment.HOST}:${dir}$`;
}
