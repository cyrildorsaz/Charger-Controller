import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiTesla } from "react-icons/si";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      handleTeslaCallback(code);
    }
  }, []);

  async function handleTeslaCallback(code: string) {
    try {
      await apiRequest("POST", "/api/auth/tesla", { code });
      setLocation("/");
    } catch (error) {
      console.error("Tesla auth failed:", error);
    }
  }

  function initiateAuth() {
    const verifier = generateCodeVerifier();
    localStorage.setItem("code_verifier", verifier);
    
    const challenge = generateCodeChallenge(verifier);
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      client_id: "ownerapi",
      redirect_uri: `${window.location.origin}/login`,
      response_type: "code",
      scope: "openid vehicle_device_data vehicle_charging_cmd",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    window.location.href = `https://auth.tesla.com/oauth2/v3/authorize?${params}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SiTesla className="h-6 w-6" />
            Tesla Charge Monitor
          </CardTitle>
          <CardDescription>
            Monitor and manage your Tesla's charging schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full"
            size="lg"
            onClick={initiateAuth}
          >
            <SiTesla className="mr-2 h-4 w-4" />
            Sign in with Tesla
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateCodeChallenge(verifier: string) {
  return btoa(verifier)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
