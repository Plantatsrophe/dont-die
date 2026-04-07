const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Basic file serving from current directory
    let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not Found");
        return;
    }
    
    const ext = path.extname(filePath);
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png' }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(filePath));
});

server.listen(8080, '127.0.0.1', () => {
    console.log("Server running at http://127.0.0.1:8080/");
});
