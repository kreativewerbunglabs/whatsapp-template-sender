import { createContext, useContext } from "react";
import { WhatsAppService } from "../lib/whatsapp";

export const WhatsAppContext = createContext<WhatsAppService | null>(null);

export const useWhatsApp = () => {
  const ctx = useContext(WhatsAppContext);
  if (!ctx) throw new Error("WhatsAppService not initialized");
  return ctx;
};
