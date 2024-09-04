"use client";

import FarmingForm from "@/components/feature/FarmingForm";
import { farms } from "@/config/farms";
import { useWalletStore } from "@/zustand/store";
import _ from "lodash";
import { useMemo } from "react";

export const FarmingForms = () => {
  const { network } = useWalletStore();
  const currentChainId = network?.chainId;

  const pools = useMemo(() => {
    if (!currentChainId) {
      return [];
    }
    const farm = farms[Number(currentChainId)];
    if (!farm) {
      return [];
    }
    return farm.pools.map((pool: any) => ({
      ...pool,
      earnedTokenAddress: farm.earnedTokenAddress,
      stakingAddress: farm.stakingAddress
    }));
  }, [currentChainId]);

  return <>
    {
      _.map(pools, (pool, key) => {
        return <FarmingForm key={key} {...pool} />
      })
    }
  </>
}