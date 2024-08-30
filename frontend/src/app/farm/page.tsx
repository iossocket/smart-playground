import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import FarmingForm from "@/components/feature/FarmingForm";
import { LoadingSpinner } from "@/components/Spinner";
import { farms } from "@/config/farms";



export default function Farm() {
  return <div className="container">
    <div className="flex flex-row">
      <div className="text-white">
        Yield Farms
      </div>

    </div>
    <div className="text-white mb-8">
      Yield Farms allow users to earn Reward token while supporting C2N by staking LP Tokens.
    </div>
    <div className="grid grid-cols-3 gap-8">
      <div className="h-[200px]">
        <Card>
          <LoadingSpinner />
        </Card>
      </div>

      <FarmingForm {...farms[31337]} />
      <FarmingForm {...farms[11155111]} />
    </div>

  </div>
}