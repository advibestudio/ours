import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { PortfolioItem } from '@/content/types';

export function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Renders a heading with its LAST word in the serif-italic accent style (the studio look). Copy stays yours. */
export function EmLast({ text }: { text: string }) {
  const t = text.trim();
  const i = t.lastIndexOf(' ');
  if (i < 0) return <em>{t}</em>;
  return <>{t.slice(0, i + 1)}<em>{t.slice(i + 1)}</em></>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** The pill button with the green arrow circle. */
export function StudioButton({ children, onClick, small = false, light = false, className = '' }: { children: React.ReactNode; onClick?: () => void; small?: boolean; light?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`btn-studio ${small ? 'is-sm' : ''} ${light ? 'is-light' : ''} ${className}`}>
      <span>{children}</span>
      <span className="btn-arrow" aria-hidden="true"><ArrowIcon /></span>
    </button>
  );
}

export function Lightbox({ item, onClose }: { item: PortfolioItem | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Video: ${item.title}`}>
      <button onClick={onClose} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition hover:scale-105" aria-label="Close video">
        <X className="h-5 w-5" />
      </button>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`w-full overflow-hidden rounded-3xl bg-ink ${item.orientation === 'vertical' ? 'max-w-[360px]' : 'max-w-4xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={item.orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'}>
          <iframe
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="flex items-center justify-between gap-3 p-4 text-white">
          <div>
            <p className="font-display text-lg leading-tight">{item.title}</p>
            <p className="text-sm text-white/55">{item.client} · {item.category}</p>
          </div>
          {item.result && <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-ink">{item.result}</span>}
        </div>
      </motion.div>
    </div>
  );
}
