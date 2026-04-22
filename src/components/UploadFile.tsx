import { useState } from "react";
import { Input } from "./ui/input";
import { useWhatsApp } from "../context/WhatsApp";

export function UploadFile({
  name,
  onChange,
  setPreviewUrl,
}: {
  name: string;
  onChange: (value: string) => void; // returns mediaId
  setPreviewUrl: (url: string) => void;
}) {
  const wa = useWhatsApp();
  const [loading, setLoading] = useState(false);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setLoading(true);
    setError("");

    try {
      const res = await wa?.uploadFile(file);

      // WhatsApp returns { id: "MEDIA_ID" }
      const id = res.id;

      setMediaId(id);
      onChange(id); // 🔥 push to form
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* UPLOAD BOX */}
      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition">
        <span className="text-sm font-medium text-muted-foreground">
          Click to upload image
        </span>
        <span className="text-xs text-muted-foreground">PNG, JPG, WEBP</span>

        <Input
          name={name}
          type="file"
          accept="image/*"
          required
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-md">
          <span className="truncate">Uploading ...</span>
        </div>
      )}

      {/* SUCCESS STATE */}
      {mediaId && !loading && (
        <div className="flex items-center justify-between text-xs bg-green-50 text-green-700 px-3 py-2 rounded-md">
          <span className="truncate">Uploaded successfully</span>
          <span className="font-mono text-[10px] opacity-70">
            {mediaId.slice(0, 8)}...
          </span>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
