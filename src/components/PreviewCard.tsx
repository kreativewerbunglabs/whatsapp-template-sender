import type { Template } from "../lib/whatsapp";
import { Check, ImageIcon } from "lucide-react";

const PreviewCard = ({
  preview,
  previewUrl,
  template,
}: {
  preview: any;
  previewUrl: string;
  template: Template;
}) => {
  const buttons = template.components
    .filter((c) => c.type === "BUTTONS" && c.buttons)
    .flatMap((c) => c.buttons || []);

  const hasMediaSlot =
    preview.HEADER_IMAGE !== undefined || preview.HEADER_VIDEO !== undefined;
  const hasMedia = hasMediaSlot && previewUrl;

  return (
    <div className="rounded-xl overflow-hidden border bg-[#e5ddd5] dark:bg-zinc-900 shadow-sm">
      {/* WHATSAPP-LIKE HEADER */}
      <div className="bg-[#075e54] dark:bg-zinc-950 px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
          B
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white leading-tight truncate">
            Business
          </p>
          <p className="text-[10px] text-white/70 leading-tight">
            Preview · WhatsApp
          </p>
        </div>
      </div>

      {/* CHAT BACKGROUND */}
      <div
        className="p-3 min-h-100 relative"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* DATE PILL */}
        <div className="flex justify-center mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-medium">
            Today
          </span>
        </div>

        {/* MESSAGE BUBBLE */}
        <div className="relative max-w-[88%] animate-in fade-in slide-in-from-bottom-2">
          <div className="relative rounded-lg rounded-tl-none bg-white dark:bg-zinc-800 p-1.5 shadow-sm">
            {/* TAIL */}
            <div className="absolute top-0 -left-1.5 w-0 h-0 border-t-10 border-t-white dark:border-t-zinc-800 border-l-8 border-l-transparent" />

            {/* MEDIA */}
            {hasMediaSlot && (
              <div className="mb-1 overflow-hidden rounded-md bg-muted aspect-video">
                {hasMedia ? (
                  preview.HEADER_IMAGE ? (
                    <img
                      src={previewUrl}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <ImageIcon className="w-6 h-6 opacity-40" />
                    <span className="text-[10px]">Media will appear here</span>
                  </div>
                )}
              </div>
            )}

            <div className="px-1.5 py-1 space-y-1">
              {preview.HEADER && (
                <p className="font-semibold text-[13px] text-zinc-900 dark:text-zinc-100 leading-tight">
                  {preview.HEADER}
                </p>
              )}

              {preview.BODY ? (
                <p className="text-[13px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-snug">
                  {preview.BODY}
                </p>
              ) : (
                !preview.HEADER && (
                  <p className="text-[12px] italic text-muted-foreground">
                    Your message will preview here as you type…
                  </p>
                )
              )}

              {preview.FOOTER && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                  {preview.FOOTER}
                </p>
              )}

              {/* TIME + TICKS */}
              <div className="flex items-center justify-end gap-0.5 -mb-0.5 pt-0.5">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="flex -space-x-1.5 text-[#53bdeb]">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            {buttons.length > 0 && (
              <div className="mt-1 -mx-1.5 -mb-1.5 border-t border-black/5 dark:border-white/5">
                {buttons.map((btn, i) => (
                  <div
                    key={i}
                    className={`py-2.5 px-3 text-center text-[13px] text-[#00a884] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer ${
                      i > 0 ? "border-t border-black/5 dark:border-white/5" : ""
                    }`}
                  >
                    {btn.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW LABEL FOOTER */}
      <div className="bg-background border-t px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          Live Preview
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          Updates as you type
        </span>
      </div>
    </div>
  );
};

export default PreviewCard;
