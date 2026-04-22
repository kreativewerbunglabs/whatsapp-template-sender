import React, { useEffect, useMemo, useState } from "react";
import { type Template, type TemplateParam } from "../lib/whatsapp";
import { Button } from "./ui/button";
import { ArrowLeft, Eye, MessageSquare, Pencil } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useWhatsApp } from "../context/WhatsApp";
import { UploadFile } from "./UploadFile";
import { ComposeStep } from "./ComposeStep";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import PreviewCard from "./PreviewCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface ComposeStepProps {
  template: Template;
  onBack: () => void;
}

const EditTemplate = ({ template, onBack }: ComposeStepProps) => {
  const [params, setParams] = useState<TemplateParam[]>([]);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [liveValues, setLiveValues] = useState<Record<string, string>>({});
  const [finalParams, setFinalParams] = useState<TemplateParam[]>([]);
  const wa = useWhatsApp();

  useEffect(() => {
    if (wa) setParams(wa.extractParams(template));
  }, [wa, template]);

  const handleInputChange = (key: string, value: string) =>
    setLiveValues((prev) => ({ ...prev, [key]: value }));

  const hasMediaInput = template.components.some(
    (c) =>
      c.type === "HEADER" &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(c.format ?? ""),
  );

  const hasInputs = params.length > 0 || hasMediaInput;

  const preview = useMemo(() => {
    const result: any = {};
    for (const comp of template.components) {
      if (comp.text) {
        let text = comp.text;
        const matches = comp.text.match(/{{[^}]+}}/g) || [];
        matches.forEach((variable) => {
          const varName = variable.replace(/{{|}}/g, "");
          const key =
            comp.type === "HEADER"
              ? `header_text_${varName}`
              : `body_${varName}`;
          const value = liveValues[key] || `[${varName}]`;
          text = text.replace(variable, value);
        });
        result[comp.type] = text;
      }
      if (comp.type === "HEADER" && comp.format === "IMAGE")
        result.HEADER_IMAGE = mediaId;
      if (comp.type === "HEADER" && comp.format === "VIDEO")
        result.HEADER_VIDEO = mediaId;
    }
    return result;
  }, [template, liveValues, mediaId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const entries = [...new FormData(e.currentTarget).entries()];
    if (!entries.length && !mediaId) return toast.error("Fields are required");

    const updatedParams = [...params];
    for (const [key, value] of entries) {
      const isHeader = key.startsWith("header_text_");
      const isBody = key.startsWith("body_");
      if (!isHeader && !isBody) continue;
      const varName = key.replace(isHeader ? "header_text_" : "body_", "");
      const componentType = isHeader ? "HEADER" : "BODY";
      const param = updatedParams.find(
        (p) =>
          p.componentType === componentType &&
          p.placeholder === `{{${varName}}}`,
      );
      if (param) param.value = value as string;
      else
        updatedParams.push({
          componentType,
          index: updatedParams.filter((p) => p.componentType === componentType)
            .length,
          placeholder: `{{${varName}}}`,
          value: value as string,
        });
    }

    if (mediaId) {
      const existing = updatedParams.find((p) => p.componentType === "HEADER");
      if (existing) existing.value = mediaId;
      else
        updatedParams.push({
          componentType: "HEADER",
          index: 0,
          placeholder: "media",
          value: mediaId,
        });
    }
    setFinalParams(updatedParams);
    setIsReady(true);
  };

  const isSubmitDisabled = hasMediaInput && !previewUrl;

  return (
    <div className="flex flex-col gap-5">
      {/* TOP NAV BAR */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Templates</span>
          <span className="sm:hidden">Back</span>
        </button>
        {/* MOBILE: preview trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-sm">Message Preview</SheetTitle>
            </SheetHeader>
            <div className="p-4 overflow-y-auto h-[calc(80vh-65px)]">
              <PreviewCard
                preview={preview}
                previewUrl={previewUrl ?? ""}
                template={template}
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:block w-22" /> {/* spacer */}
      </div>

      {/* TEMPLATE META */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground capitalize truncate">
            {template.name.replace(/_/g, " ")}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge
              variant="secondary"
              className="px-2 py-0 h-5 text-[10px] font-medium uppercase tracking-wider"
            >
              {template.language}
            </Badge>
            <Badge
              variant="outline"
              className="px-2 py-0 h-5 text-[10px] font-medium capitalize text-muted-foreground"
            >
              {template.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] gap-5 items-start">
        {/* LEFT: FORM / COMPOSE */}
        <div className="min-w-0">
          {!isReady && hasInputs ? (
            <div className="rounded-xl border bg-card">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Personalize message</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Fill the variables — preview updates live
                  </p>
                </div>
              </div>
              <form onSubmit={onSubmit} className="p-4 space-y-5">
                {template.components.map((item, idx) => (
                  <ComponentSection
                    key={idx}
                    item={item}
                    setMediaId={setMediaId}
                    setPreviewUrl={setPreviewUrl}
                    onChange={handleInputChange}
                  />
                ))}
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="w-full h-10"
                >
                  Continue to recipients
                </Button>
              </form>
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Recipients</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Add numbers and send your campaign
                  </p>
                </div>
                {isReady && hasInputs && (
                  <button
                    onClick={() => setIsReady(false)}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="p-4">
                <ComposeStep params={finalParams} template={template} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: STICKY PREVIEW (desktop only) */}
        <div className="hidden md:block sticky top-4">
          <PreviewCard
            preview={preview}
            previewUrl={previewUrl ?? ""}
            template={template}
          />
        </div>
      </div>
    </div>
  );
};

const ComponentSection = ({
  item,
  setMediaId,
  setPreviewUrl,
  onChange,
}: {
  item: any;
  setMediaId: (id: string) => void;
  setPreviewUrl: (url: string) => void;
  onChange: (key: string, value: string) => void;
}) => {
  const extractVariables = (text: string) => text.match(/{{[^}]+}}/g) || [];

  if (item.type === "HEADER") {
    if (item.format === "TEXT") {
      const vars = extractVariables(item.text ?? "");
      if (!vars.length) return null;
      return (
        <FieldGroup label="Header" hint="Title shown in bold">
          {vars.map((variable) => {
            const varName = variable.replace(/{{|}}/g, "");
            return (
              <div key={`h-${varName}`} className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground capitalize">
                  {varName.replace(/_/g, " ")}
                </Label>
                <Input
                  name={`header_text_${varName}`}
                  placeholder={`Enter ${varName}`}
                  onChange={(e) =>
                    onChange(`header_text_${varName}`, e.target.value)
                  }
                  required
                />
              </div>
            );
          })}
        </FieldGroup>
      );
    }
    if (["IMAGE", "VIDEO"].includes(item.format)) {
      return (
        <FieldGroup
          label="Media"
          hint={`${item.format.toLowerCase()} attachment`}
        >
          <UploadFile
            name="header_media"
            onChange={(id) => setMediaId(id)}
            setPreviewUrl={setPreviewUrl}
          />
        </FieldGroup>
      );
    }
  }

  if (item.type === "BODY") {
    const vars = extractVariables(item.text ?? "");
    if (!vars.length) return null;
    return (
      <FieldGroup label="Body" hint="Variables in the message">
        {vars.map((variable) => {
          const varName = variable.replace(/{{|}}/g, "");
          return (
            <div key={`b-${varName}`} className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground capitalize">
                {varName.replace(/_/g, " ")}
              </Label>
              <Input
                name={`body_${varName}`}
                placeholder={`Enter ${varName}`}
                onChange={(e) => onChange(`body_${varName}`, e.target.value)}
                required
              />
            </div>
          );
        })}
      </FieldGroup>
    );
  }

  return null;
};

const FieldGroup = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {hint && (
        <span className="text-[10px] text-muted-foreground/60">{hint}</span>
      )}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

export default EditTemplate;
