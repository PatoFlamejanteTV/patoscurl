const express = require('express');
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
        // Respond with HTML for browser requests
        res.type('text/html');
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Hello World</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                </style>
            </head>
            <body>
                <h1>Hello, World!</h1>
                <p>This is a full HTML response for modern browsers.</p>
            </body>
            </html>
        `);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
