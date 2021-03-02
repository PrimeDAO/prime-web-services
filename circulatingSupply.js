require("dotenv").config();
const { ethers, BigNumber } = require("ethers");
const { formatEther } = require("ethers/lib/utils");
const ContractAddresses = require("./contracts/contractAddresses.json");
const LockingToken4ReputationAbi = require("./contracts/LockingToken4Reputation.json");
const PrimeTokenAbi = require("./contracts/PrimeToken.json");
const BPoolAbi = require("./contracts/BPool.json");
const vestingContracts = require("./vestingContracts.json").vestingContracts;
let debugging = false;

function fromWei(weiValue) {
  return formatEther(weiValue.toString());
};


async function getCirculatingSupply(provider, log) {
  try {
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
    let sumVestedPrime = BigNumber.from(0);
    for (const spec of vestingContracts) {
      sumVestedPrime = sumVestedPrime.add(await primeToken.balanceOf(spec.contractAddress));
    }

    const result = fromWei(
      primeTokenSupply.sub(
        poolPrimeBalance
          .add(primeDaoPrimeBalance)
          .add(primeLockedForRep)
          .add(treasuryPrimeBalance)
          .add(sumVestedPrime)));

    if (debugging) {
      log(`primeTokenSupply: ${fromWei(primeTokenSupply)}`);
      log(`poolPrimeBalance: ${fromWei(poolPrimeBalance)}`);
      log(`primeDaoPrimeBalance: ${fromWei(primeDaoPrimeBalance)}`);
      log(`primeLockedForRep: ${fromWei(primeLockedForRep)}`);
      log(`treasuryPrimeBalance: ${fromWei(treasuryPrimeBalance)}`);
      log(`sumVestedPrime: ${fromWei(sumVestedPrime)}`);
      log(`circulating supply: ${result}`);
    }
    return result;
  } catch (ex) {
    try {
      log(ex.stack);
    } finally {
      return undefined;
    }
  }
}

const run = (debug, log) => {

  debugging = !!debug;

  const ProviderEndpoints = {
    "mainnet": `https://${process.env.RIVET_ID}.eth.rpc.rivet.cloud/`,
    "rinkeby": `https://${process.env.RIVET_ID}.rinkeby.rpc.rivet.cloud/`,
    // "kovan": `https://${process.env.RIVET_ID}.kovan.rpc.rivet.cloud/`,
    "kovan": `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
  }

  if (debugging) {
    log(`network: ${process.env.NETWORK}`);
  }

  const provider = ethers.getDefaultProvider(ProviderEndpoints[process.env.NETWORK]);

  return getCirculatingSupply(provider, log)
}

exports.run = run;
