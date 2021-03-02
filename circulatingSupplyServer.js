require("dotenv").config();
const http = require('http');
const { run } = require('./circulatingSupply');

let currentValue = undefined;

const refresh = () => run()
  .then((result) => {
    if (result) {
      currentValue = result;
    }
  })
  .catch(console.log);

setInterval(refresh, process.env.INTERVAL_FETCH_SECONDS * 1000);

refresh();

const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  var response = currentValue ? currentValue : "N/A";
  res.end(response);
});
// this is the timeout on execution of requests
server.timeout = 3600000; // an hour
server.listen(8080);
