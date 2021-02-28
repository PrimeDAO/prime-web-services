require("dotenv").config();
const http = require('http');
const { run } = require('./circulatingSupply');

let currentValue = "N/A";

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

  // var message = 'It works!\n',
  //   version = 'NodeJS ' + process.versions.node + '\n',
  //   response = [message, version].join('\n');
  var response = currentValue;
  res.end(response);
});
server.listen(8799);
