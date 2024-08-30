import { Menu } from "./menu";
import Image from "next/image";
import WalletButton from "@/components/feature/WalletButton";

export default function DefaultNav() {
  return <div className="container h-full flex items-center justify-between relative">
    <Image src="/logo_c2n.svg" className="h-8 w-auto" height={47} width={40} alt="Picture of the author" />
    <Menu />
    <WalletButton />
  </div>
}