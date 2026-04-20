import { useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { StepIndicator } from "../components/StepIndicator";
import { ConnectStep } from "../components/ConnectStep";
import { TemplateSelectStep } from "../components/TemplateSelectStep";
import { ComposeStep } from "../components/ComposeStep";
import { fetchTemplates, extractParams } from "../lib/whatsapp";
import type { Template, TemplateParam } from "../lib/whatsapp";

const Index = () => {
  const [step, setStep] = useState(0);
  const [token, setToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [params, setParams] = useState<TemplateParam[]>([]);

  const handleConnect = useCallback(async (t: string, wabaId: string, pid: string) => {
    const data = await fetchTemplates(t, wabaId);
    setToken(t);
    setPhoneNumberId(pid);
    setTemplates(data);
    setStep(1);
  }, []);

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setParams(extractParams(template));
    setStep(2);
  }, []);

  const handleBackToTemplates = useCallback(() => {
    setSelectedTemplate(null);
    setParams([]);
    setStep(1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto flex items-center gap-3 py-4 px-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">WhatsApp Template Sender</h1>
            <p className="text-xs text-muted-foreground">Send template messages via the Business API</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto py-8 px-4">
        <StepIndicator currentStep={step} />

        {step === 0 && <ConnectStep onConnect={handleConnect} />}
        {step === 1 && <TemplateSelectStep templates={templates} onSelect={handleSelectTemplate} />}
        {step === 2 && selectedTemplate && (
          <ComposeStep
            template={selectedTemplate}
            params={params}
            token={token}
            phoneNumberId={phoneNumberId}
            onBack={handleBackToTemplates}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
