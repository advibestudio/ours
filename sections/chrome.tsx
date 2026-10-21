import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, X, MessageCircle, ArrowDown, Play } from 'lucide-react';
import { useStore, waLink, ytThumb } from '@/lib/store';
import type { PortfolioItem } from '@/content/types';
import { EmLast, StudioButton, ArrowIcon } from '@/components/shared';

/* ---------- NAV (floating pill) ---------- */
export function Nav({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'Packages', href: '#pricing' },
    { label: 'How it works', href: '#process' },
    { label: 'FAQs', href: '#faq' },
  ];
  return (
    <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-nav-bar">
        <a href="#top" className="site-brand" aria-label={`${content.brand.name} home`}>
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="10" fill="rgb(var(--ink))" />
            <path d="M12 9.5v13l11-6.5z" fill="rgb(var(--brand))" />
          </svg>
          <span>{content.brand.name}</span>
        </a>
        <nav className="site-links" aria-label="Main">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <div className="flex items-center gap-1.5">
          <StudioButton small onClick={onOrder}>Get your video</StudioButton>
          <button onClick={() => setOpen(!open)} className="nav-burger grid h-11 w-11 place-items-center rounded-full bg-black/5" aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="nav-sheet" aria-label="Mobile">
          {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        </nav>
      )}
    </header>
  );
}

/* ---------- EVENT BANNER (floating pill under the nav) ---------- */
function useCountdown(target: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(target + 'T00:00:00').getTime() - now);
  return { days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, mins: Math.floor(diff / 60000) % 60, secs: Math.floor(diff / 1000) % 60 };
}

export function EventBanner({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  const campaign = content.campaigns.find((c) => c.id === content.banner.campaignId && c.active);
  const cd = useCountdown(campaign?.orderBy ?? '2026-12-31');
  if (!content.banner.enabled || !campaign) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[74px] z-50 flex justify-center px-3">
      <button onClick={onOrder} className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-ink py-2 pl-4 pr-2 text-white shadow-[0_14px_30px_-14px_rgb(17_20_18/0.6)] transition hover:scale-[1.02]">
        <span className="truncate text-[13px] font-semibold sm:text-sm">{campaign.bannerText}</span>
        <span className="hidden shrink-0 items-center gap-1 font-mono text-xs font-semibold sm:flex" aria-label="Countdown">
          {[cd.days, cd.hours, cd.mins, cd.secs].map((v, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-white/40">:</span>}
              <span className="rounded-md bg-white/10 px-1.5 py-1">{String(v).padStart(2, '0')}</span>
            </React.Fragment>
          ))}
        </span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-ink"><ArrowIcon className="h-3.5 w-3.5" /></span>
      </button>
    </div>
  );
}

/* ---------- THE WALL ---------- */
const SPAN = 176; // degrees the ring of cards covers
type Conn = { connection?: { saveData?: boolean } };

