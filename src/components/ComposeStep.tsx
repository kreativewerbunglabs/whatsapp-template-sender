import { useState } from "react";
import { buildMessagePayload, sendMessage } from "../lib/whatsapp";
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
import { Badge } from "./ui/badge";
import { ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";

interface ComposeStepProps {
  template: Template;
  params: TemplateParam[];
  token: string;
  phoneNumberId: string;
  onBack: () => void;
}

export function ComposeStep({
  template,
  params: initialParams,
  token,
  phoneNumberId,
  onBack,
}: ComposeStepProps) {
  const [params, setParams] = useState<TemplateParam[]>(initialParams);
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateParam = (idx: number, value: string) => {
    setParams((prev) => prev.map((p, i) => (i === idx ? { ...p, value } : p)));
  };

  const getPreviewText = () => {
    let preview: Record<string, string> = {};
    for (const comp of template.components) {
      if (!comp.text) continue;
      let text = comp.text;
      const compParams = params.filter((p) => p.componentType === comp.type);
      for (const p of compParams) {
        text = text.replace(p.placeholder, p.value || `[${p.placeholder}]`);
      }
      preview[comp.type] = text;
    }
    return preview;
  };

  const handleSend = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const payload = buildMessagePayload(template, params, recipient);
      await sendMessage(token, phoneNumberId, payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  const allFilled =
    params.every((p) => p.value.trim() !== "") && recipient.trim() !== "";
  const preview = getPreviewText();

  if (success) {
    return (
      <Card className="max-w-lg mx-auto shadow-lg text-center">
        <CardContent className="py-12 space-y-4">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
          <h2 className="text-xl font-semibold">Message Sent!</h2>
          <p className="text-muted-foreground">
            Template <strong>{template.name}</strong> was sent to{" "}
            <strong>{recipient}</strong>
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setRecipient("");
              }}
            >
              Send Another
            </Button>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Pick Another Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{template.name}</h2>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {template.language}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {template.category.toLowerCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Edit fields */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Edit Parameters</CardTitle>
            <CardDescription>
              {params.length === 0
                ? "No editable fields"
                : "Fill in the template variables"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {params.map((p, i) => (
              <div key={i} className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {p.componentType} — {p.placeholder}
                </Label>
                <Input
                  placeholder={`Enter value for ${p.placeholder}`}
                  value={p.value}
                  onChange={(e) => updateParam(i, e.target.value)}
                />
              </div>
            ))}

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Recipient Phone Number
              </Label>
              <Input
                placeholder="e.g. +1234567890"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              disabled={
                loading ||
                (!allFilled && params.length > 0) ||
                !recipient.trim()
              }
              onClick={handleSend}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-card p-4 shadow-sm space-y-3 border">
              {preview.HEADER && (
                <p className="font-semibold text-sm">{preview.HEADER}</p>
              )}
              {preview.BODY && (
                <p className="text-sm whitespace-pre-wrap">{preview.BODY}</p>
              )}
              {preview.FOOTER && (
                <p className="text-xs text-muted-foreground">
                  {preview.FOOTER}
                </p>
              )}
              {template.components
                .filter((c) => c.type === "BUTTONS" && c.buttons)
                .flatMap((c) =>
                  (c.buttons || []).map((btn, i) => (
                    <div
                      key={i}
                      className="text-center text-sm text-primary font-medium py-2 border-t"
                    >
                      {btn.text}
                    </div>
                  )),
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
