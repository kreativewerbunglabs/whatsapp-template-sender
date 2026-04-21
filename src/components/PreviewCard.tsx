import type { Template } from "../lib/whatsapp";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const PreviewCard = ({
  preview,
  previewUrl,
  template,
}: {
  preview: any;
  previewUrl: string;
  template: Template;
}) => {
  return (
    <Card className="bg-muted/30 border border-border/50 shadow-sm max-h-102 flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="font-medium text-muted-foreground">
          Live Preview
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-3 shadow-md space-y-3 border max-w-sm mx-auto">
          {/* IMAGE HEADER */}
          {preview.HEADER_IMAGE && previewUrl && (
            <div className="overflow-hidden rounded-xl">
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* VIDEO HEADER */}
          {preview.HEADER_VIDEO && previewUrl && (
            <video src={previewUrl} controls className="w-full rounded-xl" />
          )}

          {/* HEADER */}
          {preview.HEADER && (
            <p className="font-semibold text-sm text-foreground wrap-break-word">
              {preview.HEADER}
            </p>
          )}

          {/* BODY */}
          {preview.BODY && (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {preview.BODY}
            </p>
          )}

          {/* BUTTONS */}
          {template.components
            .filter((c) => c.type === "BUTTONS" && c.buttons)
            .flatMap((c) =>
              (c.buttons || []).map((btn, i) => (
                <div
                  key={i}
                  className="text-center text-sm text-primary font-medium py-2 border-t"
                >
                  {btn.text}
                </div>
              )),
            )}

          {/* FOOTER */}
          {preview.FOOTER && (
            <p className="text-xs text-muted-foreground">{preview.FOOTER}</p>
          )}

          {/* TIMESTAMP */}
          <div className="flex justify-end">
            <span className="text-[10px] text-muted-foreground">just now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewCard;
