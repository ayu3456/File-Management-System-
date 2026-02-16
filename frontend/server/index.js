const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;
const VFM_PATH = path.resolve(__dirname, '../../vfm');

app.use(cors());
app.use(bodyParser.json());

// Helper to execute VFM commands
const runVFM = (args) => {
    return new Promise((resolve, reject) => {
        exec(`${VFM_PATH} ${args}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(stderr || error.message);
                return;
            }
            if (stderr) {
                // Some warnings might be printed to stderr, but if exit code is 0, it might be fine.
                // However, C implementation prints errors to stderr.
                console.warn(`Stderr: ${stderr}`);
            }
            try {
                // Try strictly parsing JSON if it looks like JSON
                const jsonStart = stdout.indexOf('{');
                const jsonArrayStart = stdout.indexOf('[');
                if (jsonStart !== -1 || jsonArrayStart !== -1) {
                     // Find the first valid JSON character
                     const start = (jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart)) ? jsonStart : jsonArrayStart;
                     const jsonStr = stdout.substring(start);
                     resolve(JSON.parse(jsonStr));
                } else {
                    resolve({ message: stdout.trim() });
                }
            } catch (e) {
                resolve({ raw: stdout.trim(), message: "Non-JSON output" });
            }
        });
    });
};

// Start by ensuring disk is initialized (run list once)
runVFM('list').then(() => console.log('VFM Initialized')).catch(err => console.error('VFM Init Failed:', err));


app.get('/api/files', async (req, res) => {
    try {
        const result = await runVFM('list');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.post('/api/files', async (req, res) => {
    const { filename, size } = req.body;
    if (!filename || !size) return res.status(400).json({ error: 'Missing filename or size' });
    try {
        const result = await runVFM(`create "${filename}" ${size}`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.get('/api/files/:name', async (req, res) => {
    const filename = req.params.name;
    try {
        const result = await runVFM(`read "${filename}"`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.put('/api/files/:name', async (req, res) => {
    const filename = req.params.name;
    const { content } = req.body;
    if (content === undefined) return res.status(400).json({ error: 'Missing content' });
    
    // Escape content for CLI - this is basic and might need improvement for complex chars
    // For now, removing double quotes or handling them?
    // Using single quotes for the argument in shell might be safer, but content might have single quotes.
    // The C backend takes all remaining args as data, so we don't strictly need quotes IF we can ensure no shell reserved chars execute.
    // But `write_file` in C joins argv[3..].
    // Simplest approach: pass it as a single string argument if possible, or just raw args.
    // In `runVFM` we use string template.
    // Let's escape double quotes in content:
    const escapedContent = content.replace(/"/g, '\\"');
    
    try {
        const result = await runVFM(`write "${filename}" "${escapedContent}"`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.delete('/api/files/:name', async (req, res) => {
    const filename = req.params.name;
    try {
        const result = await runVFM(`delete "${filename}"`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.get('/api/status', async (req, res) => {
    try {
        const result = await runVFM('status');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
