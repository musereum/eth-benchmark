const fs = require('fs')
const Web3 = require('web3');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));


const transactionPerSecond = Number.parseInt(process.argv[2] || 10);
const transactionsPer100Ms = Math.ceil(transactionPerSecond / 10);

console.log((transactionsPer100Ms * 10) + ' transactions per second');


const transactions = fs.readFileSync('transactions.txt', 'ascii').split('\n');
const numTransactions = transactions.length;

let stopOnError = false;
let i = 0;

function batch() {
  const maxI = Math.min(i + transactionsPer100Ms, numTransactions);
  for (; i < maxI; ++i) {

    web3.eth.sendRawTransaction(
      transactions[i],
      (err,res) => { stopOnError |= !!err }
    );
  }
  if (i < numTransactions && !stopOnError) {
    setTimeout(batch, 100);
  }
  process.stdout.write('.');
}

setTimeout(batch, 100);
