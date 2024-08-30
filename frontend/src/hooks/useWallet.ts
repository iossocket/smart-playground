import { VALID_CHAINS } from "@/config/valid_chains";
import { checkMetaMask } from "@/lib/wallet";

export const useWallet = () => {

  async function getNetwork() {
    const installedMetamask = checkMetaMask();
    console.log("installedMetamask:", installedMetamask);
    // dispatch installedMetamask
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log("chainId:", chainId);
    const chain = VALID_CHAINS.find(valid => valid.chainId == chainId);
    console.log("chain:", chain);
  }

  async function getAccount() {
    const installedMetamask = checkMetaMask();
    console.log("installedMetamask:", installedMetamask);
    if (!installedMetamask) {
      return Promise.reject();
    }
    if (!window.ethereum.isConnected()) {
      console.log("window.ethereum.isConnected", window.ethereum.isConnected())
      return Promise.reject();
    }
    try {

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log("accounts", accounts);
      return Promise.resolve(accounts[0]);
    } catch (e) {
      console.log('connect error', e)
    }
  }

  return {}
}