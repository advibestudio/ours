import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Check, CalendarDays } from 'lucide-react';
import { useStore, fmtNaira, waLink } from '@/lib/store';
import type { Offer } from '@/content/types';
import { Reveal, SectionLabel, EmLast, StudioButton, ArrowIcon } from '@/components/shared';

const PASTELS = ['bg-peach', 'bg-mint', 'bg-butter', 'bg-sky', 'bg-lilac', 'bg-peach'];

/* ---------- PROBLEM ---------- */
export function Problem() {
  const { content } = useStore();
  const n = content.problem.lines.length;
  return (
    <section className="sec">
      <div className="wrap max-w-4xl">
        <Reveal><SectionLabel>The problem</SectionLabel></Reveal>
        <Reveal><h2 className="h-section"><EmLast text={content.problem.heading} /></h2></Reveal>
        <div className="mt-10">
          {content.problem.lines.map((line, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className={`border-b border-line py-5 text-xl sm:text-2xl ${i === n - 1 ? 'font-display text-accent2' : 'text-ink-2/70'}`}>{line}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}><p className="mt-10 font-display text-3xl tracking-tight sm:text-5xl"><EmLast text={content.problem.transition} /></p></Reveal>
      </div>
    </section>
  );
}

/* ---------- SERVICES ---------- */
export function Services() {
  const { content } = useStore();
  return (
    <section id="services" className="sec">
      <div className="wrap">
        <Reveal>
          <SectionLabel>What we create</SectionLabel>
          <h2 className="h-section max-w-3xl">Every kind of ad your feed is <em>missing.</em></h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <div className={`tile h-full ${PASTELS[i % PASTELS.length]}`}>
                <p className="font-mono text-xs font-semibold text-ink/50">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-10 font-display text-2xl tracking-tight">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- EVENTS / SEASONAL (dark band) ---------- */
export function Events({ onOrder }: { onOrder: (eventName: string) => void }) {
  const { content } = useStore();
  const upcoming = content.campaigns
    .filter((c) => c.active && new Date(c.eventDate) >= new Date())
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));
  return (
    <section className="py-3">
      <div className="band px-5 py-16 sm:px-12 sm:py-24">
        <div className="wrap !px-0">
          <Reveal>
            <p className="eyebrow !bg-white/10 !text-white/80 !shadow-none">Sales seasons</p>
            <h2 className="h-section max-w-3xl"><EmLast text={content.events.heading} /></h2>
            <p className="mt-5 font-display text-xl tracking-tight text-white/80 sm:text-2xl">{content.events.subheading}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">{content.events.body}</p>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}>
                <button onClick={() => onOrder(c.name)} className="group flex w-full items-center justify-between gap-3 rounded-3xl bg-white/[0.07] p-5 text-left ring-1 ring-white/10 transition hover:bg-white/15">
                  <span>
                    <span className="flex items-center gap-2 font-mono text-xs text-white/55"><CalendarDays className="h-3.5 w-3.5" />{new Date(c.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="mt-1 block font-display text-xl tracking-tight">{c.name}</span>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-ink transition-transform group-hover:-rotate-45"><ArrowIcon className="h-4 w-4" /></span>
                </button>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}><div className="mt-10"><StudioButton light onClick={() => onOrder('')}>{content.events.cta}</StudioButton></div></Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */
function OfferCard({ offer, onChoose }: { offer: Offer; onChoose: (o: Offer) => void }) {
  const [drawer, setDrawer] = useState<'none' | 'included' | 'good'>('none');
  const dark = offer.featured;
  return (
    <motion.div layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className={`relative flex flex-col rounded-[32px] p-7 sm:p-8 ${dark ? 'bg-ink text-white shadow-[0_30px_60px_-30px_rgb(17_20_18/0.7)]' : 'card'}`}>
      {offer.badge && <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-ink">{offer.badge}</span>}
      <h3 className="font-display text-2xl tracking-tight">{offer.name}</h3>
      <p className={`mt-1 text-sm ${dark ? 'text-white/60' : 'text-soft'}`}>{offer.description}</p>
      <p className="mt-6 font-display text-5xl tracking-tight">{fmtNaira(offer.price)}{offer.goal === 'monthly' && <span className={`text-base font-medium ${dark ? 'text-white/55' : 'text-soft'}`}> /mo</span>}</p>
      <p className={`mt-1 font-mono text-xs ${dark ? 'text-brand' : 'text-accent2'}`}>{offer.unitNote}</p>
      <p className={`mt-4 text-sm leading-relaxed ${dark ? 'text-white/70' : 'text-ink-2'}`}>{offer.whoFor}</p>
      <ul className="mt-5 space-y-2.5">
        {offer.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-ink"><Check className="h-3 w-3" strokeWidth={3} /></span>{f}</li>
        ))}
      </ul>
      {(['included', 'good'] as const).map((d) => (
        <div key={d} className={`mt-3 border-t pt-3 ${dark ? 'border-white/15' : 'border-line'}`}>
          <button onClick={() => setDrawer(drawer === d ? 'none' : d)} className="flex w-full items-center justify-between py-1 text-sm font-semibold">
            {d === 'included' ? "What's included" : 'Good to know'}
            <ChevronDown className={`h-4 w-4 transition-transform ${drawer === d ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {drawer === d && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                {(d === 'included' ? offer.included : offer.goodToKnow).map((x) => (
                  <li key={x} className={`py-1 text-sm ${dark ? 'text-white/60' : 'text-soft'}`}>· {x}</li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}
      <div className="mt-7"><StudioButton light={dark} onClick={() => onChoose(offer)}>{offer.cta}</StudioButton></div>
    </motion.div>
  );
}

export function Pricing({ onChoose }: { onChoose: (o: Offer) => void }) {
  const { content } = useStore();
  const [goal, setGoal] = useState<'one' | 'test' | 'monthly'>('one');
  const offers = useMemo(() => content.offers.filter((o) => o.active && o.goal === goal).sort((a, b) => a.order - b.order), [content.offers, goal]);
  const activeGoal = content.pricing.goals.find((g) => g.id === goal);
  return (
    <section id="pricing" className="sec">
      <div className="wrap">
        <Reveal>
          <SectionLabel>Packages</SectionLabel>
          <h2 className="h-section max-w-3xl"><EmLast text={content.pricing.heading} /></h2>
          <p className="mt-4 max-w-2xl text-soft">{content.pricing.subheading}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Choose your goal">
            {content.pricing.goals.map((g) => (
              <button key={g.id} role="tab" aria-selected={goal === g.id} onClick={() => setGoal(g.id)}
                className={`rounded-3xl p-5 text-left transition ${goal === g.id ? 'bg-ink text-white shadow-[0_20px_40px_-20px_rgb(17_20_18/0.6)]' : 'card hover:-translate-y-0.5'}`}>
                <span className="font-display text-lg tracking-tight">{g.label}</span>
                <span className={`mt-1 block text-sm leading-relaxed ${goal === g.id ? 'text-white/65' : 'text-soft'}`}>{g.blurb}</span>
              </button>
            ))}
          </div>
        </Reveal>
        <div className={`mt-10 grid gap-5 ${offers.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'}`}>
          {offers.map((o) => <OfferCard key={o.id} offer={o} onChoose={onChoose} />)}
        </div>
        {goal === 'test' && <Reveal><p className="mt-6 text-sm text-soft">One ad gives you one chance. Multiple ads give you data. {activeGoal?.blurb}</p></Reveal>}
      </div>
    </section>
  );
}

/* ---------- WHY US ---------- */
export function WhyUs() {
  const { content } = useStore();
  return (
    <section className="sec pt-0">
      <div className="wrap">
        <Reveal><SectionLabel>{content.whyUs.heading}</SectionLabel></Reveal>
        <Reveal><h2 className="h-section max-w-4xl"><EmLast text={content.whyUs.statement} /></h2></Reveal>
        <div className="mt-12">
          {content.whyUs.points.map((p, i) => (
            <Reveal key={p} delay={i * 0.04}>
              <p className="group flex items-baseline gap-4 border-b border-line py-5 text-ink/45 transition-colors duration-300 hover:text-ink">
                <span className="font-mono text-xs font-semibold text-accent2">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-2xl tracking-tight sm:text-4xl">{p}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PROCESS ---------- */
export function Process() {
  const { content } = useStore();
  return (
    <section id="process" className="sec pt-0">
      <div className="wrap">
        <Reveal>
          <SectionLabel>{content.process.heading}</SectionLabel>
          <h2 className="h-section max-w-3xl">From brief to finished ad in {content.settings.deliveryDays} <em>days.</em></h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.process.steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="card h-full p-7">
                <p className="em-serif text-6xl text-accent2">{i + 1}</p>
                <h3 className="mt-4 font-display text-xl tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIALS ---------- */
export function Testimonials() {
  const { content } = useStore();
  const items = content.testimonials.filter((t) => t.visible);
  if (!items.length) return null;
  return (
    <section className="sec pt-0">
      <div className="wrap">
        <Reveal>
          <SectionLabel>Word on the street</SectionLabel>
          <h2 className="h-section max-w-3xl">Businesses that stopped scrolling past <em>themselves.</em></h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.07}>
              <figure className={`tile flex h-full flex-col ${PASTELS[(i + 1) % PASTELS.length]}`}>
                <blockquote className="flex-1 font-display text-xl leading-snug tracking-tight">“{t.quote}”</blockquote>
                <figcaption className="mt-6 border-t border-ink/10 pt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-ink-2/80">{t.business} · {t.industry}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ + AI NOTE ---------- */
function FaqRow({ id, q, a, open, setOpen, muted = false }: { id: string; q: string; a: string; open: string | null; setOpen: (v: string | null) => void; muted?: boolean }) {
  const isOpen = open === id;
  return (
    <div className="faq-row">
      <button onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen} className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left ${muted ? 'text-sm font-semibold text-soft' : 'font-display text-lg tracking-tight'}`}>
        {q}
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}><ChevronDown className="h-4 w-4" /></span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="px-6 pb-6 leading-relaxed text-ink-2">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const { content } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const faqs = content.faqs.filter((f) => f.visible);
  return (
    <section id="faq" className="sec pt-0">
      <div className="wrap max-w-3xl">
        <Reveal><SectionLabel>Questions</SectionLabel><h2 className="h-section">Before you <em>ask.</em></h2></Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => <FaqRow key={f.id} id={f.id} q={f.q} a={f.a} open={open} setOpen={setOpen} />)}
          <FaqRow id="ai-note" q={content.aiNote.title} a={content.aiNote.body} open={open} setOpen={setOpen} muted />
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
export function FinalCta({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  return (
    <section className="py-3">
      <div className="band px-5 py-20 text-center sm:px-12 sm:py-28">
        <Reveal>
          <h2 className="h-section mx-auto max-w-4xl text-[clamp(36px,6vw,76px)]"><EmLast text={content.finalCta.heading} /></h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/65">{content.finalCta.subheading}</p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <StudioButton light onClick={onOrder}>{content.finalCta.primaryCta}</StudioButton>
            <a href={waLink(content.settings.whatsappNumber, `Hi ${content.settings.whatsappDisplay}, I want a video ad for my business.`)} target="_blank" rel="noreferrer" className="btn-ghost on-dark">
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
export function Footer() {
  const { content } = useStore();
  const h = 'mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-soft';
  const a = 'block py-1 text-ink-2 transition hover:text-accent2';
  return (
    <footer className="wrap pb-28 pt-16 md:pb-14">
      <div className="card flex flex-col gap-10 p-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-3xl tracking-tight">{content.brand.name}</p>
          <p className="mt-2 max-w-xs text-sm text-soft">{content.brand.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
          <div>
            <p className={h}>Contact</p>
            <a href={`mailto:${content.settings.email}`} className={a}>{content.settings.email}</a>
            <a href={waLink(content.settings.whatsappNumber, 'Hi!')} target="_blank" rel="noreferrer" className={a}>WhatsApp</a>
          </div>
          <div>
            <p className={h}>Site</p>
            {[['Work', '#work'], ['Packages', '#pricing'], ['FAQs', '#faq']].map(([l, href]) => <a key={href} href={href} className={a}>{l}</a>)}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-soft">© {new Date().getFullYear()} {content.brand.name}. AI-assisted production, human-directed creative.</p>
    </footer>
  );
}
