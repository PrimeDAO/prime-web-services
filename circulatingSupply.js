require("dotenv").config();
const { ethers } = require("ethers");
// const { parseUnits } = require("ethers/lib/utils");
const ContractAddresses = require("./src/contracts/contractAddresses.json");
const LockingToken4ReputationAbi = require("./src/contracts/LockingToken4Reputation.json");
const BPoolAbi = require("./src/contracts/BPool.json");

// const Contracts = new Map([
//   ["LockingToken4Reputation", ContractAddresses[process.env.NETWORK].LockingToken4Reputation]
//   , ["BPool", ContractAddresses[process.env.NETWORK].BPool]
//   ,
// ]);

async function getCirculatingSupply(provider) {

  const lockingToken4Reputation = new ethers.Contract(
    ContractAddresses[process.env.NETWORK].LockingToken4Reputation,
    LockingToken4ReputationAbi.abi,
    provider);

  const bPool = new ethers.Contract(
    ContractAddresses[process.env.NETWORK].BPool,
    BPoolAbi.abi,
    provider);

}

async function main() {
  const ProviderEndpoints = {
    "mainnet": `https://${process.env.RIVET_ID}.eth.rpc.rivet.cloud/`,
    "rinkeby": `https://${process.env.RIVET_ID}.rinkeby.rpc.rivet.cloud/`,
    // "kovan": `https://${process.env.RIVET_ID}.kovan.rpc.rivet.cloud/`,
    "kovan": `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
  }

  console.log(`network: ${process.env.NETWORK}`);

  const provider = ethers.getDefaultProvider(ProviderEndpoints[process.env.NETWORK]);

  await getCirculatingSupply(provider)
}

main()
  .then(() => { process.exit(0) })
  .catch((ex) => { console.error(ex); process.exit(-1); });
