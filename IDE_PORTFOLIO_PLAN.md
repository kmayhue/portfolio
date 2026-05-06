# Modular Terminal Portfolio Plan

## Overview
A portfolio website with two modes:
1. **Terminal Mode** - Authentic CLI experience (must work perfectly)
2. **IDE Mode** - VS Code-like interface that mirrors terminal functionality

Both modes share the same backend logic, commands, and file system.

---

## Core Architecture

### File Structure
```
portfolio/
├── index.html           # Entry point
├── css/
│   ├── terminal.css    # Terminal-specific styles
│   ├── ide.css         # IDE-specific styles
│   └── shared.css      # Common styles (theme, fonts, layout)
├── js/
│   ├── core/
│   │   ├── filesystem.js   # Virtual file system
│   │   ├── commands.js     # Command registry & handlers
│   │   ├── parser.js       # Command parsing
│   │   ├── history.js      # Command history
│   │   └── state.js        # App state management
│   ├── modes/
│   │   ├── terminal.js     # Terminal mode UI
│   │   └── ide.js          # IDE mode UI
│   └── main.js         # Entry point, mode switching
└── assets/
    └── (fonts, icons)
```

### Shared State
```javascript
const state = {
    mode: 'terminal',        // 'terminal' | 'ide'
    currentDir: '~',
    directories: ['~', 'projects', 'about', 'archive'],
    commandHistory: [],
    historyIndex: -1,
    files: {},               // Virtual file system
    environment: {}          // Env vars, PATH, etc.
};
```

---

## Terminal Mode Requirements

### Commands (Must Work Flawlessly)
| Command | Behavior |
|---------|----------|
| `ls [-la]` | List files, support flags |
| `cd <dir>` | Navigate directories, ~, .., relative/absolute |
| `cat <file>` | Display file contents |
| `pwd` | Print working directory |
| `clear` | Clear terminal output |
| `help` | Show available commands |
| `whoami` | About the user |
| `date` | Current date/time |
| `echo <text>` | Print text |
| `mkdir <dir>` | Create directory |
| `rm <file>` | Remove file |
| `touch <file>` | Create empty file |
| `cp <src> <dst>` | Copy file |
| `mv <src> <dst>` | Move/rename file |
| `tree` | Display directory tree |
| `which <cmd>` | Find command location |

### Features
- **Tab completion** - Files, directories, commands
- **Arrow key navigation** - Up/down for history
- **Ctrl+C / Ctrl+D** - Interrupt/Exit
- **Ctrl+L** - Clear (alias for clear)
- **Ctrl+A/E** - Jump to start/end of line
- **Up/Down arrows** - History traversal
- **Command timeout** - Long-running commands can be cancelled
- **Output scrolling** - Auto-scroll to bottom, scrollback buffer
- **Working directory prompt** - Shows `~/path$`
- **Colored output** - Different colors for files, dirs, errors

### Edge Cases to Handle
- Invalid paths (`cd /fake/path`)
- Missing arguments (`cat` without file)
- Permission errors (simulated)
- Circular directory references
- Very long output (pagination with `--more`)
- Special characters in filenames
- Case sensitivity on macOS vs Linux behavior

---

## IDE Mode Requirements

### Layout (VS Code-inspired)
```
┌─────────────────────────────────────────────────┐
│ ┌─[ Explorer ]───────────────────────────────┐ │
│ │ ▼ PROJECT                                 │ │
│ │   ├─ about/                               │ │
│ │   ├─ projects/                            │ │
│ │   ├─ resume.md                            │ │
│ │   └─ contact.md                           │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ ┌─[ Terminal ]───────────────────────────────┐ │
│ │ kenny@portfolio:~$ █                       │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Panels
1. **Sidebar (Explorer)** - File tree, collapsible sections
2. **Terminal Panel** - Embedded terminal (mirrors terminal mode)
3. **Editor Area** - View file contents when clicking files in sidebar

### IDE Features
- Click file in sidebar → opens in editor panel
- Terminal at bottom (resizable, toggleable)
- File tree with expand/collapse
- Theme toggle (dark/light)
- Status bar with current directory
- Command palette (Ctrl+Shift+P)
- Keyboard shortcuts

### Key Difference from Terminal Mode
- File tree navigation instead of `cd`/`ls`
- Click-to-open files instead of `cat`
- Visual distinction but same underlying commands

---

## Virtual File System

### Default Structure
```
~
├── about/
│   ├── bio.txt
│   ├── skills.md
│   └── contact.md
├── projects/
│   ├── data-pipeline.md
│   ├── etl-tool.md
│   └── portfolio.md
├── resume.md
├── linkedin.txt     # → URL
└── github.txt      # → URL
```

### File Types
- `.txt` - Plain text
- `.md` - Markdown (rendered in IDE)
- `.json` - JSON (syntax highlighted)
- `.html` - HTML preview

---

## Command Registry Pattern

```javascript
// commands.js
const commands = {
    ls: {
        execute: (args, state) => { /* ... */ },
        help: 'List directory contents',
        completer: (partial) => ['-l', '-a', '-la']
    },
    cd: {
        execute: (args, state) => { /* ... */ },
        help: 'Change directory',
        completer: (partial) => state.directories
    }
};

