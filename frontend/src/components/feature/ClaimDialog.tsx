"use client";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Contract, ethers } from "ethers";
import { useWalletStore } from "@/zustand/store";
import { useMemo, useState } from "react";
import { addresses, depositTokens, farmContract } from "@/config/farms";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { LoadingSpinner } from "../ui/spinner";
import { useToast } from "../hooks/use-toast";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  initSelectedTab: "claim" | "stake" | "withdraw";

  userBalance?: string;
  userBalanceSymbol: string;
  userStaked?: string;
  userPendingRewards?: string;
  userRewardsSymbol: string;
  poolTitle: string;
  poolId: number;

  refreshFormData: () => void;
}

const bigintSchema = z.string().refine((val) => {
  try {
    ethers.parseUnits(val, 18);
    return true;
  } catch (e) {
    return false;
  }
}, {
  message: "must be valid number",
});

export const ClaimDialog = (props: Props) => {

  const { signer } = useWalletStore();
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const stakeFormSchema = z.object({
    userBalance: bigintSchema.refine((val) => {
      try {
        if (!props.userBalance) {
          return true;
        }
        return ethers.parseEther(props.userBalance || "0") >= ethers.parseUnits(val, 18);
      } catch (error) {
        return false;
      }
    }, {
      message: "not enough to stake",
    })
  });

  const withdrawFormSchema = z.object({
    withdraw: bigintSchema.refine((val) => {
      try {
        if (!props.userStaked) {
          return true;
        }
        return ethers.parseEther(props.userStaked) >= ethers.parseUnits(val, 18);
      } catch (error) {
        return false;
      }
    }, {
      message: "not enough to withdraw",
    })
  });

  const stakeFrom = useForm<z.infer<typeof stakeFormSchema>>({
    resolver: zodResolver(stakeFormSchema),
    defaultValues: {
      userBalance: ""
    }
  });

  const canWithdraw = useMemo(() => {
    try {
      if (!props.userStaked) {
        return false;
      }
      return ethers.parseUnits(props.userStaked, 18) > 0;
    } catch (error) {
      return false;
    }
  }, [props.userStaked])

  const canStake = useMemo(() => {
    try {
      if (!props.userBalance) {
        return false;
      }
      return ethers.parseUnits(props.userBalance, 18) > 0;
    } catch (error) {
      return false;
    }
  }, [props.userBalance])


  const withdrawFrom = useForm<z.infer<typeof withdrawFormSchema>>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      withdraw: ""
    }
  });

  const onStakeSubmit = async (values: z.infer<typeof stakeFormSchema>) => {
    try {
      setLoading(true);
      const amount = ethers.parseUnits(values.userBalance, 18);

      const lpContract = new Contract(addresses["FarmingC2NModule#lpToken01"], depositTokens[addresses["FarmingC2NModule#lpToken01"]].abi, signer);
      await lpContract.approve(addresses["FarmingC2NModule#FarmingC2N"], amount);

      const contract = new Contract(addresses["FarmingC2NModule#FarmingC2N"], farmContract.abi, signer);
      await contract.deposit(props.poolId, amount);
      toast({
        description: "Stake successfully"
      })
      props.refreshFormData();
      props.setOpen(false);
    } catch (e) {
      console.error(e);
      toast({
        description: "Failed to stake"
      })
    } finally {
      setLoading(false);
    }
  }

  const onWithdrawSubmit = async (values: z.infer<typeof withdrawFormSchema>) => {
    try {
      setLoading(true);
      const amount = ethers.parseUnits(values.withdraw, 18);

      const contract = new Contract(addresses["FarmingC2NModule#FarmingC2N"], farmContract.abi, signer);
      await contract.withdraw(props.poolId, amount);
      toast({
        description: "Withdraw successfully"
      })
      props.refreshFormData();
      props.setOpen(false);
    } catch (e) {
      console.error(e);
      toast({
        description: "Failed to withdraw"
      })
    } finally {
      setLoading(false);
    }
  }

  const onClaimSubmit = async () => {
    if (!props.userPendingRewards) {
      return;
    }
    const amount = parseInt(props.userPendingRewards);
    if (amount <= 0) {
      toast({
        description: "nothing can be claimed"
      })
      return;
    }
    try {
      setLoading(true);
      const contract = new Contract(addresses["FarmingC2NModule#FarmingC2N"], farmContract.abi, signer);
      await contract.claim(props.poolId);
      props.refreshFormData();
      props.setOpen(false);
    } catch (e) {
      console.error(e);
      toast({
        description: "Failed to claim"
      })
    } finally {
      setLoading(false);
    }

  }

  return <Dialog open={props.open} onOpenChange={(open) => {
    if (loading) {
      return;
    }
    props.setOpen(open);
  }} modal={true}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>HANDLE ASSETS</DialogTitle>
        <DialogDescription>{props.poolTitle}</DialogDescription>
      </DialogHeader>
      <Tabs defaultValue={props.initSelectedTab}>
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="stake">Stake</TabsTrigger>
          <TabsTrigger className="flex-1" value="claim">Claim</TabsTrigger>
          <TabsTrigger className="flex-1" value="withdraw">Withdraw</TabsTrigger>
        </TabsList>
        <TabsContent value="stake">
          <Form {...stakeFrom}>
            <form onSubmit={stakeFrom.handleSubmit(onStakeSubmit)}>
              <FormField
                control={stakeFrom.control}
                name="userBalance"
                render={({ field }) => {
                  return <FormItem>
                    <div className="flex flex-row justify-between items-center mb-2">
                      <FormLabel>{props.userBalance ? `Balance: ${ethers.formatEther(props.userBalance)} ${props.userBalanceSymbol}` : `Balance: - ${props.userBalanceSymbol}`}</FormLabel>
                      <Button disabled={!canStake} type="button" onClick={() => {
                        stakeFrom.setValue("userBalance", ethers.formatEther(props.userBalance || 0), { shouldValidate: true });
                      }} variant="ghost">MAX</Button>
                    </div>
                    <FormControl>
                      <Input disabled={!canStake} placeholder="user balance" className="mb-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                }}
              />
              <Button disabled={!canStake} type="submit" size="lg" className="w-full mt-4">Stake</Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="claim">
          <div className="flex flex-row justify-center items-center mb-10 mt-9">
            <Label className="text-lg">{props.userPendingRewards ? `Pending rewards: ${ethers.formatEther(props.userPendingRewards)} ${props.userRewardsSymbol}` : `Pending rewards: - ${props.userRewardsSymbol}`}</Label>
          </div>
          <Button type="submit" size="lg" onClick={onClaimSubmit} className="w-full">Claim</Button>
        </TabsContent>
        <TabsContent value="withdraw">
          <Form {...withdrawFrom}>
            <form onSubmit={withdrawFrom.handleSubmit(onWithdrawSubmit)}>
              <FormField
                control={withdrawFrom.control}
                name="withdraw"
                render={({ field }) => {
                  return <FormItem>
                    <div className="flex flex-row justify-between items-center mb-2">
                      <Label>{props.userStaked ? `Deposited: ${ethers.formatEther(props.userStaked)} ${props.userBalanceSymbol}` : `Deposited: - ${props.userBalanceSymbol}`}</Label>
                      <Button disabled={!canWithdraw} type="button" onClick={() => {
                        withdrawFrom.setValue("withdraw", ethers.formatEther(props.userStaked || 0), { shouldValidate: true });
                      }} variant="ghost">MAX</Button>
                    </div>
                    <FormControl>
                      <Input disabled={!canWithdraw} placeholder="withdraw" className="mb-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                }}
              />
              <Button disabled={!canWithdraw} type="submit" size="lg" className="w-full mt-4">Withdraw</Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
      {loading && <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-10">
        <LoadingSpinner />
      </div>}
    </DialogContent>
  </Dialog >
}
