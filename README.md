
Benchmark your ethereum node
----------------------------


1. Generate genesis file with *N* preloaded accounts.
2. Generate *M* raw transactions.
3. Feed generated transactions to the node via HTTP-RPC.


```
$ node prepareBenchmark.js <num of accounts> <num of transactions>
$ node runBenchmark.js <transactions per second>
```

####Geth

```
$ geth init genesis.geth.json
$ geth \
    --mine --minerthreads 1 \
    --networkid 66 \
    --rpc --nodiscover \
    --cache=2048
```



####Parity

Parity requires external miner (see
[here](https://github.com/ethcore/parity/wiki/Mining)).

```
$ ethminer --cpu --mining-threads 1 --verbosity 0
$ parity \
    --no-ui --geth \
    --no-discovery \
    --chain genesis.parity.json \
    --author 0x753e381301779a1ca449deaa58f824b50c8993a9
```
