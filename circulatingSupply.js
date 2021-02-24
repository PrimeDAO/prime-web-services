require("dotenv").config();
const { ethers, BigNumber } = require("ethers");
const { formatEther } = require("ethers/lib/utils");
const ContractAddresses = require("./src/contracts/contractAddresses.json");
const LockingToken4ReputationAbi = require("./src/contracts/LockingToken4Reputation.json");
const PrimeTokenAbi = require("./src/contracts/PrimeToken.json");
const BPoolAbi = require("./src/contracts/BPool.json");

function fromWei(weiValue) {
  return formatEther(weiValue.toString());
};

async function getCirculatingSupply(provider) {

  const lockingToken4Reputation = new ethers.Contract(
    ContractAddresses[process.env.NETWORK].LockingToken4Reputation,
    LockingToken4ReputationAbi.abi,
    provider);

  const bPool = new ethers.Contract(
    ContractAddresses[process.env.NETWORK].BPool,
    BPoolAbi.abi,
    provider);

  const primeToken = new ethers.Contract(
    ContractAddresses[process.env.NETWORK].PrimeToken,
    PrimeTokenAbi.abi,
    provider);

  const primeTokenSupply = await primeToken.totalSupply();
  const poolPrimeBalance = await bPool.getBalance(primeToken.address);
  const primeDaoPrimeBalance = await primeToken.balanceOf(ContractAddresses[process.env.NETWORK].Avatar);
  const treasuryPrimeBalance = await primeToken.balanceOf(process.env.TREASURY);
  const primeLockedForRep = await lockingToken4Reputation.totalLocked();
  console.log(`primeTokenSupply: ${fromWei(primeTokenSupply)}`);
  console.log(`poolPrimeBalance: ${fromWei(poolPrimeBalance)}`);
  console.log(`primeDaoPrimeBalance: ${fromWei(primeDaoPrimeBalance)}`);
  console.log(`primeLockedForRep: ${fromWei(primeLockedForRep)}`);
  console.log(`treasuryPrimeBalance: ${fromWei(treasuryPrimeBalance)}`);
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
