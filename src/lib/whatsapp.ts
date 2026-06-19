import { buildOrderMessage, type OrderForMessage } from "./order-message";

type OrderForNotification = OrderForMessage;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("216") ? digits : `216${digits.replace(/^0/, "")}`;
}

function formatOrderMessage(order: OrderForNotification): string {
  return buildOrderMessage(order, "fr");
}

async function sendViaCallMeBot(phone: string, message: string): Promise<boolean> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) return false;

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", `+${phone}`);
  url.searchParams.set("text", message);
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString());
  return res.ok;
}

async function sendViaMetaCloudApi(phone: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return false;

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message },
    }),
  });

  return res.ok;
}

export async function notifyOwnerNewOrder(order: OrderForNotification): Promise<void> {
  const ownerPhone = normalizePhone(
    process.env.WHATSAPP_OWNER_PHONE ?? "21693775858"
  );
  const message = formatOrderMessage(order);

  try {
    const sentMeta = await sendViaMetaCloudApi(ownerPhone, message);
    if (sentMeta) return;

    const sentCallMeBot = await sendViaCallMeBot(ownerPhone, message);
    if (sentCallMeBot) return;

    if (process.env.NODE_ENV === "development") {
      console.log("[WhatsApp] Non configuré. Message qui aurait été envoyé à", ownerPhone);
      console.log(message);
    }
  } catch (error) {
    console.error("[WhatsApp] Erreur envoi notification:", error);
  }
}
