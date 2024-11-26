const express = require("express");
const fs = require("fs"); // Import the fs module for file system operations
const os = require("os"); // Import the os module for system information
const dns = require("dns"); // Import the dns module for DNS resolution
const app = express();
const PORT = process.env.PORT || 3000;

//const CURLDEBUGASCII = process.env.CURLDEBUGASCII || 1234;

// Middleware to check if the request is from curl
function detectCurl(req, res, next) {
  const userAgent = req.headers["user-agent"] || "";
  req.isCurl = userAgent.toLowerCase().includes("curl");
  next();
}

app.use(detectCurl);

// Route to handle requests
app.get("/", (req, res) => {
  const startTime = Date.now(); // Record start time for delay calculation
  const ipAddress = req.socket.remoteAddress; // Get client IP address

  console.log("/ " + req.socket.remoteAddress + ". isCURL? " + req.isCurl);
  if (req.isCurl) {
    // Respond with the content of indexcurl.txt for curl requests
    fs.readFile("indexcurl.txt", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error reading indexcurl.txt");
      } else {
        //const endTime = Date.now(); // Record end time for delay calculation
        //const delay = endTime - startTime; // Calculate the delay

        // Add server info and debug data to the response
        const serverInfo = `\n\n\nServer Info:\nIP Address: ${ipAddress}\n`;
        res.type("text/plain"); // Set content type to plain text
        res.send(`${serverInfo}\n${data}`);
      }
    });
  } else {
    // Respond with the content of indexbrowser.html for browser requests
    fs.readFile("indexbrowser.html", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error reading indexbrowser.html");
      } else {
        res.type("text/html");
        res.send(data);
      }
    });
  }
});

// Route for subpages
app.get("/:subpage", (req, res) => {
  console.log("/${subpage}" + req.socket.remoteAddress + ". isCURL? " + req.isCurl);
  //console.log(req.socket.remoteAddress);
  const subpage = req.params.subpage;
  const filePath = `./${subpage}.txt`;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).send("Subpage not found");
    } else {
      if (req.isCurl) {
        res.type("text/plain");
        res.send(data);
      } else {
        res.type("text/html");
        res.send(data);
      }
    }
  });
});

// Route for the debug subpage
app.get("/TEST/debug", (req, res) => {
  console.log("/TEST/debug " + req.socket.remoteAddress + ". isCURL? " + req.isCurl);
  const ipAddress = req.socket.remoteAddress; // Get client IP address
  const userAgent = req.headers["user-agent"] || "";
  const hostname = os.hostname(); // Get the hostname of the server
  const platform = os.platform(); // Get the operating system
  const arch = os.arch(); // Get the system architecture
  const totalMemory = os.totalmem() / (1024 * 1024); // Get total memory in MB
  const freeMemory = os.freemem() / (1024 * 1024); // Get free memory in MB
  const cpuCount = os.cpus().length; // Get the number of CPU cores
  const uptime = os.uptime(); // Get the server uptime in seconds

  // Get DNS information
  dns.lookup(hostname, (err, addresses, family) => {
    if (err) {
      console.error(err);
      addresses = "N/A";
    }

    // Get lines of code
    let totalLines = 0;
    const files = ["*"]; // Add other file paths as needed
    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      totalLines += content.split("\n").length;
    });

    const NPMVERSION = process.env.npm_package_version;

    // Construct the debug information
    const debugInfo = `
            Debug Information
            Client IP Address: ${ipAddress}
            User Agent: ${userAgent}
            Server Hostname: ${hostname}
            Server Platform: ${platform}
            Server Architecture: ${arch}
            Total Memory: ${totalMemory.toFixed(2)} MB
            Free Memory: ${freeMemory.toFixed(2)} MB
            CPU Cores: ${cpuCount}
            Uptime: ${Math.floor(uptime / 60 / 60)} hours, ${Math.floor((uptime % 3600) / 60)} minutes
            DNS Lookup (IP): ${addresses}
            Lines of Code (and ASCII): ${totalLines}
            NPM ver: ${NPMVERSION}
        `;

    //console.log(debugInfo);

    // Send the debug information as HTML
    res.type("text/html");
    res.send(debugInfo);
  });
});

app.get("/TEST/mem", (req, res) => {
  console.log("/TEST/mem " + req.socket.remoteAddress + ". isCURL? " + req.isCurl);
  const totalMemory = os.totalmem() / (1024 * 1024); // Get total memory in MB
  const freeMemory = os.freemem() / (1024 * 1024); // Get free memory in MB
  const cpuCount = os.cpus().length; // Get the number of CPU cores
  const uptime = os.uptime(); // Get the server uptime in seconds

    // Send the debug information as HTML
    res.type("text/plain");
    res.send(`
            Total Memory: ${totalMemory} MB
            Free Memory: ${freeMemory} MB
            CPU Cores: ${cpuCount} cores
            Uptime: ${uptime}`
            );
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
