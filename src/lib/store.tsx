import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SiteContent, Lead, Project, AuditEntry, AdminUser } from '@/content/types';
import { defaultContent, seedLeads, seedProjects, ADMIN_USERS } from '@/content/defaultContent';

const LS_CONTENT = 'advibe.content.v1';
const LS_LEADS = 'advibe.leads.v1';
const LS_PROJECTS = 'advibe.projects.v1';
const LS_AUDIT = 'advibe.audit.v1';
const LS_SESSION = 'advibe.session.v1';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

interface Store {
  content: SiteContent;
  updateContent: (next: SiteContent, actor?: string, action?: string) => void;
  resetContent: () => void;
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'ref' | 'date' | 'status' | 'paymentStatus'>) => Lead;
  updateLead: (id: string, patch: Partial<Lead>, actor?: string) => void;
  deleteLead: (id: string) => void;
  projects: Project[];
  updateProject: (id: string, patch: Partial<Project>, actor?: string) => void;
  addProject: (p: Omit<Project, 'id' | 'ref'>) => void;
  audit: AuditEntry[];
  log: (user: string, action: string) => void;
  session: AdminUser | null;
  signIn: (email: string, password: string) => AdminUser | null;
  signOut: () => void;
  dirty: boolean;
  setDirty: (v: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

let refCounter = Math.floor(1000 + Math.random() * 9000);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => load(LS_CONTENT, defaultContent));
  const [leads, setLeads] = useState<Lead[]>(() => load(LS_LEADS, seedLeads));
  const [projects, setProjects] = useState<Project[]>(() => load(LS_PROJECTS, seedProjects));
  const [audit, setAudit] = useState<AuditEntry[]>(() => load(LS_AUDIT, []));
  const [session, setSession] = useState<AdminUser | null>(() => load(LS_SESSION, null));
  const [dirty, setDirty] = useState(false);

  useEffect(() => save(LS_CONTENT, content), [content]);
  useEffect(() => save(LS_LEADS, leads), [leads]);
  useEffect(() => save(LS_PROJECTS, projects), [projects]);
  useEffect(() => save(LS_AUDIT, audit), [audit]);
  useEffect(() => save(LS_SESSION, session), [session]);

  const log = useCallback((user: string, action: string) => {
    setAudit((a) => [{ id: crypto.randomUUID(), at: new Date().toISOString(), user, action }, ...a].slice(0, 100));
  }, []);

  const updateContent = useCallback((next: SiteContent, actor?: string, action?: string) => {
    setContent(next);
    setDirty(false);
    if (actor) log(actor, action ?? 'Updated website content');
  }, [log]);

  const resetContent = useCallback(() => {
    setContent(defaultContent);
  }, []);

  const addLead: Store['addLead'] = useCallback((lead) => {
    const full: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      ref: `AV-${++refCounter}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'New',
      paymentStatus: 'Unpaid',
    };
    setLeads((ls) => [full, ...ls]);
    return full;
  }, []);

  const updateLead = useCallback((id: string, patch: Partial<Lead>, actor?: string) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    if (actor) log(actor, `Updated lead ${patch.status ? `status → ${patch.status}` : ''} (${id.slice(0, 6)})`);
  }, [log]);

  const deleteLead = useCallback((id: string) => {
    setLeads((ls) => ls.filter((l) => l.id !== id));
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>, actor?: string) => {
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (actor) log(actor, `Updated project ${id}`);
  }, [log]);

  const addProject: Store['addProject'] = useCallback((p) => {
    setProjects((ps) => [{ ...p, id: crypto.randomUUID(), ref: `PRJ-${++refCounter}` }, ...ps]);
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const user = ADMIN_USERS.find((u) => u.email === email.trim().toLowerCase() && u.password === password) ?? null;
    if (user) {
      setSession(user);
      log(user.name, 'Signed in');
    }
    return user;
  }, [log]);

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo<Store>(() => ({
    content, updateContent, resetContent,
    leads, addLead, updateLead, deleteLead,
    projects, updateProject, addProject,
    audit, log, session, signIn, signOut, dirty, setDirty,
  }), [content, updateContent, resetContent, leads, addLead, updateLead, deleteLead, projects, updateProject, addProject, audit, log, session, signIn, signOut, dirty]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

export const fmtNaira = (n: number) => '₦' + n.toLocaleString('en-NG');

export function waLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
}

export function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function extractYouTubeId(url: string): string {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/);
  return m ? m[1] : url.trim();
}
