import type { Lead, SiteContent } from '@/content/types';

/**
 * Where leads are sent. Set VITE_MAKE_WEBHOOK_URL in your .env file (local)
 * or as a GitHub secret (live site). See README.md → "Connecting Make".
 */
const ENV_WEBHOOK = (import.meta.env.VITE_MAKE_WEBHOOK_URL as string | undefined) ?? '';

/**
 * Sends one lead to your Make scenario as a simple form-style POST.
 * Make receives each field separately (name, email, whatsapp …) so you can
 * drop them straight into Google Sheets and SendFox.
 *
 * It never blocks the customer: if it fails, the order flow still continues
 * (the lead is still saved in this browser and the WhatsApp handoff still works).
 */
export async function sendLeadToMake(lead: Lead, content: SiteContent): Promise<boolean> {
  const url = ENV_WEBHOOK || content.settings.makeWebhook;
  if (!url) return false;
  const body = new URLSearchParams({
    ref: lead.ref,
    submitted_at: new Date().toISOString(),
    name: lead.name,
    whatsapp: lead.whatsapp,
    email: lead.email,
    business: lead.business,
    industry: lead.industry,
    product: lead.product,
    offer_id: lead.offerId,
    offer_name: lead.offerName,
    price: String(lead.price),
    event: lead.event,
    notes: lead.notes,
    utm_source: lead.utmSource ?? '',
    status: lead.status,
    payment_status: lead.paymentStatus,
    page_url: window.location.href,
  });
  try {
    // no-cors = browser sends it without needing Make's permission headers.
    // We can't read the reply (it's "opaque"), but Make still receives the data.
    await fetch(url, { method: 'POST', mode: 'no-cors', body, keepalive: true });
    return true;
  } catch {
    return false;
  }
}
