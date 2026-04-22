import { useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { StepIndicator } from "../components/StepIndicator";
import { ConnectStep } from "../components/ConnectStep";
import { TemplateSelectStep } from "../components/TemplateSelectStep";
import type { Template, WhatsAppService } from "../lib/whatsapp";
import EditTemplate from "../components/EditTemplate";
import { WhatsAppContext } from "../context/WhatsApp";

const Index = () => {
  const [step, setStep] = useState(0);
  const [wa, setWa] = useState<WhatsAppService | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setStep(2);
  }, []);

  const handleBackToTemplates = useCallback(() => {
    setSelectedTemplate(null);
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
            <h1 className="font-bold text-lg leading-tight">
              WhatsApp Template Sender
            </h1>
            <p className="text-xs text-muted-foreground">
              Send template messages via the Business API
            </p>
          </div>
        </div>
      </header>
      <WhatsAppContext.Provider value={wa}>
        <main className="container max-w-4xl mx-auto py-8 px-4">
          <StepIndicator  currentStep={step} />

          <div className="md:w-full max-md:max-w-xl mx-auto">
            {step === 0 && <ConnectStep setStep={setStep} setWa={setWa} />}
            {step === 1 && (
              <TemplateSelectStep onSelect={handleSelectTemplate} />
            )}
            {step === 2 && selectedTemplate && (
              <EditTemplate
                template={selectedTemplate}
                onBack={handleBackToTemplates}
              />
            )}
          </div>
        </main>
      </WhatsAppContext.Provider>
    </div>
  );
};

export default Index;
