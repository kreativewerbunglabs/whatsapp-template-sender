import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, ArrowRight, KeyRound, Phone } from "lucide-react";
import { WhatsAppService } from "../lib/whatsapp";


export function ConnectStep({
  setStep,
  setWa,
}: {
  setStep: (num: number) => void;
  setWa: (wa: WhatsAppService) => void;
}) {
  const [token, setToken] = useState(
    "EAANPMUIBQmoBRazETyHFSkdmrRK5bp4v0FXQaSZB9PjydpO67eaXJRxgjOpQzxM5TfcslhCfMT2xqae31hzCuN0RMthTwo09xeM3F4pHjJJDHeIf6b8qnpMHmKqNOPrXOgN9hJ7UNaVMZA0lztIia5swiOiKFbVNFsbs6pdPLdNFmawnPtWy6LhCh9ZCQZDZD",
  );
  const [wabaId, setWabaId] = useState("2379289982557132");
  const [phoneNumberId, setPhoneNumberId] = useState("1090215210840685");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const instance = new WhatsAppService({
        token: token.trim(),
        wabaId: wabaId.trim(),
        phoneNumberId: phoneNumberId.trim(),
      });
      
      setWa(instance);
      setStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto shadow-lg border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Connect to WhatsApp</CardTitle>
        <CardDescription>
          Enter your WhatsApp Business API credentials to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="token" className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              Access Token
            </Label>
            <Input
              id="token"
              type="password"
              placeholder="Your WhatsApp API access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wabaId" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              WABA ID (WhatsApp Business Account)
            </Label>
            <Input
              id="wabaId"
              placeholder="e.g. 123456789012345"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Found in Meta Business Manager → WhatsApp Accounts → Settings
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneId" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Phone Number ID
            </Label>
            <Input
              id="phoneId"
              placeholder="e.g. 123456789012345"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Used for sending messages
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !token || !wabaId || !phoneNumberId}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {loading ? "Connecting..." : "Connect & Fetch Templates"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
