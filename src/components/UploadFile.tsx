import { useState } from "react";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { useWhatsApp } from "../context/WhatsApp";

export function UploadFile({
  name,
  onChange,
  setPreviewUrl
}: {
  name: string;
  onChange: (value: string) => void; // returns mediaId
  setPreviewUrl:(url:string)=>void
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
      const res = await wa.uploadFile(file);

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
    <div className="space-y-2">
      <Input
        name={name}
        type="file"
        accept="image/*"
        required
        onChange={handleFileChange}
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </div>
      )}

      {mediaId && (
        <p className="text-xs text-green-600">Uploaded ✓ ID: {mediaId}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
