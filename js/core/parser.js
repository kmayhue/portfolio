function parseCommand(input) {
    const trimmed = input.trim();

    if (!trimmed) {
        return { command: '', args: [] };
    }

    const parts = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i];

        if ((char === '"' || char === "'") && !inQuotes) {
            inQuotes = true;
            quoteChar = char;
        } else if (char === quoteChar && inQuotes) {
            inQuotes = false;
            quoteChar = '';
        } else if (char === ' ' && !inQuotes) {
            if (current) {
                parts.push(current);
                current = '';
            }
        } else {
            current += char;
        }
    }

    if (current) {
        parts.push(current);
    }

    return {
        command: parts[0] || '',
        args: parts.slice(1)
    };
}

function parseArgs(args) {
    const parsed = [];
    let i = 0;

    while (i < args.length) {
        const arg = args[i];

        if (arg === '--') {
            parsed.push(...args.slice(i + 1));
            break;
        } else if (arg.startsWith('--')) {
            parsed.push(arg);
        } else if (arg.startsWith('-')) {
            for (let j = 1; j < arg.length; j++) {
                parsed.push('-' + arg[j]);
            }
        } else {
            parsed.push(arg);
        }
        i++;
    }

    return parsed;
}
