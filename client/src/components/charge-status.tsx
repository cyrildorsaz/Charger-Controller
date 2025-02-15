import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Battery, Clock, Target } from "lucide-react";
import type { VehicleStatus } from "@shared/schema";

interface ChargeStatusProps {
  status: VehicleStatus | null;
}

export default function ChargeStatus({ status }: ChargeStatusProps) {
  if (!status) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">
          Vehicle data unavailable. Please ensure you're logged in and your vehicle is accessible.
        </p>
      </div>
    );
  }

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "charging": return "text-green-500";
      case "complete": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="h-5 w-5" />
            Current Charge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={status.batteryLevel} />
            <p className="text-2xl font-semibold">{status.batteryLevel}%</p>
            <p className={`text-sm ${getStatusColor(status.chargingState)}`}>
              {status.chargingState}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time to Full
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {status.timeToFullCharge.toFixed(1)} hours
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Charge Limit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={status.chargeLimit} />
            <p className="text-2xl font-semibold">{status.chargeLimit}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}