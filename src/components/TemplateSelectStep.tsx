import { useState } from "react";
import type { Template } from "../lib/whatsapp";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, FileText } from "lucide-react";

interface TemplateSelectStepProps {
  templates: Template[];
  onSelect: (template: Template) => void;
}

export function TemplateSelectStep({ templates, onSelect }: TemplateSelectStepProps) {
  const [search, setSearch] = useState("");

  const approved = templates.filter((t) => t.status === "APPROVED");
  const filtered = approved.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Select a Template</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {approved.length} approved template{approved.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No templates found</p>
        ) : (
          filtered.map((t) => {
            const bodyComp = t.components.find((c) => c.type === "BODY");
            return (
              <Card
                key={t.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => onSelect(t)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 p-2 rounded-lg bg-secondary">
                        <FileText className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{t.name}</p>
                        {bodyComp?.text && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {bodyComp.text}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {t.language}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {t.category.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
