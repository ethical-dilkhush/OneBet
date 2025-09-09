import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Coins, TrendingUp, Shield } from "lucide-react"

export function GameInstructions() {
  return (
    <div className="space-y-4">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex items-start gap-2">
              <Coins className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">1. Place Your Bet</div>
                <div>Minimum bet is 0.001 SOL. Choose your amount.</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="text-lg mt-0.5">🎨</div>
              <div>
                <div className="font-semibold text-white">2. Pick Your Choice</div>
                <div>Select your prediction and place your bet.</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">3. Win Multiplied Payouts</div>
                <div>Test your luck and win big!</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">4. Instant Payouts</div>
                <div>Winners receive SOL directly to their wallet.</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3">
            <div className="text-yellow-200 text-xs">
              <strong>💡 Tip:</strong> Make sure to approve transactions in your Phantom wallet when prompted!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
