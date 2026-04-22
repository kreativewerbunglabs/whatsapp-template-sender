import { useState } from "react";
import type { Template, TemplateParam } from "../lib/whatsapp";
import { Button } from "./ui/button";
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

export function ComposeStep({ template, params }: ComposeStepProps) {
  const [recipients, setRecipients] = useState(["+918957379014"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const wa = useWhatsApp();
  const [successList, setSuccessList] = useState<string[]>([]);
  const [failedList, setFailedList] = useState<
    { number: string; error: string }[]
  >([]);
  const handleSend = async () => {
    console.log(recipients);
    if (recipients.length === 0) {
      setError("Atleast one number is req");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);
    const successTemp: string[] = [];
    const failedTemp: { number: string; error: string }[] = [];
    try {
      for (const number of recipients) {
        try {
          const payload = wa.buildMessagePayload(template, params, number);

          await wa.sendMessage(payload);

          // 🔥 persist progress
          successTemp.push(number);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";

          failedTemp.push({ number, error: message });
        }

        await new Promise((r) => setTimeout(r, 400));
      }
      setSuccessList(successTemp);
      setFailedList(failedTemp);
      setRecipients([]);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  };
  const downloadFailedCSV = () => {
    const rows = [
      ["Number", "Error"],
      ...failedList.map((f) => [f.number, f.error]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "failed_numbers.csv";
    link.click();
  };

  if (success) {
    return (
      <Card className="max-w-lg mx-auto h-125 shadow-xl border flex items-center justify-center border-border/50 backdrop-blur-sm">
        <CardContent className="py-4 px-8 text-center space-y-6">
          {/* ICON */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-500/10">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* TITLE */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Message Process Completed
            </h2>

            <p className="text-sm text-muted-foreground">
              Template{" "}
              <span className="font-medium text-foreground">
                {template.name}
              </span>{" "}
              processed for all recipients.
            </p>
          </div>

          {/* STATS */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-green-600 font-medium">
              ✅ {successList.length} Success
            </div>
            <div className="text-red-500 font-medium">
              ❌ {failedList.length} Failed
            </div>
          </div>

          <div className="flex gap-3">
            {failedList.length > 0 && (
              <Button
                variant="destructive"
                className="flex-1 h-10"
                onClick={downloadFailedCSV}
              >
                Download Failed CSV
              </Button>
            )}

            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => {
                setSuccess(false);
                setRecipients([]);
                setSuccessList([]);
                setFailedList([]);
              }}
            >
              Send Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl  w-full h-full space-y-6">
      <div className="w-full">
        {/* Edit fields */}
        <Card className="shadow-lg border border-border/50 w-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Add Recipients
            </CardTitle>

            <CardDescription className="text-sm">
              Enter phone numbers manually or upload a CSV/XLSX file. Press
              Enter to add multiple numbers.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <Separator className="my-2" />

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
