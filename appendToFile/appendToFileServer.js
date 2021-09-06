const fs = require('fs');
require("dotenv").config();
const http = require('http');

const debugging = !!+process.env.DEBUG;

const log = (message) => {
  fs.appendFileSync(process.env.LOGFILE, `${message}\r\n`);
}

const writeStringToStorage = (value, prod) => {
  if (value !== undefined) {
    const fileStorage = `./emailAddresses${!prod ? "-test" : ""}.txt`;
    log(`Writing: ${value} to ${fileStorage}`);
    // should write as 'utf-8' by default
    fs.appendFile(fileStorage, value + "\r\n", (ex) => { if (ex) { log(ex.stack); } });
  }
}

if (debugging) {
  log(`network: ${process.env.NETWORK}`);
}

const server = http.createServer(async function (req, res) {
  const getString = (value) => {
    let json;
    try {
      console.log(value);
      json = JSON.parse(value);
      console.dir(json);
      /**
       * {
       *   prod?: true|false|1|0 // if missing then assumed false
       *   email: string
       * }
       */
      writeStringToStorage(json.email, (!!json?.prod ?? false));
    } catch (ex) {
      log(`An error occurred parsing the posted data ${ex.message ?? ex}`)
    }
  };

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  req.setEncoding('utf-8');
  req.on('data', getString);
  req.read();
  res.end();
});

server.listen(process.env.PORT ?? 8080);
