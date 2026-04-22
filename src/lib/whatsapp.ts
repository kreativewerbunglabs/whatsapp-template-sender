const BASE_URL = "https://graph.facebook.com/v21.0";

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
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

export class WhatsAppService {
  private token: string;
  private wabaId: string;
  private phoneNumberId: string;

  constructor({
    token,
    wabaId,
    phoneNumberId,
  }: {
    token: string;
    wabaId: string;
    phoneNumberId: string;
  }) {
    this.token = token;
    this.wabaId = wabaId;
    this.phoneNumberId = phoneNumberId;
  }

  // 🔹 Fetch Templates
  async fetchTemplates(): Promise<Template[]> {
    const res = await fetch(
      `${BASE_URL}/${this.wabaId}/message_templates?limit=100`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.error?.message || `Failed to fetch templates (${res.status})`,
      );
    }

    const data = await res.json();
    return data.data || [];
  }

  // 🔹 Extract Parameters from Template
  extractParams(template: Template): TemplateParam[] {
    const params: TemplateParam[] = [];

    for (const comp of template.components) {
      if (!comp.text) continue;

      const matches = comp.text.match(/{{[^}]+}}/g) || [];

      // 👇 maintain order per component
      const localMap = new Map<string, number>();
      let counter = 0;

      matches.forEach((match) => {
        const inner = match.replace(/{{|}}/g, "");
        const isNumeric = /^\d+$/.test(inner);

        let index: number;

        if (isNumeric) {
          index = parseInt(inner) - 1;
        } else {
          // 👇 assign stable index for named variables
          if (!localMap.has(inner)) {
            localMap.set(inner, counter++);
          }
          index = localMap.get(inner)!;
        }

        params.push({
          componentType: comp.type,
          index,
          placeholder: match,
          value: "",
        });
      });
    }

    return params.sort((a, b) => a.index - b.index);
  }
  // 🔹 Build Message Payload
  buildMessagePayload(
    template: Template,
    params: TemplateParam[],
    recipientPhone: string,
  ) {
    const components: any[] = [];

    for (const comp of template.components) {
      // HEADER

      if (comp.type === "HEADER") {
        const headerParams = params
          .filter((p) => p.componentType === "HEADER")
          .sort((a, b) => a.index - b.index);

        if (comp.format === "TEXT") {
          components.push({
            type: "header",
            parameters: headerParams.map((p) => {
              const isNamed = isNaN(
                Number(p.placeholder.replace(/{{|}}/g, "")),
              );
              return {
                type: "text",
                ...(isNamed && {
                  parameter_name: p.placeholder.replace(/{{|}}/g, ""),
                }),
                text: p.value,
              };
            }),
          });
        }

        if (["IMAGE", "VIDEO", "DOCUMENT"].includes(comp?.format!)) {
          const media = headerParams[0]?.value;
          if (!media) continue;

          const type = comp?.format?.toLowerCase() ?? "";

          components.push({
            type: "header",
            parameters: [
              {
                type,
                [type]: { id: media },
              },
            ],
          });
        }
      }

      // BODY
      if (comp.type === "BODY") {
        const bodyParams = params
          .filter((p) => p.componentType === "BODY")
          .sort((a, b) => a.index - b.index);

        // ✅ always push body, even if no params
        components.push({
          type: "body",
          parameters: bodyParams.map((p) => {
            const isNamed = isNaN(Number(p.placeholder.replace(/{{|}}/g, "")));
            return {
              type: "text",
              ...(isNamed && {
                parameter_name: p.placeholder.replace(/{{|}}/g, ""),
              }),
              text: p.value,
            };
          }),
        });
      }
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

  // 🔹 Send Message
  async sendMessage(payload: any) {
    try {
      const res = await fetch(`${BASE_URL}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch {
        // sometimes response is empty / not JSON
      }
      if (!res.ok) {
        throw new Error(
          json?.error?.message || `Request failed with status ${res.status}`,
        );
      }

      return json;
    } catch (err: any) {
      if (err?.message?.includes("Failed to fetch")) {
        throw new Error("No internet connection. Please check your network.");
      }

      if (err?.name === "TypeError") {
        throw new Error("Network error. Unable to reach server.");
      }

      // ✅ fallback
      throw new Error(err?.message || "Unexpected error occurred");
    }
  }

  // 🔹 Upload Media
  async uploadFile(file: File) {
    const formData = new FormData();

    formData.append("messaging_product", "whatsapp");
    formData.append("file", file);
    formData.append("type", file.type);

    const res = await fetch(`${BASE_URL}/${this.phoneNumberId}/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Upload error:", err);
      throw new Error(
        err.error?.message || `Failed to upload file (${res.status})`,
      );
    }

    return res.json();
  }
}
