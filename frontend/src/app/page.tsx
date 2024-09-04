import { Button } from "@/components/ui/button";
import HomeBanner from "@/components/feature/HomeBanner";
import Image from 'next/image'
import banner from "@/components/assets/banner.png";
import Link from "next/link";
import Footer from "@/components/feature/Footer";

export default function Home() {

  return (
    <>
      <div className="container">
        <HomeBanner />
        <div className="flex flex-row items-center mt-16 mb-16 mr-4 p-4">
          <div className="flex flex-col flex-1 mr-12">
            <h2 className="text-5xl font-bold text-white mb-6">C2N: Fundraising platform on Sepolia</h2>
            <p className="text-white font-normal mb-6">
              C2N is the first exclusive launchpad for decentralized fundraising
              offering the hottest and innovative projects in
              a fair, secure, and efficient way.
            </p>
            <Button variant="outline" className="text-lg p-6 rounded-full mr-4" asChild>
              <Link href="/staking">Stake</Link>
            </Button>
          </div>
          <Image src={banner} width={600} height={600} alt="banner" />
        </div>

      </div>
      <Footer />
    </>
  );
}
