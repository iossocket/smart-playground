"use client";

import { useWalletStore } from "@/zustand/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useStake } from "@/hooks/useStake";
import _ from "lodash";
import { Contract, ethers } from "ethers";
import { addresses, depositTokens } from "@/config/farms";
import { AlertDialog } from "./AlertDialog";
import { ClaimDialog } from "./ClaimDialog";
import { useToast } from "../hooks/use-toast";

interface Props {
  chainId: number;
  depositTokenAddress: string;
  airdropAddress: string;
  earnedTokenAddress: string;
  stakingAddress: string;
  poolId: number;
  available: boolean;
  depositSymbol: string;
  earnedSymbol: string;
  title: string;
  depositLogo: string;
  earnedLogo: string;
  getLptHref: string;
  aprRate: number;
  aprUrl: string;
}

export default function FarmingForm(props: Props) {
  const { network, account, signer, provider } = useWalletStore();
  const { viewStakingContract, viewDepositTokenContract } = useStake({
    stakingAddress: props.stakingAddress,
    depositTokenAddress: props.depositTokenAddress,
    airdropAddress: props.airdropAddress
  });
  const [pool, setPool] = useState<any>({});
  const [userStaked, setUserStaked] = useState<undefined | string>();
  const [userBalance, setUserBalance] = useState<undefined | string>();
  const [userPendingRewards, setUserPendingRewards] = useState<undefined | string>();
  const [airdropRemaining, setAirdropRemaining] = useState<undefined | string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertBody, setAlertBody] = useState<string | null>(null);
  const [showClaimDialog, setShowClaimDialog] = useState<boolean>(false);
  const [initSelectedTab, setInitSelectedTab] = useState<"claim" | "stake" | "withdraw">("claim");
  const { toast } = useToast()

  const isChainAvailable = useMemo(() => {
    if (!network) {
      return false;
    }
    return Number(network.chainId) === props.chainId;
  }, [network, props.chainId])

  const refreshFormData = useCallback(() => {
    if (!viewStakingContract || !account || !viewDepositTokenContract) {
      return;
    }
    viewStakingContract.poolInfo(props.poolId).then(data => {
      setPool(data);
    });
    viewStakingContract.deposited(props.poolId, account).then(data => {
      setUserStaked(`${data}`);
    });
    viewStakingContract.pending(props.poolId, account).then(data => {
      console.log('%c [ UserPendingRewards ]-106', 'font-size:13px; background:pink; color:#bf2c9f;', data);
      setUserPendingRewards(`${data}`);
    });
    viewDepositTokenContract.balanceOf(account).then(data => {
      setUserBalance(`${data}`);
    });
    if (props.airdropAddress) {
      viewDepositTokenContract.balanceOf(props.airdropAddress).then(data => {
        setAirdropRemaining(`${data}`);
      });
    }
    provider!.getBlock("latest").then((block) => {
      console.log("更新后的 block.timestamp:", block?.timestamp);
    });
  }, [account, props.airdropAddress, props.poolId, provider, viewDepositTokenContract, viewStakingContract]);

  const handleClaim = useCallback(async () => {
    if (!signer || !provider) {
      return;
    }
    try {
      setLoading(true);
      const airdropContract = new Contract(addresses["FarmingC2NModule#Airdrop"], depositTokens[addresses["FarmingC2NModule#Airdrop"]].abi, signer);
      const claimed = await airdropContract.wasClaimed(signer.address);
      if (!claimed) {
        await airdropContract.withdrawTokens();
        await window.ethereum && window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: addresses["FarmingC2NModule#lpToken01"],
              symbol: props.depositSymbol,
              decimals: 18,
              image: '',
            }
          }
        });
        refreshFormData();
        toast({
          description: "Claim successfully!"
        });
      } else {
        setAlertBody(`Current account ${account} had claimed already.`)
        setShowAlert(true);
      }
    } catch (error) {
      console.log("error", error);
      toast({
        description: "failed",
      });
    } finally {
      setLoading(false);
    }
  }, [account, props.depositSymbol, provider, refreshFormData, signer, toast]);

  useEffect(() => {
    refreshFormData();
  }, [refreshFormData]);

  return <Card className="relative">
    {/* {
      isChainAvailable ?
        <></>
        :
        (
          <div className="mask">
            <Button onClick={() => {
              switchNetwork(props.chainId);
            }}>Switch Network</Button>
          </div>
        )
    } */}
    <CardHeader>
      <CardTitle className="text-center">{props.title}</CardTitle>
    </CardHeader>
    <Separator className="mb-4" />

    <CardContent>
      <div className="flex flex-col items-center mb-4">
        <div>{props.aprRate === null ? <LoadingSpinner /> : <>{props.aprRate || '-'} %</>}</div>
        <div>ARP</div>
      </div>
      <Table className="bg-gray-300 rounded-sm">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Earned</TableCell>
            <TableCell className="text-right">{props.earnedSymbol}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Total staked</TableCell>
            <TableCell className="text-right">{_.isUndefined(pool.totalDeposits) ? < LoadingSpinner className="ml-auto" /> : `${ethers.formatEther(pool.totalDeposits)}`}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">My staked</TableCell>
            <TableCell className="text-right">{_.isUndefined(userStaked) ? < LoadingSpinner className="ml-auto" /> : `${ethers.formatEther(userStaked)}`}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Available</TableCell>
            <TableCell className="text-right">{_.isUndefined(userBalance) ? < LoadingSpinner className="ml-auto" /> : `${ethers.formatEther(userBalance)}`}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>

    <CardFooter className="flex flex-col">
      <Button disabled={loading} size="lg" className="w-full" onClick={() => {
        setInitSelectedTab("stake");
        setShowClaimDialog(true);
      }}>Stake</Button>
      <Table className="mt-2">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Rewards</TableCell>
            <TableCell className="text-right">{_.isUndefined(userPendingRewards) ? < LoadingSpinner className="ml-auto" /> : <>
              {`${userPendingRewards} ${props.earnedSymbol}`}
              <Button disabled={loading} size="sm" className="ml-2" onClick={() => {
                setInitSelectedTab("claim");
                setShowClaimDialog(true);
              }}>CLAIM</Button>
            </>}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">{`${props.title} ${airdropRemaining === undefined ? "" : ethers.formatEther(airdropRemaining)}`}</TableCell>
            <TableCell className="text-right"><Button disabled={loading} onClick={async () => {
              // get LP01 from airdrop and show the token in metamask
              await handleClaim();
            }} size="sm" className="ml-2">{`GET ${props.depositSymbol}`}</Button></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardFooter>
    {showAlert && alertBody && <AlertDialog open={showAlert} title="CLAIM ALERT" body={alertBody} actions={[
      {
        label: "Cancel", type: "cancel", action: () => {
          setShowAlert(false);
        }
      },
    ]} />}
    {showClaimDialog && <ClaimDialog
      poolTitle={props.title}
      poolId={props.poolId}
      open={showClaimDialog}
      setOpen={(open) => setShowClaimDialog(open)}
      initSelectedTab={initSelectedTab}
      userBalance={userBalance}
      userBalanceSymbol={props.depositSymbol}
      userStaked={userStaked}
      userPendingRewards={userPendingRewards}
      userRewardsSymbol={props.earnedSymbol}
    />}
    {loading && <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-10">
      <LoadingSpinner />
    </div>}
  </Card>
}