// https://nodejs.org/api/cluster.html
const cluster = require('cluster')
const os = require('os')
const process = require('process')
const express = require('express');
const responseTime = require('response-time')

// see amount of CPU cores on Mac
// sysctl -n hw.ncpu
// or amount of CPU cores on Windows
// wmic cpu get NumberOfCores, NumberOfLogicalProcessors
const numCPUs = os.cpus().length;
// console.log(numCPUs)

// Clusters of Node.js processes can be used to run multiple instances of Node.js 
// that can distribute workloads among their application threads

//The cluster module allows easy creation of child processes that all share server ports
if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${numCPUs}`);
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app = express();
  app.use(responseTime())
  console.log(`Worker ${process.pid} started`);
 
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
 
  app.get("/api/:n", function (req, res) {
    let n = parseInt(req.params.n);
    let count = 0;
 
    if (n > 5000000000) n = 5000000000;
 
    for (let i = 0; i <= n; i++) {
      count += i;
    }
 
    res.send(`Final count is ${count}`);
  });

  app.listen(6000, () => {
    console.log('Listening on port %d', server.address().port)
  });
}


// curl requests
// link: https://curl.se/docs/manual.html
// Udregningen af tallet påvirker responstiden

// curl -v http://localhost:6000/api/5000000000
// curl -i http://localhost:6000/api/5000000000


// loadtest
// npm install -g loadtest
// link: https://www.npmjs.com/package/loadtest

// loadtest http://localhost:6000/api/500000 -n 1000 -c 100
// loadtest http://localhost:6000/api/500000000 -n 1000 -c 100