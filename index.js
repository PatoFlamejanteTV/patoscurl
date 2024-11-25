const express = require('express');
const fs = require('fs'); // Import the fs module for file system operations
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to check if the request is from curl
function detectCurl(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';
    req.isCurl = userAgent.toLowerCase().includes('curl');
    next();
}

app.use(detectCurl);

// Route to handle requests
app.get('/', (req, res) => {
    if (req.isCurl) {
        // Respond with plain text for curl requests
        res.type('text/plain');
        res.send("Hello, World!\nThis is a text-only response for curl.");
    } else {
        // Respond with the content of indexbrowser.html for browser requests
        fs.readFile('indexbrowser.html', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error reading indexbrowser.html');
            } else {
                res.type('text/html');
                res.send(data);
            }
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});