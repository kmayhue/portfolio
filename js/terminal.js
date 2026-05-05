// Terminal Portfolio - Kenny
// Mode: terminal or gui
let currentMode = 'gui';
let currentDir = '~';
let commandHistory = [];
let historyIndex = -1;
let chatState = null; // null or { step: 'name' | 'email' | 'message', data: {} }

const files = {
    'about.txt': `Hi, I'm Kenny
Senior Data Engineer based in Emeryville, CA

Currently open to new opportunities.

Skills: Python, SQL, Data Engineering, ETL, Pandas, SQLAlchemy`,
    'projects.md': `# Projects

TODO KM - Think of projects to put here`,
    'resume.txt': `# Resume

EXPERIENCE
----------
Senior Data Engineer
1099 Contract
Present - 2 months remaining

SKILLS
------
Python, SQL, Data Engineering, ETL Pipelines, SQLAlchemy, Pandas

EDUCATION
---------
Coming soon`,
    'contact.md': `# Contact

Let's connect!

- LinkedIn: https://www.linkedin.com/in/kennethmayhue/
- GitHub: https://github.com/kmayhue
- Email: mayhuek@gmail.com

Or use the chat command to send me a message directly!`,
    'game.md': `# Game

Play my game: slopcannon.com

Terminal: curl slopcannon.com
GUI: Click "Play Game" button`
};

const directories = ['~', 'archive'];

// Initial message
window.onload = function() {
    // Start in GUI mode by default
    if (currentMode === 'gui') {
        document.getElementById('terminal').style.display = 'none';
        document.getElementById('gui').style.display = 'block';
        document.getElementById('modeBtn').textContent = 'mode: gui';
        showGuiFile('about');
    } else {
        printOutput('Welcome to kenny@portfolio', 'result');
        printOutput('Type "kenny-cli -help" to get started', 'result');
        document.getElementById('commandInput').focus();
    }
};

function toggleMode() {
    const terminal = document.getElementById('terminal');
    const gui = document.getElementById('gui');
    const btn = document.getElementById('modeBtn');

    if (currentMode === 'terminal') {
        currentMode = 'gui';
        terminal.style.display = 'none';
        gui.style.display = 'block';
        btn.textContent = 'mode: gui';
        showGuiFile('about');
    } else {
        currentMode = 'terminal';
        terminal.style.display = 'block';
        gui.style.display = 'none';
        btn.textContent = 'mode: terminal';
    }
}

function showGuiFile(name) {
    const content = document.getElementById('guiContent');

    if (name === 'projects') {
        content.innerHTML = '<h1>Projects</h1><p>TODO KM - Think of projects to put here</p>';
        return;
    }

    if (name === 'game') {
        content.innerHTML = '<h1>Game</h1><p>Play my game: slopcannon.com</p><a href="slopcannon.html" class="mailto-btn">Play Game</a>';
        return;
    }

    const guiFiles = {
        'about': files['about.txt'],
        'resume': files['resume.txt'],
        'contact': files['contact.md']
    };

    let html = guiFiles[name] || 'File not found';
    // Simple markdown to HTML
    html = html
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^- (.+)$/gm, '<p>$1</p>')
        .replace(/\n/g, '<br>');

    if (name === 'contact') {
        html += `
            <div class="contact-form">
                <h2>Send me a message</h2>
                <a href="mailto:mayhuek@gmail.com" class="mailto-btn">Open Email Client</a>
            </div>`;
    }

    content.innerHTML = html;
}

function printOutput(text, className = 'result') {
    const output = document.getElementById('output');
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    output.appendChild(line);
}

