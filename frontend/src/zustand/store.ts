import { CURRENT_CHAIN, VALID_CHAINS } from '@/config/valid_chains'
import { checkMetaMask, numToHexString } from '@/lib/wallet'
import { BrowserProvider, ethers } from 'ethers'
import { Network } from 'ethers'
import { JsonRpcSigner } from 'ethers'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { find } from 'es-toolkit/compat';

type WalletState = {
  provider: BrowserProvider | null;
  network: Network | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  connecting: boolean;
}

const initialWalletState: WalletState = {
  provider: null,
  network: null,
  signer: null,
  account: null,
  connecting: false,
}

type WalletAction = {
  connectToWallet: () => Promise<void>;
  clear: () => Promise<void>;
  restoreWallet: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

export const METAMASK_NOT_INSTALLED = "METAMASK_NOT_INSTALLED";
export const CHAIN_NOT_MATCH = "CHAIN_NOT_MATCH";
export const ACTIVE_USER_NOT_MATCH = "ACTIVE_USER_NOT_MATCH";

export const useWalletStore = create<WalletState & WalletAction>()(persist((set, get) => ({
  ...initialWalletState,
  clear: async () => {
    await get().provider?.send("wallet_revokePermissions", [{ eth_accounts: {} }]);
    set(initialWalletState);
  },

  connectToWallet: async () => {
    const connectTo = async (chainId: bigint): Promise<WalletState> => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
        const accounts = await provider.send("eth_accounts", [])
        console.log("connect accounts:", accounts);
        const network = await provider.getNetwork();

        if (network.chainId !== chainId) {
          return Promise.reject(CHAIN_NOT_MATCH);
        }
        const signer = await provider.getSigner(accounts[0])
        const account = await signer.getAddress();
        return {
          network,
          account,
          provider,
          signer,
          connecting: get().connecting
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const connect = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // await provider.send("wallet_addEthereumChain", [CURRENT_CHAIN]);
        await provider.send("wallet_switchEthereumChain", [{ chainId: CURRENT_CHAIN.chainId }])
        return await connectTo(BigInt(Number(CURRENT_CHAIN.chainId)));
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const isInstalled = checkMetaMask();
    if (!isInstalled) {
      return Promise.reject(METAMASK_NOT_INSTALLED);
    }
    try {
      set({
        connecting: true
      })
      const walletState = await connect();
      set({
        ...walletState
      })
    } catch (error) {
      return Promise.reject(error);
    } finally {
      set({
        connecting: false
      })
    }
  },

  restoreWallet: async () => {
    const isInstalled = checkMetaMask();
    if (!isInstalled) {
      return Promise.reject(METAMASK_NOT_INSTALLED);
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("restore accounts:", accounts);
      if (!accounts || !accounts.length) {
        throw new Error(ACTIVE_USER_NOT_MATCH);
      }
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(Number(CURRENT_CHAIN.chainId))) {
        throw new Error(CHAIN_NOT_MATCH);
      }
      const signer = await provider.getSigner(accounts[0])
      const account = await signer.getAddress();
      if (!account || account !== get().account) {
        return Promise.reject(ACTIVE_USER_NOT_MATCH);
      }
      set({
        provider,
        account,
        network,
        signer,
        connecting: false
      })
    } catch (error) {
      console.log('%c [ restoreWallet failed ]-130', 'font-size:13px; background:pink; color:#bf2c9f;', error);
      get().clear()
    }

  },

  switchNetwork: async (chainId: number) => {
    const result = find(VALID_CHAINS, (ch) => ch.chainId === numToHexString(chainId));
    if (!result) {
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("wallet_switchEthereumChain", [{ chainId: result.chainId }])
    } catch (error) {
      console.error("switchNetwork failed", error);
      return Promise.reject(error);
    }

  },
}),
  {
    name: "wallet-cache",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ account: state.account })
  }
))