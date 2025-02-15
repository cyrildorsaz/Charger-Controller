import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChargingSchedule, VehicleStatus } from "@shared/schema";
import ChargeStatus from "@/components/charge-status";
import ScheduleForm from "@/components/schedule-form";
import { Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { 
    data: status, 
    isLoading: loadingStatus,
    error: statusError,
    isError: isStatusError
  } = useQuery<VehicleStatus>({
    queryKey: ["/api/vehicle/status"],
    retry: false,
  });

  const { 
    data: schedules = [], 
    isLoading: loadingSchedules,
    isError: isSchedulesError
  } = useQuery<ChargingSchedule[]>({
    queryKey: ["/api/schedules"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({ title: "Schedule deleted" });
    }
  });

  // Redirect to login if unauthorized
  if (isStatusError && (statusError as any)?.message?.includes("401")) {
    setLocation("/login");
    return null;
  }

  if (loadingStatus || loadingSchedules) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Tesla Charge Monitor</h1>

      {isStatusError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load vehicle status. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ChargeStatus status={status} />
      )}

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Schedules</TabsTrigger>
          <TabsTrigger value="new">New Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {isSchedulesError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p>Failed to load schedules. Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map((schedule: ChargingSchedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <CardTitle>Charging Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>Start Time: {schedule.startTime}</p>
                      <p>End Time: {schedule.endTime}</p>
                      <p>Target: {schedule.targetPercentage}%</p>
                      <Button 
                        variant="destructive" 
                        onClick={() => deleteMutation.mutate(schedule.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardContent className="pt-6">
              <ScheduleForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}