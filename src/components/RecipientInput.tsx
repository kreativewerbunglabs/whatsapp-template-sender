import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function RecipientInput({
  onChange,
}: {
  onChange: (numbers: string[]) => void;
}) {
  const [manual, setManual] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);

  const normalize = (num: string) => num.replace(/\D/g, "");

  useEffect(() => {
    if (!manual.trim()) return;

    const timer = setTimeout(() => {
      const split = manual
        .split(/[\n, ]+/)
        .map(normalize)
        .filter(Boolean);

      const merged = Array.from(new Set([...numbers, ...split]));
      setNumbers(merged);
      onChange(merged);
    }, 500);

    return () => clearTimeout(timer);
  }, [manual]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const split = manual
        .split(/[\n, ]+/)
        .map(normalize)
        .filter(Boolean);

      const merged = Array.from(new Set([...numbers, ...split]));

      setNumbers(merged);
      onChange(merged);
      setManual(""); // clear input after enter
    }
  };

  // 🔹 File upload (same as before)
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

      {/* Manual Input */}
      <Input
        placeholder="Type numbers (comma, space, enter)"
        value={manual}
        onChange={(e) => setManual(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* File Upload */}
      <Input
        type="file"
        accept=".xlsx,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="text-xs text-muted-foreground">
        {numbers.length} recipients selected
      </div>
    </div>
  );
}
