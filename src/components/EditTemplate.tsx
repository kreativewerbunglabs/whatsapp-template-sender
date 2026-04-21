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

  useEffect(() => {
    setParams(wa.extractParams(template));
  }, [wa, template]);
  useEffect(() => {
    console.log("params:", params);
    console.log("template components:", template.components);
  }, [params, template]);

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
      const index = Number(key.split("_").pop());
      if (key.startsWith("header_text_")) {
        const param = updatedParams.find(
          (p) => p.componentType === "HEADER" && p.index === index,
        );
        if (param) param.value = value as string;
      }
      if (key.startsWith("body_")) {
        const param = updatedParams.find(
          (p) => p.componentType === "BODY" && p.index === index,
        );
        if (param) param.value = value as string;
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

    setParams(updatedParams);
    setIsReady(true);
  };

  const hasInputs =
    params.length > 0 ||
    template.components.some(
      (c) =>
        c.type === "HEADER" &&
        ["IMAGE", "VIDEO", "DOCUMENT"].includes(c.format ?? ""),
    );

  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <h2 className="text-2xl capitalize font-semibold">{template.name}</h2>
        <div className="flex gap-2 mt-1">
          <Badge variant="secondary">{template.language}</Badge>
          <Badge variant="outline" className="capitalize">
            {template.category}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch w-full md:grid-cols-2 gap-6">
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
              <Button type="submit">Submit</Button>
            </form>
          ) : (
            <ComposeStep params={params} template={template} />
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
  const extractVariables = (
    text: string, // Matches both {{1}} and {{name}}
  ) => text.match(/{{[^}]+}}/g) || [];
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
