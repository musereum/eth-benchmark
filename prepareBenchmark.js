const fs = require('fs')
const Tx = require('ethereumjs-tx')
const hdkey = require('ethereumjs-wallet/hdkey')
const util = require('ethereumjs-util')


const numAccounts = process.argv[2] || 1000;
const numTransactions = process.argv[3] || 10000;


const networkId = '0x42';
const nonce = "0x0000000000000000";
const difficulty = '0x40000';
const gasLimit = '0xFFFF0000';


const genesisGethTemplate = {
  "nonce": nonce,
  "difficulty": difficulty,
  "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "timestamp": "0x00",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "extraData": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "gasLimit": gasLimit,
  "alloc": {}
};


const genesisParityTemplate = {
  "name": "test",
  "engine": {
    "Ethash": {
      "params": {
        "gasLimitBoundDivisor": "0x0400",
        "minimumDifficulty": "0x4",
        "difficultyBoundDivisor": "0x0800",
        "durationLimit": "0x0a",
        "blockReward": "0x4563918244F40000",
        "registrar": "",
        "frontierCompatibilityModeLimit": "0x00"
      }
    }
  },
  "params": {
    "accountStartNonce": "0x0000000000000000",
    "maximumExtraDataSize": "0x20",
    "minGasLimit": "0xFFFF0000",
    "networkID" : networkId
  },
  "genesis": {
    "seal": {
      "ethereum": {
        "nonce": nonce,
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
      }
    },
    "difficulty": difficulty,
    "author": "0x0000000000000000000000000000000000000000",
    "timestamp": "0x00",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "extraData": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "gasLimit": gasLimit,
  },
  "nodes": [ ],
  "accounts": { }
}



// Generate keys
const seed = Number(new Date());
const accounts = [];
for(let i = 0; i < numAccounts; ++i) {
  const key = hdkey.fromMasterSeed(seed + '_' + i)._hdkey._privateKey;
  accounts.push({
    key: key,
    addr: util.bufferToHex(util.privateToAddress(key)),
    nonce: 0
  });
}


// Fill balances in genesis
const genesisGeth = Object.assign({}, genesisGethTemplate);
const genesisParity = Object.assign({}, genesisParityTemplate);
genesisGeth.alloc = genesisParity.accounts = accounts.reduce(
  (val, acc) => Object.assign(val, {[acc.addr]: {balance: "654321000000000000000"}}),
  {}
);


// write keys and genesis files
fs.writeFile('genesis.geth.json', JSON.stringify(genesisGeth), err =>
  err || console.log('genesis.geth.json generated')
);
fs.writeFile('genesis.parity.json', JSON.stringify(genesisParity), err =>
  err || console.log('genesis.parity.json generated')
);


// Generate signed transactions
const transactions = [];

for(let i = 0; i < numTransactions; ++i) {
  const k = accounts[i % numAccounts];
  const to = accounts[numAccounts - i % numAccounts - 1].addr;

  const tx = new Tx({
    from: k.addr,
    nonce: k.nonce,
    to: to,
    gasPrice: '0x09184e72a000',
    gasLimit: '0x27100',
    value: '0x12300',
    data: '0x0',
    chainId: '0x42'
  });

  tx.sign(k.key);
  k.nonce++;
  transactions.push('0x' + tx.serialize().toString('hex'));
}

// Write transactions to file
fs.writeFile('transactions.txt', transactions.join('\n'), err =>
  err || console.log(numTransactions + ' transactions written to transactions.txt')
);
