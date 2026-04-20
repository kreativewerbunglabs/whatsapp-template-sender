const BASE_URL = "https://graph.facebook.com/v21.0";

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  buttons?: Array<{ type: string; text: string; url?: string; phone_number?: string }>;
  example?: {
    header_text?: string[];
    body_text?: string[][];
    header_handle?: string[];
  };
}

export interface Template {
  name: string;
  language: string;
  status: string;
  category: string;
  id: string;
  components: TemplateComponent[];
}

export interface TemplateParam {
  componentType: string;
  index: number;
  placeholder: string;
  value: string;
}

export async function fetchTemplates(token: string, wabaId: string): Promise<Template[]> {
  const res = await fetch(
    `${BASE_URL}/${wabaId}/message_templates?limit=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch templates (${res.status})`);
  }
  const data = await res.json();
  return data.data || [];
}

export function extractParams(template: Template): TemplateParam[] {
  const params: TemplateParam[] = [];
  for (const comp of template.components) {
    if (!comp.text) continue;
    const regex = /\{\{(\d+)\}\}/g;
    let match;
    while ((match = regex.exec(comp.text)) !== null) {
      params.push({
        componentType: comp.type,
        index: parseInt(match[1]),
        placeholder: match[0],
        value: "",
      });
    }
  }
  return params;
}

export function buildMessagePayload(
  template: Template,
  params: TemplateParam[],
  recipientPhone: string
) {
  const components: any[] = [];

  const grouped = params.reduce((acc, p) => {
    if (!acc[p.componentType]) acc[p.componentType] = [];
    acc[p.componentType].push(p);
    return acc;
  }, {} as Record<string, TemplateParam[]>);

  for (const [type, ps] of Object.entries(grouped)) {
    components.push({
      type: type.toLowerCase(),
      parameters: ps
        .sort((a, b) => a.index - b.index)
        .map((p) => ({ type: "text", text: p.value })),
    });
  }

  return {
    messaging_product: "whatsapp",
    to: recipientPhone.replace(/\D/g, ""),
    type: "template",
    template: {
      name: template.name,
      language: { code: template.language },
      components: components.length > 0 ? components : undefined,
    },
  };
}

export async function sendMessage(
  token: string,
  phoneNumberId: string,
  payload: any
) {
  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send message (${res.status})`);
  }
  return res.json();
}
