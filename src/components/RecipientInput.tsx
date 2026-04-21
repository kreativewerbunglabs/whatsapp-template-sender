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
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      addNumbers(manual, true);
    }
  };

  // commit on paste too
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    addNumbers(e.clipboardData.getData("text"), true);
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
    onChange(merged);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        Recipients
      </Label>

      {/* INPUT BOX */}
      <div className="border rounded-xl p-2 bg-background focus-within:ring-2 focus-within:ring-primary/30 transition">
        <Input
          className="border-0 focus-visible:ring-0 p-1 text-sm"
          placeholder="Type or paste numbers (comma, space, or Enter)"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>

      {/* HELPER TEXT */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Press Enter, comma, or space to add numbers</p>
        <p>• You can paste multiple numbers at once</p>
      </div>

      {/* FILE UPLOAD */}
      <div className="space-y-1">
        <Button asChild>
          <Label
            htmlFor=".xlsx-.csv-file"
            className="text-xs uppercase tracking-wider "
          >
            Upload file (optional)
          </Label>
        </Button>

        <Input
          type="file"
          accept=".xlsx,.csv"
          className="cursor-pointer hidden"
          id=".xlsx-.csv-file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <p className="text-xs text-muted-foreground">
          Supports CSV/XLSX (one number per row)
        </p>
      </div>

      {/* COUNT */}

      <RecipientsDialog numbers={numbers} />
    </div>
  );
}
function RecipientsDialog({ numbers }: { numbers: string[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return numbers.filter((n) => n.includes(search));
  }, [numbers, search]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-primary hover:underline cursor-pointer">
          {numbers.length} recipients added (view)
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recipients ({numbers.length})</DialogTitle>
        </DialogHeader>

        {/* 🔍 SEARCH */}
        <Input
          placeholder="Search number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LIST */}
        <div className="max-h-64 overflow-y-auto space-y-1.5 mt-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No results
            </p>
          ) : (
            filtered.map((num) => (
              <div
                key={num}
                className="flex items-center justify-between border rounded-md px-2 py-1 text-xs"
              >
                <span>{num}</span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
