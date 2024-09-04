import { DialogDescription } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ethers } from "ethers";

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
}

export const ClaimDialog = (props: Props) => {



  return <Dialog open={props.open} onOpenChange={(open) => {
    console.log("dialog", open);
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
          <div className="flex flex-row justify-between items-center mb-2">
            <Label htmlFor="userBalance">{props.userBalance ? `Balance: ${ethers.formatEther(props.userBalance)} ${props.userBalanceSymbol}` : `Balance: - ${props.userBalanceSymbol}`}</Label>
            <Button variant="ghost">MAX</Button>
          </div>
          <Input type="number" id="userBalance" placeholder="user balance" className="mb-4" />
          <Button type="submit" size="lg" className="w-full">Stake</Button>
        </TabsContent>
        <TabsContent value="claim">
          <div className="flex flex-row justify-center items-center mb-10 mt-9">
            <Label className="text-lg">{props.userPendingRewards ? `Pending rewards: ${ethers.formatEther(props.userPendingRewards)} ${props.userRewardsSymbol}` : `Pending rewards: - ${props.userRewardsSymbol}`}</Label>
          </div>
          <Button type="submit" size="lg" className="w-full">Claim</Button>
        </TabsContent>
        <TabsContent value="withdraw">
          <div className="flex flex-row justify-between items-center mb-2">
            <Label htmlFor="userStaked">{props.userStaked ? `Balance: ${ethers.formatEther(props.userStaked)} ${props.userBalanceSymbol}` : `Balance: - ${props.userBalanceSymbol}`}</Label>
            <Button variant="ghost">MAX</Button>
          </div>
          <Input type="number" id="userStaked" placeholder="withdraw" className="mb-4" />
          <Button type="submit" size="lg" className="w-full">Withdraw</Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
}
