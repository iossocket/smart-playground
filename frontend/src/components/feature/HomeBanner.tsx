"use client";

import { useWalletStore } from "@/zustand/store";
import { Button } from "../ui/button";
import { Contract } from "ethers";
import Airdrop from "@/artifacts/contracts/Airdrop.sol/Airdrop.json";
import { TOKENS_INFO } from "@/config/valid_chains";
import { useMemo, useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";

export default function HomeBanner() {

  const { signer, network, provider } = useWalletStore();
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (!signer) {
      return;
    }
    try {
      setLoading(true);
      console.log("start");
      const airdropContract = new Contract("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", Airdrop.abi, signer);
      const claimed = await airdropContract.wasClaimed(signer.address);
      console.log("claimed", claimed);
      const res = await airdropContract.withdrawTokens();
      console.log("RES", res);
    } catch (error) {
      console.log("error", error)
    } finally {
      setLoading(false);
    }
  }

  const addToken = async () => {
    if (!network || !provider) {
      return
    }
    const chainId = Number(network.chainId)
    const tokenInfo = TOKENS_INFO[chainId];
    console.log("tokenInfo", tokenInfo);
    if (!tokenInfo) {
      return;
    }

    try {
      setLoading(true);
      await window.ethereum && window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenInfo.address,
            symbol: tokenInfo.symbol,
            decimals: 18,
            image: '',
          }
        }
      });
      // can not use ethers send method
      // await provider.send("wallet_watchAsset", [{
      //   type: "ERC20",
      //   options: {
      //     address: tokenInfo.address,
      //     symbol: tokenInfo.symbol,
      //     decimals: 18,
      //     image: '',
      //   }
      // }]);
    } catch (error) {
      console.log("error", error)
    } finally {
      setLoading(false);
    }
  }

  const tokenInfo = useMemo(() => {
    if (!network || !provider) {
      return null;
    }
    const chainId = Number(network.chainId)
    return TOKENS_INFO[chainId];
  }, [network, provider])

  return <div className="h-[120px] w-full mt-4 border-2 border-cyan-50 rounded-full flex flex-row items-center">
    <div className="h-[80px] w-[80px] ml-[80px] bg-[#6366f1] text-white font-medium flex justify-center items-center">
      C2N
    </div>
    <div className="text-white ml-8">
      <div className="text-2xl font-bold mb-2">C2N Tokens Online Now!</div>
      <div className="text-xs font-light">Contract Address:  {tokenInfo?.address || ""}</div>
    </div>
    <div className="flex-1"></div>
    <Button disabled={loading} onClick={handleClaim} variant="outline" className="text-lg p-6 rounded-full mr-4">
      {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
      Claim C2N
    </Button>
    <Button disabled={loading} onClick={addToken} variant="outline" className="text-lg p-6 rounded-full justify-self-end mr-[80px]">
      {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
      Add C2N to Wallet
    </Button>
  </div>
}