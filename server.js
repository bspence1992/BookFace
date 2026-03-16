require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        let filePath = '.' + req.url;
        if (filePath === './') filePath = './index.html';
        const ext = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript'
        };
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); res.end('Not found'); return; }
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(data);
        });
    }

    if (req.method === 'POST' && req.url === '/api/characters') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const { bookTitle, author } = JSON.parse(body);

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-opus-4-5',
                    max_tokens: 1024,
                    messages: [{
                        role: 'user',
                        content: `List the 4 main characters from the book titled "${bookTitle}"${author ? ` by ${author}` : ''}. Return ONLY a JSON array with this exact format, no extra text:
[
  {"name": "Character Name", "title": "Their title or role", "description": "2 sentence physical and personality description"},
  ...
]`
                    }]
                })
            });

            const data = await response.json();
            console.log('Claude response:', JSON.stringify(data));

            if (!data.content) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Claude API error', details: data }));
                return;
            }

            const text = data.content[0].text;
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
                return;
            }
            const characters = JSON.parse(jsonMatch[0]);

            for (let character of characters) {
    try {
        const cleanName = character.name.replace(/[^a-zA-Z0-9 ]/g, ' ');
        const imageResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STABILITY_API_KEY}`
            },
            body: JSON.stringify({
                text_prompts: [{ text: `Portrait of ${cleanName}, ${character.description}, fantasy book character, detailed, painterly art style` }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                samples: 1,
                steps: 30
            })
        });
        const imageData = await imageResponse.json();
        character.image = `data:image/png;base64,${imageData.artifacts[0].base64}`;
    } catch (err) {
        console.error('Image failed for', character.name, ':', err.message);
        character.image = null;
    }
}

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(characters));
        });
    }
});

server.listen(3000, () => {
    console.log('BookFace server running at http://localhost:3000');
});