function handleCommand(cmd) {
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Add to history
    if (cmd.trim()) {
        commandHistory.push(cmd.trim());
        historyIndex = commandHistory.length;
    }

    // Handle chat state
    if (chatState) {
        handleChatInput(cmd);
        return;
    }

    switch (command) {
        case 'kenny-cli':
            if (args[0] === '-help' || args[0] === '--help') {
                printOutput('kenny-cli -help    Show this help menu', 'help-cmd');
                printOutput('ls                List files', 'help-cmd');
                printOutput('cd [dir]          Change directory', 'help-cmd');
                printOutput('cat [file]        View file content', 'help-cmd');
                printOutput('nvim [file]       Open file in editor', 'help-cmd');
                printOutput('curl <url>        Fetch URL / play game', 'help-cmd');
                printOutput('chat              Send me a message', 'help-cmd');
                printOutput('whoami            About me', 'help-cmd');
                printOutput('clear             Clear terminal', 'help-cmd');
                printOutput('pwd               Current directory', 'help-cmd');
                printOutput('date              Show current date', 'help-cmd');
                printOutput('mkdir <dir>       Create directory', 'help-cmd');
                printOutput('kenny-cli --gui   Switch to GUI mode', 'help-cmd');
            } else if (args[0] === '--gui') {
                toggleMode();
                if (currentMode === 'gui') {
                    printOutput('Switched to GUI mode', 'result');
                } else {
                    printOutput('Switched to terminal mode', 'result');
                }
            } else {
                printOutput('kenny-cli: unknown option. try "kenny-cli -help"', 'error');
            }
            break;

        case 'ls':
            listFiles();
            break;

        case 'cd':
            changeDirectory(args[0]);
            break;

        case 'cat':
            if (args[0]) {
                viewFile(args[0]);
            } else {
                printOutput('cat: missing file operand', 'error');
            }
            break;

        case 'nvim':
        case 'vi':
        case 'vim':
            if (args[0]) {
                viewFile(args[0]);
            } else {
                printOutput('nvim: missing file operand', 'error');
            }
            break;

        case 'curl':
            if (args[0]) {
                if (args[0] === 'slopcannon.com') {
                    printOutput('Downloading slopcannon.com...', 'result');
                    setTimeout(() => {
                        printOutput('Download complete!', 'result');
                        printOutput('Opening game...', 'result');
                        window.location.href = 'slopcannon.html';
                    }, 500);
                } else {
                    printOutput(`curl: could not resolve host: ${args[0]}`, 'error');
                }
            } else {
                printOutput('curl: missing URL', 'error');
            }
            break;

        case 'chat':
            startChat();
            break;

        case 'whoami':
            printOutput('kenny - Senior Data Engineer', 'result');
            break;

        case 'clear':
            document.getElementById('output').innerHTML = '';
            break;

        case 'pwd':
            printOutput('/home/kenny/' + currentDir, 'result');
            break;

        case 'date':
            printOutput(new Date().toString(), 'result');
            break;

        case 'mkdir':
            if (args[0]) {
                if (!directories.includes(args[0])) {
                    directories.push(args[0]);
                    printOutput('', 'result');
                } else {
                    printOutput(`mkdir: cannot create directory '${args[0]}': Directory already exists`, 'error');
                }
            } else {
                printOutput('mkdir: missing operand', 'error');
            }
            break;

        case '':
            break;

        default:
            printOutput(`kenny-cli: command not found: ${command}`, 'error');
    }
}

function listFiles() {
    if (currentDir === '~') {
        const dirs = directories.filter(d => d !== '~').join('  ');
        const files_list = Object.keys(files).join('  ');
        printOutput(files_list + (dirs ? '  ' + dirs : ''), 'result');
    } else if (currentDir === 'archive') {
        printOutput('old_portfolio/', 'dir');
    } else {
        printOutput('', 'result');
    }
}

function changeDirectory(dir) {
    if (!dir || dir === '~') {
        currentDir = '~';
        printOutput('', 'result');
    } else if (dir === '..') {
        currentDir = '~';
        printOutput('', 'result');
    } else if (directories.includes(dir)) {
        currentDir = dir;
        printOutput('', 'result');
    } else {
        printOutput(`cd: ${dir}: No such directory`, 'error');
    }
}

function viewFile(filename) {
    if (files[filename]) {
        printOutput(files[filename], 'result');
    } else {
        printOutput(`cat: ${filename}: No such file`, 'error');
    }
}

function startChat() {
    chatState = { step: 'name', data: {} };
    printOutput('--- Send me a message ---', 'result');
    printOutput('Enter your name:', 'prompt');
}

function handleChatInput(input) {
    if (chatState.step === 'name') {
        chatState.data.name = input;
        chatState.step = 'message';
        printOutput('Enter your message:', 'prompt');
    } else if (chatState.step === 'message') {
        chatState.data.message = input;
        chatState.step = 'done';

        // Show preview and send email
        printOutput('', 'result');
        printOutput('--- Message Preview ---', 'result');
        printOutput(`Name: ${chatState.data.name}`, 'result');
        printOutput(`Message: ${chatState.data.message}`, 'result');
        printOutput('', 'result');
        const subject = encodeURIComponent('Portfolio Message from ' + chatState.data.name);
        const body = encodeURIComponent(`Name: ${chatState.data.name}\n\nMessage:\n${chatState.data.message}`);
        printOutput('Opening email to mayhuek@gmail.com...', 'result');
        window.location.href = `mailto:mayhuek@gmail.com?subject=${subject}&body=${body}`;

        chatState = null;
    }
}

// Input handling
document.getElementById('commandInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const cmd = this.value;
        printOutput('kenny@portfolio:~$ ' + cmd, 'command');
        handleCommand(cmd);
        this.value = '';
        window.scrollTo(0, document.body.scrollHeight);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            this.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            this.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            this.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const parts = this.value.split(' ');
        const partial = parts[parts.length - 1];
        const cmd = parts[0];

        if (['cat', 'nvim', 'vi', 'vim'].includes(cmd)) {
            const allFiles = Object.keys(files).concat(directories.filter(d => d !== '~'));
            const matches = allFiles.filter(f => f.startsWith(partial));
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0];
                this.value = parts.join(' ');
            }
        } else if (cmd === 'cd') {
            const matches = directories.filter(d => d.startsWith(partial));
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0];
                this.value = parts.join(' ');
            }
        } else {
            const allCommands = ['kenny-cli', 'ls', 'cd', 'cat', 'nvim', 'curl', 'chat', 'whoami', 'clear', 'pwd', 'date', 'mkdir'];
            const matches = allCommands.filter(c => c.startsWith(partial));
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0];
                this.value = parts.join(' ');
            }
        }
    }
});

// Keep focus on input when clicking outside output
document.addEventListener('click', function(e) {
    const output = document.getElementById('output');
    const input = document.getElementById('commandInput');
    if (!output.contains(e.target) && e.target !== input) {
        input.focus();
    }
});