function Wall({ items, onPlay, paused }: { items: PortfolioItem[]; onPlay: (i: PortfolioItem) => void; paused: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pausedRef = useRef(false);
  const syncRef = useRef<(() => void) | null>(null);

  // repeat items so the ring always has at least 8 cards
  const cards = useMemo(() => {
    if (!items.length) return [];
    const out: PortfolioItem[] = [];
    while (out.length < 8) out.push(...items);
    return out;
  }, [items]);

  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);

  useEffect(() => {
    const root = rootRef.current;
    const els = cardRefs.current.filter((e): e is HTMLButtonElement => !!e);
    if (!root || !els.length) return;
    const m = els.length;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & Conn).connection?.saveData === true;

    const baseStep = (mobile: boolean) => Math.max(mobile ? 24 : 16, SPAN / m);
    let step = baseStep(false);
    let radius = 700;
    let pos = 0;           // rotation in degrees
    let fling = 0;         // extra momentum
    const base = reduced || saveData ? 0 : 4.5;
    let drift = base;
    let target = base;
    let visible = false;
    let raf = 0;
    let last = 0;
    let dragging = false;
    let pid = -1;
    let lastX = 0;
    let lastT = 0;
    let moved = 0;
    let velocity = 0;
    let lastScroll = window.scrollY;

    const measure = () => {
      const w = root.clientWidth;
      const mobile = w < 640;
      const s = baseStep(mobile);
      if (s !== step) { pos = (pos / step) * s; step = s; }
      radius = Math.max(mobile ? 300 : 520, w * (mobile ? 0.72 : 0.56));
    };

    const draw = () => {
      const total = m * step;
      let centre = 0;
      let best = Infinity;
      for (let i = 0; i < m; i++) {
        const a = ((i * step - pos) % total + total) % total - total / 2;
        const abs = Math.abs(a);
        const rad = (a * Math.PI) / 180;
        const op = abs < 56 ? 1 : Math.max(0, 1 - (abs - 56) / 22);
        const pop = abs < step / 2 ? 34 : 0;
        const el = els[i];
        el.style.transform = `translate(-50%,-50%) translate3d(${(radius * Math.sin(rad)).toFixed(1)}px,0,${(radius * (1 - Math.cos(rad)) + pop).toFixed(1)}px) rotateY(${(-a).toFixed(2)}deg)`;
        el.style.opacity = op.toFixed(3);
        el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
        el.tabIndex = op > 0.5 ? 0 : -1;
        if (abs < best) { best = abs; centre = i; }
      }
      els.forEach((el, i) => el.classList.toggle('is-center', i === centre));
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!dragging) {
        drift += (target - drift) * Math.min(1, dt * 3);
        pos += (drift + fling) * dt;
        fling *= Math.pow(0.9, dt * 60);
        if (Math.abs(fling) < 0.01) fling = 0;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; draw(); };
    const sync = () => (visible && !document.hidden && !pausedRef.current ? start() : stop());
    syncRef.current = sync;

    const onScroll = () => {
      const d = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (!reduced && visible) fling = Math.max(-140, Math.min(140, fling + d * 0.9));
    };
    const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse' && !reduced) target = 1.2; };
    const onLeave = () => { target = base; };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true; pid = e.pointerId; lastX = e.clientX; lastT = performance.now(); moved = 0; velocity = 0; fling = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      if (moved > 6 && !root.classList.contains('is-dragging')) {
        root.classList.add('is-dragging');
        try { root.setPointerCapture(pid); } catch { /* ignore */ }
      }
      const k = step / (root.clientWidth < 640 ? 118 : 176);
      pos -= dx * k;
      velocity = (-dx * k) / Math.max(0.008, (now - lastT) / 1000);
      lastX = e.clientX; lastT = now;
      if (!raf) draw();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false;
      if (root.classList.contains('is-dragging')) {
        root.classList.remove('is-dragging');
        if (!reduced && e.type === 'pointerup') fling = Math.max(-160, Math.min(160, velocity * 0.6));
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      pos += e.key === 'ArrowRight' ? step : -step;
      fling = 0;
      if (!raf) draw();
    };
    const onFocusIn = () => { target = 0; };
    const onFocusOut = (e: FocusEvent) => { if (!root.contains(e.relatedTarget as Node | null)) target = base; };

    measure();
    pos = step / 2;
    draw();
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); });
    io.observe(root);
    const ro = new ResizeObserver(() => { measure(); if (!raf) draw(); });
    ro.observe(root);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', sync);
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('keydown', onKey);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', sync);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      syncRef.current = null;
    };
  }, [cards]);

  return (
    <div ref={rootRef} className="wall" role="region" aria-roledescription="carousel" aria-label="Video ads we made. Drag, scroll or use the arrow keys to turn the wall, and select a video to watch it.">
      <div className="wall-stage">
        {cards.map((item, i) => (
          <button key={`${item.id}-${i}`} ref={(el) => { cardRefs.current[i] = el; }} type="button" className="wall-card" aria-label={`Play video: ${item.title}`} onClick={() => onPlay(item)}>
            <img src={ytThumb(item.youtubeId)} alt="" loading="lazy" draggable={false} />
            <span className="wall-play" aria-hidden="true"><span><Play className="h-5 w-5 fill-current" /></span></span>
            <span className="wall-tag" aria-hidden="true">{item.category}</span>
          </button>
        ))}
      </div>
      <div className="wall-floor" aria-hidden="true" />
    </div>
  );
}

