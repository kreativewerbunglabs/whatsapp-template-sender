import { useState } from "react";

import type { Template, TemplateParam } from "../lib/whatsapp";
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
import { Separator } from "./ui/separator";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { useWhatsApp } from "../context/WhatsApp";
import { RecipientInput } from "./RecipientInput";

interface ComposeStepProps {
  template: Template;
  params: TemplateParam[];
}

export function ComposeStep({
  template,
  params: initialParams,
}: ComposeStepProps) {
  const [params, setParams] = useState<TemplateParam[]>(initialParams);
  const [recipients, setRecipients] = useState(["+918957379014"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const wa = useWhatsApp();
  const updateParam = (idx: number, value: string) => {
    setParams((prev) => prev.map((p, i) => (i === idx ? { ...p, value } : p)));
  };
  const failedList: { number: string; error: string }[] = [];

  const handleSend = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      for (const number of recipients) {
        try {
          const payload = wa.buildMessagePayload(template, params, number);
          await wa.sendMessage(payload);

          // 🔥 persist progress
          localStorage.setItem("failed", number);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";

          console.log("FAILED:", number, message);

          failedList.push({ number, error: message });
          localStorage.setItem("lastSuccess", JSON.stringify(failedList));
          // ❗ DO NOT break
        }

        await new Promise((r) => setTimeout(r, 400));
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-lg mx-auto shadow-xl border border-border/50 backdrop-blur-sm">
        <CardContent className="py-12 px-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-500/10">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Message Sent
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Template{" "}
              <span className="font-medium text-foreground">
                {template.name}
              </span>{" "}
              has been delivered successfully.
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-4 px-6"
            onClick={() => {
              setSuccess(false);
              setRecipients([]);
            }}
          >
            Send Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl  w-full h-full space-y-6">
      <div className="w-full">
        {/* Edit fields */}
        <Card className="shadow-lg border border-border/50 w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Edit Parameters
            </CardTitle>
            <CardDescription className="text-sm">
              {params.length === 0
                ? "No editable fields available"
                : "Fill in the template variables"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {params.map((p, i) => (
              <div key={i} className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  {p.componentType} — {p.placeholder}
                </Label>

                <Input
                  className="focus-visible:ring-2 focus-visible:ring-primary/40"
                  placeholder={`Enter value for ${p.placeholder}`}
                  value={p.value}
                  onChange={(e) => updateParam(i, e.target.value)}
                />
              </div>
            ))}

            <Separator className="my-4" />

            <RecipientInput onChange={setRecipients} />

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              className="w-full h-11 text-sm font-medium transition-all hover:scale-[1.01]"
              disabled={loading}
              onClick={handleSend}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
