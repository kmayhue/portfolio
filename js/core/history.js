class CommandHistory {
    constructor(maxSize = 1000) {
        this.history = [];
        this.index = -1;
        this.maxSize = maxSize;
    }

    add(command) {
        if (!command || !command.trim()) return;

        const trimmed = command.trim();
        if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
            return;
        }

        this.history.push(trimmed);

        if (this.history.length > this.maxSize) {
            this.history.shift();
        }

        this.index = this.history.length;
    }

    previous() {
        if (this.index > 0) {
            this.index--;
            return this.history[this.index];
        }
        return '';
    }

    next() {
        if (this.index < this.history.length - 1) {
            this.index++;
            return this.history[this.index];
        }
        this.index = this.history.length;
        return '';
    }

    reset() {
        this.index = this.history.length;
    }

    getAll() {
        return [...this.history];
    }

    clear() {
        this.history = [];
        this.index = -1;
    }

    search(prefix) {
        return this.history.filter(cmd => cmd.startsWith(prefix));
    }
}

const commandHistory = new CommandHistory();
