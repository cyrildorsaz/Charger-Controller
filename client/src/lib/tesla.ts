import type { VehicleStatus } from "@shared/schema";

const TESLA_AUTH_URL = "https://auth.tesla.com/oauth2/v3/authorize";
const TESLA_API_URL = "https://owner-api.teslamotors.com/api/1";

export class TeslaClient {
  constructor(private accessToken?: string) {}

  async exchangeCodeForTokens(code: string) {
    const codeVerifier = localStorage.getItem("code_verifier");
    if (!codeVerifier) {
      throw new Error("Code verifier not found");
    }

    try {
      const response = await fetch(`${TESLA_AUTH_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: "ownerapi",
          code,
          code_verifier: codeVerifier,
          redirect_uri: "https://auth.tesla.com/void/callback"
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Tesla auth failed: ${error}`);
      }

      return response.json();
    } catch (error) {
      console.error("Tesla auth error:", error);
      throw new Error("Failed to authenticate with Tesla");
    } finally {
      // Clear code verifier after use
      localStorage.removeItem("code_verifier");
    }
  }

  async getVehicleStatus(): Promise<VehicleStatus> {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    try {
      const vehiclesResponse = await fetch(`${TESLA_API_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (!vehiclesResponse.ok) {
        if (vehiclesResponse.status === 401) {
          throw new Error("401");
        }
        throw new Error("Failed to get vehicles");
      }

      const vehicles = await vehiclesResponse.json();
      if (!vehicles.response || !vehicles.response[0]) {
        throw new Error("No vehicles found");
      }

      const vehicle = vehicles.response[0];
      const dataResponse = await fetch(`${TESLA_API_URL}/vehicles/${vehicle.id}/vehicle_data`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (!dataResponse.ok) {
        throw new Error("Failed to get vehicle data");
      }

      const data = await dataResponse.json();
      const charge = data.response.charge_state;

      if (!charge) {
        throw new Error("No charge state data available");
      }

      return {
        batteryLevel: charge.battery_level,
        chargingState: charge.charging_state,
        timeToFullCharge: charge.time_to_full_charge,
        chargeLimit: charge.charge_limit_soc
      };
    } catch (error) {
      console.error("Tesla API error:", error);
      throw error;
    }
  }
}