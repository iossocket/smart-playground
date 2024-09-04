import { FarmingForms } from "./FarmingForms";

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
      <FarmingForms />
    </div>
  </div>
}