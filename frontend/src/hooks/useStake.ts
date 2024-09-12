import { VALID_CHAINS } from "@/config/valid_chains";
import { numToHexString } from "@/lib/wallet";
import { useWalletStore } from "@/zustand/store";
import { Contract, ethers } from "ethers";
import { useMemo } from "react";
import FarmingC2N from "@/artifacts/contracts/farming/FarmingC2N.sol/FarmingC2N.json";
import { depositTokens } from "@/config/farms";

interface Props {
  stakingAddress: string;
  depositTokenAddress: string;
  airdropAddress: string;
  c2nTokenAddress: string;
}

export const useStake = ({ stakingAddress, depositTokenAddress, c2nTokenAddress }: Props) => {

  const { network } = useWalletStore();

  const viewStakingContract: Contract | null = useMemo(() => {
    if (!network) {
      return null;
    }
    const found = VALID_CHAINS.filter(chain => numToHexString(Number(network.chainId)) === chain.chainId.toUpperCase());
    if (!found || !found.length) {
      return null;
    }
    if (stakingAddress) {
      const viewProvider = new ethers.JsonRpcProvider(found[0].rpcUrls[0]);
      const viewStakingContract = new Contract(stakingAddress, FarmingC2N.abi, viewProvider);
      return viewStakingContract;
    } else {
      return null;
    }
  }, [network, stakingAddress]);

  const viewDepositTokenContract: Contract | null = useMemo(() => {
    if (!network) {
      return null;
    }
    const found = VALID_CHAINS.filter(chain => numToHexString(Number(network.chainId)) === chain.chainId.toUpperCase());
    if (!found || !found.length) {
      return null;
    }
    if (depositTokenAddress) {
      const viewProvider = new ethers.JsonRpcProvider(found[0].rpcUrls[0]);
      const viewDepositTokenContract = new Contract(depositTokenAddress, depositTokens[depositTokenAddress].abi, viewProvider);
      return viewDepositTokenContract;
    } else {
      return null;
    }
  }, [network, depositTokenAddress]);

  const viewC2NTokenContract: Contract | null = useMemo(() => {
    if (!network) {
      return null;
    }
    const found = VALID_CHAINS.filter(chain => numToHexString(Number(network.chainId)) === chain.chainId.toUpperCase());
    if (!found || !found.length) {
      return null;
    }
    if (c2nTokenAddress) {
      const viewProvider = new ethers.JsonRpcProvider(found[0].rpcUrls[0]);
      const viewC2NTokenContract = new Contract(c2nTokenAddress, depositTokens[c2nTokenAddress].abi, viewProvider);
      return viewC2NTokenContract;
    } else {
      return null;
    }
  }, [network, c2nTokenAddress]);

  return {
    viewStakingContract,
    viewDepositTokenContract,
    viewC2NTokenContract
  }
};