function Note({ cls, text, flip = false }: { cls: string; text: string; flip?: boolean }) {
  const style = { '--len': 170, transform: flip ? 'scaleX(-1)' : undefined } as React.CSSProperties;
  return (
    <div className={`note ${cls}`} aria-hidden="true">
      <span>{text}</span>
      <svg width="110" height="64" viewBox="0 0 110 64" style={style}>
        <path d="M6 6 C 8 40, 40 58, 98 46" />
        <path d="M84 36 L 100 46 L 86 58" />
      </svg>
    </div>
  );
}

/* ---------- HERO ---------- */
export function Hero({ onOrder, onPlay, paused }: { onOrder: () => void; onPlay: (i: PortfolioItem) => void; paused: boolean }) {
  const { content } = useStore();
  const items = useMemo(() => content.portfolio.filter((p) => p.visible).sort((a, b) => a.order - b.order), [content.portfolio]);
  const bannerOn = content.banner.enabled && content.campaigns.some((c) => c.id === content.banner.campaignId && c.active);
  return (
    <section id="top" className={`hero ${bannerOn ? 'has-banner' : ''}`} aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="wrap hero-copy">
        <h1 id="hero-title" className="h-hero"><span><EmLast text={content.hero.headline} /></span></h1>
        <p className="hero-sub">{content.hero.subheadline}</p>
        <div className="hero-cta">
          <StudioButton onClick={onOrder}>{content.hero.primaryCta}</StudioButton>
          <a className="btn-ghost" href="#work">{content.hero.secondaryCta} <ArrowDown className="h-4 w-4" /></a>
        </div>
        <p className="hero-micro">AI video ads · Lagos → everywhere · Delivered in {content.settings.deliveryDays} days</p>
      </div>
      {items.length > 0 && (
        <div id="work" className="wall-zone">
          <Note cls="note-a" text="ads we've made" />
          <Note cls="note-b" text={`ready in ${content.settings.deliveryDays} days`} flip />
          <Wall items={items} onPlay={onPlay} paused={paused} />
          <p className="wall-hint">Drag to spin · Tap a video to watch</p>
        </div>
      )}
    </section>
  );
}

/* ---------- PROOF: stats + marquee ---------- */
export function Proof() {
  const { content } = useStore();
  const words = ['Product ads', 'UGC-style ads', 'Event promos', 'Explainer videos', 'Black Friday', 'Detty December', "Valentine's", 'Launch campaigns', 'Brand videos', 'Service ads'];
  const row = [...words, ...words];
  return (
    <section className="proof" aria-label="Results">
      <div className="wrap">
        <div className="stat-row">
          {content.hero.stats.map((s) => (
            <p key={s.label}><span className="stat-num">{s.value}</span><span className="stat-lbl">{s.label}</span></p>
          ))}
        </div>
        <div className="word-marquee" aria-hidden="true">
          <div className="word-track">
            {row.map((w, i) => <span key={i}>{w}<i /></span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- STICKY MOBILE CTA ---------- */
export function StickyBar({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-full bg-white/90 p-2 shadow-[0_18px_40px_-16px_rgb(17_20_18/0.5)] backdrop-blur-md md:hidden" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <StudioButton small className="flex-1" onClick={onOrder}>Get your video</StudioButton>
      <a href={waLink(content.settings.whatsappNumber, `Hi ${content.settings.whatsappDisplay}, I want to ask about a video ad.`)} target="_blank" rel="noreferrer"
        className="grid h-11 w-11 place-items-center rounded-full bg-ink/5 text-ink" aria-label="Chat on WhatsApp">
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}
