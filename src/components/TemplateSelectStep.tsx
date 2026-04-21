import { useEffect, useState } from "react";
import type { Template } from "../lib/whatsapp";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, FileText } from "lucide-react";
import { useWhatsApp } from "../context/WhatsApp";
import { toast } from "sonner";

interface TemplateSelectStepProps {
  onSelect: (template: Template) => void;
}

export function TemplateSelectStep({ onSelect }: TemplateSelectStepProps) {
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState<Template[] | undefined>();

  const wa = useWhatsApp();
  const approved = templates;

  const fetchTemplates = async () => {
    try {
      const data = await wa.fetchTemplates();
      console.log({ data });
      setTemplates(data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to get templates");
      }
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filtered = approved?.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Select a Template</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {approved?.length} approved template
          {approved?.length !== 1 ? "s" : ""} found
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

      <div className="space-y-3 max-h-112.5 p-1 overflow-y-auto ">
        {filtered?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No templates found
          </p>
        ) : (
          filtered?.map((t) => {
            const bodyComp = t.components.find((c) => c.type === "BODY");
            return (
              <Card
                key={t.id}
                onClick={() => onSelect(t)}
                className="group cursor-pointer transition-all duration-200
             bg-background
             shadow-sm hover:shadow-md
             ring-1 ring-border/40 hover:ring-primary/30
             hover:-translate-y-0.5 rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* ICON */}
                      <div
                        className="p-2.5 rounded-xl bg-muted 
                        group-hover:bg-primary/10 transition-colors"
                      >
                        <FileText
                          className="w-4 h-4 text-muted-foreground 
                       group-hover:text-primary transition-colors"
                        />
                      </div>

                      {/* TEXT */}
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-sm truncate">{t.name}</p>

                        {bodyComp?.text && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {bodyComp.text}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className="text-[10px] px-2 py-0.5 rounded-md">
                        {t.language}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 capitalize rounded-md"
                      >
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
