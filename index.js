const express = require('express');
const fs = require('fs'); // Import the fs module for file system operations
const app = express();
const PORT = process.env.PORT || 3000;

//const CURLDEBUGASCII = process.env.CURLDEBUGASCII || 1234;

// Middleware to check if the request is from curl
function detectCurl(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';
    req.isCurl = userAgent.toLowerCase().includes('curl');
    next();
}

app.use(detectCurl);

// Route to handle requests
app.get('/', (req, res) => {
    const startTime = Date.now(); // Record start time for delay calculation
    const ipAddress = req.socket.remoteAddress; // Get client IP address

    if (req.isCurl) {
        // Respond with the content of indexcurl.txt for curl requests
        fs.readFile('indexcurl.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error reading indexcurl.txt');
            } else {
                //const endTime = Date.now(); // Record end time for delay calculation
                //const delay = endTime - startTime; // Calculate the delay

                // Add server info and debug data to the response
                const serverInfo = `\n\n\nServer Info:\nIP Address: ${ipAddress}\n`;
                res.type('text/plain'); // Set content type to plain text
                res.send(`${serverInfo}\n${data}`);
            }
        });
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