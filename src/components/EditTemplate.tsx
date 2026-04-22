import React, { useEffect, useState } from "react";
import { type Template, type TemplateParam } from "../lib/whatsapp";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "./ui/input";
import { useWhatsApp } from "../context/WhatsApp";
import { UploadFile } from "./UploadFile";
import { ComposeStep } from "./ComposeStep";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import PreviewCard from "./PreviewCard";

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
  const wa = useWhatsApp();
  const [finalParams, setFinalParams] = useState<TemplateParam[]>([]);

  useEffect(() => {
    if (wa) {
      setParams(wa.extractParams(template));
    }
  }, [wa, template]);

  const handleInputChange = (key: string, value: string) => {
    setLiveValues((prev) => ({ ...prev, [key]: value }));
  };

  const preview = React.useMemo(() => {
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
    if (!entries.length) return toast.error("Fields are required");

    const updatedParams = [...params];

    for (const [key, value] of entries) {
      if (key.startsWith("header_text_")) {
        const varName = key.replace("header_text_", "");
        const param = updatedParams.find(
          (p) =>
            p.componentType === "HEADER" &&
            (p.placeholder === `{{${varName}}}` ||
              p.placeholder === `{{${varName}}}`),
        );
        if (param) param.value = value as string;
        else
          updatedParams.push({
            componentType: "HEADER",
            index: updatedParams.filter((p) => p.componentType === "HEADER")
              .length,
            placeholder: `{{${varName}}}`,
            value: value as string,
          });
      }

      if (key.startsWith("body_")) {
        const varName = key.replace("body_", "");
        const param = updatedParams.find(
          (p) =>
            p.componentType === "BODY" && p.placeholder === `{{${varName}}}`,
        );
        if (param) param.value = value as string;
        else
          updatedParams.push({
            componentType: "BODY",
            index: updatedParams.filter((p) => p.componentType === "BODY")
              .length,
            placeholder: `{{${varName}}}`,
            value: value as string,
          });
      }
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

  const hasInputs =
    params.length > 0 ||
    template.components.some(
      (c) =>
        c.type === "HEADER" &&
        ["IMAGE", "VIDEO", "DOCUMENT"].includes(c.format ?? ""),
    );

  const hasMediaInput = template.components.some(
    (c) =>
      c.type === "HEADER" &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(c.format ?? ""),
  );
  const isSubmitDisabled = hasMediaInput && !previewUrl;

  return (
    <div className="flex flex-col items-start gap-4 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full px-1">
        <div className="space-y-1.5 text-center sm:text-left">
          {/* TITLE: Responsive sizing from text-xl to text-2xl */}
          <h2 className="text-xl sm:text-2xl capitalize font-bold tracking-tight text-foreground">
            {template.name}
          </h2>

          {/* BADGES: Flex-wrap ensures they don't break the layout on tiny screens */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary border-none"
            >
              {template.language}
            </Badge>
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[10px] sm:text-xs font-medium capitalize border-muted-foreground/20 text-muted-foreground"
            >
              {template.category}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 w-full items-start h-fit px-2  overflow-y-auto py-2 no-scrollbar">
        <div className="w-full">
          {!isReady && hasInputs ? (
            <form onSubmit={onSubmit} className="space-y-4">
              {template.components.map((item) =>
                renderComponent({
                  item,
                  setMediaId,
                  setPreviewUrl,
                  onChange: handleInputChange,
                }),
              )}
              <Button type="submit" disabled={isSubmitDisabled}>
                Submit
              </Button>
            </form>
          ) : (
            <ComposeStep params={finalParams} template={template} />
          )}
        </div>
        <PreviewCard
          preview={preview}
          previewUrl={previewUrl ?? ""}
          template={template}
        />
      </div>

      <Button variant="outline" className="w-full" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2 stroke-[0.5px]" />
        Pick Another Template
      </Button>
    </div>
  );
};

export default EditTemplate;

const renderComponent = ({
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
      return extractVariables(item.text ?? "").map((variable) => {
        const varName = variable.replace(/{{|}}/g, "");
        return (
          <Input
            key={`header-text-${varName}`}
            name={`header_text_${varName}`}
            placeholder={varName}
            onChange={(e) => onChange(`header_text_${varName}`, e.target.value)}
            required
          />
        );
      });
    }
    if (["IMAGE", "VIDEO"].includes(item.format)) {
      return (
        <UploadFile
          key={`header-${item.format}`}
          name="header_media"
          onChange={(id) => setMediaId(id)}
          setPreviewUrl={setPreviewUrl}
        />
      );
    }
  }

  if (item.type === "BODY") {
    return extractVariables(item.text ?? "").map((variable) => {
      const varName = variable.replace(/{{|}}/g, ""); // strips {{ and }}
      return (
        <Input
          key={`body-${varName}`}
          name={`body_${varName}`}
          placeholder={varName} // shows "name", "order_id" etc
          onChange={(e) => onChange(`body_${varName}`, e.target.value)}
        />
      );
    });
  }

  return null;
};
