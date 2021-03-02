const fs = require('fs');
require("dotenv").config();
const http = require('http');
const { run } = require('./circulatingSupply');

let currentValue = undefined;
const debugging = !!+process.env.DEBUG;

const log = (message) => {
  fs.appendFileSync(process.env.LOGFILE, `${message}\r\n`, () => { });
}

const refresh = () => run(debugging, log)
  .then((result) => {
    if (result) {
      currentValue = result;
    }
  })
  .then(async () => {
    /**
     * keep ourselves alive...
     */
    // const pingResult = await ping.promise.probe(process.env.SELF);
    // if (debugging) {
    //   log(`${process.env.SELF} is ${pingResult.alive ? "alive" : "not alive"}`);
    // }
  })
  .catch((ex) => {
    log(ex.stack);
  });

setInterval(refresh, process.env.INTERVAL_FETCH_SECONDS * 1000);

refresh();

const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  var response = currentValue ? currentValue : "N/A";
  res.write(response);
  res.end();
});

server.listen();
