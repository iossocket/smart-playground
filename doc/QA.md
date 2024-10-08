### Q: 如果没有新的区块产生，调用智能合约中的一个 view 函数，其中的 block.timestamp 是不是没有变化？

A: 是的，如果没有新的区块产生，调用智能合约中的 view 函数时，block.timestamp 将保持不变。block.timestamp 是当前区块的时间戳，它代表的是最近一个已经被确认的区块的时间。因此，view 函数是只读的，不会产生任何交易，也不会触发区块的生成或打包，所以如果没有新的区块产生，block.timestamp 会是最新的区块的时间戳，而不会随着调用而变化。

具体原因如下：

1. block.timestamp 依赖于区块：block.timestamp 代表的是当前正在执行的区块的时间。对于没有状态更改的 view 函数调用，合约不会生成新交易，也不会导致新的区块被打包。block.timestamp 是当前链上最后一个区块的时间戳，而不是调用时的实际时间。

2. view 函数是只读的：调用 view 函数不会产生链上的状态更改，不会触发交易，也不会生成新的区块。因此，调用 view 函数时，block.timestamp 是基于当前链的最后一个区块的时间戳。

> 举例说明：
假设最新的区块是 100，并且其 block.timestamp 为 1600000000。如果你在区块 100 之后调用智能合约中的 view 函数，而没有产生新的区块，那么即使你多次调用 view 函数，block.timestamp 都将继续返回 1600000000，直到新的区块被打包。