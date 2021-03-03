const fs = require('fs');
require("dotenv").config();
const http = require('http');
const { run } = require('./circulatingSupply');

let currentValue = undefined;
const debugging = !!+process.env.DEBUG;

const log = (message) => {
  fs.appendFileSync(process.env.LOGFILE, `${message}\r\n`);
}

const previousSupplyStorage = "./latestSupply.txt";

const writePreviousSupply = () => {
  if (currentValue !== undefined) {
    fs.writeFile(previousSupplyStorage, currentValue, (ex) => { if (ex) { log(ex.stack); } });
  }
}

const readPreviousSupply = () => {
  try {
    if (fs.existsSync(previousSupplyStorage)) {
      currentValue = fs.readFileSync(previousSupplyStorage);
    }
  }
  catch (ex) {
    log(ex.stack);
  }
}

const refresh = () => run(debugging, log)
  .then((result) => {
    if (result !== undefined) {
      currentValue = result;
      /**
       * Persist this value to be able to restart with the latest value. FastComet keeps bringing down
       * this service even though they say they don't.
       */
      writePreviousSupply();
    }
  })
  .then(async () => {
  })
  .catch((ex) => {
    log(ex.stack);
  });

if (debugging) {
  log(`network: ${process.env.NETWORK}`);
}

setInterval(refresh, process.env.INTERVAL_FETCH_SECONDS * 1000);

refresh();

const server = http.createServer(async function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  if (currentValue === undefined) {
    await readPreviousSupply();
  }
  /**
   * should only return "N/A" if the supply has never before been persisted
   */
  var response = currentValue === undefined ? "N/A" : currentValue;
  res.write(response);
  res.end();
});

server.listen(process.env.PORT);
