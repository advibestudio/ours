import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, Copy, Check } from 'lucide-react';
import { useStore, fmtNaira, waLink } from '@/lib/store';
import { sendLeadToMake } from '@/lib/api';
import type { Offer, Lead } from '@/content/types';

interface Props {
  offer: Offer | null;
  eventName?: string;
  onClose: () => void;
  onPickOffer: () => void;
}

const INDUSTRIES = ['Fashion', 'Food & Restaurant', 'Beauty & Skincare', 'Real Estate', 'Finance / Fintech', 'Electronics', 'Events', 'Education', 'Health & Fitness', 'Other'];

export function OrderModal({ offer, eventName, onClose, onPickOffer }: Props) {
  const { content, addLead } = useStore();
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Lead | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', whatsapp: '', email: '', business: '', industry: INDUSTRIES[0], product: '',
    event: eventName ?? '', notes: '', honey: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const steps = ['Contact', 'Business', 'Your need', 'Review'];

  const validate = (): boolean => {
    const e: string[] = [];
    if (step === 0) {
      if (form.name.trim().length < 2) e.push('Please enter your name.');
      if (form.whatsapp.replace(/[^\d]/g, '').length < 7) e.push('Please enter a valid WhatsApp number with country code.');
    }
    if (step === 1) {
      if (form.business.trim().length < 2) e.push('Please enter your business name.');
      if (form.product.trim().length < 3) e.push('Tell us in one line what you sell.');
    }
    setErrors(e);
    return e.length === 0;
  };

  const submit = () => {
    if (form.honey) { onClose(); return; } // honeypot
    if (!offer) return;
    const utm = new URLSearchParams(window.location.search).get('utm_source') ?? undefined;
    const lead = addLead({
      name: form.name.trim(), business: form.business.trim(), whatsapp: form.whatsapp.trim(),
      email: form.email.trim(), offerId: offer.id, offerName: offer.name, price: offer.price,
      industry: form.industry, product: form.product.trim(), event: form.event || 'None',
      notes: form.notes.trim(), utmSource: utm,
    });
    setSending(true);
    // fire-and-forget: send to Make (-> Google Sheets + SendFox). Never blocks the customer.
    void sendLeadToMake(lead, content).finally(() => setSending(false));
    setDone(lead);
  };

  const waMsg = useMemo(() => {
    if (!done || !offer) return '';
    return content.settings.whatsappMessage
      .replace('{name}', done.name).replace('{business}', done.business)
      .replace('{offer}', done.offerName).replace('{ref}', done.ref);
  }, [done, offer, content.settings.whatsappMessage]);

  const inputCls = 'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-white/35 focus:border-[#01d87e] focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="Order form">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#121214] p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#01d87e]">
              {done ? 'Order received' : offer ? offer.name : 'Start your order'}
            </p>
            {!done && offer && <p className="mt-1 font-display text-lg uppercase text-white">{fmtNaira(offer.price)} <span className="text-sm font-normal normal-case text-white/50">· {offer.unitNote}</span></p>}
          </div>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-[#01d87e]" />
              <div>
                <p className="font-display text-xl uppercase text-white">We've received your request.</p>
                <p className="text-sm text-white/60">Reference: <span className="font-bold text-[#01d87e]">{done.ref}</span></p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <p className="mb-1 font-semibold text-white">Pay now</p>
              <p>{content.settings.paymentInstructions}</p>
              <button
                onClick={() => { navigator.clipboard?.writeText(done.ref); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#01d87e]" /> : <Copy className="h-3.5 w-3.5" />} Copy reference {done.ref}
              </button>
            </div>
            <a
              href={waLink(content.settings.whatsappNumber, waMsg)}
              target="_blank" rel="noreferrer"
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#01d87e] px-6 py-3.5 font-display text-base text-black transition hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" /> Continue on WhatsApp
            </a>
            <p className="text-center text-xs text-white/40">Your order details are pre-filled in the message.</p>
          </div>
        ) : !offer ? (
          <div className="space-y-4">
            <p className="text-white/70">Choose a package first — it takes 10 seconds.</p>
            <button onClick={onPickOffer} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#01d87e] px-6 py-3.5 font-display text-base text-black transition hover:brightness-110">
              View packages <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex gap-1.5">
              {steps.map((s, i) => (
                <div key={s} className="flex-1">
                  <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-[#01d87e]' : 'bg-white/10'}`} />
                  <p className={`mt-1.5 text-[10px] font-semiboldr ${i === step ? 'text-white' : 'text-white/35'}`}>{s}</p>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="space-y-4">
                {step === 0 && (
                  <>
                    <input className={inputCls} placeholder="Full name *" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
                    <input className={inputCls} placeholder="WhatsApp number (with country code) *" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} inputMode="tel" autoComplete="tel" />
                    <input className={inputCls} placeholder="Email (optional)" value={form.email} onChange={(e) => set('email', e.target.value)} inputMode="email" autoComplete="email" />
                    <input className="hidden" tabIndex={-1} autoComplete="off" value={form.honey} onChange={(e) => set('honey', e.target.value)} aria-hidden="true" />
                  </>
                )}
                {step === 1 && (
                  <>
                    <input className={inputCls} placeholder="Business name *" value={form.business} onChange={(e) => set('business', e.target.value)} autoComplete="organization" />
                    <select className={inputCls} value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                      {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-neutral-900">{i}</option>)}
                    </select>
                    <input className={inputCls} placeholder="What do you sell? (one line) *" value={form.product} onChange={(e) => set('product', e.target.value)} />
                  </>
                )}
                {step === 2 && (
                  <>
                    <select className={inputCls} value={form.event} onChange={(e) => set('event', e.target.value)}>
                      <option value="" className="bg-neutral-900">No specific event / deadline</option>
                      {content.campaigns.filter((c) => c.active).map((c) => (
                        <option key={c.id} value={c.name} className="bg-neutral-900">{c.name} — {new Date(c.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</option>
                      ))}
                      <option value="Other" className="bg-neutral-900">Other</option>
                    </select>
                    <textarea className={`${inputCls} min-h-[110px] resize-none`} placeholder="Notes: link to product photos (Drive / Instagram), preferred tone, target audience…" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
                  </>
                )}
                {step === 3 && (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                    {[
                      ['Package', `${offer.name} — ${fmtNaira(offer.price)}`],
                      ['Name', form.name], ['WhatsApp', form.whatsapp],
                      ['Business', `${form.business} (${form.industry})`],
                      ['Selling', form.product],
                      ['Event', form.event || 'None'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4"><span className="text-white/45">{k}</span><span className="text-right text-white">{v}</span></div>
                    ))}
                    <p className="border-t border-white/10 pt-3 text-xs text-white/45">Includes {offer.included[0]?.toLowerCase()}. Full terms are confirmed before production starts.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {errors.length > 0 && (
              <div className="mt-4 space-y-1 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                {errors.map((e) => <p key={e} className="text-sm text-red-300">{e}</p>)}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {step > 0 && (
                <button onClick={() => { setErrors([]); setStep(step - 1); }} className="flex min-h-[52px] items-center gap-2 rounded-xl border border-white/15 px-5 font-semibold text-white/80 transition hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => validate() && setStep(step + 1)} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#01d87e] px-6 font-display text-base text-black transition hover:brightness-110">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={submit} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#01d87e] px-6 font-display text-base text-black transition hover:brightness-110">
                  {sending ? 'Sending…' : 'Submit order'} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
