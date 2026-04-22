import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Info,
  Search,
  User,
  UserMinus,
  Users,
  Upload,
  Trash2,
  FileSpreadsheet,
  Plus,

} from "lucide-react";

export function RecipientInput({
  onChange,
}: {
  onChange: (numbers: string[]) => void;
}) {
  const [manual, setManual] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const normalize = (num: string) => num.replace(/\D/g, "");

  const addNumbers = (raw: string, clearInput = false) => {
    if (raw.length === 0) return;
    const split = raw
      .split(/[\n, ]+/)
      .map(normalize)
      .filter(Boolean);
    if (!split.length) return;
    const merged = Array.from(new Set([...numbers, ...split]));
    setNumbers(merged);
    onChange(merged);
    if (clearInput) setManual("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNumbers(manual, true);
    }
  };

  const handleFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const extracted = rows
      .map((row) => row[0])
      .filter(Boolean)
      .map((num) => String(num).replace(/\D/g, ""));
    const merged = Array.from(new Set([...numbers, ...extracted]));
    setNumbers(merged);
    setFileName(file.name);
    onChange(merged);
  };

  const removeOne = (num: string) => {
    const filtered = numbers.filter((n) => n !== num);
    setNumbers(filtered);
    onChange(filtered);
  };

  const clearAll = () => {
    setNumbers([]);
    setFileName(null);
    onChange([]);
  };



  return (
    <div className="space-y-4">
      {/* TABBED INPUT */}
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid grid-cols-2 w-full h-9">
          <TabsTrigger value="manual" className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Manual
          </TabsTrigger>
          <TabsTrigger value="file" className="text-xs gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Import file
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-3 space-y-2">
          <div className="relative">
            <Input
              className="pr-14 h-11 text-sm font-mono tracking-tight"
              placeholder="Enter Recipients"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {manual ? (
                <button
                  onClick={() => addNumbers(manual, true)}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              ) : (
                <kbd className="text-[10px] border px-1.5 py-0.5 rounded bg-muted font-sans text-muted-foreground">
                  Enter
                </kbd>
              )}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            Separate multiple numbers with commas or new lines · International
            format
          </p>
        </TabsContent>

        <TabsContent value="file" className="mt-3 space-y-2">
          <Label
            htmlFor="csv-xlsx-file"
            className="flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
          >
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 transition-all" />
            <div className="text-center">
              <p className="text-xs font-medium">
                {fileName ? fileName : "Drop or click to upload"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                .csv, .xlsx, .xls — first column only
              </p>
            </div>
          </Label>
          <Input
            type="file"
            accept=".xlsx,.csv,.xls"
            className="hidden"
            id="csv-xlsx-file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="flex justify-end">
            <InfoCsvDialog />
          </div>
        </TabsContent>
      </Tabs>

      {/* RECIPIENTS PREVIEW */}
      {numbers.length > 0 && (
        <div className="rounded-lg border bg-muted/30 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-background/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Users className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-semibold">
                {numbers.length}{" "}
                {numbers.length === 1 ? "recipient" : "recipients"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <RecipientsDialog numbers={numbers} onRemove={removeOne} />
              <button
                onClick={clearAll}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
         
        </div>
      )}
    </div>
  );
}

function RecipientsDialog({
  numbers,
  onRemove,
}: {
  numbers: string[];
  onRemove: (num: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => numbers.filter((n) => n.includes(search)),
    [numbers, search],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
          View all
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            All recipients
            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-mono">
              {numbers.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search numbers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="max-h-80 overflow-y-auto rounded-md border">
            {filtered.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-muted-foreground">
                <Search className="w-6 h-6 opacity-20 mb-2" />
                <p className="text-xs">No numbers found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((num) => (
                  <div
                    key={num}
                    className="flex items-center justify-between px-3 py-2 group hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-mono">{num}</span>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                      title="Remove"
                      onClick={() => onRemove(num)}
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCsvDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-3 h-3" />
          Format help
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            File format
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-1">
          <div className="rounded-md border overflow-hidden">
            <div className="bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Column A
            </div>
            <div className="p-3 font-mono text-xs space-y-1 bg-background">
              <div>919876543210</div>
              <div>918888777666</div>
              <div className="text-muted-foreground/40 italic text-[10px]">
                only first column is read
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              "Numbers only — no spaces or symbols",
              "International format with country code",
              "Duplicates will be removed automatically",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
