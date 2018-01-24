const fs = require('fs')
const Tx = require('ethereumjs-tx')
const hdkey = require('ethereumjs-wallet/hdkey')
const util = require('ethereumjs-util')


const numAccounts = parseInt(process.argv[2])
const numTransactions = parseInt(process.argv[3])
const genesis = require(process.argv[4])

// Generate keys
const seed = Number(new Date())
const accounts = []
for(let i = 0; i < numAccounts; ++i) {
  const key = hdkey.fromMasterSeed(seed + '_' + i)._hdkey._privateKey
  accounts.push({
    key: key,
    addr: util.bufferToHex(util.privateToAddress(key)),
    nonce: 0
  })
}


// Fill balances in genesis
genesis.accounts = accounts.reduce(
  (val, acc) => Object.assign(val, {[acc.addr]: {balance: "654321000000000000000"}}),
  {}
)


// write keys and genesis files
fs.writeFile(process.argv[4] + '.test', JSON.stringify(genesis), err =>
  err || console.log(`${process.argv[4]} generated`)
)

// Generate signed transactions
const transactions = []

for(let i = 0; i < numTransactions; ++i) {
  const k = accounts[i % numAccounts]
  const to = accounts[numAccounts - i % numAccounts - 1].addr

  const tx = new Tx({
    from: k.addr,
    nonce: k.nonce,
    to: to,
    gasPrice: '0x09184e72a000',
    gasLimit: '0x27100',
    value: '0x12300',
    data: '0x0',
    chainId: '0xC0FFEE6'
  })

  tx.sign(k.key)
  k.nonce++
  transactions.push('0x' + tx.serialize().toString('hex'))
}

// Write transactions to file
fs.writeFile('transactions.txt', transactions.join('\n'), err =>
  err || console.log(numTransactions + ' transactions written to transactions.txt')
)
