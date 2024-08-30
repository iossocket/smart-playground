"use client";

import { useWalletStore } from "@/zustand/store";
import { useMemo } from "react";
import { Button } from "../Button";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "../Table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../Card";
import { Separator } from "../Separator";
import { LoadingSpinner } from "../Spinner";

interface Props {
  chainId: number;
  depositTokenAddress: string;
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

  const { network, switchNetwork } = useWalletStore();

  const isChainAvailable = useMemo(() => {
    if (!network) {
      return false;
    }
    return Number(network.chainId) === props.chainId;
  }, [network, props.chainId])

  return <Card>
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
        <div>{apr === null ? <LoadingSpinner /> : <>{apr || '-'} %</>}</div>
        <div>ARP</div>
      </div>
      <Table className="bg-gray-300 rounded-sm">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Earned</TableCell>
            <TableCell className="text-right">250</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Earned</TableCell>
            <TableCell className="text-right">250</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Earned</TableCell>
            <TableCell className="text-right">250</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>

    <CardFooter className="flex flex-col">
      <Button className="w-full">Stake</Button>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Earned</TableCell>
            <TableCell className="text-right">250</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Earned</TableCell>
            <TableCell className="text-right">250</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardFooter>
  </Card>
}

{/* <Card>
<CardHeader>
  <CardTitle>123</CardTitle>
</CardHeader>
<CardContent>
  <FarmingForm />
</CardContent>
</Card> */}