## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

1. check metamask

```typescript
export function checkMetaMask(): boolean {
  const installedMetamask = window && window.ethereum && window.ethereum.isMetaMask;
  return installedMetamask && window.ethereum.isConnected();
}
```

2. ensure the network you dapp is installed/configured in metamask, related methods "wallet_addEthereumChain" and "wallet_switchEthereumChain"
```typescript

```
> https://docs.metamask.io/wallet/reference/wallet_addethereumchain/

2. invoke `provider.send(...)` to interact with metamask
```typescript
const provider = new ethers.BrowserProvider(window.ethereum);

// it will request the currently active account
// "eth_requestAccounts"

// wallet_requestPermissions then eth_accounts will ask user to select one or more accounts
await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
await provider.send("eth_accounts", []);
```


