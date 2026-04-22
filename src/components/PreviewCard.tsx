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
    <Card className="bg-[#efe7de] dark:bg-zinc-950 pt-0 border-none shadow-inner min-h-125 flex flex-col overflow-hidden">
      <CardHeader className="bg-white/80 backdrop-blur-md border-b py-3 shrink-0">
        <CardTitle className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Preview
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col justify-start">
        {/* THE BUBBLE */}
        <div className="relative rounded-2xl rounded-tl-none bg-white dark:bg-zinc-900 p-2 shadow-sm border border-black/5 max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
          {/* WHATSAPP BUBBLE TAIL */}
          <div className="absolute top-0 -left-2 w-0 h-0 border-t-10 border-t-white dark:border-t-zinc-900 border-l-10 border-l-transparent" />

          {/* MEDIA AREA */}
          {(preview.HEADER_IMAGE || preview.HEADER_VIDEO) && previewUrl && (
            <div className="mb-2 overflow-hidden rounded-lg bg-muted">
              {preview.HEADER_IMAGE ? (
                <img
                  src={previewUrl}
                  className="w-full aspect-video object-cover"
                  alt="preview"
                />
              ) : (
                <video src={previewUrl} className="w-full" />
              )}
            </div>
          )}

          <div className="px-1 space-y-1">
            {preview.HEADER && (
              <p className="font-bold text-[13px] text-foreground">
                {preview.HEADER}
              </p>
            )}

            {preview.BODY && (
              <p className="text-[13px] text-zinc-800 dark:text-zinc-200 leading-snug">
                {preview.BODY}
              </p>
            )}

            {preview.FOOTER && (
              <p className="text-[11px] text-muted-foreground/70">
                {preview.FOOTER}
              </p>
            )}

            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-muted-foreground">
                11:44 AM
              </span>
            </div>
          </div>

          {/* BUTTONS */}
          <div className=" divide-y">
            {template.components
              .filter((c) => c.type === "BUTTONS" && c.buttons)
              .flatMap((c) =>
                (c.buttons || []).map((btn, i) => (
                  <div
                    key={i}
                    className="py-2.5 mt-2 -mx-2 border-t text-center text-[13px] text-[#00a884] font-semibold active:bg-zinc-100 transition-colors"
                  >
                    {btn.text}
                  </div>
                )),
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewCard;
