import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
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
} from "lucide-react";
import { Separator } from "./ui/separator";

export function RecipientInput({
  onChange,
}: {
  onChange: (numbers: string[]) => void;
}) {
  const [manual, setManual] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);

  const normalize = (num: string) => num.replace(/\D/g, "");

  const addNumbers = (raw: string, clearInput = false) => {
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

    setNumbers(extracted);
    onChange(extracted);
  };

  return (
    <div className="w-full space-y-6">
      {/* SECTION 1: MANUAL ENTRY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            Enter Numbers
          </Label>
        </div>

        <div className="relative group">
          <Input
            className="pr-16 py-6 text-sm bg-muted/30 border-dashed focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            placeholder="919876543210, 918888..."
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
            <kbd className="text-[10px] border px-1.5 py-0.5 rounded bg-background font-sans text-muted-foreground opacity-60">
              Enter
            </kbd>
          </div>
        </div>

        {/* RECIPIENT SUMMARY BAR */}
      </div>

      {/* VISUAL DIVIDER */}
      <div className="relative flex items-center py-2">
        <Separator className="grow" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-background px-4 text-[10px] font-black text-muted-foreground/40 tracking-tighter">
          OR
        </span>
      </div>

      {/* SECTION 2: FILE UPLOAD */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs  font-bold uppercase tracking-widest text-primary/70">
            Bulk Import
          </h4>
          <InfoCsvDialog />
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-primary/20 hover:bg-primary/10 hover:border-primary/40 bg-background h-14 group transition-all rounded-xl"
            asChild
          >
            <Label
              htmlFor=".xlsx-.csv-file"
              className="cursor-pointer flex items-center justify-center gap-3 w-full"
            >
              <Upload className="size-4 group-hover:-translate-y-0.5 transition-transform text-primary" />
              <span className="font-medium">Upload CSV or Excel</span>
            </Label>
          </Button>
          <Input
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            id=".xlsx-.csv-file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <p className="text-[10px] text-center text-muted-foreground/50 font-medium">
            Supported: .csv, .xlsx, .xls
          </p>
        </div>
      </div>
      {numbers.length > 0 && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl p-3 sm:p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold leading-none mb-1">
                {numbers.length} Recipients
              </p>
              <RecipientsDialog
                numbers={numbers}
                onRemove={(num) => {
                  const filtered = numbers.filter((n) => n !== num);
                  setNumbers(filtered);
                  onChange(filtered);
                }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => {
              setNumbers([]);
              onChange([]);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
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

  const filtered = useMemo(() => {
    return numbers.filter((n) => n.includes(search));
  }, [numbers, search]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Updated trigger to look more like a status badge */}

        <span className="text-muted-foreground ml-1 hover:underline text-xs">
          View
        </span>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              Recipients
              <span className="bg-muted px-2 py-0.5 rounded-full text-[11px] text-muted-foreground">
                {numbers.length}
              </span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* 🔍 SEARCH BAR - Styled to feel native */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>

          {/* LIST AREA */}
          <div className="max-h-84 overflow-y-auto no-scrollbar rounded-xl border bg-muted/20">
            {filtered.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Search className="size-8 opacity-20 mb-2" />
                <p className="text-sm">No numbers found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((num) => (
                  <div
                    key={num}
                    className="flex items-center justify-between px-4 py-3 group hover:bg-background transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="size-5 text-muted-foreground" />

                      <span className="text-sm font-mono tracking-tight">
                        {num}
                      </span>
                    </div>

                    <button
                      className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                      title="Remove"
                      onClick={() => onRemove(num)}
                    >
                      <UserMinus className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-muted/30 p-3 text-center border-t">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            End of list
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCsvDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-primary transition-colors p-1">
          <Info className="size-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-sm rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            CSV/Excel Format
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="bg-muted px-3 py-2 border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Sample Layout (Column A)
            </div>
            <div className="p-4 font-mono text-xs space-y-2 bg-muted/10">
              <div className="text-primary/80">919876543210</div>
              <div className="text-primary/80">918888777666</div>
              <div className="text-muted-foreground/30 italic text-[10px]">
                ...only first column
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              "Numbers only (no spaces/symbols)",
              "International format (e.g., 91...)",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-[10px] text-center text-muted-foreground/60 font-medium">
              Accepts .csv, .xlsx, .xls
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