function executeCommand(cmd, args, state) {
    if (commands[cmd]) {
        return commands[cmd].execute(args, state);
    }
    return { error: `command not found: ${cmd}` };
}
```

---

## Styling

### Color Palette (Dark Theme - Default)
```css
:root {
    --bg-primary: #1e1e1e;
    --bg-secondary: #252526;
    --bg-tertiary: #2d2d30;
    --fg-primary: #d4d4d4;
    --fg-secondary: #808080;
    --accent: #007acc;        /* Blue */
    --success: #4ec9b0;       /* Green */
    --error: #f14c4c;         /* Red */
    --warning: #cca700;      /* Yellow */
    --prompt: #4ec9b0;       /* Teal */
    --link: #3794ff;
}
```

### Terminal-Specific Colors
- Prompt: `#4ec9b0` (teal)
- Command: `#d4d4d4` (white)
- Error: `#f14c4c` (red)
- File: `#d4d4d4`
- Directory: `#4ec9b0`
- Executable: `#ce9178` (orange)
- Symlink: `#3794ff` (blue)

---

## Implementation Phases

### Phase 1: Core Terminal (Week 1)
- [ ] HTML structure for terminal
- [ ] Basic CSS (dark theme)
- [ ] Command parser
- [ ] Core commands: `ls`, `cd`, `cat`, `pwd`, `clear`, `help`
- [ ] Tab completion
- [ ] History (up/down arrows)
- [ ] Basic file system

### Phase 2: Terminal Polish (Week 1-2)
- [ ] All remaining commands (`mkdir`, `rm`, `touch`, `cp`, `mv`, `tree`)
- [ ] Edge case handling
- [ ] Scrolling & scrollback
- [ ] Keyboard shortcuts (Ctrl+C, Ctrl+L, etc.)
- [ ] Colored output
- [ ] Error messages

### Phase 3: IDE Shell (Week 2)
- [ ] HTML structure (sidebar, editor, terminal panel)
- [ ] CSS for IDE layout
- [ ] File tree component
- [ ] Resizable panels
- [ ] Integrate terminal logic

### Phase 4: IDE Features (Week 2-3)
- [ ] File clicking opens in editor
- [ ] Command palette (Ctrl+Shift+P)
- [ ] Theme toggle (dark/light)
- [ ] Status bar
- [ ] Settings panel

### Phase 5: Polish & Testing (Week 3)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Edge cases
- [ ] Documentation

---

## Testing Checklist

### Terminal
- [ ] Every command works with valid input
- [ ] Every command shows proper error for invalid input
- [ ] Tab completion works for all contexts
- [ ] History navigation works correctly
- [ ] Scrolling works with large output
- [ ] Works on mobile (touch-friendly)

### IDE
- [ ] File tree renders correctly
- [ ] Clicking files opens content
- [ ] Terminal functions identically to standalone
- [ ] Panels are resizable
- [ ] Keyboard shortcuts work
- [ ] Theme toggle works

---

## Future Extensibility

### Easy to Add
- New commands: Add to `commands.js` registry
- New files: Add to `filesystem.js`
- New panels: Add to IDE layout
- Themes: Add CSS variables

### Potential Features
- Multiple terminal tabs in IDE
- File editing (vim-like in terminal)
- Git integration
- Live search/filter
- Command aliases
- Environment variables
- Piping (`cat file | grep text`)
- Redirects (`cat file > output.txt`)
