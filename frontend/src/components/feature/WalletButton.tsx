"use client";

import { useWalletStore } from "@/zustand/store";
import { DashboardIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import { useEffect } from "react";

export default function WalletButton() {
  const { connecting, account, connectToWallet, clear, provider, restoreWallet } = useWalletStore();

  useEffect(() => {
    if (provider === null && account !== null) {
      console.log('%c [ user refreshed ]-21', 'font-size:13px; background:pink; color:#bf2c9f;', provider, account);
      restoreWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, account]);

  return account ?
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-row items-center text-white text-sm">
        <DashboardIcon className="mr-2 h-4 w-4" />
        {account.replace?.(/^(.{6}).+(.{4})$/g, '$1...$2')}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          console.log("Hi");
          clear();
          useWalletStore.persist.clearStorage();
        }}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    :
    <Button className="text-sm" disabled={connecting} onClick={async () => {
      try {
        await connectToWallet();
      } catch (error) {
        console.error("connectToWallet:", error);
      }
    }}>
      {connecting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
      Connect Wallet
    </Button>
}

