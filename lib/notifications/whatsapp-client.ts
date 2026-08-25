const GRAPH_API_VERSION = "v21.0";
const DEFAULT_TEMPLATE_LANGUAGE = "en_US";

// Meta's Graph API wants the recipient's number in E.164 digits only, no
// "+", spaces, dashes or parens -- but the `users.phone` column is a loose
// free-text field (see features/user/validation.ts), so normalize here
// rather than trying to tighten that field's format for every caller.
function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");

  if (digits.length < 8) {
    throw new Error(
      `Phone number "${phone}" doesn't look like a valid WhatsApp number (include the country code).`,
    );
  }

  return digits;
}

export type WhatsAppTemplateMessageInput = {
  to: string;
  // Body parameters, in the exact order the approved template's {{1}},
  // {{2}}, ... placeholders expect.
  bodyParams: string[];
};

// Reminders are business-initiated (the recipient hasn't messaged us in the
// last 24h), so the Cloud API requires a pre-approved message template --
// free-form text is rejected outside that window. See WHATSAPP_TEMPLATE_NAME
// below and the setup notes for the exact template to submit for approval.
export async function sendWhatsAppTemplateMessage(
  input: WhatsAppTemplateMessageInput,
): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const languageCode =
    process.env.WHATSAPP_TEMPLATE_LANG || DEFAULT_TEMPLATE_LANGUAGE;

  if (!accessToken || !phoneNumberId || !templateName) {
    throw new Error(
      "WhatsApp is not configured (missing WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, or WHATSAPP_TEMPLATE_NAME).",
    );
  }

  const to = normalizePhoneNumber(input.to);

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: input.bodyParams.map((text) => ({
                type: "text",
                text,
              })),
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `WhatsApp API error (${response.status}): ${body.slice(0, 500)}`,
    );
  }
}
