import { useState } from "react";
import type { Template, TemplateParam } from "../lib/whatsapp";
import { Button } from "./ui/button";
import {
  Send,
  Loader2,
  CheckCircle2,
  Download,
  RotateCcw,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useWhatsApp } from "../context/WhatsApp";
import { RecipientInput } from "./RecipientInput";

interface ComposeStepProps {
  template: Template;
  params: TemplateParam[];
}

export function ComposeStep({ template, params }: ComposeStepProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const wa = useWhatsApp();
  const [successList, setSuccessList] = useState<string[]>([]);
  const [failedList, setFailedList] = useState<
    { number: string; error: string }[]
  >([]);

  const handleSend = async () => {
    if (recipients.length === 0) {
      setError("Add at least one recipient to continue");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);
    setProgress(0);

    const successTemp: string[] = [];
    const failedTemp: { number: string; error: string }[] = [];

    try {
      for (let i = 0; i < recipients.length; i++) {
        const number = recipients[i];
        try {
          const payload = wa?.buildMessagePayload(template, params, number);
          await wa?.sendMessage(payload);
          successTemp.push(number);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
         
          failedTemp.push({ number, error: message });
        }
        setProgress(Math.round(((i + 1) / recipients.length) * 100));
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
  const escapeCSV = (value: string) => {
    if (!value) return "";
    return `"${value.replace(/"/g, '""')}"`;
  };

  const rows = [
    ["Number", "Error"],
    ...failedList.map((f) => [f.number, f.error]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => escapeCSV(cell)).join(","))
    .join("\n");

  // ✅ Use Blob instead of data URI
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "failed_numbers.csv";
  link.click();

  URL.revokeObjectURL(url);
};

  if (success) {
    const total = successList.length + failedList.length;
    const successRate = total
      ? Math.round((successList.length / total) * 100)
      : 0;

    return (
      <div className="space-y-5">
        {/* Hero status */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 ring-8 ring-green-500/5">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">
              Campaign sent
            </h3>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {template.name}
              </span>{" "}
              · {successRate}% delivered
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border bg-green-500/5 border-green-500/20 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              Success
            </div>
            <div className="mt-1 text-2xl font-semibold text-foreground">
              {successList.length}
            </div>
          </div>
          <div className="rounded-lg border bg-destructive/5 border-destructive/20 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-destructive">
              <XCircle className="w-3 h-3" />
              Failed
            </div>
            <div className="mt-1 text-2xl font-semibold text-foreground">
              {failedList.length}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {failedList.length > 0 && (
            <Button
              variant="outline"
              className="flex-1 h-10 gap-2"
              onClick={downloadFailedCSV}
            >
              <Download className="w-4 h-4" />
              Download failures
            </Button>
          )}
          <Button
            className="flex-1 h-10 gap-2"
            onClick={() => {
              setSuccess(false);
              setRecipients([]);
              setSuccessList([]);
              setFailedList([]);
              setProgress(0);
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RecipientInput onChange={setRecipients} />

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md flex items-center gap-2">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Sticky-ish footer action */}
      <div className="pt-2 border-t">
        <Button
          className="w-full h-11 text-sm font-medium relative overflow-hidden"
          disabled={loading || recipients.length === 0}
          onClick={handleSend}
        >
          {loading && (
            <div
              className="absolute inset-y-0 left-0 bg-white/15 transition-all"
              style={{ width: `${progress}%` }}
            />
          )}
          <span className="relative flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending {progress}%
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {recipients.length || 0}{" "}
                {recipients.length === 1 ? "recipient" : "recipients"}
              </>
            )}
          </span>
        </Button>

        {loading && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-md px-3 py-2 mt-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />

            <div className="text-xs leading-tight">
              <p className="font-semibold">Do not close this tab</p>
              <p className="text-[11px] text-yellow-800/80">
                Your upload is in progress. Closing the tab may interrupt the
                request.
              </p>
            </div>
          </div>
        )}
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Messages send sequentially with a brief delay
        </p>
      </div>
    </div>
  );
}
