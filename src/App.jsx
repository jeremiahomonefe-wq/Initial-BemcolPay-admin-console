import React, { useState, useMemo, useContext, createContext, useEffect } from "react";
import {
  Search, Bell, HelpCircle, ChevronDown, ChevronRight, ArrowUpRight, ArrowRight,
  AlertTriangle, Circle, X, FileText, Eye, RefreshCw,
  LayoutDashboard, Users, UserPlus, ShieldCheck, ArrowLeftRight, BookOpen, Landmark,
  GitCompare, Wallet, FolderOpen, FileBarChart, Award, Percent, CheckSquare,
  SlidersHorizontal, Scale, AlertOctagon, UserCircle, Building2, BarChart3, Code,
  Lock, ListChecks, Headphones, ClipboardList, Layers, Flag, Activity, MoreHorizontal,
  Menu, RotateCcw, Ban, Zap, Gift, Split, Gauge, CreditCard, Banknote, Globe2,
  ShieldAlert, Receipt, MessagesSquare, Ticket, ScrollText, CheckCircle2, Settings,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const C = {
  ink: "#F5F3E8",
  inkSoft: "#D9DED2",
  paper: "#07100D",
  raised: "#111A16",
  line: "rgba(217,222,210,0.14)",
  lineSoft: "rgba(217,222,210,0.07)",
  muted: "#A9B3A6",
  mutedSoft: "#6E7A70",
  blue: "#81A84B",
  blueDeep: "#6B8F3A",
  blueSoft: "rgba(129,168,75,0.16)",
  lime: "#B7F23A",
  limeDeep: "#9AD62E",
  limeSoft: "rgba(183,242,58,0.16)",
  green: "#C8F7D4",
  greenDeep: "#C8F7D4",
  greenSoft: "rgba(200,247,212,0.14)",
  amber: "#D6B94F",
  amberSoft: "rgba(214,185,79,0.16)",
  alertBorder: "rgba(229,72,77,0.4)",
  rust: "#E5484D",
  rustSoft: "rgba(229,72,77,0.16)",
};

const fontStack = {
  display: "'Sora', system-ui, sans-serif",       // headings
  body: "'Manrope', system-ui, sans-serif",         // body copy, labels, IDs, timestamps
  money: "'IBM Plex Sans', system-ui, sans-serif",  // currency / numeric values — always paired with tabular-nums
  mono: "'IBM Plex Mono', 'SFMono-Regular', monospace", // code-only: API keys, HTTP methods, endpoints, webhook events
};

// Convenience style spread for any element displaying a money/numeric value.
// Usage: style={{ ...moneyStyle, fontSize: 14 }}
const moneyStyle = { fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" };

const InteractionContext = createContext(null);
function InteractionProvider({ children }) {
  const [message, setMessage] = useState("");
  const notify = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage((current) => current === text ? "" : current), 3200);
  };
  return <InteractionContext.Provider value={{ notify }}>{children}<div aria-live="polite" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 200, maxWidth: 360, transform: message ? "translateY(0)" : "translateY(80px)", opacity: message ? 1 : 0, transition: "all 180ms ease-out", padding: "12px 14px", borderRadius: 9, background: C.greenSoft, border: `1px solid ${C.lime}`, color: C.ink, fontFamily: fontStack.body, fontSize: 13, fontWeight: 600, pointerEvents: "none" }}>{message}</div></InteractionContext.Provider>;
}
function useInteraction() { return useContext(InteractionContext) || { notify: () => {} }; }

// ---------------------------------------------------------------------------
// Shared UI kit
// ---------------------------------------------------------------------------
function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: fontStack.body, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.mutedSoft, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ fontFamily: fontStack.display, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>{title}</div>
        {subtitle && <div style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.muted, marginTop: 4 }}>{subtitle}</div>}
        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 12, width: 72 }}><span style={{ height: 1, flex: 1, background: C.amber }} /><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber }} /><span style={{ height: 1, flex: 1, background: C.line }} /></div>
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

function Panel({ title, right, children, padding = 24 }) {
  return (
    <div style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          {title && <div style={{ fontFamily: fontStack.display, fontSize: 16, fontWeight: 600, color: C.ink }}>{title}</div>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, tone }) {
  const color = tone === "danger" ? C.rust : tone === "warn" ? C.amber : tone === "success" ? C.lime : C.ink;
  return (
    <div style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontFamily: fontStack.body, fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ fontFamily: fontStack.money, fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
    </div>
  );
}

function StatGrid({ items }) {
  return (
    <div className="stat-grid" style={{ marginBottom: 24 }}>
      {items.map((it, i) => <StatCard key={i} {...it} />)}
    </div>
  );
}

function Btn({ children, tone = "default", onClick, small }) {
  const { notify } = useInteraction();
  const styles = {
    default: { bg: "transparent", color: C.blue, border: C.blue },
    primary: { bg: C.lime, color: "#07100D", border: C.lime },
    accent: { bg: C.lime, color: "#07100D", border: C.lime },
    subtle: { bg: C.raised, color: C.ink, border: C.line },
    danger: { bg: C.rustSoft, color: C.rust, border: "rgba(229,72,77,0.4)" },
  }[tone];
  return (
    <button onClick={(event) => { if (onClick) onClick(event); else notify(`${typeof children === "string" ? children : "Action"} is ready in this prototype.`); }} style={{
      fontFamily: fontStack.body, fontSize: small ? 12.5 : 13.5, fontWeight: 600,
      padding: small ? "7px 14px" : "9px 18px", borderRadius: 999,
      border: `1.5px solid ${styles.border}`, background: styles.bg, color: styles.color, cursor: "pointer",
      whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function FilterRow({ placeholder, filters = [], onChange }) {
  const [query, setQuery] = useState("");
  const [values, setValues] = useState(() => Object.fromEntries(filters.map((filter) => [filter, "All"])));
  useEffect(() => { onChange && onChange({ query, filters: values }); }, [query, values, onChange]);
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", flex: "1 1 240px", minWidth: 200 }}>
        <Search size={14} color={C.mutedSoft} />
        <input aria-label={placeholder} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} style={{ width: "100%", minWidth: 0, border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: fontStack.body, fontSize: 13 }} />
      </div>
      {filters.map((f, i) => (
        <select key={i} aria-label={`Filter by ${f}`} value={values[f]} onChange={(event) => setValues((current) => ({ ...current, [f]: event.target.value }))} style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, background: C.raised }}><option>All</option><option>Active</option><option>Pending</option><option>Review</option><option>Failed</option></select>
      ))}
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.line}`, marginBottom: 20, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} style={{
          background: "none", border: "none", cursor: "pointer", padding: "10px 4px", marginRight: 18,
          fontFamily: fontStack.body, fontSize: 13.5, fontWeight: 600,
          color: active === t ? C.ink : C.mutedSoft,
          borderBottom: active === t ? `2px solid ${C.blue}` : "2px solid transparent",
          whiteSpace: "nowrap",
        }}>{t}</button>
      ))}
    </div>
  );
}

function Timeline({ steps }) {
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color || C.blue, flexShrink: 0, marginTop: 4 }} />
            {i < steps.length - 1 && <span style={{ width: 1, flex: 1, background: C.line, minHeight: 26 }} />}
          </div>
          <div style={{ paddingBottom: 20 }}>
            <div style={{ fontFamily: fontStack.body, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{s.label}</div>
            <div style={{ fontFamily: fontStack.body, fontSize: 12, color: C.mutedSoft, marginTop: 2 }}>{s.time}</div>
            {s.note && <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, marginTop: 4 }}>{s.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoGrid({ rows, cols = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`, rowGap: 16, columnGap: 20 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{r.label}</div>
          <div style={{ fontFamily: r.mono ? fontStack.money : fontStack.body, fontSize: 13.5, color: C.ink, fontWeight: 500, wordBreak: "break-word" }}>{r.value}</div>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <pre style={{ background: C.ink, color: "#D7E3DF", fontFamily: fontStack.mono, fontSize: 12, padding: 14, borderRadius: 6, overflowX: "auto", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
      {children}
    </pre>
  );
}

function SidePanel({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(17,22,29,0.35)", backdropFilter: "blur(2px)" }} />
      <div className="app-side-panel" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 420, maxWidth: "100vw", background: C.raised, boxShadow: "-8px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: fontStack.display, fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</div>
            {subtitle && <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedSoft, padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: 22, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, title, body, onConfirm, confirmLabel = "Confirm" }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(17,22,29,0.45)" }} />
      <div style={{ position: "relative", background: C.raised, borderRadius: 10, padding: 24, width: 380, maxWidth: "100%" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{title}</div>
        <div style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>{body}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn tone="default" onClick={onClose}>Cancel</Btn>
          <Btn tone="danger" onClick={() => { onConfirm && onConfirm(); onClose(); }}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: "clamp(18px, 2.5vw, 20px)", fontWeight: 600, color: C.ink }}>{value}</div>
    </div>
  );
}

function BackLink({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.muted, fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, marginBottom: 16, padding: 0 }}>
      <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to {label}
    </button>
  );
}

function EmptyNote({ label }) {
  return <div style={{ fontFamily: fontStack.body, fontSize: 13, color: C.mutedSoft, textAlign: "center", padding: "32px 0" }}>No {label.toLowerCase()} configured for this preview.</div>;
}

function FieldLabel({ label, value, options = ["All", "Active", "Pending", "Review"], onChange }) {
  const [selected, setSelected] = useState(value);
  useEffect(() => setSelected(value), [value]);
  return (
    <div>
      <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{label}</div>
      <select aria-label={label} value={selected} onChange={(event) => { setSelected(event.target.value); onChange && onChange(event.target.value); }} style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13, color: C.ink, background: "transparent" }}>
        {[selected, ...options].filter((option, index, list) => list.indexOf(option) === index).map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}

function STATUS_STYLE(status) {
  const s = String(status).toLowerCase();
  const success = ["active", "success", "successful", "completed", "delivered", "approved", "matched", "operational", "resolved", "healthy", "up to date", "live", "won", "cleared", "filed"];
  const warn = ["pending", "processing", "review", "waiting", "degraded", "investigating", "escalated", "new", "expiring", "dormant", "not started", "held", "needs update", "underpaid", "delayed"];
  const danger = ["failed", "restricted", "rejected", "suspended", "critical", "major", "declined", "exception", "lost", "overdue", "disputed", "chargeback"];
  // Neutral: outcomes that are resolved/closed but shouldn't read as good or bad (e.g. a reversed
  // transaction, or a payment that came in over the expected amount).
  const neutral = ["reversed", "overpaid"];
  if (neutral.some((k) => s.includes(k))) return { bg: "rgba(217,222,210,0.10)", fg: C.muted };
  if (success.some((k) => s.includes(k))) return { bg: C.greenSoft, fg: C.greenDeep };
  if (danger.some((k) => s.includes(k))) return { bg: C.rustSoft, fg: C.rust };
  if (warn.some((k) => s.includes(k))) return { bg: C.amberSoft, fg: C.amber };
  return { bg: "rgba(217,222,210,0.10)", fg: C.muted };
}

function Badge({ status }) {
  const s = STATUS_STYLE(status);
  return (
    <span style={{
      fontFamily: fontStack.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em",
      padding: "3px 8px", borderRadius: 20, background: s.bg, color: s.fg,
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

function DataTable({ columns, rows, onRowClick }) {
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table style={{ minWidth: 500 }}>
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onClick={() => onRowClick && onRowClick(r)} style={{ cursor: onRowClick ? "pointer" : "default" }}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Maker-checker primitive
//
// Every page that lets an admin change something sensitive (a fee, a limit, a
// merchant's status, a payout account) should route the change through this
// pattern instead of writing a bespoke inline editor:
//   1. The "maker" opens <ProposeChangePanel /> and submits a proposed value + reason.
//   2. The proposal renders as an <ApprovalCard /> in the requesting page's
//      "Pending approvals" panel AND in the System → Approval Center queue.
//   3. A different admin (the "checker") reviews the current → proposed diff
//      and approves or rejects it from the same card.
// ---------------------------------------------------------------------------

// Shape reference for a proposal object (plain JS, no enforcement — pages can
// spread additional fields as needed):
//   {
//     field, currentValue, proposedValue, requester, requesterRole,
//     reason, approver, effectiveDate, status: "Pending" | "Approved" | "Rejected" | "Needs Update",
//     group,      // which nav group/page raised it (shown in the Approval Center)
//     onCommit,   // optional — applies the proposed value to that page's own state when approved
//   }

// Global proposal store. Every "propose a change" surface reads/writes this
// same context so a single approval, wherever it happens, is reflected both
// on the originating page and in the System → Approval Center queue.
const ApprovalContext = createContext(null);

function ApprovalProvider({ children }) {
  const [proposals, setProposals] = useState(SAMPLE_APPROVALS);

  const addProposal = (proposal) => {
    setProposals((list) => [{ requester: "Jeremiah Omonefe", requesterRole: "Admin", approver: "—", status: "Pending", ...proposal }, ...list]);
  };
  const resolveProposal = (id, status, approver = "Jeremiah Omonefe") => {
    setProposals((list) => list.map((p) => {
      if (p.id !== id) return p;
      if (status === "Approved" && p.onCommit) p.onCommit();
      return { ...p, status, approver };
    }));
  };

  return (
    <ApprovalContext.Provider value={{ proposals, addProposal, resolveProposal }}>
      {children}
    </ApprovalContext.Provider>
  );
}

function useApprovals() {
  const ctx = useContext(ApprovalContext);
  if (!ctx) throw new Error("useApprovals must be used within an ApprovalProvider");
  return ctx;
}

function ApprovalCard({ proposal, onApprove, onReject, onRequestUpdate }) {
  const {
    field, currentValue, proposedValue, requester, requesterRole,
    reason, approver, effectiveDate, status = "Pending", impact = "Impact assessment required",
  } = proposal;
  const pending = status.toLowerCase() === "pending";

  return (
    <div style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{field}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ ...moneyStyle, fontSize: 15, color: C.mutedSoft, textDecoration: "line-through" }}>{currentValue}</span>
            <ArrowRight size={14} color={C.mutedSoft} />
            <span style={{ ...moneyStyle, fontSize: 15, fontWeight: 600, color: C.ink }}>{proposedValue}</span>
          </div>
        </div>
        <Badge status={status} />
      </div>

      <InfoGrid rows={[
        { label: "Requested by", value: requesterRole ? `${requester} · ${requesterRole}` : requester },
        { label: "Reason", value: reason },
        { label: "Approver", value: approver || "Unassigned" },
        { label: "Effective date", value: effectiveDate, mono: true },
      ]} />
      <div style={{ padding: "10px 12px", borderLeft: `3px solid ${C.amber}`, background: C.amberSoft, borderRadius: 6 }}>
        <div style={{ fontFamily: fontStack.body, fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>Financial impact</div>
        <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>{impact}</div>
      </div>

      {pending && (onApprove || onReject || onRequestUpdate) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 2 }}>
          {onApprove && <Btn tone="primary" small onClick={onApprove}>Approve</Btn>}
          {onRequestUpdate && <Btn tone="default" small onClick={onRequestUpdate}>Request update</Btn>}
          {onReject && <Btn tone="danger" small onClick={onReject}>Reject</Btn>}
        </div>
      )}
    </div>
  );
}

function ApprovalQueue({ title = "Pending approvals", proposals, onApprove, onReject, onRequestUpdate, emptyLabel = "proposals" }) {
  return (
    <Panel title={title}>
      {proposals && proposals.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {proposals.map((p, i) => (
            <ApprovalCard
              key={i}
              proposal={p}
              onApprove={onApprove && (() => onApprove(p, i))}
              onReject={onReject && (() => onReject(p, i))}
              onRequestUpdate={onRequestUpdate && (() => onRequestUpdate(p, i))}
            />
          ))}
        </div>
      ) : (
        <EmptyNote label={emptyLabel} />
      )}
    </Panel>
  );
}

// Shared "propose change" form. Drop this into a SidePanel from any page —
// pass the field being changed and its current value; onSubmit receives
// { proposedValue, reason, effectiveDate } to hand off to the approval queue.
function ProposeChangePanel({ open, onClose, field, currentValue, onSubmit }) {
  const [proposedValue, setProposedValue] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [impact, setImpact] = useState("");

  return (
    <SidePanel open={open} onClose={onClose} title={`Propose change — ${field}`} subtitle="Submitted for a second admin to review and approve.">
      <FieldLabel label="Current value" value={currentValue} />
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Proposed value</div>
        <input value={proposedValue} onChange={(e) => setProposedValue(e.target.value)} placeholder="Enter new value"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.money, fontSize: 13.5, color: C.ink, background: "transparent", outline: "none" }} />
      </div>
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Reason</div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is this change needed?"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13, color: C.ink, background: "transparent", outline: "none", resize: "vertical" }} />
      </div>
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Effective date</div>
        <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)}
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.money, fontSize: 13, color: C.ink, background: "transparent", outline: "none" }} />
      </div>
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Financial impact</div>
        <textarea value={impact} onChange={(e) => setImpact(e.target.value)} rows={2} placeholder="Revenue, merchant, and liability impact"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13, color: C.ink, background: "transparent", outline: "none", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <Btn tone="default" onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" onClick={() => { onSubmit && onSubmit({ proposedValue, reason, effectiveDate, impact }); onClose(); }}>Submit for approval</Btn>
      </div>
    </SidePanel>
  );
}

// ---------------------------------------------------------------------------
// Placeholder page
//
// Phase 1 moves the IA to its spec-correct shape before every page has real
// content. New nav entries that don't have a built-out page yet render this
// so the group structure and navigation are correct end-to-end; the content
// itself lands in a later phase.
// ---------------------------------------------------------------------------
function PlaceholderPage({ title, group, note }) {
  return (
    <>
      <PageHeader title={title} subtitle={`${group} · coming in a later phase`} />
      <Panel>
        <div style={{ textAlign: "center", padding: "36px 16px" }}>
          <div style={{ fontFamily: fontStack.display, fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Not built yet</div>
          <div style={{ fontFamily: fontStack.body, fontSize: 13, color: C.muted, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            {note || `This page is placeholder-only for now — it exists so the ${group} group in the sidebar matches the target IA. Full functionality follows in a later build phase.`}
          </div>
        </div>
      </Panel>
    </>
  );
}

const SAMPLE_APPROVALS = [
  { id: "apr-1", group: "Operations", field: "Merchant settlement account — Zenko Foods", currentValue: "GTBank •••4821", proposedValue: "Access Bank •••0193", requester: "Ada Nwosu", requesterRole: "Ops Analyst", reason: "Merchant requested payout bank change; supporting letter attached.", approver: "—", effectiveDate: "2026-08-18", status: "Pending" },
  { id: "apr-2", group: "Business Rules", field: "Card transaction limit — Tier 2 merchants", currentValue: "\u20A65,000,000 / day", proposedValue: "\u20A68,000,000 / day", requester: "Chidi Eze", requesterRole: "Risk Lead", reason: "Volume growth across Tier 2 cohort over the last quarter.", approver: "—", effectiveDate: "2026-08-20", status: "Pending" },
  { id: "apr-3", group: "Business Rules", field: "Commission rate — Referral partners", currentValue: "1.2%", proposedValue: "1.0%", requester: "Femi Adeyemi", requesterRole: "Finance Manager", reason: "Align with renegotiated partner contract.", approver: "Jeremiah Omonefe", effectiveDate: "2026-08-05", status: "Approved" },
];

function ApprovalCenterPage() {
  const { proposals, resolveProposal } = useApprovals();
  const pending = proposals.filter((p) => p.status === "Pending");
  const resolved = proposals.filter((p) => p.status !== "Pending");
  const groups = ["All", ...Array.from(new Set(proposals.map((p) => p.group).filter(Boolean)))];
  const [filter, setFilter] = useState("All");
  const matches = (p) => filter === "All" || p.group === filter;

  return (
    <>
      <PageHeader title="Approval Center" subtitle="Maker-checker queue — every sensitive change proposed across the console lands here for a second admin to review." />
      <StatGrid items={[
        { label: "Awaiting review", value: String(pending.length), tone: pending.length ? "warn" : "success" },
        { label: "Approved", value: String(proposals.filter((p) => p.status === "Approved").length), tone: "success" },
        { label: "Rejected", value: String(proposals.filter((p) => p.status === "Rejected").length) },
        { label: "Total this month", value: String(proposals.length) },
      ]} />
      <Tabs tabs={groups} active={filter} onChange={setFilter} />
      <ApprovalQueue
        title="Pending approvals"
        proposals={pending.filter(matches)}
        emptyLabel="pending approvals"
        onApprove={(p) => resolveProposal(p.id, "Approved")}
        onReject={(p) => resolveProposal(p.id, "Rejected")}
        onRequestUpdate={(p) => resolveProposal(p.id, "Needs Update")}
      />
      <div style={{ height: 20 }} />
      <ApprovalQueue title="Resolved" proposals={resolved.filter(matches)} emptyLabel="resolved proposals" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Overview page (dashboard)
// ---------------------------------------------------------------------------
const KPIS = [
  { label: "Transaction volume", value: "\u20A6248.6M", delta: "+14.2%", up: true, sub: "vs. yesterday" },
  { label: "Success rate", value: "98.72%", delta: "+0.4%", up: true, sub: "vs. yesterday" },
  { label: "Active merchants", value: "1,284", delta: "+26", up: true, sub: "vs. yesterday" },
  { label: "Funds in transit", value: "\u20A618.4M", delta: null, up: null, sub: "24 settlements" },
  { label: "Reconciliation", value: "\u20A642,500", delta: null, up: null, sub: "Needs review", warn: true },
  { label: "Open issues", value: "17", delta: null, up: null, sub: "3 critical", danger: true },
];

function KpiCard({ item }) {
  return (
    <div style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
      <div style={{ fontFamily: fontStack.money, fontSize: "clamp(20px, 3vw, 26px)", color: C.ink, fontWeight: 500, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{item.value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16 }}>
        {item.delta && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 500, color: item.up ? C.lime : C.rust }}>
            <ArrowUpRight size={12} style={{ transform: item.up ? "none" : "rotate(90deg)" }} />
            {item.delta}
          </span>
        )}
        <span style={{ fontFamily: fontStack.body, fontSize: 12, color: item.danger ? C.rust : item.warn ? C.amber : C.mutedSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.sub}</span>
      </div>
    </div>
  );
}

function MoneyPosition() {
  const rows = [
    { label: "Customer balances", value: 84.2, display: "\u20A684.2M", color: C.blue, pattern: "solid" },
    { label: "Provider balances", value: 81.7, display: "\u20A681.7M", color: C.blueDeep, pattern: "solid" },
    { label: "Funds in transit", value: 2.5, display: "\u20A62.5M", color: C.mutedSoft, pattern: "stripe" },
    { label: "Unreconciled", value: 0.0425, display: "\u20A642,500", color: C.rust, pattern: "stripe", floor: true },
  ];
  const total = rows.reduce((s, r) => s + r.value, 0);
  const segs = rows.map((r) => ({ ...r, pct: r.floor ? 2.5 : Math.max((r.value / total) * 100, 2.5) }));
  const scale = 100 / segs.reduce((s, r) => s + r.pct, 0);
  const stripe = (color) => ({
    backgroundImage: `repeating-linear-gradient(135deg, ${color} 0, ${color} 3px, transparent 3px, transparent 7px)`,
    backgroundColor: "transparent",
  });

  return (
    <div style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 16, fontWeight: 600, color: C.ink }}>Money position</div>
        <div style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 13, color: C.mutedSoft }}>{"\u20A6"}{total.toFixed(1)}M total</div>
      </div>

      <div style={{ display: "flex", height: 34, borderRadius: 5, overflow: "hidden", border: `1px solid ${C.line}` }}>
        {segs.map((s, i) => (
          <div
            key={i}
            title={`${s.label}: ${s.display}`}
            style={{
              width: `${s.pct * scale}%`,
              ...(s.pattern === "solid" ? { background: s.color } : stripe(s.color)),
              borderRight: i < segs.length - 1 ? `1px solid ${C.raised}` : "none",
            }}
          />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", rowGap: 12, columnGap: 16 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0, ...(r.pattern === "solid" ? { background: r.color } : stripe(r.color)), border: `1px solid ${C.line}` }} />
            <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, flex: 1 }}>{r.label}</span>
            <span style={{ fontFamily: fontStack.money, fontSize: 12.5, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{r.display}</span>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, fontStyle: "italic" }}>
        Striped segments flag balances moving or unresolved.
      </div>

      <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: fontStack.body, fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: "none", marginTop: 4 }}>
        View reconciliation <ArrowRight size={14} />
      </a>
    </div>
  );
}

function AlertBanner({ icon: Icon = AlertTriangle, text, linkText }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.rustSoft, border: `1px solid ${C.alertBorder}`, borderRadius: 10, padding: "14px 18px", marginBottom: 24, flexWrap: "wrap" }}>
      <Icon size={18} color={C.rust} style={{ flexShrink: 0 }} />
      <div style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.ink, flex: 1 }}>
        {text} <a href="#" style={{ color: C.blue, fontWeight: 600, textDecoration: "none" }}>{linkText}</a>
      </div>
    </div>
  );
}

const TODO_ITEMS = [
  { icon: AlertOctagon, title: "3 settlement failures", detail: "\u20A62.4M requires investigation", badge: "URGENT", date: "Today" },
  { icon: GitCompare, title: "12 reconciliation exceptions", detail: "Oldest exception: 18 hours", badge: null, date: "Today" },
  { icon: ShieldCheck, title: "5 KYB applications", detail: "Awaiting review", badge: null, date: "This week" },
];

function ThingsToDo() {
  return (
    <Panel title="Things to do">
      <div style={{ display: "flex", flexDirection: "column" }}>
        {TODO_ITEMS.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 4px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}`, flexWrap: "wrap" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} color={C.blue} />
              </div>
              <div style={{ flex: "1 1 180px", minWidth: 160 }}>
                <div style={{ fontFamily: fontStack.body, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{t.title}</div>
                <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{t.detail}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {t.badge && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: fontStack.body, fontSize: 11.5, fontWeight: 600, color: C.rust, background: C.rustSoft, borderRadius: 999, padding: "3px 10px" }}>
                    <Circle size={6} fill={C.rust} color={C.rust} />{t.badge}
                  </span>
                )}
                <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft }}>{t.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function QuickActions() {
  return (
    <Panel title="Quick actions">
      <p style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: "0 0 20px" }}>
        Jump straight into the areas that need a decision today — reconciliation exceptions, flagged transactions, and pending approvals.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn tone="primary">Open reconciliation</Btn>
        <Btn tone="default">Review risk alerts</Btn>
      </div>
    </Panel>
  );
}

const SPOTLIGHTS = [
  { id: "fees", title: "Fee Configuration", body: "Set per-merchant pricing across card, transfer, USSD and virtual account rails.", link: "Configure fees" },
  { id: "recon", title: "Reconciliation", body: "Catch settlement breaks before they age past 24 hours.", link: "Open reconciliation" },
  { id: "risk", title: "Risk Center", body: "Review flagged transactions and unusual merchant activity.", link: "Open risk center" },
];

function SpotlightCard({ title, body, link, onDismiss }) {
  return (
    <div style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding: 24, position: "relative", flex: "1 1 240px", minWidth: 220 }}>
      <button onClick={onDismiss} style={{ position: "absolute", top: 16, right: 16, width: 24, height: 24, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.raised, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={12} color={C.mutedSoft} />
      </button>
      <div style={{ fontFamily: fontStack.display, fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 10, paddingRight: 24 }}>{title}</div>
      <div style={{ fontFamily: fontStack.body, fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>{body}</div>
      <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: fontStack.body, fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: "none" }}>{link} <ArrowRight size={14} /></a>
    </div>
  );
}

function SpotlightRow() {
  const [dismissed, setDismissed] = useState([]);
  const visible = SPOTLIGHTS.filter((s) => !dismissed.includes(s.id));
  if (visible.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
      {visible.map((s) => (
        <SpotlightCard key={s.id} title={s.title} body={s.body} link={s.link} onDismiss={() => setDismissed((d) => [...d, s.id])} />
      ))}
    </div>
  );
}

function RecentActivity() {
  return (
    <Panel title="Recent activity">
      <Timeline steps={[
        { label: "Settlement STL-8288 completed", time: "07:15", color: C.blue },
        { label: "Fee schedule updated — ABC Traders", time: "Yesterday, 16:40" },
        { label: "KYB approved — Nova Stores", time: "Yesterday, 11:02" },
        { label: "Merchant restricted — flagged for review", time: "2 days ago", color: C.rust },
      ]} />
    </Panel>
  );
}

const RANGES = ["Today", "7D", "30D", "90D"];
const POINT_COUNTS = { Today: 12, "7D": 7, "30D": 30, "90D": 12 };

function genSeries(range) {
  const n = POINT_COUNTS[range];
  const labelFor = (i) => {
    if (range === "Today") return `${(8 + i) % 24}:00`;
    if (range === "7D") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
    if (range === "30D") return `${i + 1}`;
    return ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"][i];
  };
  let seed = 42;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  return Array.from({ length: n }, (_, i) => {
    const base = 800 + Math.sin(i / 2) * 200 + rand() * 250;
    const successful = Math.round(base);
    const failed = Math.round(base * (0.02 + rand() * 0.02));
    const pending = Math.round(base * (0.01 + rand() * 0.015));
    return { t: labelFor(i), successful, failed, pending, volume: Math.round((successful + failed + pending) * (18000 + rand() * 4000)) };
  });
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.muted }}>{label}</span>
    </div>
  );
}

function ToggleGroup({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 6, padding: 2 }}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          border: "none", cursor: "pointer", padding: "5px 10px", borderRadius: 4,
          fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600,
          background: value === o.v ? C.ink : "transparent", color: value === o.v ? C.raised : C.muted,
        }}>{o.l}</button>
      ))}
    </div>
  );
}

function ActivityChart() {
  const [metric, setMetric] = useState("count");
  const [range, setRange] = useState("Today");
  const data = useMemo(() => genSeries(range), [range]);

  return (
    <div style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 16, fontWeight: 600, color: C.ink }}>Transaction activity</div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <ToggleGroup value={metric} onChange={setMetric} options={[{ v: "volume", l: "Volume" }, { v: "count", l: "Count" }]} />
          <div style={{ width: 1, height: 18, background: C.line }} />
          <ToggleGroup value={range} onChange={setRange} options={RANGES.map((r) => ({ v: r, l: r }))} />
        </div>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <ResponsiveContainer width="100%" height={260} minWidth={300}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.lime} stopOpacity={0.3} />
                <stop offset="100%" stopColor={C.lime} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.lineSoft} vertical={false} />
            <XAxis dataKey="t" tick={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 11, fill: C.mutedSoft }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 11, fill: C.mutedSoft }} axisLine={false} tickLine={false} width={48} />
            <Tooltip contentStyle={{ fontFamily: fontStack.body, fontSize: 12.5, border: `1px solid ${C.line}`, borderRadius: 6, background: C.raised, color: C.ink }} labelStyle={{ color: C.ink, fontWeight: 600 }} itemStyle={{ color: C.ink }} />
            <Area type="monotone" dataKey={metric === "volume" ? "volume" : "successful"} stroke={C.lime} strokeWidth={2} fill="url(#gSuccess)" name="Successful" />
            {metric === "count" && (
              <>
                <Area type="monotone" dataKey="pending" stroke={C.amber} strokeWidth={1.5} fill="none" name="Pending" />
                <Area type="monotone" dataKey="failed" stroke={C.rust} strokeWidth={1.5} fill="none" name="Failed" />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
        <Legend color={C.lime} label="Successful" />
        {metric === "count" && <Legend color={C.amber} label="Pending" />}
        {metric === "count" && <Legend color={C.rust} label="Failed" />}
      </div>
    </div>
  );
}

function OverviewPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: fontStack.display, fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 700, letterSpacing: "-0.01em", color: C.ink }}>Good afternoon, Jeremiah 👋</div>
          <div style={{ fontFamily: fontStack.body, fontSize: 14, color: C.muted, marginTop: 4 }}>Here's what's going on across BemcolPay today.</div>
        </div>
        <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft }}>10 Aug 2026<br />Last updated 2 mins ago</div>
      </div>

      <AlertBanner text="3 settlement failures need investigation before today's close." linkText="Review settlements" />

      <SectionLabel>Platform health</SectionLabel>
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      <div style={{ marginBottom: 28 }}><ActivityChart /></div>

      <div className="grid-split-position" style={{ marginBottom: 28 }}>
        <MoneyPosition />
        <RecentActivity />
      </div>

      <SpotlightRow />

      <div className="grid-split-main">
        <ThingsToDo />
        <QuickActions />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Merchants
// ---------------------------------------------------------------------------
const MERCHANTS = [
  { name: "Acme Ltd", id: "MRC-8291", status: "Active", volume: "\u20A624.8M", risk: "Low" },
  { name: "BrightPay", id: "MRC-8290", status: "Review", volume: "\u20A68.2M", risk: "Medium" },
  { name: "Nova Stores", id: "MRC-8289", status: "Active", volume: "\u20A64.8M", risk: "Low" },
  { name: "ABC Traders", id: "MRC-8288", status: "Restricted", volume: "\u20A61.2M", risk: "High" },
  { name: "Zenith Retail", id: "MRC-8287", status: "Active", volume: "\u20A612.4M", risk: "Low" },
];

const TRANSACTIONS = [
  { id: "TX-82931", merchant: "Acme", type: "Collection", amount: "\u20A6250,000", provider: "Provider A", status: "Success" },
  { id: "TX-82930", merchant: "Nova", type: "Transfer", amount: "\u20A685,000", provider: "Provider B", status: "Pending" },
  { id: "TX-82929", merchant: "ABC", type: "Collection", amount: "\u20A642,500", provider: "Provider A", status: "Failed" },
  { id: "TX-82928", merchant: "Zenith", type: "Collection", amount: "\u20A6120,000", provider: "Provider A", status: "Success" },
  { id: "TX-82927", merchant: "BrightPay", type: "Refund", amount: "\u20A620,000", provider: "Provider B", status: "Success" },
];
const txColumns = [
  { key: "id", label: "ID", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.id}</span> },
  { key: "merchant", label: "Merchant" },
  { key: "type", label: "Type" },
  { key: "amount", label: "Amount", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.amount}</span> },
  { key: "provider", label: "Provider" },
  { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
];

function MerchantsSection() {
  const [selected, setSelected] = useState(null);
  if (selected) return <MerchantDetail merchant={selected} onBack={() => setSelected(null)} />;
  return (
    <div>
      <PageHeader title="Merchants" subtitle="Manage businesses using BemcolPay." actions={[<Btn key="e" tone="default">Export</Btn>, <Btn key="a" tone="accent">Add merchant</Btn>]} />
      <StatGrid items={[{ label: "Total", value: "1,284" }, { label: "Active", value: "1,210" }, { label: "Under review", value: "42", tone: "warn" }, { label: "Restricted", value: "12", tone: "danger" }]} />
      <FilterRow placeholder="Search merchant name, ID, email..." filters={["Status", "Industry", "Date joined", "Risk level"]} />
      <Panel padding={0}>
        <DataTable
          columns={[
            { key: "name", label: "Merchant" },
            { key: "id", label: "ID", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted }}>{r.id}</span> },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            { key: "volume", label: "Volume", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.volume}</span> },
            { key: "risk", label: "Risk" },
          ]}
          rows={MERCHANTS}
          onRowClick={setSelected}
        />
      </Panel>
    </div>
  );
}

function MerchantDetail({ merchant, onBack }) {
  const [tab, setTab] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  return (
    <div>
      <BackLink onClick={onBack} label="Merchants" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontFamily: fontStack.display, fontSize: 22, fontWeight: 700, color: C.ink }}>Acme Limited</div>
            <Badge status={merchant.status} />
            <Badge status={`${merchant.risk} Risk`} />
          </div>
          <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft, marginTop: 4 }}>{merchant.id}</div>
        </div>
        <div style={{ position: "relative" }}>
          <Btn tone="default" onClick={() => setMenuOpen((v) => !v)}>More <ChevronDown size={13} style={{ display: "inline", marginLeft: 4 }} /></Btn>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: "110%", background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", width: 200, zIndex: 10, overflow: "hidden" }}>
              {["Restrict account", "Suspend account", "Change limits"].map((a) => (
                <button key={a} onClick={() => { setConfirm(a); setMenuOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: fontStack.body, fontSize: 13, color: C.rust }}>{a}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Panel>
        <div className="grid-3col" style={{ marginBottom: 20 }}>
          <MiniStat label="Balance" value="\u20A62.45M" />
          <MiniStat label="Volume" value="\u20A624.8M" />
          <MiniStat label="Success rate" value="98.7%" />
        </div>
        <div style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 16 }}>
          <InfoGrid cols={3} rows={[{ label: "Settlement status", value: "Up to date" }, { label: "Last transaction", value: "10 Aug, 14:32" }, { label: "Account created", value: "01 Aug 2026" }]} />
        </div>
      </Panel>

      <div style={{ marginTop: 24 }}>
        <Tabs tabs={["Overview", "Transactions", "Accounts", "Settlements", "KYC/KYB", "Risk", "Fees", "Team", "API", "Activity"]} active={tab} onChange={setTab} />
        {tab === "Fees" && (
          <Panel title="Fee schedule" right={<span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.blue, fontWeight: 600 }}>Edit in Fee Configuration →</span>}>
            <InfoGrid rows={[{ label: "Plan", value: "Standard" }, { label: "Card fee", value: "1.5% + \u20A6100", mono: true }, { label: "Transfer fee", value: "\u20A650 flat", mono: true }, { label: "Cap", value: "\u20A62,000", mono: true }, { label: "Effective", value: "01 Jan 2026" }]} />
          </Panel>
        )}
        {tab === "Overview" && (
          <div className="grid-split-equal">
            <Panel title="Business information">
              <InfoGrid rows={[{ label: "Legal name", value: "Acme Limited" }, { label: "Industry", value: "Retail & E-commerce" }, { label: "Registration", value: "RC 1928374" }, { label: "Contact", value: "ops@acmeltd.com" }]} />
            </Panel>
            <Panel title="Recent activity">
              <Timeline steps={[{ label: "Settlement paid", time: "10 Aug, 09:12" }, { label: "KYB re-verified", time: "03 Aug, 16:40" }, { label: "Transfer limit increased", time: "28 Jul, 11:05" }]} />
            </Panel>
          </div>
        )}
        {tab === "Transactions" && (
          <Panel padding={0}><DataTable columns={txColumns} rows={TRANSACTIONS.slice(0, 4)} /></Panel>
        )}
        {!["Overview", "Transactions", "Fees"].includes(tab) && (
          <Panel><EmptyNote label={tab} /></Panel>
        )}
      </div>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title={confirm} body="This action affects Acme Limited's ability to transact on BemcolPay. This cannot be undone automatically." confirmLabel={confirm} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------
const APPLICATIONS = [
  { business: "Kudi Logistics", type: "Business", stage: "Document review", submitted: "10 Aug" },
  { business: "Chika Fashion", type: "Individual", stage: "Awaiting signature", submitted: "9 Aug" },
  { business: "Delta Foods", type: "Business", stage: "Compliance check", submitted: "8 Aug" },
];
function ApplicationsSection() {
  return (
    <div>
      <PageHeader title="Applications" subtitle="Track new business applications onto BemcolPay." />
      <StatGrid items={[{ label: "New", value: "8" }, { label: "In review", value: "15", tone: "warn" }, { label: "Approved this week", value: "22", tone: "success" }, { label: "Declined", value: "3", tone: "danger" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "business", label: "Business" }, { key: "type", label: "Type" },
          { key: "stage", label: "Stage", render: (r) => <Badge status={r.stage} /> }, { key: "submitted", label: "Submitted" },
        ]} rows={APPLICATIONS} />
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KYC / KYB (Verification)
// ---------------------------------------------------------------------------
const KYC_QUEUE = [
  { business: "Acme Ltd", type: "Business", status: "Review", submitted: "10 Aug" },
  { business: "John Doe", type: "Individual", status: "Pending", submitted: "10 Aug" },
  { business: "Nova Stores", type: "Business", status: "Approved", submitted: "9 Aug" },
  { business: "ABC Traders", type: "Business", status: "Escalated", submitted: "7 Aug" },
];
function KycSection() {
  const [sel, setSel] = useState(null);
  if (sel) return <VerificationDetail item={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHeader title="Verification" subtitle="Review KYC and KYB applications." />
      <StatGrid items={[{ label: "Pending", value: "24", tone: "warn" }, { label: "Approved", value: "1,142", tone: "success" }, { label: "Rejected", value: "82", tone: "danger" }, { label: "Escalated", value: "6", tone: "danger" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "business", label: "Business" }, { key: "type", label: "Type" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }, { key: "submitted", label: "Submitted" },
        ]} rows={KYC_QUEUE} onRowClick={setSel} />
      </Panel>
    </div>
  );
}
function VerificationDetail({ item, onBack }) {
  return (
    <div>
      <BackLink onClick={onBack} label="Verification" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700 }}>{item.business}</div>
        <Badge status={item.status} />
      </div>
      <div className="grid-split-kyc" style={{ marginBottom: 20 }}>
        <Panel title="Documents">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["CAC certificate.pdf", "Directors ID.pdf", "Proof of address.pdf"].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${C.line}`, borderRadius: 6, padding: "10px 12px" }}>
                <FileText size={16} color={C.mutedSoft} />
                <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.ink, flex: 1, wordBreak: "break-all" }}>{d}</span>
                <Eye size={14} color={C.blue} style={{ cursor: "pointer" }} />
              </div>
            ))}
          </div>
        </Panel>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Business information">
            <InfoGrid rows={[{ label: "Legal name", value: item.business }, { label: "Type", value: item.type }, { label: "Registration", value: "RC 1928374" }, { label: "Address", value: "12 Marina Rd, Lagos" }]} />
          </Panel>
          <Panel title="Ownership & directors">
            <InfoGrid rows={[{ label: "Directors", value: "2 listed" }, { label: "Beneficial owners", value: "1 — 92% holding" }]} />
          </Panel>
          <Panel title="Risk indicators">
            <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft }}>No adverse media found. Standard risk profile.</div>
          </Panel>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn tone="accent">Approve</Btn>
        <Btn tone="default">Request more information</Btn>
        <Btn tone="danger">Reject</Btn>
        <Btn tone="default">Escalate</Btn>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------
function TransactionsSection() {
  const [selected, setSelected] = useState(null);
  if (selected) return <TransactionDetail tx={selected} onBack={() => setSelected(null)} />;
  return (
    <div>
      <PageHeader title="Transactions" subtitle="Monitor every payment and money movement across the platform." />
      <StatGrid items={[{ label: "Today", value: "18,429" }, { label: "Successful", value: "18,193", tone: "success" }, { label: "Failed", value: "146", tone: "danger" }, { label: "Pending", value: "90", tone: "warn" }]} />
      <FilterRow placeholder="Transaction ID / merchant / customer" filters={["Type", "Status", "Merchant", "Provider", "Currency", "Date", "Amount"]} />
      <Panel padding={0}><DataTable columns={txColumns} rows={TRANSACTIONS} onRowClick={setSelected} /></Panel>
    </div>
  );
}

function TransactionDetail({ tx, onBack }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <BackLink onClick={onBack} label="Transactions" />
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
          <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700, color: C.ink }}>Transaction {tx.id}</div>
          <Badge status={tx.status} />
        </div>
        <div style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: "clamp(24px, 4vw, 28px)", fontWeight: 600, color: C.ink }}>{tx.amount}.00</div>
      </div>
      <div className="grid-split-equal">
        <Panel title="Timeline">
          <Timeline steps={[
            { label: "Payment initiated", time: "14:31:08" },
            { label: "Sent to provider", time: "14:31:09" },
            { label: "Provider confirmed", time: "14:31:11" },
            { label: "Ledger updated", time: "14:31:11" },
            { label: "Merchant balance updated", time: "14:31:12" },
            { label: "Settlement scheduled", time: "14:31:13" },
          ]} />
        </Panel>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Details">
            <InfoGrid rows={[
              { label: "Merchant", value: tx.merchant === "Acme" ? "Acme Limited" : tx.merchant },
              { label: "Customer", value: "John Doe" },
              { label: "Payment method", value: "Bank Transfer" },
              { label: "Provider", value: tx.provider },
              { label: "Reference", value: tx.id, mono: true },
              { label: "Currency", value: "NGN" },
            ]} />
          </Panel>
          <Panel title="Provider response" right={<button onClick={() => setOpen((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: C.blue, fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600 }}>{open ? "Hide" : "Show"}</button>}>
            {open ? <CodeBlock>{`200 OK\nreference: ${tx.id}\ntimestamp: 2026-08-10T14:31:11Z`}</CodeBlock> : <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft }}>Raw provider payload, useful for debugging.</div>}
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ledger
// ---------------------------------------------------------------------------
const LEDGER_ROWS = [
  { time: "14:32", account: "Acme Wallet", type: "Payment", debit: "—", credit: "\u20A6250K", balance: "\u20A62.4M" },
  { time: "14:40", account: "Acme Wallet", type: "Transfer", debit: "\u20A685K", credit: "—", balance: "\u20A62.3M" },
  { time: "15:02", account: "Nova Wallet", type: "Refund", debit: "\u20A620K", credit: "—", balance: "\u20A61.8M" },
  { time: "15:11", account: "ABC Wallet", type: "Payment", debit: "—", credit: "\u20A6120K", balance: "\u20A6980K" },
];
function LedgerSection() {
  const [entry, setEntry] = useState(null);
  return (
    <div>
      <PageHeader title="Ledger" subtitle="View the financial record of every account movement." />
      <StatGrid items={[{ label: "Ledger balance", value: "\u20A684.2M" }, { label: "Available balance", value: "\u20A679.8M" }, { label: "Pending", value: "\u20A64.4M", tone: "warn" }]} />
      <FilterRow placeholder="Search reference" filters={["Account", "Merchant", "Entry type", "Date"]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "time", label: "Time", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.time}</span> },
          { key: "account", label: "Account" },
          { key: "type", label: "Type" },
          { key: "debit", label: "Debit", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.debit}</span> },
          { key: "credit", label: "Credit", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.credit}</span> },
          { key: "balance", label: "Balance", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{r.balance}</span> },
        ]} rows={LEDGER_ROWS} onRowClick={setEntry} />
      </Panel>
      <SidePanel open={!!entry} onClose={() => setEntry(null)} title="Double-entry detail" subtitle={entry ? entry.account : ""}>
        {entry && (
          <>
            <InfoGrid cols={1} rows={[{ label: "Debit leg", value: `${entry.account} — ${entry.debit}` }, { label: "Credit leg", value: `${entry.account} — ${entry.credit}` }, { label: "Resulting balance", value: entry.balance, mono: true }]} />
            <Panel title="Reference"><CodeBlock>{`type: ${entry.type}\ntime: ${entry.time}\nentry_id: LDG-4471`}</CodeBlock></Panel>
          </>
        )}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settlements
// ---------------------------------------------------------------------------
const SETTLEMENTS = [
  { merchant: "Acme", amount: "\u20A61.2M", destination: "GTBank", expected: "Today", status: "Processing" },
  { merchant: "Nova", amount: "\u20A6850K", destination: "Access", expected: "Today", status: "Completed" },
  { merchant: "ABC", amount: "\u20A6420K", destination: "UBA", expected: "Today", status: "Failed" },
];
function SettlementsSection() {
  const [sel, setSel] = useState(null);
  if (sel) return <SettlementDetail s={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHeader title="Settlements" subtitle="Monitor funds owed to merchants and settlement execution." />
      <StatGrid items={[{ label: "Due today", value: "\u20A68.2M" }, { label: "Processing", value: "\u20A62.1M", tone: "warn" }, { label: "Completed", value: "\u20A642M", tone: "success" }, { label: "Failed", value: "\u20A6320K", tone: "danger" }]} />
      <Panel title="Settlement queue" padding={0}>
        <DataTable columns={[
          { key: "merchant", label: "Merchant" },
          { key: "amount", label: "Amount", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.amount}</span> },
          { key: "destination", label: "Destination" },
          { key: "expected", label: "Expected" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={SETTLEMENTS} onRowClick={setSel} />
      </Panel>
    </div>
  );
}
function SettlementDetail({ s, onBack }) {
  return (
    <div>
      <BackLink onClick={onBack} label="Settlements" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700 }}>Settlement STL-8291</div>
        <Badge status={s.status} />
      </div>
      <div className="grid-split-equal">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Breakdown">
            <InfoGrid rows={[{ label: "Merchant", value: "Acme Ltd" }, { label: "Gross", value: "\u20A61,300,000", mono: true }, { label: "Fees", value: "\u20A640,000", mono: true }, { label: "Refunds", value: "\u20A610,000", mono: true }, { label: "Net", value: "\u20A61,250,000", mono: true }]} />
          </Panel>
          <Panel title="Provider information">
            <InfoGrid rows={[{ label: "Provider", value: s.destination === "GTBank" ? "Provider A" : "Provider B" }, { label: "Settlement batch", value: "BATCH-4471" }]} />
          </Panel>
          <Panel title="Bank destination">
            <InfoGrid rows={[{ label: "Bank", value: s.destination }, { label: "Account", value: "0123456789" }]} />
          </Panel>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Settlement timeline">
            <Timeline steps={[{ label: "Settlement created", time: "06:00" }, { label: "Batch submitted", time: "07:15" }, { label: "Bank processing", time: "07:20" }, { label: s.status, time: "Now", color: s.status === "Failed" ? C.rust : C.amber }]} />
          </Panel>
          <Panel title="Exceptions">
            <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft }}>{s.status === "Failed" ? "Bank rejected transfer — invalid account details. Escalated to operations." : "No exceptions recorded."}</div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------
const EXCEPTIONS = [
  { ref: "TX8291", internal: "\u20A6250,000", external: "\u20A6250,000", diff: "—", age: "Matched" },
  { ref: "TX8290", internal: "\u20A680,000", external: "\u20A685,000", diff: "\u20A65,000", age: "4h" },
  { ref: "TX8289", internal: "\u20A6120,000", external: "—", diff: "\u20A6120,000", age: "9h" },
];
function ReconciliationSection() {
  const [inv, setInv] = useState(null);
  const [notes, setNotes] = useState("");
  return (
    <div>
      <PageHeader title="Reconciliation" subtitle="Compare BemcolPay records with external financial records." />
      <StatGrid items={[{ label: "Matched", value: "99.8%", tone: "success" }, { label: "Exceptions", value: "18", tone: "danger" }, { label: "Unreconciled value", value: "\u20A642,500", tone: "warn" }, { label: "Pending", value: "7" }]} />
      <Panel title="Provider A · 10 Aug 2026">
        <InfoGrid rows={[{ label: "Records received", value: "18,421" }, { label: "Matched", value: "18,403" }, { label: "Exceptions", value: "18" }]} />
      </Panel>
      <div style={{ height: 20 }} />
      <Panel title="Exceptions" padding={0}>
        <DataTable columns={[
          { key: "ref", label: "Reference", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.ref}</span> },
          { key: "internal", label: "Internal", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.internal}</span> },
          { key: "external", label: "External", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.external}</span> },
          { key: "diff", label: "Difference", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", color: r.diff !== "—" ? C.rust : C.mutedSoft }}>{r.diff}</span> },
          { key: "age", label: "Age", render: (r) => (r.age === "Matched" ? <Badge status="Matched" /> : <span style={{ fontFamily: fontStack.body, fontSize: 12 }}>{r.age}</span>) },
        ]} rows={EXCEPTIONS} onRowClick={(r) => r.age !== "Matched" && setInv(r)} />
      </Panel>
      <SidePanel open={!!inv} onClose={() => setInv(null)} title={inv ? `Investigate ${inv.ref}` : ""} subtitle="Reconciliation exception">
        {inv && (
          <>
            <InfoGrid cols={1} rows={[
              { label: "Internal record", value: `${inv.ref} — ${inv.internal}` },
              { label: "Provider record", value: `${inv.ref} — ${inv.external}` },
              { label: "Ledger entries", value: "2 entries linked" },
              { label: "Settlement status", value: "Held pending resolution" },
            ]} />
            <div>
              <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Notes</div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add investigation notes..." style={{ width: "100%", minHeight: 80, border: `1px solid ${C.line}`, borderRadius: 6, padding: 10, fontFamily: fontStack.body, fontSize: 13, resize: "vertical" }} />
            </div>
            <Btn tone="accent" onClick={() => setInv(null)}>Mark resolved</Btn>
          </>
        )}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Treasury
// ---------------------------------------------------------------------------
function TreasurySection() {
  const providers = [{ name: "Provider A", balance: "\u20A632.0M", status: "Healthy" }, { name: "Provider B", balance: "\u20A624.0M", status: "Healthy" }, { name: "Bank A", balance: "\u20A618.0M", status: "Healthy" }, { name: "Bank B", balance: "\u20A68.4M", status: "Review" }];
  const obligations = [{ label: "Merchant settlements", value: 8.2 }, { label: "Provider fees", value: 1.4 }, { label: "Refunds", value: 0.32 }, { label: "Other obligations", value: 0.85 }];
  const total = obligations.reduce((s, o) => s + o.value, 0);
  return (
    <div>
      <PageHeader title="Treasury" subtitle="Monitor liquidity, balances and upcoming obligations." />
      <StatGrid items={[{ label: "Total liquidity", value: "\u20A682.4M" }, { label: "Expected inflows", value: "\u20A618.2M", tone: "success" }, { label: "Expected outflows", value: "\u20A614.7M", tone: "warn" }, { label: "Projected position", value: "\u20A685.9M" }]} />
      <div className="grid-split-treasury">
        <Panel title="Provider balances" padding={0}>
          <DataTable columns={[
            { key: "name", label: "Provider" },
            { key: "balance", label: "Balance", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.balance}</span> },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={providers} />
        </Panel>
        <Panel title="Upcoming obligations">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {obligations.map((o, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted }}>{o.label}</span>
                  <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: C.ink }}>{"\u20A6"}{o.value >= 1 ? o.value.toFixed(1) + "M" : Math.round(o.value * 1000) + "K"}</span>
                </div>
                <div style={{ height: 6, background: C.lineSoft, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(o.value / total) * 100}%`, background: C.blue, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Center
// ---------------------------------------------------------------------------
const ALERTS = [
  { level: "high", title: "\u20A68.5M transaction", merchant: "Acme Ltd", reason: "Unusual transaction value", time: "10 mins ago" },
  { level: "medium", title: "High transaction velocity", merchant: "Merchant XYZ", reason: "4× normal volume", time: "32 mins ago" },
  { level: "medium", title: "New device login", merchant: "Nova Stores", reason: "Login from unrecognised device", time: "1 hr ago" },
];
function RiskSection() {
  const [alert, setAlert] = useState(null);
  const [reviewed, setReviewed] = useState([]);
  return (
    <div>
      <PageHeader title="Risk Center" subtitle="Monitor unusual activity and accounts requiring review." />
      <StatGrid items={[{ label: "Open alerts", value: "28" }, { label: "High risk", value: "7", tone: "danger" }, { label: "Under review", value: "12", tone: "warn" }, { label: "Escalated", value: "3", tone: "danger" }]} />
      <Panel title="Alert queue">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ALERTS.map((a, i) => (
            <button key={i} onClick={() => setAlert(a)} style={{
              display: "flex", alignItems: "center", gap: 14, textAlign: "left", background: "none", border: "none", cursor: "pointer",
              padding: "14px 4px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}`, opacity: reviewed.includes(i) ? 0.45 : 1, width: "100%", flexWrap: "wrap",
            }}>
              <span style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: a.level === "high" ? C.rust : C.amber, flexShrink: 0 }} />
              <Badge status={a.level === "high" ? "Critical" : "Review"} />
              <div style={{ flex: "1 1 180px" }}>
                <div style={{ fontFamily: fontStack.body, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{a.title}</div>
                <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{a.merchant} · {a.reason}</div>
              </div>
              <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft }}>{a.time}</div>
            </button>
          ))}
        </div>
      </Panel>
      <SidePanel open={!!alert} onClose={() => setAlert(null)} title={alert ? alert.title : ""} subtitle={alert ? alert.merchant : ""}>
        {alert && (
          <>
            <InfoGrid cols={1} rows={[{ label: "Why was this flagged?", value: alert.reason }, { label: "Customer history", value: "6 prior transactions, no disputes" }, { label: "Transaction history", value: "\u20A612.4M over 30 days" }, { label: "Risk indicators", value: "Value outlier, new beneficiary" }, { label: "Related accounts", value: "2 linked accounts" }]} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn tone="accent" onClick={() => { setReviewed((r) => [...r, ALERTS.indexOf(alert)]); setAlert(null); }}>Mark reviewed</Btn>
              <Btn tone="default">Escalate</Btn>
              <Btn tone="danger">Restrict</Btn>
              <Btn tone="default">Request information</Btn>
            </div>
          </>
        )}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Disputes
// ---------------------------------------------------------------------------
const DISPUTES = [
  { id: "DSP-4471", merchant: "Nova Stores", amount: "\u20A645,000", reason: "Product not received", status: "Under review", due: "2 days" },
  { id: "DSP-4470", merchant: "Acme Ltd", amount: "\u20A612,000", reason: "Duplicate charge", status: "Won", due: "—" },
  { id: "DSP-4469", merchant: "ABC Traders", amount: "\u20A68,500", reason: "Unauthorised", status: "Lost", due: "—" },
];
function DisputesSection() {
  return (
    <div>
      <PageHeader title="Disputes" subtitle="Track and respond to chargebacks and customer disputes." />
      <StatGrid items={[{ label: "Open", value: "9" }, { label: "Won", value: "34", tone: "success" }, { label: "Lost", value: "6", tone: "danger" }, { label: "Under review", value: "5", tone: "warn" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "id", label: "Dispute", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.id}</span> },
          { key: "merchant", label: "Merchant" },
          { key: "amount", label: "Amount", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.amount}</span> },
          { key: "reason", label: "Reason" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          { key: "due", label: "Due" },
        ]} rows={DISPUTES} />
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------
function IncidentsSection() {
  const [open, setOpen] = useState(false);
  if (open) return <IncidentDetail onBack={() => setOpen(false)} />;
  return (
    <div>
      <PageHeader title="Incidents" subtitle="Track operational problems affecting BemcolPay." />
      <button onClick={() => setOpen(true)} style={{ display: "block", width: "100%", textAlign: "left", background: C.rustSoft, border: `1px solid ${C.rust}22`, borderRadius: 12, padding: "16px 20px", marginBottom: 20, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <AlertTriangle size={16} color={C.rust} />
          <span style={{ fontFamily: fontStack.body, fontSize: 11, fontWeight: 700, color: C.rust, letterSpacing: "0.04em" }}>1 MAJOR INCIDENT</span>
        </div>
        <div style={{ fontFamily: fontStack.body, fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Provider A experiencing elevated failure rates</div>
        <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted }}>Started 14:32 · Affected: Collections · Status: Investigating</div>
      </button>
      <Panel title="Recent incidents" padding={0}>
        <DataTable columns={[
          { key: "id", label: "Incident" }, { key: "severity", label: "Severity", render: (r) => <Badge status={r.severity} /> },
          { key: "started", label: "Started" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={[
          { id: "INC-0021", severity: "Major", started: "Today, 14:32", status: "Investigating" },
          { id: "INC-0020", severity: "Minor", started: "Yesterday", status: "Resolved" },
          { id: "INC-0019", severity: "Minor", started: "3 Aug", status: "Resolved" },
        ]} />
      </Panel>
    </div>
  );
}
function IncidentDetail({ onBack }) {
  const [tab, setTab] = useState("Overview");
  return (
    <div>
      <BackLink onClick={onBack} label="Incidents" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700 }}>Incident INC-0021</div>
        <Badge status="Major" />
      </div>
      <StatGrid items={[{ label: "Owner", value: "Operations" }, { label: "Impact", value: "1,240 txns" }, { label: "Est. affected value", value: "\u20A64.2M", tone: "danger" }, { label: "Status", value: "Investigating", tone: "warn" }]} />
      <Tabs tabs={["Overview", "Timeline", "Affected Transactions", "Communication", "Resolution", "Postmortem"]} active={tab} onChange={setTab} />
      {tab === "Overview" && (
        <Panel title="Summary">
          <div style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            Provider A is returning elevated failure rates on collection requests. Engineering has been engaged and the provider has been notified. Affected merchants are being monitored for repeat failures.
          </div>
        </Panel>
      )}
      {tab === "Timeline" && (
        <Panel title="Timeline">
          <Timeline steps={[
            { label: "Alert triggered", time: "14:32" },
            { label: "Operations acknowledged", time: "14:35" },
            { label: "Engineering investigating", time: "14:38" },
            { label: "Provider contacted", time: "14:45" },
          ]} />
        </Panel>
      )}
      {!["Overview", "Timeline"].includes(tab) && <Panel><EmptyNote label={tab} /></Panel>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------
const PROVIDERS = [
  { name: "Provider A", type: "Payment processor", status: "Degraded" },
  { name: "Provider B", type: "Payment processor", status: "Operational" },
  { name: "GTBank", type: "Banking partner", status: "Operational" },
  { name: "Access Bank", type: "Banking partner", status: "Operational" },
];
function PartnersSection() {
  const [sel, setSel] = useState(null);
  if (sel) return <ProviderDetail provider={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHeader title="Partners" subtitle="Banking and payment infrastructure partners." />
      <StatGrid items={[{ label: "Banking partners", value: "4" }, { label: "Payment processors", value: "3" }, { label: "Virtual account providers", value: "2" }, { label: "Bill payment providers", value: "2" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "name", label: "Partner" }, { key: "type", label: "Type" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={PROVIDERS} onRowClick={setSel} />
      </Panel>
    </div>
  );
}
function ProviderDetail({ provider, onBack }) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div>
      <BackLink onClick={onBack} label="Partners" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700 }}>{provider.name}</div>
        <Badge status={provider.status} />
      </div>
      <StatGrid items={[{ label: "Success rate", value: "98.9%" }, { label: "Latency", value: "420ms" }, { label: "Today's volume", value: "\u20A624.8M" }, { label: "Failed transactions", value: "1.2%", tone: "warn" }]} />
      <div className="grid-split-equal">
        <Panel title="Recent incidents">
          <Timeline steps={[{ label: "Elevated failure rate", time: "Today, 14:32", color: C.rust }, { label: "Latency spike resolved", time: "3 Aug", color: C.lime }]} />
        </Panel>
        <Panel title="Credentials">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: fontStack.mono, fontSize: 13, color: C.ink }}>{showKey ? "sk_live_8fA92kD01mZ" : "sk_live_••••••••"}</span>
            <button onClick={() => setShowKey((v) => !v)} style={{ background: "none", border: "none", color: C.blue, cursor: "pointer", fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600 }}>{showKey ? "Hide" : "Reveal"}</button>
          </div>
        </Panel>
        <Panel title="Contacts">
          <InfoGrid cols={1} rows={[{ label: "Account manager", value: "Tunde Bakare — tunde@providera.com" }, { label: "Support", value: "support@providera.com" }]} />
        </Panel>
        <Panel title="Settlement activity">
          <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft }}>Last settlement: Today, 07:15 · \u20A61.2M</div>
        </Panel>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
function ReportsSection() {
  const types = ["Financial", "Transactions", "Settlements", "Reconciliation", "Treasury", "Compliance", "Operations"];
  const [type, setType] = useState("Settlements");
  const [format, setFormat] = useState("CSV");
  const [queued, setQueued] = useState(false);
  return (
    <div>
      <PageHeader title="Reports" subtitle="Build and export reports from BemcolPay data." />
      <Panel title="Choose report">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: "8px 14px", borderRadius: 20, border: `1px solid ${type === t ? C.blue : C.line}`,
              background: type === t ? C.blueSoft : C.raised, color: type === t ? C.blueDeep : C.muted,
              fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
      </Panel>
      <div style={{ height: 20 }} />
      <Panel title={`${type} report`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
          <FieldLabel label="Date range" value="01 Aug → 10 Aug" />
          <FieldLabel label="Merchant" value="All merchants" />
          <FieldLabel label="Provider" value="All providers" />
          <FieldLabel label="Status" value="All" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Format</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["CSV", "XLSX", "PDF"].map((f) => (
              <button key={f} onClick={() => setFormat(f)} style={{
                padding: "7px 14px", borderRadius: 6, border: `1px solid ${format === f ? C.ink : C.line}`,
                background: format === f ? C.ink : C.raised, color: format === f ? C.raised : C.muted,
                fontFamily: fontStack.body, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{f}</button>
            ))}
          </div>
        </div>
        <Btn tone="accent" onClick={() => setQueued(true)}>Generate report</Btn>
        {queued && <div style={{ marginTop: 14, fontFamily: fontStack.body, fontSize: 12.5, color: C.blue }}>Report queued — you'll get a notification when it's ready.</div>}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Developers (API Activity + Webhooks)
// ---------------------------------------------------------------------------
const API_REQUESTS = [
  { time: "14:32", merchant: "Acme", method: "POST", endpoint: "/v1/payments", status: "201" },
  { time: "14:32", merchant: "Nova", method: "GET", endpoint: "/v1/customers", status: "200" },
  { time: "14:31", merchant: "ABC", method: "POST", endpoint: "/v1/transfers", status: "400" },
  { time: "14:30", merchant: "Zenith", method: "GET", endpoint: "/v1/balances", status: "200" },
];
const WEBHOOKS = [
  { event: "payment.completed", merchant: "Acme", attempts: 1, status: "Delivered" },
  { event: "payout.failed", merchant: "Nova", attempts: 3, status: "Failed" },
  { event: "transfer.completed", merchant: "ABC", attempts: 1, status: "Delivered" },
];
function DevelopersSection() {
  const [tab, setTab] = useState("API Activity");
  const [req, setReq] = useState(null);
  const [hook, setHook] = useState(null);
  return (
    <div>
      <PageHeader title="Developers" subtitle="API and webhook activity across the platform." />
      <Tabs tabs={["API Activity", "Webhooks"]} active={tab} onChange={setTab} />
      {tab === "API Activity" && (
        <>
          <StatGrid items={[{ label: "Requests", value: "1.2M" }, { label: "Success", value: "99.2%", tone: "success" }, { label: "Errors", value: "0.8%", tone: "danger" }, { label: "Latency", value: "220ms" }]} />
          <Panel padding={0}>
            <DataTable columns={[
              { key: "time", label: "Time", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12 }}>{r.time}</span> },
              { key: "merchant", label: "Merchant" },
              { key: "method", label: "Method", render: (r) => <span style={{ fontFamily: fontStack.mono, fontSize: 12 }}>{r.method}</span> },
              { key: "endpoint", label: "Endpoint", render: (r) => <span style={{ fontFamily: fontStack.mono, fontSize: 12 }}>{r.endpoint}</span> },
              { key: "status", label: "Status", render: (r) => <Badge status={r.status.startsWith("2") ? "Success" : "Failed"} /> },
            ]} rows={API_REQUESTS} onRowClick={setReq} />
          </Panel>
          <SidePanel open={!!req} onClose={() => setReq(null)} title={req ? req.endpoint : ""} subtitle={req ? req.merchant : ""}>
            {req && (
              <>
                <Panel title="Request"><CodeBlock>{`${req.method} ${req.endpoint}\nAuthorization: Bearer sk_live_••••`}</CodeBlock></Panel>
                <Panel title="Response"><CodeBlock>{`${req.status} ${req.status.startsWith("2") ? "OK" : "Bad Request"}\n{ "id": "req_48213" }`}</CodeBlock></Panel>
              </>
            )}
          </SidePanel>
        </>
      )}
      {tab === "Webhooks" && (
        <>
          <StatGrid items={[{ label: "Delivered", value: "99.4%", tone: "success" }, { label: "Failed", value: "0.6%", tone: "danger" }, { label: "Pending", value: "24", tone: "warn" }]} />
          <Panel padding={0}>
            <DataTable columns={[
              { key: "event", label: "Event", render: (r) => <span style={{ fontFamily: fontStack.mono, fontSize: 12 }}>{r.event}</span> },
              { key: "merchant", label: "Merchant" },
              { key: "attempts", label: "Attempts" },
              { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            ]} rows={WEBHOOKS} onRowClick={setHook} />
          </Panel>
          <SidePanel open={!!hook} onClose={() => setHook(null)} title={hook ? hook.event : ""} subtitle={hook ? hook.merchant : ""}>
            {hook && (
              <>
                <Panel title="Payload"><CodeBlock>{`{ "event": "${hook.event}", "merchant": "${hook.merchant}" }`}</CodeBlock></Panel>
                <Panel title="Response"><CodeBlock>{hook.status === "Delivered" ? "200 OK" : "Connection timeout after 3 attempts"}</CodeBlock></Panel>
                <Btn tone="accent"><RefreshCw size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />Retry delivery</Btn>
              </>
            )}
          </SidePanel>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Access (Admin Users + Audit Trail)
// ---------------------------------------------------------------------------
const ADMINS = [
  { name: "David Okafor", role: "Super Admin", last: "Just now", status: "Active" },
  { name: "Sarah Bello", role: "Operations", last: "4 mins ago", status: "Active" },
  { name: "Michael Adeyemi", role: "Finance", last: "2 hrs ago", status: "Active" },
  { name: "Grace Nwosu", role: "Compliance", last: "1 day ago", status: "Active" },
];
const AUDIT = [
  { time: "10 Aug 14:31", user: "David Okafor", action: "Changed merchant transfer limit", resource: "Acme Ltd", detail: "\u20A65M → \u20A610M", reason: "Approved limit increase" },
  { time: "10 Aug 11:02", user: "Sarah Bello", action: "Restricted merchant account", resource: "ABC Traders", detail: "Active → Restricted", reason: "Suspicious activity flagged" },
  { time: "09 Aug 16:48", user: "Michael Adeyemi", action: "Approved settlement override", resource: "STL-8204", detail: "\u20A6420,000", reason: "Manual reconciliation match" },
];
function AccessSection() {
  const [tab, setTab] = useState("Admin Users");
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <PageHeader title="Admin Access" subtitle="Manage internal access to the BemcolPay control environment." />
      <div style={{ marginBottom: 20 }}><SecureAccessNotice /></div>
      <Tabs tabs={["Admin Users", "Audit Trail", "Permissions", "Security"]} active={tab} onChange={setTab} />
      {tab === "Admin Users" && (
        <>
          <StatGrid items={[{ label: "Administrators", value: "18" }, { label: "Operations", value: "6" }, { label: "Finance", value: "4" }, { label: "Compliance", value: "3" }]} />
          <Panel padding={0}>
            <DataTable columns={[
              { key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "last", label: "Last active" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            ]} rows={ADMINS} onRowClick={setUser} />
          </Panel>
          <SidePanel open={!!user} onClose={() => setUser(null)} title={user ? user.name : ""} subtitle={user ? user.role : ""}>
            {user && (
              <>
                <InfoGrid cols={1} rows={[{ label: "Permissions", value: "Merchants · Transactions · Settlements · Risk (read/write)" }, { label: "Sessions", value: "2 active sessions" }, { label: "Recent activity", value: "Changed transfer limit for Acme Ltd" }]} />
                <a href="#" style={{ fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, color: C.blue, textDecoration: "none" }}>View full access history →</a>
              </>
            )}
          </SidePanel>
        </>
      )}
      {tab === "Audit Trail" && (
        <>
          <FilterRow placeholder="Search admin, merchant, transaction or action" filters={["User", "Action", "Resource", "Date"]} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {AUDIT.map((a, i) => (
              <div key={i} style={{ borderTop: i === 0 ? `1px solid ${C.line}` : `1px solid ${C.lineSoft}` }}>
                <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "14px 4px", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, width: 110, flexShrink: 0 }}>{a.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fontStack.body, fontSize: 13, color: C.ink }}><strong>{a.user}</strong> {a.action.toLowerCase()}</div>
                    <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{a.resource} · {a.detail}</div>
                  </div>
                </button>
                {expanded === i && (
                  <div style={{ padding: "0 4px 16px 16px" }}>
                    <CodeBlock>{`actor: ${a.user}\naction: ${a.action}\nresource: ${a.resource}\nchange: ${a.detail}\nreason: ${a.reason}\nip_device: 102.89.xxx · managed device\naudit_status: immutable event recorded`}</CodeBlock>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "Permissions" && <PermissionsTab />}
      {tab === "Security" && <SecurityTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Support
// ---------------------------------------------------------------------------
const TICKETS = [
  { id: "82931", merchant: "Acme Ltd", issue: "Settlement not received", status: "Urgent" },
  { id: "82930", merchant: "Nova Stores", issue: "API integration question", status: "Waiting" },
  { id: "82929", merchant: "ABC Traders", issue: "Refund delay", status: "Open" },
];
function ChatBubble({ from, text, mine }) {
  return (
    <div style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "85%" }}>
      <div style={{ fontFamily: fontStack.body, fontSize: 11, color: C.mutedSoft, marginBottom: 3 }}>{from}</div>
      <div style={{ background: mine ? C.blueSoft : C.paper, color: mine ? C.blueDeep : C.ink, padding: "10px 14px", borderRadius: 12, fontFamily: fontStack.body, fontSize: 13, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}
function SupportSection() {
  const [sel, setSel] = useState(null);
  if (sel) return <TicketDetail ticket={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHeader title="Support" subtitle="Merchant support queue." />
      <StatGrid items={[{ label: "Open", value: "42" }, { label: "Urgent", value: "5", tone: "danger" }, { label: "Waiting", value: "18", tone: "warn" }, { label: "Resolved today", value: "84", tone: "success" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "id", label: "Ticket", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>#{r.id}</span> },
          { key: "merchant", label: "Merchant" }, { key: "issue", label: "Issue" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={TICKETS} onRowClick={setSel} />
      </Panel>
    </div>
  );
}
function TicketDetail({ ticket, onBack }) {
  const [notes, setNotes] = useState("");
  return (
    <div>
      <BackLink onClick={onBack} label="Support" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700 }}>Ticket #{ticket.id}</div>
        <Badge status={ticket.status} />
      </div>
      <div style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.muted, marginBottom: 20 }}>{ticket.merchant} · {ticket.issue}</div>
      <div className="grid-split-support">
        <Panel title="Conversation">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ChatBubble from={ticket.merchant} text="We haven't received today's settlement. Can you check?" />
            <ChatBubble from="BemcolPay Support" mine text="Looking into this now — checking with our banking partner." />
          </div>
        </Panel>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Settlement details">
            <InfoGrid cols={1} rows={[{ label: "Settlement", value: "STL-8291" }, { label: "Amount", value: "\u20A61,250,000", mono: true }, { label: "Status", value: "Processing" }]} />
          </Panel>
          <Panel title="Internal notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note for the team..." style={{ width: "100%", minHeight: 70, border: `1px solid ${C.line}`, borderRadius: 6, padding: 10, fontFamily: fontStack.body, fontSize: 13, resize: "vertical" }} />
          </Panel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn tone="accent">Resolve</Btn>
            <Btn tone="default">Escalate</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// System Status
// ---------------------------------------------------------------------------
const SERVICES = [
  { name: "API", status: "Operational" }, { name: "Dashboard", status: "Operational" }, { name: "Ledger", status: "Operational" },
  { name: "Collections", status: "Operational" }, { name: "Transfers", status: "Operational" }, { name: "Virtual Accounts", status: "Operational" },
  { name: "Webhooks", status: "Operational" }, { name: "Provider A", status: "Degraded" }, { name: "Provider B", status: "Operational" },
];
function StatusSection() {
  return (
    <div>
      <PageHeader title="System Health" subtitle="Live status of BemcolPay services and infrastructure." />
      <Panel title="Services">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SERVICES.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}` }}>
              <span style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.ink }}>{s.name}</span>
              <Badge status={s.status} />
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ height: 20 }} />
      <Panel title="Live incident timeline">
        <Timeline steps={[
          { label: "Provider A latency increased", time: "14:20", color: C.amber },
          { label: "Failure rate crossed threshold", time: "14:32", color: C.rust },
          { label: "Operations acknowledged", time: "14:35" },
          { label: "Provider contacted", time: "14:45" },
        ]} />
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compliance: Screening
// ---------------------------------------------------------------------------
const SCREENING = [
  { name: "Chinedu Okoro", type: "PEP", source: "Local PEP List", score: 82, status: "Escalated" },
  { name: "GlobalTrade Ventures", type: "Sanctions", source: "OFAC SDN", score: 95, status: "Escalated" },
  { name: "Amaka Eze", type: "Adverse Media", source: "News scan", score: 41, status: "Cleared" },
  { name: "Bright Horizon Ltd", type: "Sanctions", source: "UN Consolidated", score: 12, status: "Cleared" },
];
function ScreeningSection() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <PageHeader title="Screening" subtitle="Sanctions, PEP and adverse media screening for merchants and beneficial owners." />
      <StatGrid items={[{ label: "Open matches", value: "6", tone: "warn" }, { label: "Escalated", value: "2", tone: "danger" }, { label: "Cleared this week", value: "21", tone: "success" }, { label: "False positive rate", value: "3.2%" }]} />
      <FilterRow placeholder="Search name, entity or reference" filters={["Match type", "List source", "Status"]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "name", label: "Entity" },
          { key: "type", label: "Match type" },
          { key: "source", label: "List source" },
          { key: "score", label: "Score", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.score}</span> },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={SCREENING} onRowClick={setSel} />
      </Panel>
      <SidePanel open={!!sel} onClose={() => setSel(null)} title={sel ? sel.name : ""} subtitle={sel ? sel.type : ""}>
        {sel && (
          <>
            <InfoGrid cols={1} rows={[{ label: "List source", value: sel.source }, { label: "Match score", value: `${sel.score} / 100` }, { label: "Linked to", value: "Merchant onboarding — GlobalTrade Ventures" }, { label: "Screened", value: "10 Aug 2026, 09:14" }]} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn tone="accent" onClick={() => setSel(null)}>Clear match</Btn>
              <Btn tone="danger">Block</Btn>
              <Btn tone="default">Escalate to compliance</Btn>
            </div>
          </>
        )}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compliance: Case Management
// ---------------------------------------------------------------------------
const CASES = [
  { id: "CASE-1042", subject: "GlobalTrade Ventures", type: "SAR", priority: "High", status: "Under investigation", opened: "08 Aug" },
  { id: "CASE-1041", subject: "Nova Stores", type: "Unusual activity", priority: "Medium", status: "Open", opened: "06 Aug" },
  { id: "CASE-1039", subject: "ABC Traders", type: "Sanctions match", priority: "High", status: "Filed", opened: "29 Jul" },
  { id: "CASE-1035", subject: "Zenith Retail", type: "Unusual activity", priority: "Low", status: "Closed", opened: "14 Jul" },
];
function CaseManagementSection() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <PageHeader title="Case Management" subtitle="Investigate and file suspicious activity reports." />
      <StatGrid items={[{ label: "Open cases", value: "9" }, { label: "Under investigation", value: "4", tone: "warn" }, { label: "Filed this month", value: "3" }, { label: "Closed", value: "27", tone: "success" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "id", label: "Case", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.id}</span> },
          { key: "subject", label: "Subject" }, { key: "type", label: "Type" },
          { key: "priority", label: "Priority", render: (r) => <Badge status={r.priority === "High" ? "Critical" : r.priority} /> },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }, { key: "opened", label: "Opened" },
        ]} rows={CASES} onRowClick={setSel} />
      </Panel>
      <SidePanel open={!!sel} onClose={() => setSel(null)} title={sel ? sel.id : ""} subtitle={sel ? sel.subject : ""}>
        {sel && (
          <>
            <InfoGrid cols={1} rows={[{ label: "Type", value: sel.type }, { label: "Priority", value: sel.priority }, { label: "Linked transactions", value: "4 transactions, \u20A63.1M total" }, { label: "Investigator", value: "Grace Nwosu" }]} />
            <div>
              <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Investigation notes</div>
              <textarea placeholder="Add investigation notes..." style={{ width: "100%", minHeight: 80, border: `1px solid ${C.line}`, borderRadius: 6, padding: 10, fontFamily: fontStack.body, fontSize: 13, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn tone="accent">File SAR</Btn>
              <Btn tone="default">Escalate</Btn>
              <Btn tone="default" onClick={() => setSel(null)}>Close case</Btn>
            </div>
          </>
        )}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compliance: Regulatory Reporting & Licenses
// ---------------------------------------------------------------------------
const REPORTS_REG = [
  { report: "CBN Returns — Monthly", regulator: "CBN", period: "Jul 2026", due: "15 Aug 2026", status: "Pending" },
  { report: "AML Compliance Report", regulator: "NFIU", period: "Q2 2026", due: "31 Jul 2026", status: "Filed" },
  { report: "Large Transaction Report", regulator: "NFIU", period: "Jul 2026", due: "10 Aug 2026", status: "Overdue" },
];
function RegulatoryReportingSection() {
  return (
    <div>
      <PageHeader title="Regulatory Reporting" subtitle="Track filings owed to regulators." />
      <StatGrid items={[{ label: "Due this month", value: "4", tone: "warn" }, { label: "Filed", value: "11", tone: "success" }, { label: "Overdue", value: "1", tone: "danger" }, { label: "Upcoming (30d)", value: "6" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "report", label: "Report" }, { key: "regulator", label: "Regulator" }, { key: "period", label: "Period" }, { key: "due", label: "Due date" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={REPORTS_REG} />
      </Panel>
    </div>
  );
}

const LICENSES = [
  { name: "Payment Solution Service Provider (PSSP)", regulator: "CBN", number: "PSSP-00214", expires: "12 Jan 2027", status: "Active" },
  { name: "Switching & Processing License", regulator: "CBN", number: "SPL-00881", expires: "03 Mar 2026", status: "Expiring soon" },
  { name: "Data Protection Registration", regulator: "NDPC", number: "NDPC-33021", expires: "20 Jun 2026", status: "Active" },
];
function LicensesSection() {
  return (
    <div>
      <PageHeader title="Licenses & Registrations" subtitle="Regulatory licenses required to operate BemcolPay." />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "name", label: "License" }, { key: "regulator", label: "Regulator" },
          { key: "number", label: "Number", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12 }}>{r.number}</span> },
          { key: "expires", label: "Expires" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={LICENSES} />
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finance: Fee Configuration (per merchant)
// ---------------------------------------------------------------------------
const MERCHANT_FEES = [
  { merchant: "Acme Ltd", id: "MRC-8291", plan: "Standard", card: "1.5% + \u20A6100", transfer: "\u20A650 flat", cap: "\u20A62,000", effective: "01 Jan 2026", monthlyVolume: 62000000 },
  { merchant: "BrightPay", id: "MRC-8290", plan: "Volume tier", card: "1.2% + \u20A6100", transfer: "\u20A635 flat", cap: "\u20A61,500", effective: "15 Mar 2026", monthlyVolume: 118000000 },
  { merchant: "Nova Stores", id: "MRC-8289", plan: "Standard", card: "1.5% + \u20A6100", transfer: "\u20A650 flat", cap: "\u20A62,000", effective: "01 Jan 2026", monthlyVolume: 34000000 },
  { merchant: "ABC Traders", id: "MRC-8288", plan: "Custom", card: "1.8% + \u20A6100", transfer: "\u20A675 flat", cap: "\u20A62,500", effective: "22 Jun 2026", monthlyVolume: 21000000 },
  { merchant: "Zenith Retail", id: "MRC-8287", plan: "Standard", card: "1.5% + \u20A6100", transfer: "\u20A650 flat", cap: "\u20A62,000", effective: "01 Jan 2026", monthlyVolume: 47000000 },
];
function FeeInput({ value, suffix, onChange }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 10px", background: C.paper }}>
      <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} style={{ width: 50, border: "none", background: "transparent", fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 13, color: C.ink, outline: "none" }} />
      {suffix && <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 12, color: C.mutedSoft }}>{suffix}</span>}
    </div>
  );
}
const FEE_ROW_DEFS = [
  { key: "card", label: "Card payments" },
  { key: "transfer", label: "Bank transfer" },
  { key: "ussd", label: "USSD" },
  { key: "virtualAccount", label: "Virtual account" },
];
const DEFAULT_FEE_SCHEDULE = {
  card: { pct: 1.5, flat: 100, cap: 2000 },
  transfer: { pct: 0, flat: 50, cap: 0 },
  ussd: { pct: 1.0, flat: 0, cap: 1000 },
  virtualAccount: { pct: 0.5, flat: 0, cap: 500 },
};
function summarizeFeeSchedule(fees) {
  return FEE_ROW_DEFS.map((r) => `${r.label}: ${fees[r.key].pct}% + \u20A6${fees[r.key].flat} (cap \u20A6${fees[r.key].cap})`).join(" · ");
}

// Read-only by default: the schedule renders as plain rows. "Request edit"
// switches the same rows into a draft — nothing is written back to the
// committed schedule until a second admin approves the proposal.
function FeeEditor({ merchant, onBack }) {
  const { proposals, addProposal } = useApprovals();
  const [committed, setCommitted] = useState(DEFAULT_FEE_SCHEDULE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_FEE_SCHEDULE);
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const pending = proposals.find((p) => p.merchantId === merchant.id && p.status === "Pending");
  const update = (key, field, val) => setDraft((f) => ({ ...f, [key]: { ...f[key], [field]: val } }));
  const startEdit = () => { setDraft(committed); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setReason(""); setEffectiveDate(""); };

  const changed = JSON.stringify(draft) !== JSON.stringify(committed);
  // Rough impact preview: blend on the card rate, since it carries the bulk of volume.
  const impact = Math.round(((draft.card.pct - committed.card.pct) / 100) * merchant.monthlyVolume);

  const submit = () => {
    addProposal({
      id: `fee-${merchant.id}-${Date.now()}`,
      group: "Business Rules",
      field: `Fee schedule — ${merchant.merchant}`,
      currentValue: summarizeFeeSchedule(committed),
      proposedValue: summarizeFeeSchedule(draft),
      reason: reason || "No reason provided",
      effectiveDate: effectiveDate || "Not specified",
      merchantId: merchant.id,
      onCommit: () => setCommitted(draft),
    });
    setEditing(false);
    setReason("");
    setEffectiveDate("");
  };

  return (
    <div>
      <BackLink onClick={onBack} label="Fee Configuration" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700 }}>{merchant.merchant}</div>
        <Badge status={merchant.plan === "Custom" ? "Review" : "Active"} />
        <span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.mutedSoft }}>{merchant.id}</span>
      </div>

      {pending && (
        <div style={{ marginBottom: 20 }}>
          <ApprovalCard proposal={pending} />
        </div>
      )}

      <Panel
        title="Transaction fees"
        right={editing
          ? <span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.amber, fontWeight: 600 }}>Draft — not yet submitted</span>
          : <span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.mutedSoft }}>Effective {merchant.effective}</span>}
      >
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ minWidth: 460 }}>
            <thead><tr><th>Type</th><th>Percentage</th><th>Flat fee (\u20A6)</th><th>Cap (\u20A6)</th></tr></thead>
            <tbody>
              {FEE_ROW_DEFS.map((r) => (
                <tr key={r.key}>
                  <td>{r.label}</td>
                  {editing ? (
                    <>
                      <td><FeeInput value={draft[r.key].pct} suffix="%" onChange={(v) => update(r.key, "pct", v)} /></td>
                      <td><FeeInput value={draft[r.key].flat} onChange={(v) => update(r.key, "flat", v)} /></td>
                      <td><FeeInput value={draft[r.key].cap} onChange={(v) => update(r.key, "cap", v)} /></td>
                    </>
                  ) : (
                    <>
                      <td><span style={{ ...moneyStyle, fontSize: 13 }}>{committed[r.key].pct}%</span></td>
                      <td><span style={{ ...moneyStyle, fontSize: 13 }}>{"\u20A6"}{committed[r.key].flat}</span></td>
                      <td><span style={{ ...moneyStyle, fontSize: 13 }}>{"\u20A6"}{committed[r.key].cap}</span></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!editing && (
          <div style={{ marginTop: 18 }}>
            <Btn tone="default" small onClick={startEdit}>Request edit</Btn>
          </div>
        )}

        {editing && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {changed && (
              <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 8, padding: 14 }}>
                <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Estimated monthly revenue impact</div>
                <span style={{ ...moneyStyle, fontSize: 17, fontWeight: 600, color: impact >= 0 ? C.lime : C.rust }}>{impact >= 0 ? "+" : "−"}{"\u20A6"}{Math.abs(impact).toLocaleString()}</span>
                <span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.mutedSoft, marginLeft: 8 }}>vs. current schedule, based on {merchant.merchant}'s trailing monthly volume</span>
              </div>
            )}
            <div>
              <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Reason</div>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Why is this change needed?"
                style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13, color: C.ink, background: "transparent", outline: "none", resize: "vertical" }} />
            </div>
            <div style={{ maxWidth: 220 }}>
              <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Effective date</div>
              <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)}
                style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.money, fontSize: 13, color: C.ink, background: "transparent", outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn tone="default" small onClick={cancelEdit}>Cancel</Btn>
              <Btn tone="primary" small onClick={submit}>Submit for approval</Btn>
            </div>
          </div>
        )}
      </Panel>
      <div style={{ height: 20 }} />
      <Panel title="Change history">
        <Timeline steps={[
          { label: "Custom pricing approved", time: merchant.effective, note: `Card fee set to ${committed.card.pct}%` },
          { label: "Standard plan applied", time: "01 Jan 2026" },
        ]} />
      </Panel>
    </div>
  );
}
function FeeConfigSection() {
  const [sel, setSel] = useState(null);
  if (sel) return <FeeEditor merchant={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHeader title="Fee Configuration" subtitle="Set and manage transaction fees per merchant." actions={[<Btn key="p" tone="default">Manage default plans</Btn>]} />
      <StatGrid items={[{ label: "Standard plan", value: "1,142 merchants" }, { label: "Volume tier", value: "96 merchants" }, { label: "Custom pricing", value: "46 merchants", tone: "warn" }, { label: "Avg. take rate", value: "1.48%" }]} />
      <FilterRow placeholder="Search merchant name or ID" filters={["Plan", "Effective date"]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "merchant", label: "Merchant" },
          { key: "id", label: "ID", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12 }}>{r.id}</span> },
          { key: "plan", label: "Plan", render: (r) => <Badge status={r.plan === "Custom" ? "Review" : "Active"} /> },
          { key: "card", label: "Card fee", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.card}</span> },
          { key: "transfer", label: "Transfer fee", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.transfer}</span> },
          { key: "effective", label: "Effective" },
        ]} rows={MERCHANT_FEES} onRowClick={setSel} />
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finance: Close & GL, FX, Adjustments
// ---------------------------------------------------------------------------
function CloseSection() {
  const tasks = [
    { task: "Reconcile provider settlements", status: "Completed" },
    { task: "Post interest & fee accruals", status: "Completed" },
    { task: "Review unreconciled exceptions", status: "Pending" },
    { task: "Generate trial balance", status: "Pending" },
    { task: "Export to GL", status: "Not started" },
  ];
  return (
    <div>
      <PageHeader title="Month-End Close" subtitle="Close checklist and general ledger export." actions={[<Btn key="e" tone="default">Export to GL</Btn>]} />
      <StatGrid items={[{ label: "Period", value: "Jul 2026" }, { label: "Status", value: "In progress", tone: "warn" }, { label: "Trial balance variance", value: "\u20A60" }, { label: "Days to close", value: "3" }]} />
      <Panel title="Close checklist">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {tasks.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}` }}>
              <span style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.ink }}>{t.task}</span>
              <Badge status={t.status} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

const FX_PAIRS = [
  { pair: "USD/NGN", rate: "1,612.40", change: "+0.4%", exposure: "\u20A64.2M", status: "Healthy" },
  { pair: "GBP/NGN", rate: "2,048.10", change: "-0.2%", exposure: "\u20A6820K", status: "Healthy" },
  { pair: "EUR/NGN", rate: "1,752.60", change: "+0.1%", exposure: "\u20A6410K", status: "Healthy" },
];
function FXSection() {
  return (
    <div>
      <PageHeader title="FX Management" subtitle="Monitor currency exposure and conversion margin." />
      <StatGrid items={[{ label: "Base currency", value: "NGN" }, { label: "Active pairs", value: "3" }, { label: "Today's exposure", value: "\u20A65.4M" }, { label: "Realized FX margin", value: "\u20A6182,000", tone: "success" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "pair", label: "Pair", render: (r) => <span style={{ fontFamily: fontStack.body }}>{r.pair}</span> },
          { key: "rate", label: "Rate", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.rate}</span> },
          { key: "change", label: "24h change", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", color: r.change.startsWith("+") ? C.lime : C.rust }}>{r.change}</span> },
          { key: "exposure", label: "Exposure", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.exposure}</span> },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={FX_PAIRS} />
      </Panel>
    </div>
  );
}

const ADJUSTMENTS = [
  { date: "09 Aug", merchant: "Acme Ltd", type: "Fee waiver", amount: "\u20A612,000", reason: "Goodwill — onboarding delay", approver: "David Okafor" },
  { date: "07 Aug", merchant: "Nova Stores", type: "Credit", amount: "\u20A65,500", reason: "Duplicate charge refund", approver: "Michael Adeyemi" },
  { date: "02 Aug", merchant: "ABC Traders", type: "Debit", amount: "\u20A68,200", reason: "Chargeback recovery", approver: "Michael Adeyemi" },
];
const ADJUSTMENT_TYPES = ["Fee waiver", "Credit", "Debit"];

// Direct entry is gone — a new adjustment is always a proposal. It only
// lands in the log below once a second admin approves it from the queue.
function NewAdjustmentPanel({ open, onClose }) {
  const { addProposal } = useApprovals();
  const [type, setType] = useState("Fee waiver");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const submit = () => {
    addProposal({
      id: `adj-${Date.now()}`,
      group: "Finance",
      field: `${type} — ${merchant || "Unspecified merchant"}`,
      currentValue: "No adjustment",
      proposedValue: amount ? `\u20A6${Number(amount).toLocaleString()}` : "—",
      reason: reason || "No reason provided",
      effectiveDate: "Immediate on approval",
    });
    setType("Fee waiver"); setMerchant(""); setAmount(""); setReason("");
    onClose();
  };

  return (
    <SidePanel open={open} onClose={onClose} title="New adjustment" subtitle="Submitted for a second admin to review and approve.">
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Type</div>
        <div style={{ display: "flex", gap: 8 }}>
          {ADJUSTMENT_TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: "7px 14px", borderRadius: 6, border: `1px solid ${type === t ? C.ink : C.line}`,
              background: type === t ? C.ink : C.raised, color: type === t ? C.raised : C.muted,
              fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Merchant</div>
        <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Merchant name"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13.5, color: C.ink, background: "transparent", outline: "none" }} />
      </div>
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Amount (\u20A6)</div>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 13.5, color: C.ink, background: "transparent", outline: "none" }} />
      </div>
      <div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Reason</div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is this adjustment needed?"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13, color: C.ink, background: "transparent", outline: "none", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <Btn tone="default" onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" onClick={submit}>Submit for approval</Btn>
      </div>
    </SidePanel>
  );
}

function AdjustmentsSection() {
  const { proposals, resolveProposal } = useApprovals();
  const [panelOpen, setPanelOpen] = useState(false);
  const pending = proposals.filter((p) => p.group === "Finance" && p.id && p.id.startsWith("adj-") && p.status === "Pending");

  return (
    <div>
      <PageHeader title="Fee Waivers & Adjustments" subtitle="Log of manual fee and balance adjustments." actions={[<Btn key="n" tone="primary" onClick={() => setPanelOpen(true)}>New adjustment</Btn>]} />
      <StatGrid items={[{ label: "This month", value: "14" }, { label: "Total waived", value: "\u20A6182,000" }, { label: "Total credited", value: "\u20A644,500" }, { label: "Total debited", value: "\u20A631,000" }]} />

      {pending.length > 0 && (
        <>
          <ApprovalQueue
            title="Pending adjustments"
            proposals={pending}
            onApprove={(p) => resolveProposal(p.id, "Approved")}
            onReject={(p) => resolveProposal(p.id, "Rejected")}
          />
          <div style={{ height: 20 }} />
        </>
      )}

      <Panel title="Approved history" padding={0}>
        <DataTable columns={[
          { key: "date", label: "Date" }, { key: "merchant", label: "Merchant" },
          { key: "type", label: "Type", render: (r) => <Badge status={r.type === "Debit" ? "Review" : "Approved"} /> },
          { key: "amount", label: "Amount", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.amount}</span> },
          { key: "reason", label: "Reason" }, { key: "approver", label: "Approved by" },
        ]} rows={ADJUSTMENTS} />
      </Panel>

      <NewAdjustmentPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
const CUSTOMERS = [
  { name: "John Doe", phone: "0803 xxx 1234", email: "john@example.com", merchant: "Acme Ltd", kyc: "Verified", vas: 2 },
  { name: "Ifeoma Chukwu", phone: "0805 xxx 5521", email: "ifeoma@example.com", merchant: "Nova Stores", kyc: "Pending", vas: 1 },
  { name: "Tobi Alade", phone: "0701 xxx 9087", email: "tobi@example.com", merchant: "Zenith Retail", kyc: "Verified", vas: 3 },
];
const VIRTUAL_ACCOUNTS = [
  { account: "9021445871", bank: "Providus Bank", provider: "Provider A", owner: "John Doe", status: "Active" },
  { account: "8834221190", bank: "Wema Bank", provider: "Provider B", owner: "Ifeoma Chukwu", status: "Active" },
  { account: "7712098345", bank: "Providus Bank", provider: "Provider A", owner: "Tobi Alade", status: "Dormant" },
];
function CustomersSection() {
  const [tab, setTab] = useState("Search");
  return (
    <div>
      <PageHeader title="Customers" subtitle="End-user accounts and virtual accounts across all merchants." />
      <Tabs tabs={["Search", "Virtual Accounts"]} active={tab} onChange={setTab} />
      {tab === "Search" && (
        <>
          <FilterRow placeholder="Search by name, phone or email" filters={["Merchant", "KYC status"]} />
          <Panel padding={0}>
            <DataTable columns={[
              { key: "name", label: "Name" }, { key: "phone", label: "Phone", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12 }}>{r.phone}</span> },
              { key: "email", label: "Email" }, { key: "merchant", label: "Merchant" },
              { key: "kyc", label: "KYC", render: (r) => <Badge status={r.kyc} /> },
              { key: "vas", label: "Virtual accounts" },
            ]} rows={CUSTOMERS} />
          </Panel>
        </>
      )}
      {tab === "Virtual Accounts" && (
        <>
          <StatGrid items={[{ label: "Total VAs", value: "48,204" }, { label: "Active", value: "41,880", tone: "success" }, { label: "Dormant", value: "6,324", tone: "warn" }, { label: "Providers", value: "2" }]} />
          <Panel padding={0}>
            <DataTable columns={[
              { key: "account", label: "Account", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12 }}>{r.account}</span> },
              { key: "bank", label: "Bank" }, { key: "provider", label: "Provider" }, { key: "owner", label: "Owner" },
              { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            ]} rows={VIRTUAL_ACCOUNTS} />
          </Panel>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insights (BI)
// ---------------------------------------------------------------------------
function InsightsSection() {
  const [tab, setTab] = useState("Cohorts");
  const cohorts = [
    { cohort: "Feb 2026", m0: 100, m1: 78, m2: 64, m3: 58 },
    { cohort: "Mar 2026", m0: 100, m1: 81, m2: 69, m3: 0 },
    { cohort: "Apr 2026", m0: 100, m1: 84, m2: 0, m3: 0 },
    { cohort: "May 2026", m0: 100, m1: 0, m2: 0, m3: 0 },
  ];
  const chargebacks = [
    { merchant: "Acme Ltd", ratio: "0.08%", threshold: "0.65%", status: "Healthy" },
    { merchant: "Nova Stores", ratio: "0.42%", threshold: "0.65%", status: "Review" },
    { merchant: "ABC Traders", ratio: "0.91%", threshold: "0.65%", status: "Critical" },
  ];
  const providerTrend = [
    { provider: "Provider A", trend: [98, 97, 96, 94, 92, 95, 97] },
    { provider: "Provider B", trend: [99, 99, 98, 99, 98, 99, 99] },
  ];
  return (
    <div>
      <PageHeader title="Insights" subtitle="Business intelligence across BemcolPay." />
      <Tabs tabs={["Cohorts", "Chargebacks", "Provider Trends", "Exec Summary"]} active={tab} onChange={setTab} />
      {tab === "Cohorts" && (
        <Panel title="Merchant retention by signup cohort">
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ minWidth: 400 }}>
              <thead><tr><th>Cohort</th><th>Month 0</th><th>Month 1</th><th>Month 2</th><th>Month 3</th></tr></thead>
              <tbody>
                {cohorts.map((c, i) => (
                  <tr key={i}>
                    <td>{c.cohort}</td>
                    {[c.m0, c.m1, c.m2, c.m3].map((v, j) => (
                      <td key={j}>{v > 0 ? <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", color: v >= 70 ? C.lime : v >= 40 ? C.amber : C.rust }}>{v}%</span> : <span style={{ color: C.mutedSoft }}>—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {tab === "Chargebacks" && (
        <Panel title="Chargeback ratio monitoring" padding={0}>
          <DataTable columns={[
            { key: "merchant", label: "Merchant" },
            { key: "ratio", label: "Chargeback ratio", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.ratio}</span> },
            { key: "threshold", label: "Network threshold", render: (r) => <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", color: C.mutedSoft }}>{r.threshold}</span> },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={chargebacks} />
        </Panel>
      )}
      {tab === "Provider Trends" && (
        <Panel title="Success rate, last 7 days">
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {providerTrend.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: fontStack.body, fontSize: 13, fontWeight: 600, color: C.ink }}>{p.provider}</span>
                  <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: C.mutedSoft }}>{p.trend[p.trend.length - 1]}%</span>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 40 }}>
                  {p.trend.map((v, j) => (
                    <div key={j} style={{ flex: 1, background: v >= 96 ? C.lime : v >= 93 ? C.amber : C.rust, height: `${((v - 85) / 15) * 100}%`, borderRadius: 2 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {tab === "Exec Summary" && (
        <Panel title="Weekly executive summary" right={<Btn tone="default" small>Download PDF</Btn>}>
          <div style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.muted, lineHeight: 1.7 }}>
            Transaction volume grew 14.2% week-over-week to \u20A6248.6M, driven by continued growth from Standard-tier merchants. Success rate held at 98.72%. Provider A's elevated failure rate on Aug 10 is under active investigation. Chargeback ratio for ABC Traders has crossed the network threshold and is flagged for review. Compliance closed 27 cases this month with 3 SARs filed.
          </div>
        </Panel>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Infrastructure
// ---------------------------------------------------------------------------
function InfraSection() {
  const [tab, setTab] = useState("Deployments");
  const jobs = [
    { queue: "settlement-batch", pending: 12, processing: 2, failed: 0, lastRun: "2 mins ago" },
    { queue: "webhook-delivery", pending: 24, processing: 4, failed: 3, lastRun: "Just now" },
    { queue: "reconciliation-match", pending: 0, processing: 1, failed: 0, lastRun: "5 mins ago" },
  ];
  const certs = [
    { name: "api.bemcolpay.com", issuer: "Let's Encrypt", expires: "02 Sep 2026", status: "Expiring soon" },
    { name: "webhook signing cert", issuer: "Internal CA", expires: "14 Dec 2026", status: "Active" },
    { name: "admin.bemcolpay.com", issuer: "Let's Encrypt", expires: "20 Oct 2026", status: "Active" },
  ];
  const rateLimits = [
    { key: "Acme Ltd — live key", limit: "500 req/min", usage: 62 },
    { key: "Nova Stores — live key", limit: "200 req/min", usage: 88 },
    { key: "ABC Traders — live key", limit: "100 req/min", usage: 34 },
  ];
  return (
    <div>
      <PageHeader title="Infrastructure" subtitle="Deployment history, job queues and platform limits." />
      <Tabs tabs={["Deployments", "Job Queues", "Certificates", "Rate Limits"]} active={tab} onChange={setTab} />
      {tab === "Deployments" && (
        <Panel title="Recent deployments">
          <Timeline steps={[
            { label: "v2.14.0 deployed to production", time: "Today, 06:02", note: "David Okafor — Ledger service, webhook retries" },
            { label: "v2.13.4 deployed to production", time: "Yesterday, 21:40", note: "Hotfix: reconciliation matching bug" },
            { label: "v2.13.3 deployed to staging", time: "Yesterday, 15:10" },
          ]} />
        </Panel>
      )}
      {tab === "Job Queues" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "queue", label: "Queue", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.queue}</span> },
            { key: "pending", label: "Pending" }, { key: "processing", label: "Processing" },
            { key: "failed", label: "Failed", render: (r) => <span style={{ color: r.failed > 0 ? C.rust : C.mutedSoft, fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums" }}>{r.failed}</span> },
            { key: "lastRun", label: "Last run" },
          ]} rows={jobs} />
        </Panel>
      )}
      {tab === "Certificates" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "name", label: "Certificate" }, { key: "issuer", label: "Issuer" }, { key: "expires", label: "Expires" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={certs} />
        </Panel>
      )}
      {tab === "Rate Limits" && (
        <Panel title="API rate limit usage">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {rateLimits.map((r, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: fontStack.body, fontSize: 13, color: C.ink }}>{r.key}</span>
                  <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 12, color: C.mutedSoft }}>{r.usage}% of {r.limit}</span>
                </div>
                <div style={{ height: 6, background: C.lineSoft, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${r.usage}%`, background: r.usage > 80 ? C.rust : r.usage > 60 ? C.amber : C.lime, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Operations: Ops Queue, Runbooks, Bulk Operations, Feature Flags
// ---------------------------------------------------------------------------
const OPS_QUEUE = [
  { item: "Settlement exception — STL-8204", type: "Settlement exception", assignee: "Sarah Bello", age: "6h", priority: "High" },
  { item: "Ledger break — Nova Wallet", type: "Ledger break", assignee: "Unassigned", age: "1d", priority: "Medium" },
  { item: "KYC escalation — ABC Traders", type: "KYC escalation", assignee: "Grace Nwosu", age: "2d", priority: "High" },
];
function OpsQueueSection() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <PageHeader title="Ops Queue" subtitle="Internal exceptions requiring manual review." />
      <StatGrid items={[{ label: "Open", value: "11" }, { label: "SLA breached", value: "2", tone: "danger" }, { label: "Auto-resolved today", value: "34", tone: "success" }, { label: "Assigned to me", value: "3" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "item", label: "Item" }, { key: "type", label: "Type" }, { key: "assignee", label: "Assignee" }, { key: "age", label: "Age" },
          { key: "priority", label: "Priority", render: (r) => <Badge status={r.priority === "High" ? "Critical" : r.priority} /> },
        ]} rows={OPS_QUEUE} onRowClick={setSel} />
      </Panel>
      <SidePanel open={!!sel} onClose={() => setSel(null)} title={sel ? sel.item : ""} subtitle={sel ? sel.type : ""}>
        {sel && (
          <>
            <InfoGrid cols={1} rows={[{ label: "Assignee", value: sel.assignee }, { label: "Age", value: sel.age }, { label: "Priority", value: sel.priority }]} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn tone="accent">Assign to me</Btn>
              <Btn tone="default" onClick={() => setSel(null)}>Mark resolved</Btn>
            </div>
          </>
        )}
      </SidePanel>
    </div>
  );
}

const RUNBOOKS = [
  { title: "Provider outage response", category: "Incidents", updated: "3 Aug 2026", owner: "Operations" },
  { title: "Settlement failure escalation", category: "Finance", updated: "28 Jul 2026", owner: "Finance" },
  { title: "Suspected fraud freeze procedure", category: "Risk", updated: "15 Jul 2026", owner: "Risk" },
];
function RunbooksSection() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <PageHeader title="Runbooks" subtitle="Playbooks for common operational incidents." />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "title", label: "Runbook" }, { key: "category", label: "Category" }, { key: "owner", label: "Owner" }, { key: "updated", label: "Last updated" },
        ]} rows={RUNBOOKS} onRowClick={setSel} />
      </Panel>
      <SidePanel open={!!sel} onClose={() => setSel(null)} title={sel ? sel.title : ""} subtitle={sel ? sel.category : ""}>
        {sel && (
          <Timeline steps={[
            { label: "Confirm the alert", time: "Step 1", note: "Check System Health and provider dashboards." },
            { label: "Notify stakeholders", time: "Step 2", note: "Post in #ops-incidents, page on-call if Major." },
            { label: "Contain impact", time: "Step 3", note: "Pause affected rails if failure rate exceeds 10%." },
            { label: "Resolve and document", time: "Step 4", note: "Close incident, write postmortem within 48h." },
          ]} />
        )}
      </SidePanel>
    </div>
  );
}

function BulkOperationsSection() {
  const types = ["Bulk payouts", "Bulk KYC approval", "Scheduled reconciliation", "Bulk fee update"];
  const [type, setType] = useState("Bulk payouts");
  const batches = [
    { id: "BATCH-2291", type: "Bulk payouts", items: 214, status: "Completed", started: "Today, 06:00" },
    { id: "BATCH-2290", type: "Bulk KYC approval", items: 38, status: "Processing", started: "Today, 09:12" },
    { id: "BATCH-2288", type: "Scheduled reconciliation", items: 18421, status: "Completed", started: "Today, 04:00" },
  ];
  return (
    <div>
      <PageHeader title="Bulk Operations" subtitle="Run and monitor batch jobs across the platform." />
      <Panel title="Start a batch operation">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: "8px 14px", borderRadius: 20, border: `1px solid ${type === t ? C.blue : C.line}`,
              background: type === t ? C.blueSoft : C.raised, color: type === t ? C.blueDeep : C.muted,
              fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
        <Btn tone="accent">Upload file & run {type}</Btn>
      </Panel>
      <div style={{ height: 20 }} />
      <Panel title="Recent batches" padding={0}>
        <DataTable columns={[
          { key: "id", label: "Batch", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.id}</span> },
          { key: "type", label: "Type" }, { key: "items", label: "Items" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }, { key: "started", label: "Started" },
        ]} rows={batches} />
      </Panel>
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: 38, height: 22, borderRadius: 12, border: "none", cursor: "pointer", background: checked ? C.lime : C.line, position: "relative", padding: 0, flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: C.raised, transition: "left 150ms", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

const FLAG_DEFS = [
  { key: "newLedgerEngine", name: "New ledger engine", desc: "Route ledger writes through v2 double-entry engine.", rollout: 25, env: "Live" },
  { key: "instantSettlement", name: "Instant settlement", desc: "Allow eligible merchants to settle same-day.", rollout: 10, env: "Live" },
  { key: "riskMlScoring", name: "ML risk scoring", desc: "Use the new model for transaction risk scores.", rollout: 100, env: "Test" },
  { key: "bulkFeeUpdates", name: "Bulk fee updates", desc: "Enable the bulk fee update batch operation.", rollout: 0, env: "Test" },
];
function FeatureFlagsSection() {
  const [flags, setFlags] = useState({ newLedgerEngine: true, instantSettlement: true, riskMlScoring: true, bulkFeeUpdates: false });
  return (
    <div>
      <PageHeader title="Feature Flags" subtitle="Control platform rollouts and configuration." />
      <Panel>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FLAG_DEFS.map((f, i) => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 4px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}`, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: fontStack.body, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{f.name}</div>
                <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{f.desc}</div>
              </div>
              <span style={{ fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 11.5, color: C.mutedSoft }}>{f.rollout}% · {f.env}</span>
              <Switch checked={flags[f.key]} onChange={(v) => setFlags((s) => ({ ...s, [f.key]: v }))} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Access extensions: Permissions matrix, Security
// ---------------------------------------------------------------------------
const PERM_AREAS = ["Merchants", "Transactions", "Settlements", "Risk", "Compliance", "Finance", "Access"];
const PERM_ROLES = ["Super Admin", "Operations", "Finance", "Compliance"];

// A role's access to an area is sensitive enough to go through approval —
// clicking a cell proposes the flip rather than applying it immediately.
function PermissionChangeModal({ open, onClose, area, role, grantedNow, onSubmit }) {
  const [reason, setReason] = useState("");
  if (!open) return null;
  const action = grantedNow ? "Revoke" : "Grant";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(17,22,29,0.45)" }} />
      <div style={{ position: "relative", background: C.raised, borderRadius: 10, padding: 24, width: 400, maxWidth: "100%" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{action} access — {area}</div>
        <div style={{ fontFamily: fontStack.body, fontSize: 13.5, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
          {action === "Revoke" ? `Remove ${role}'s access to ${area}. This is submitted for a second admin to approve.` : `Give ${role} access to ${area}. This is submitted for a second admin to approve.`}
        </div>
        <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Reason</div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Why is this change needed?"
          style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13, color: C.ink, background: "transparent", outline: "none", resize: "vertical", marginBottom: 18 }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn tone="default" onClick={onClose}>Cancel</Btn>
          <Btn tone="primary" onClick={() => { onSubmit(reason); onClose(); }}>Submit for approval</Btn>
        </div>
      </div>
    </div>
  );
}

function PermissionsTab() {
  const { proposals, addProposal } = useApprovals();
  const [matrix, setMatrix] = useState(() => {
    const m = {};
    PERM_AREAS.forEach((area) => {
      m[area] = {};
      PERM_ROLES.forEach((role) => {
        m[area][role] = role === "Super Admin" ? true
          : area === "Finance" ? role === "Finance"
          : area === "Compliance" ? role === "Compliance"
          : area === "Risk" ? (role === "Operations" || role === "Compliance")
          : true;
      });
    });
    return m;
  });
  const [target, setTarget] = useState(null); // { area, role }

  const pendingKey = (area, role) => `perm-${area}-${role}`;
  const isPending = (area, role) => proposals.some((p) => p.id === undefined ? false : p.id.startsWith(pendingKey(area, role)) && p.status === "Pending");

  const propose = (reason) => {
    const { area, role } = target;
    const grantedNow = matrix[area][role];
    addProposal({
      id: `${pendingKey(area, role)}-${Date.now()}`,
      group: "System",
      field: `${role} access — ${area}`,
      currentValue: grantedNow ? "Granted" : "Not granted",
      proposedValue: grantedNow ? "Revoked" : "Granted",
      reason: reason || "No reason provided",
      effectiveDate: "Immediate on approval",
      onCommit: () => setMatrix((m) => ({ ...m, [area]: { ...m[area], [role]: !m[area][role] } })),
    });
    setTarget(null);
  };

  return (
    <>
      <Panel title="Permission matrix" right={<span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.mutedSoft }}>Changes require a second admin's approval</span>}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ minWidth: 460 }}>
            <thead><tr><th>Area</th>{PERM_ROLES.map((r) => <th key={r}>{r}</th>)}</tr></thead>
            <tbody>
              {PERM_AREAS.map((area) => (
                <tr key={area}>
                  <td style={{ fontWeight: 600 }}>{area}</td>
                  {PERM_ROLES.map((role) => {
                    const pending = role !== "Super Admin" && isPending(area, role);
                    return (
                      <td key={role}>
                        <button
                          onClick={() => role !== "Super Admin" && !pending && setTarget({ area, role })}
                          disabled={role === "Super Admin" || pending}
                          title={pending ? "Change pending approval" : undefined}
                          style={{
                            width: 22, height: 22, borderRadius: 5, border: `1px solid ${pending ? C.amber : matrix[area][role] ? C.blue : C.line}`,
                            background: pending ? C.amberSoft : matrix[area][role] ? C.blueSoft : C.raised, cursor: (role === "Super Admin" || pending) ? "default" : "pointer",
                            color: pending ? C.amber : C.blueDeep, fontSize: 13, lineHeight: "20px",
                          }}
                        >{pending ? "…" : matrix[area][role] ? "✓" : ""}</button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <PermissionChangeModal
        open={!!target}
        onClose={() => setTarget(null)}
        area={target?.area}
        role={target?.role}
        grantedNow={target ? matrix[target.area][target.role] : false}
        onSubmit={propose}
      />
    </>
  );
}

const SESSIONS = [
  { admin: "David Okafor", device: "MacBook Pro — Chrome", location: "Lagos, NG", started: "Just now" },
  { admin: "Sarah Bello", device: "iPhone — Safari", location: "Lagos, NG", started: "4 mins ago" },
  { admin: "Michael Adeyemi", device: "Windows — Edge", location: "Abuja, NG", started: "2 hrs ago" },
];
function SecurityTab() {
  return (
    <>
      <StatGrid items={[{ label: "2FA enabled", value: "94%", tone: "success" }, { label: "IP allowlist", value: "Active", tone: "success" }, { label: "Active sessions", value: "3" }, { label: "Failed logins (24h)", value: "2", tone: "warn" }]} />
      <div style={{ marginBottom: 20 }}><SecureAccessNotice /></div>
      <Panel title="Active sessions" padding={0}>
        <DataTable columns={[
          { key: "admin", label: "Admin" }, { key: "device", label: "Device" }, { key: "location", label: "Location" }, { key: "started", label: "Started" },
          { key: "action", label: "", render: () => <span style={{ color: C.rust, fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Revoke</span> },
        ]} rows={SESSIONS} />
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shell: Sidebar, Topbar, App
// ---------------------------------------------------------------------------
// IA per the target spec: Command Center → Operations → Business Rules →
// Products → Risk & Compliance → Finance → Support → System.
//
// Assumption flagged for review: the spec names a top-level "Products" group
// but Phase 1's instructions didn't enumerate its contents. It's stood up
// here with placeholder pages for the merchant-facing product surface
// (virtual cards, payment methods, cross-border corridors) — swap these for
// whatever the real product catalog turns out to be.
const NAV = [
  { label: "Command Center", key: "overview", icon: LayoutDashboard },

  { label: "Operations", items: [
    { label: "Merchants", key: "merchants", icon: Users },
    { label: "Developers", key: "devaccounts", icon: Code },
    { label: "Applications", key: "applications", icon: UserPlus },
    { label: "Customers", key: "customers", icon: UserCircle },
    { label: "Partners", key: "partners", icon: Building2 },
    { label: "Bank Partners", key: "bankpartners", icon: Landmark },
    { label: "Transactions", key: "transactions", icon: ArrowLeftRight },
    { label: "Wallets & Ledger", key: "ledger", icon: BookOpen },
    { label: "Settlements", key: "settlements", icon: Landmark },
    { label: "Refunds", key: "refunds", icon: RotateCcw },
    { label: "Disputes", key: "disputes", icon: Scale },
    { label: "Chargebacks", key: "chargebacks", icon: Ban },
    { label: "API Activity", key: "developers", icon: Activity },
    { label: "Ops Queue", key: "opsqueue", icon: ListChecks },
    { label: "Bulk Operations", key: "bulkops", icon: Layers },
  ] },

  { label: "Business Rules", items: [
    { label: "Fee Configuration", key: "fees", icon: Percent },
    { label: "Charge Engine", key: "chargeengine", icon: Zap },
    { label: "Cashback Engine", key: "cashbackengine", icon: Gift },
    { label: "Developer Commission Engine", key: "commissionengine", icon: Percent },
    { label: "Split Accounts", key: "splitaccounts", icon: Split },
    { label: "Limits", key: "limits", icon: Gauge },
  ] },

  { label: "Products", items: [
    { label: "Virtual Cards", key: "virtualcards", icon: CreditCard },
    { label: "Payment Methods", key: "paymentmethods", icon: Banknote },
    { label: "Payment Corridors", key: "corridors", icon: Globe2 },
  ] },

  { label: "Risk & Compliance", items: [
    { label: "Screening", key: "screening", icon: Search },
    { label: "Case Management", key: "cases", icon: FolderOpen },
    { label: "KYC/KYB", key: "kyc", icon: ShieldCheck },
    { label: "Licenses", key: "licenses", icon: Award },
    { label: "Fraud Rules", key: "fraudrules", icon: ShieldAlert },
    { label: "Restricted Businesses", key: "restrictedbiz", icon: Ban },
    { label: "Risk Center", key: "risk", icon: AlertTriangle },
    { label: "Incidents", key: "incidents", icon: AlertOctagon },
    { label: "Reporting", key: "regreporting", icon: FileBarChart },
  ] },

  { label: "Finance", items: [
    { label: "Reconciliation", key: "reconciliation", icon: GitCompare },
    { label: "Adjustments", key: "adjustments", icon: SlidersHorizontal },
    { label: "FX", key: "fx", icon: RefreshCw },
    { label: "Bank Statements", key: "bankstatements", icon: FileText },
    { label: "Tax & Fee Reports", key: "taxfeereports", icon: Receipt },
    { label: "Treasury", key: "treasury", icon: Wallet },
    { label: "Close & GL", key: "close", icon: CheckSquare },
    { label: "Reports", key: "reports", icon: FileBarChart },
  ] },

  { label: "Support", items: [
    { label: "Merchant Support", key: "support", icon: Headphones },
    { label: "Developer Support", key: "devsupport", icon: MessagesSquare },
    { label: "Internal Tickets", key: "internaltickets", icon: Ticket },
    { label: "Knowledge Base", key: "knowledgebase", icon: BookOpen },
  ] },

  { label: "System", items: [
    { label: "Admin Users & Permissions", key: "access", icon: Lock },
    { label: "Audit Trail", key: "audittrail", icon: ScrollText },
    { label: "Approval Center", key: "approvalcenter", icon: CheckCircle2 },
    { label: "Notifications", key: "notifications", icon: Bell },
    { label: "Settings", key: "settings", icon: Settings },
    { label: "System Status", key: "status", icon: Activity },
    { label: "Infrastructure", key: "infrastructure", icon: Activity },
    { label: "Insights", key: "insights", icon: BarChart3 },
    { label: "Runbooks", key: "runbooks", icon: ClipboardList },
    { label: "Feature Flags", key: "featureflags", icon: Flag },
  ] },
];

// ---------------------------------------------------------------------------
// Phase 3 — Developers (account type, parallel to Merchants)
// ---------------------------------------------------------------------------
const DEVELOPERS = [
  { name: "PayFlow Technologies", id: "DEV-3021", status: "Active", tier: "Growth", apps: 3, volume: "\u20A618.2M", commission: "0.35%", joined: "12 Feb 2026" },
  { name: "Kudi Logistics API", id: "DEV-3018", status: "Active", tier: "Scale", apps: 1, volume: "\u20A642.6M", commission: "0.28%", joined: "03 Nov 2025" },
  { name: "Chowdeck Integrations", id: "DEV-3011", status: "Under review", tier: "Starter", apps: 2, volume: "\u20A62.1M", commission: "0.50%", joined: "21 May 2026" },
  { name: "Sabi Fintech Labs", id: "DEV-3004", status: "Restricted", tier: "Starter", apps: 1, volume: "\u20A6640,000", commission: "0.50%", joined: "18 Jan 2026" },
];
const DEV_APPS = [
  { app: "Checkout Web SDK", env: "Live", calls30d: "812,400", status: "Active" },
  { app: "Payout Automation", env: "Live", calls30d: "94,200", status: "Active" },
  { app: "Sandbox Test App", env: "Test", calls30d: "6,120", status: "Active" },
];
function DeveloperAccountsSection() {
  const [selected, setSelected] = useState(null);
  if (selected) return <DeveloperDetail developer={selected} onBack={() => setSelected(null)} />;
  return (
    <div>
      <PageHeader title="Developers" subtitle="Third-party developers and fintechs building on the BemcolPay API." actions={[<Btn key="e">Export</Btn>, <Btn key="a" tone="accent">Invite developer</Btn>]} />
      <StatGrid items={[{ label: "Total", value: "46" }, { label: "Active", value: "39" }, { label: "Under review", value: "5", tone: "warn" }, { label: "Restricted", value: "2", tone: "danger" }]} />
      <FilterRow placeholder="Search developer name, ID, email..." filters={["Status", "Tier", "Date onboarded"]} />
      <Panel padding={0}>
        <DataTable
          columns={[
            { key: "name", label: "Developer" },
            { key: "id", label: "ID", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted }}>{r.id}</span> },
            { key: "tier", label: "Tier" },
            { key: "apps", label: "Apps" },
            { key: "volume", label: "Volume", render: (r) => <span style={moneyStyle}>{r.volume}</span> },
            { key: "commission", label: "Commission", render: (r) => <span style={moneyStyle}>{r.commission}</span> },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]}
          rows={DEVELOPERS}
          onRowClick={setSelected}
        />
      </Panel>
    </div>
  );
}
function DeveloperDetail({ developer, onBack }) {
  const [tab, setTab] = useState("Overview");
  const [showKey, setShowKey] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  return (
    <div>
      <BackLink onClick={onBack} label="Developers" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontFamily: fontStack.display, fontSize: 22, fontWeight: 700, color: C.ink }}>{developer.name}</div>
            <Badge status={developer.status} />
            <Badge status={`${developer.tier} tier`} />
          </div>
          <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft, marginTop: 4 }}>{developer.id} \u00B7 Onboarded {developer.joined}</div>
        </div>
        <div style={{ position: "relative" }}>
          <Btn tone="default" onClick={() => setMenuOpen((v) => !v)}>More <ChevronDown size={13} style={{ display: "inline", marginLeft: 4 }} /></Btn>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: "110%", background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", width: 200, zIndex: 10, overflow: "hidden" }}>
              {["Restrict account", "Suspend account", "Regenerate keys"].map((a) => (
                <button key={a} onClick={() => { setConfirm(a); setMenuOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: fontStack.body, fontSize: 13, color: C.rust }}>{a}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <StatGrid items={[{ label: "Apps", value: String(developer.apps) }, { label: "API calls (30d)", value: "912,720" }, { label: "Success rate", value: "99.1%" }, { label: "Commission earned (30d)", value: "\u20A663,700" }]} />

      <Tabs tabs={["Overview", "Apps", "API Keys", "Commission", "Webhooks"]} active={tab} onChange={setTab} />
      {tab === "Overview" && (
        <div className="grid-split-equal">
          <Panel title="Developer information">
            <InfoGrid rows={[{ label: "Contact", value: `devs@${developer.name.toLowerCase().replace(/[^a-z]/g, "")}.com` }, { label: "Integration type", value: "REST API" }, { label: "Commission model", value: "Per-transaction" }, { label: "Monthly volume", value: developer.volume }]} />
          </Panel>
          <Panel title="Recent activity">
            <Timeline steps={[{ label: "New live API key issued", time: "3 Aug, 10:12" }, { label: "App promoted to Live", time: "22 Jul, 15:40" }, { label: "Commission tier reviewed", time: "01 Jul, 09:00" }]} />
          </Panel>
        </div>
      )}
      {tab === "Apps" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "app", label: "App" }, { key: "env", label: "Environment" }, { key: "calls30d", label: "Calls (30d)", render: (r) => <span style={moneyStyle}>{r.calls30d}</span> },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={DEV_APPS} />
        </Panel>
      )}
      {tab === "API Keys" && (
        <Panel title="Live API key">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: fontStack.mono, fontSize: 13, color: C.ink }}>{showKey ? "sk_live_7hN2pQ81vXe" : "sk_live_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            <button onClick={() => setShowKey((v) => !v)} style={{ background: "none", border: "none", color: C.blue, cursor: "pointer", fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600 }}>{showKey ? "Hide" : "Reveal"}</button>
          </div>
          <Btn tone="default" small onClick={() => setConfirm("Regenerate keys")}>Regenerate</Btn>
        </Panel>
      )}
      {tab === "Commission" && (
        <Panel title="Commission" right={<span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.blue, fontWeight: 600 }}>Edit in Developer Commission Engine \u2192</span>}>
          <InfoGrid rows={[{ label: "Model", value: "Per-transaction" }, { label: "Rate", value: developer.commission, mono: true }, { label: "Cap", value: "\u20A65,000", mono: true }, { label: "Effective", value: "01 Jan 2026" }]} />
        </Panel>
      )}
      {tab === "Webhooks" && (
        <Panel padding={0}><DataTable columns={[
          { key: "event", label: "Event", render: (r) => <span style={{ fontFamily: fontStack.mono, fontSize: 12 }}>{r.event}</span> }, { key: "merchant", label: "Merchant" }, { key: "attempts", label: "Attempts" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={WEBHOOKS} /></Panel>
      )}

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} title={confirm} body={`This action affects ${developer.name}'s ability to use the BemcolPay API. This cannot be undone automatically.`} confirmLabel={confirm} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Cashback Engine
// ---------------------------------------------------------------------------
const CASHBACK_TIERS = [
  { tier: "Bronze", kpi: "\u20A60 \u2013 \u20A65M monthly volume", rate: "0.25%", merchants: 620 },
  { tier: "Silver", kpi: "\u20A65M \u2013 \u20A620M monthly volume", rate: "0.50%", merchants: 340 },
  { tier: "Gold", kpi: "\u20A620M \u2013 \u20A6100M monthly volume", rate: "0.75%", merchants: 112 },
  { tier: "Platinum", kpi: "\u20A6100M+ monthly volume", rate: "1.00%", merchants: 18 },
];
const MERCHANT_REWARDS = [
  { merchant: "Nova Stores", tier: "Silver", earned: "\u20A6142,000", redeemed: "\u20A698,000", balance: "\u20A644,000" },
  { merchant: "Acme Ltd", tier: "Gold", earned: "\u20A6620,000", redeemed: "\u20A6620,000", balance: "\u20A60" },
  { merchant: "BrightPay", tier: "Platinum", earned: "\u20A61,240,000", redeemed: "\u20A6900,000", balance: "\u20A6340,000" },
  { merchant: "Zenith Retail", tier: "Bronze", earned: "\u20A618,500", redeemed: "\u20A60", balance: "\u20A618,500" },
];
const CASHBACK_WITHDRAWALS = [
  { id: "CBW-2201", merchant: "BrightPay", amount: "\u20A6340,000", requested: "10 Aug", status: "Pending" },
  { id: "CBW-2198", merchant: "Nova Stores", amount: "\u20A644,000", requested: "09 Aug", status: "Pending" },
  { id: "CBW-2190", merchant: "Acme Ltd", amount: "\u20A6620,000", requested: "02 Aug", status: "Paid" },
];
function CashbackEngineSection() {
  const [tab, setTab] = useState("Merchant Rewards");
  const [editTier, setEditTier] = useState(null);
  const [selWithdrawal, setSelWithdrawal] = useState(null);
  const { addProposal, proposals, resolveProposal } = useApprovals();
  const pending = proposals.filter((p) => p.group === "Business Rules" && p.id && p.id.startsWith("cb-") && p.status === "Pending");

  return (
    <div>
      <PageHeader title="Cashback Engine" subtitle="Merchant rewards, KPI-based tier thresholds, and cashback withdrawals." />
      <StatGrid items={[{ label: "Active rewards balance", value: "\u20A6402,500" }, { label: "Paid this month", value: "\u20A61.6M", tone: "success" }, { label: "Pending withdrawals", value: "2", tone: "warn" }, { label: "Enrolled merchants", value: "1,090" }]} />
      <Tabs tabs={["Merchant Rewards", "KPI Tier Builder", "Withdrawal Queue"]} active={tab} onChange={setTab} />

      {tab === "Merchant Rewards" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "merchant", label: "Merchant" }, { key: "tier", label: "Tier", render: (r) => <Badge status={r.tier} /> },
            { key: "earned", label: "Earned", render: (r) => <span style={moneyStyle}>{r.earned}</span> },
            { key: "redeemed", label: "Redeemed", render: (r) => <span style={moneyStyle}>{r.redeemed}</span> },
            { key: "balance", label: "Balance", render: (r) => <span style={moneyStyle}>{r.balance}</span> },
          ]} rows={MERCHANT_REWARDS} />
        </Panel>
      )}

      {tab === "KPI Tier Builder" && (
        <>
          {pending.length > 0 && (
            <>
              <ApprovalQueue title="Pending tier changes" proposals={pending} onApprove={(p) => resolveProposal(p.id, "Approved")} onReject={(p) => resolveProposal(p.id, "Rejected")} />
              <div style={{ height: 20 }} />
            </>
          )}
          <Panel padding={0}>
            <DataTable columns={[
              { key: "tier", label: "Tier" }, { key: "kpi", label: "KPI threshold" },
              { key: "rate", label: "Cashback rate", render: (r) => <span style={moneyStyle}>{r.rate}</span> },
              { key: "merchants", label: "Merchants" },
              { key: "_edit", label: "", render: (r) => <button onClick={() => setEditTier(r)} style={{ background: "none", border: "none", color: C.blue, cursor: "pointer", fontFamily: fontStack.body, fontWeight: 600, fontSize: 12.5 }}>Propose change</button> },
            ]} rows={CASHBACK_TIERS} />
          </Panel>
        </>
      )}

      {tab === "Withdrawal Queue" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "id", label: "Request", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.id}</span> },
            { key: "merchant", label: "Merchant" }, { key: "amount", label: "Amount", render: (r) => <span style={moneyStyle}>{r.amount}</span> },
            { key: "requested", label: "Requested" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={CASHBACK_WITHDRAWALS} onRowClick={setSelWithdrawal} />
        </Panel>
      )}

      <ProposeChangePanel
        open={!!editTier} onClose={() => setEditTier(null)}
        field={editTier ? `${editTier.tier} cashback rate` : ""} currentValue={editTier ? editTier.rate : ""}
        onSubmit={({ proposedValue, reason, effectiveDate }) => addProposal({ id: `cb-${Date.now()}`, group: "Business Rules", field: `${editTier.tier} cashback rate`, currentValue: editTier.rate, proposedValue, reason, effectiveDate })}
      />

      <SidePanel open={!!selWithdrawal} onClose={() => setSelWithdrawal(null)} title={selWithdrawal ? selWithdrawal.id : ""} subtitle={selWithdrawal ? selWithdrawal.merchant : ""}>
        {selWithdrawal && (
          <>
            <InfoGrid cols={1} rows={[{ label: "Amount", value: selWithdrawal.amount, mono: true }, { label: "Requested", value: selWithdrawal.requested }, { label: "Status", value: selWithdrawal.status }, { label: "Payout account", value: "GTBank \u2022\u2022\u20224821" }]} />
            {selWithdrawal.status === "Pending" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn tone="accent" onClick={() => setSelWithdrawal(null)}>Approve & pay</Btn>
                <Btn tone="danger" onClick={() => setSelWithdrawal(null)}>Decline</Btn>
              </div>
            )}
          </>
        )}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Developer Commission Engine
// ---------------------------------------------------------------------------
const DEV_COMMISSIONS = [
  { developer: "PayFlow Technologies", id: "DEV-3021", model: "Per-transaction", rate: "0.35%", cap: "\u20A65,000", effective: "01 Jan 2026" },
  { developer: "Kudi Logistics API", id: "DEV-3018", model: "Revenue share", rate: "0.28%", cap: "\u20A612,000", effective: "15 Mar 2026" },
  { developer: "Chowdeck Integrations", id: "DEV-3011", model: "Per-transaction", rate: "0.50%", cap: "\u20A62,000", effective: "22 Jun 2026" },
  { developer: "Sabi Fintech Labs", id: "DEV-3004", model: "Per-transaction", rate: "0.50%", cap: "\u20A62,000", effective: "22 Jun 2026" },
];
const DEV_COMMISSION_RULES = [
  { rule: "New app onboarding bonus", detail: "\u20A625,000 one-off credit on a developer's first live transaction." },
  { rule: "Volume override", detail: "Rate steps down 0.05pp per \u20A650M of monthly volume above \u20A6100M." },
  { rule: "Restricted developer hold", detail: "Commission payouts freeze automatically while a developer account is Restricted." },
];
function CommissionEngineSection() {
  const [tab, setTab] = useState("Commission Rates");
  const [editRow, setEditRow] = useState(null);
  const { addProposal, proposals, resolveProposal } = useApprovals();
  const pending = proposals.filter((p) => p.group === "Business Rules" && p.id && p.id.startsWith("dce-") && p.status === "Pending");

  return (
    <div>
      <PageHeader title="Developer Commission Engine" subtitle="Commission rates and rules for developers building on the BemcolPay API." />
      <StatGrid items={[{ label: "Developers on commission", value: "46" }, { label: "Paid this month", value: "\u20A62.4M" }, { label: "Avg. rate", value: "0.38%" }, { label: "Frozen payouts", value: "2", tone: "warn" }]} />
      <Tabs tabs={["Commission Rates", "Rules"]} active={tab} onChange={setTab} />

      {tab === "Commission Rates" && (
        <>
          {pending.length > 0 && (
            <>
              <ApprovalQueue title="Pending rate changes" proposals={pending} onApprove={(p) => resolveProposal(p.id, "Approved")} onReject={(p) => resolveProposal(p.id, "Rejected")} />
              <div style={{ height: 20 }} />
            </>
          )}
          <Panel padding={0}>
            <DataTable columns={[
              { key: "developer", label: "Developer" },
              { key: "id", label: "ID", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted }}>{r.id}</span> },
              { key: "model", label: "Model" },
              { key: "rate", label: "Rate", render: (r) => <span style={moneyStyle}>{r.rate}</span> },
              { key: "cap", label: "Cap", render: (r) => <span style={moneyStyle}>{r.cap}</span> },
              { key: "_edit", label: "", render: (r) => <button onClick={() => setEditRow(r)} style={{ background: "none", border: "none", color: C.blue, cursor: "pointer", fontFamily: fontStack.body, fontWeight: 600, fontSize: 12.5 }}>Propose change</button> },
            ]} rows={DEV_COMMISSIONS} />
          </Panel>
          <div style={{ fontFamily: fontStack.body, fontSize: 12, color: C.mutedSoft, marginTop: 10 }}>Full developer profile in Developers \u2192</div>
        </>
      )}

      {tab === "Rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DEV_COMMISSION_RULES.map((r) => (
            <Panel key={r.rule} title={r.rule}>
              <div style={{ fontFamily: fontStack.body, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{r.detail}</div>
            </Panel>
          ))}
        </div>
      )}

      <ProposeChangePanel
        open={!!editRow} onClose={() => setEditRow(null)}
        field={editRow ? `${editRow.developer} commission rate` : ""} currentValue={editRow ? editRow.rate : ""}
        onSubmit={({ proposedValue, reason, effectiveDate }) => addProposal({ id: `dce-${Date.now()}`, group: "Business Rules", field: `${editRow.developer} commission rate`, currentValue: editRow.rate, proposedValue, reason, effectiveDate })}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Split Accounts + Simulator + Revenue Share Rules
// ---------------------------------------------------------------------------
const SPLIT_ACCOUNTS = [
  { id: "SPL-4021", name: "Acme Ltd \u21C4 Logistics Partner", type: "Fixed %", parties: 2, status: "Active" },
  { id: "SPL-4018", name: "Nova Marketplace Vendors", type: "Tiered", parties: 14, status: "Active" },
  { id: "SPL-4012", name: "BrightPay \u21C4 Referral Partner", type: "Fixed amount", parties: 2, status: "Paused" },
];
const SPLIT_PARTIES = {
  "SPL-4021": [{ party: "Acme Ltd", pct: 70 }, { party: "Logistics Partner", pct: 30 }],
  "SPL-4018": [{ party: "Vendor", pct: 92 }, { party: "Platform", pct: 6 }, { party: "Referral partner", pct: 2 }],
  "SPL-4012": [{ party: "BrightPay", pct: 80 }, { party: "Referral Partner", pct: 20 }],
};
const REVENUE_SHARE_RULES = [
  { rule: "Marketplace default split", detail: "92% to vendor, 6% to platform, 2% to referral partner on every settled order." },
  { rule: "Logistics partner split", detail: "85% to merchant, 15% to logistics partner, capped at \u20A610,000 per transaction." },
  { rule: "Referral override", detail: "Referral partner share reduces to 1% once a merchant's cumulative volume passes \u20A650M." },
];
function SplitAccountsSection() {
  const [tab, setTab] = useState("Split Accounts");
  const [sel, setSel] = useState(null);
  const [simAcct, setSimAcct] = useState("SPL-4021");
  const [simAmount, setSimAmount] = useState("100000");
  const parties = SPLIT_PARTIES[simAcct] || [];
  const amt = Number(simAmount) || 0;

  return (
    <div>
      <PageHeader title="Split Accounts" subtitle="Multi-party payout splits, revenue share rules, and a split simulator." actions={[<Btn key="n" tone="accent">New split account</Btn>]} />
      <StatGrid items={[{ label: "Active split accounts", value: "38" }, { label: "Parties", value: "112" }, { label: "Split volume (30d)", value: "\u20A6284M" }, { label: "Paused", value: "1", tone: "warn" }]} />
      <Tabs tabs={["Split Accounts", "Simulator", "Revenue Share Rules"]} active={tab} onChange={setTab} />

      {tab === "Split Accounts" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "name", label: "Split account" },
            { key: "id", label: "ID", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted }}>{r.id}</span> },
            { key: "type", label: "Type" }, { key: "parties", label: "Parties" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={SPLIT_ACCOUNTS} onRowClick={setSel} />
        </Panel>
      )}

      {tab === "Simulator" && (
        <Panel title="Split simulator">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Split account</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SPLIT_ACCOUNTS.map((a) => (
                <button key={a.id} onClick={() => setSimAcct(a.id)} style={{
                  padding: "7px 14px", borderRadius: 20, border: `1px solid ${simAcct === a.id ? C.blue : C.line}`,
                  background: simAcct === a.id ? C.blueSoft : C.raised, color: simAcct === a.id ? C.blueDeep : C.muted,
                  fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                }}>{a.name}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20, maxWidth: 240 }}>
            <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Transaction amount (\u20A6)</div>
            <input type="number" value={simAmount} onChange={(e) => setSimAmount(e.target.value)} style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 13.5, color: C.ink, background: "transparent", outline: "none" }} />
          </div>
          <InfoGrid cols={1} rows={parties.map((p) => ({ label: `${p.party} (${p.pct}%)`, value: `\u20A6${Math.round(amt * p.pct / 100).toLocaleString()}`, mono: true }))} />
        </Panel>
      )}

      {tab === "Revenue Share Rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {REVENUE_SHARE_RULES.map((r) => (
            <Panel key={r.rule} title={r.rule}><div style={{ fontFamily: fontStack.body, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{r.detail}</div></Panel>
          ))}
        </div>
      )}

      <SidePanel open={!!sel} onClose={() => setSel(null)} title={sel ? sel.name : ""} subtitle={sel ? sel.id : ""}>
        {sel && <InfoGrid cols={1} rows={(SPLIT_PARTIES[sel.id] || []).map((p) => ({ label: p.party, value: `${p.pct}%` }))} />}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Charge Engine (Bank Partner Charges vs. BemcolPay Charges) + Simulator
// ---------------------------------------------------------------------------
const BANK_PARTNER_CHARGES = [
  { bank: "GTBank", type: "Transfer", charge: "\u20A650 flat", passthrough: "Yes" },
  { bank: "Providus Bank", type: "Virtual account", charge: "\u20A610 flat", passthrough: "Yes" },
  { bank: "Wema Bank", type: "Card processing", charge: "0.5%", passthrough: "No" },
  { bank: "Access Bank", type: "Transfer", charge: "\u20A635 flat", passthrough: "Yes" },
];
const BEMCOLPAY_CHARGES = [
  { product: "Card payments", charge: "1.5% + \u20A6100", cap: "\u20A62,000" },
  { product: "Bank transfer", charge: "\u20A650 flat", cap: "\u2014" },
  { product: "Virtual account funding", charge: "\u20A625 flat", cap: "\u2014" },
  { product: "Bill payments", charge: "1.0%", cap: "\u20A6500" },
];
const CHARGE_SIM = {
  "Card payments": { pct: 1.5, flat: 100, cap: 2000, bankType: "pct", bankValue: 0.5 },
  "Bank transfer": { pct: 0, flat: 50, cap: null, bankType: "flat", bankValue: 50 },
  "Virtual account funding": { pct: 0, flat: 25, cap: null, bankType: "flat", bankValue: 10 },
  "Bill payments": { pct: 1.0, flat: 0, cap: 500, bankType: "flat", bankValue: 0 },
};
function ChargeEngineSection() {
  const [tab, setTab] = useState("Bank Partner Charges");
  const [editRow, setEditRow] = useState(null);
  const [simProduct, setSimProduct] = useState("Card payments");
  const [simAmount, setSimAmount] = useState("50000");
  const { addProposal, proposals, resolveProposal } = useApprovals();
  const pending = proposals.filter((p) => p.group === "Business Rules" && p.id && p.id.startsWith("chg-") && p.status === "Pending");

  const amt = Number(simAmount) || 0;
  const sim = CHARGE_SIM[simProduct];
  const rawFee = amt * (sim.pct / 100) + sim.flat;
  const bemcolpayFee = sim.cap ? Math.min(rawFee, sim.cap) : rawFee;
  const bankCharge = sim.bankType === "pct" ? amt * (sim.bankValue / 100) : sim.bankValue;

  return (
    <div>
      <PageHeader title="Charge Engine" subtitle="Bank partner charges and BemcolPay charges, kept separate, plus a charge simulator." />
      <StatGrid items={[{ label: "Bank partner charges (30d)", value: "\u20A64.1M" }, { label: "BemcolPay charges (30d)", value: "\u20A618.6M" }, { label: "Net margin", value: "\u20A614.5M", tone: "success" }, { label: "Products configured", value: "4" }]} />
      <Tabs tabs={["Bank Partner Charges", "BemcolPay Charges", "Simulator"]} active={tab} onChange={setTab} />

      {tab === "Bank Partner Charges" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "bank", label: "Bank partner" }, { key: "type", label: "Charge type" },
            { key: "charge", label: "Charge", render: (r) => <span style={moneyStyle}>{r.charge}</span> },
            { key: "passthrough", label: "Passed to merchant" },
          ]} rows={BANK_PARTNER_CHARGES} />
        </Panel>
      )}

      {tab === "BemcolPay Charges" && (
        <>
          {pending.length > 0 && (
            <>
              <ApprovalQueue title="Pending charge changes" proposals={pending} onApprove={(p) => resolveProposal(p.id, "Approved")} onReject={(p) => resolveProposal(p.id, "Rejected")} />
              <div style={{ height: 20 }} />
            </>
          )}
          <Panel padding={0}>
            <DataTable columns={[
              { key: "product", label: "Product" }, { key: "charge", label: "Charge", render: (r) => <span style={moneyStyle}>{r.charge}</span> },
              { key: "cap", label: "Cap", render: (r) => <span style={moneyStyle}>{r.cap}</span> },
              { key: "_edit", label: "", render: (r) => <button onClick={() => setEditRow(r)} style={{ background: "none", border: "none", color: C.blue, cursor: "pointer", fontFamily: fontStack.body, fontWeight: 600, fontSize: 12.5 }}>Propose change</button> },
            ]} rows={BEMCOLPAY_CHARGES} />
          </Panel>
        </>
      )}

      {tab === "Simulator" && (
        <Panel title="Charge simulator">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Product</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BEMCOLPAY_CHARGES.map((p) => (
                <button key={p.product} onClick={() => setSimProduct(p.product)} style={{
                  padding: "7px 14px", borderRadius: 20, border: `1px solid ${simProduct === p.product ? C.blue : C.line}`,
                  background: simProduct === p.product ? C.blueSoft : C.raised, color: simProduct === p.product ? C.blueDeep : C.muted,
                  fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                }}>{p.product}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20, maxWidth: 240 }}>
            <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Transaction amount (\u20A6)</div>
            <input type="number" value={simAmount} onChange={(e) => setSimAmount(e.target.value)} style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.money, fontVariantNumeric: "tabular-nums", fontSize: 13.5, color: C.ink, background: "transparent", outline: "none" }} />
          </div>
          <InfoGrid cols={1} rows={[
            { label: "BemcolPay charge to merchant", value: `\u20A6${Math.round(bemcolpayFee).toLocaleString()}`, mono: true },
            { label: "Bank partner charge (cost)", value: `\u20A6${Math.round(bankCharge).toLocaleString()}`, mono: true },
            { label: "Net margin", value: `\u20A6${Math.round(bemcolpayFee - bankCharge).toLocaleString()}`, mono: true },
          ]} />
        </Panel>
      )}

      <ProposeChangePanel
        open={!!editRow} onClose={() => setEditRow(null)}
        field={editRow ? `${editRow.product} charge` : ""} currentValue={editRow ? editRow.charge : ""}
        onSubmit={({ proposedValue, reason, effectiveDate }) => addProposal({ id: `chg-${Date.now()}`, group: "Business Rules", field: `${editRow.product} charge`, currentValue: editRow.charge, proposedValue, reason, effectiveDate })}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Refunds (its own queue, separated from Disputes)
// ---------------------------------------------------------------------------
const REFUNDS = [
  { id: "RFD-6031", merchant: "Acme Ltd", customer: "John Doe", amount: "\u20A624,500", reason: "Customer-initiated", status: "Pending", requested: "10 Aug" },
  { id: "RFD-6028", merchant: "Nova Stores", customer: "Ifeoma Chukwu", amount: "\u20A68,200", reason: "Merchant-initiated", status: "Approved", requested: "09 Aug" },
  { id: "RFD-6019", merchant: "ABC Traders", customer: "Tobi Alade", amount: "\u20A6120,000", reason: "Processor-forced", status: "Under review", requested: "07 Aug" },
  { id: "RFD-6011", merchant: "Zenith Retail", customer: "Grace N.", amount: "\u20A65,000", reason: "Customer-initiated", status: "Rejected", requested: "03 Aug" },
  { id: "RFD-6002", merchant: "BrightPay", customer: "Musa Y.", amount: "\u20A612,900", reason: "Merchant-initiated", status: "Processed", requested: "29 Jul" },
];
function RefundsSection() {
  const [rows, setRows] = useState(REFUNDS);
  const [sel, setSel] = useState(null);
  const setStatus = (id, status) => { setRows((list) => list.map((r) => (r.id === id ? { ...r, status } : r))); setSel(null); };
  return (
    <div>
      <PageHeader title="Refunds" subtitle="Merchant-initiated, customer-initiated, and processor-forced refund requests." />
      <StatGrid items={[
        { label: "Pending", value: String(rows.filter((r) => r.status === "Pending").length), tone: "warn" },
        { label: "Under review", value: String(rows.filter((r) => r.status === "Under review").length), tone: "warn" },
        { label: "Processed this month", value: "\u20A6482,000", tone: "success" },
        { label: "Rejected", value: String(rows.filter((r) => r.status === "Rejected").length) },
      ]} />
      <FilterRow placeholder="Search refund ID, merchant, customer..." filters={["Status", "Reason", "Date"]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "id", label: "Refund", render: (r) => <span style={{ fontFamily: fontStack.body, fontSize: 12.5 }}>{r.id}</span> },
          { key: "merchant", label: "Merchant" }, { key: "customer", label: "Customer" },
          { key: "amount", label: "Amount", render: (r) => <span style={moneyStyle}>{r.amount}</span> },
          { key: "reason", label: "Reason" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }, { key: "requested", label: "Requested" },
        ]} rows={rows} onRowClick={setSel} />
      </Panel>
      <SidePanel open={!!sel} onClose={() => setSel(null)} title={sel ? sel.id : ""} subtitle={sel ? `${sel.merchant} \u00B7 ${sel.customer}` : ""}>
        {sel && (
          <>
            <InfoGrid cols={1} rows={[{ label: "Amount", value: sel.amount, mono: true }, { label: "Reason", value: sel.reason }, { label: "Requested", value: sel.requested }, { label: "Original transaction", value: "TXN-88213" }]} />
            {(sel.status === "Pending" || sel.status === "Under review") && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn tone="accent" onClick={() => setStatus(sel.id, "Approved")}>Approve</Btn>
                <Btn tone="default" onClick={() => setStatus(sel.id, "Processed")}>Mark processed</Btn>
                <Btn tone="danger" onClick={() => setStatus(sel.id, "Rejected")}>Reject</Btn>
              </div>
            )}
          </>
        )}
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Restricted Businesses + Watchlist/Sanctions
// ---------------------------------------------------------------------------
const RESTRICTED_BUSINESSES = [
  { name: "QuickCash Traders", category: "Cryptocurrency exchange", reason: "Prohibited business category", added: "04 Aug", status: "Restricted" },
  { name: "GlobalBet Ltd", category: "Gambling", reason: "Licensing not verified", added: "28 Jul", status: "Restricted" },
  { name: "FastForex NG", category: "Money services business", reason: "Pending regulatory review", added: "14 Jul", status: "Under review" },
];
const WATCHLIST = [
  { name: "Emeka O.", type: "Individual", source: "Internal watchlist", reason: "Repeated chargeback fraud", added: "02 Aug" },
  { name: "Trident Holdings", type: "Business", source: "OFAC SDN", reason: "Sanctions list match", added: "30 Jul" },
  { name: "Nnamdi K.", type: "Individual", source: "Internal watchlist", reason: "Multiple failed KYC attempts", added: "19 Jul" },
];
function RestrictedBusinessesSection() {
  const [tab, setTab] = useState("Restricted Businesses");
  const [panelOpen, setPanelOpen] = useState(false);
  return (
    <div>
      <PageHeader title="Restricted Businesses" subtitle="Business categories and watchlisted parties blocked from onboarding or transacting." actions={[<Btn key="a" tone="accent" onClick={() => setPanelOpen(true)}>Add to list</Btn>]} />
      <StatGrid items={[{ label: "Restricted businesses", value: "12", tone: "danger" }, { label: "Under review", value: "3", tone: "warn" }, { label: "Watchlist entries", value: "27" }, { label: "Blocked onboarding (30d)", value: "6" }]} />
      <Tabs tabs={["Restricted Businesses", "Watchlist"]} active={tab} onChange={setTab} />
      {tab === "Restricted Businesses" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "name", label: "Business" }, { key: "category", label: "Category" }, { key: "reason", label: "Reason" },
            { key: "added", label: "Added" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={RESTRICTED_BUSINESSES} />
        </Panel>
      )}
      {tab === "Watchlist" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "source", label: "List source" },
            { key: "reason", label: "Reason" }, { key: "added", label: "Added" },
          ]} rows={WATCHLIST} />
        </Panel>
      )}
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Add to restricted list" subtitle="Blocks onboarding and new transactions for this business or party.">
        <div>
          <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Business or party name</div>
          <input placeholder="Enter name" style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13.5, color: C.ink, background: "transparent", outline: "none" }} />
        </div>
        <div>
          <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Reason</div>
          <textarea rows={3} placeholder="Why is this being restricted?" style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13, color: C.ink, background: "transparent", outline: "none", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn tone="default" onClick={() => setPanelOpen(false)}>Cancel</Btn>
          <Btn tone="primary" onClick={() => setPanelOpen(false)}>Add to list</Btn>
        </div>
      </SidePanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Bank Partners + Bank Partner Detail (API/credential health)
// ---------------------------------------------------------------------------
const BANK_PARTNERS = [
  { name: "GTBank", type: "Settlement bank", status: "Operational", uptime: "99.98%", lastSync: "2 mins ago" },
  { name: "Providus Bank", type: "Virtual account issuer", status: "Operational", uptime: "99.95%", lastSync: "1 min ago" },
  { name: "Wema Bank", type: "Settlement bank", status: "Degraded", uptime: "98.20%", lastSync: "14 mins ago" },
  { name: "Access Bank", type: "Settlement bank", status: "Operational", uptime: "99.99%", lastSync: "Just now" },
];
function BankPartnersSection() {
  const [sel, setSel] = useState(null);
  if (sel) return <BankPartnerDetail partner={sel} onBack={() => setSel(null)} />;
  return (
    <div>
      <PageHeader title="Bank Partners" subtitle="Settlement banks and virtual account issuers \u2014 API and credential health." />
      <StatGrid items={[{ label: "Operational", value: "3", tone: "success" }, { label: "Degraded", value: "1", tone: "warn" }, { label: "Avg. uptime (30d)", value: "99.53%" }, { label: "Keys expiring soon", value: "1", tone: "warn" }]} />
      <Panel padding={0}>
        <DataTable columns={[
          { key: "name", label: "Bank partner" }, { key: "type", label: "Role" },
          { key: "uptime", label: "Uptime (30d)", render: (r) => <span style={moneyStyle}>{r.uptime}</span> },
          { key: "lastSync", label: "Last sync" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
        ]} rows={BANK_PARTNERS} onRowClick={setSel} />
      </Panel>
    </div>
  );
}
function BankPartnerDetail({ partner, onBack }) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div>
      <BackLink onClick={onBack} label="Bank Partners" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: fontStack.display, fontSize: 20, fontWeight: 700 }}>{partner.name}</div>
        <Badge status={partner.status} />
      </div>
      <StatGrid items={[{ label: "Uptime (30d)", value: partner.uptime }, { label: "API latency", value: "310ms" }, { label: "Failed calls (24h)", value: "0.4%", tone: partner.status === "Degraded" ? "warn" : undefined }, { label: "Last successful sync", value: partner.lastSync }]} />
      <div className="grid-split-equal">
        <Panel title="Credential health">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: fontStack.mono, fontSize: 13, color: C.ink }}>{showKey ? "bnk_live_2kD91mPq7Ha" : "bnk_live_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            <button onClick={() => setShowKey((v) => !v)} style={{ background: "none", border: "none", color: C.blue, cursor: "pointer", fontFamily: fontStack.body, fontSize: 12.5, fontWeight: 600 }}>{showKey ? "Hide" : "Reveal"}</button>
          </div>
          <InfoGrid cols={1} rows={[{ label: "Credential expires", value: "22 Sep 2026" }, { label: "Webhook signing secret", value: "Configured" }]} />
        </Panel>
        <Panel title="Connectivity">
          <Timeline steps={[
            { label: partner.status === "Degraded" ? "Elevated latency detected" : "Sync healthy", time: partner.lastSync, color: partner.status === "Degraded" ? C.amber : C.lime },
            { label: "Credential rotated", time: "12 Jul, 09:00" },
            { label: "Connection established", time: "01 Jan 2026" },
          ]} />
        </Panel>
        <Panel title="Settlement activity">
          <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.mutedSoft }}>Last settlement: Today, 07:15 \u00B7 \u20A61.2M routed via {partner.name}</div>
        </Panel>
        <Panel title="Contacts">
          <InfoGrid cols={1} rows={[{ label: "Relationship manager", value: `ops@${partner.name.toLowerCase().replace(/[^a-z]/g, "")}.com` }, { label: "Technical support", value: "24/7 escalation line" }]} />
        </Panel>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 3 — Notifications and Settings (real pages)
// ---------------------------------------------------------------------------
const NOTIF_LOG = [
  { event: "Settlement failed", channel: "Email", recipient: "ops@bemcolpay.com", sent: "10 Aug, 14:20", status: "Delivered" },
  { event: "KYC escalation", channel: "Email", recipient: "compliance@bemcolpay.com", sent: "10 Aug, 09:05", status: "Delivered" },
  { event: "Large transaction (>\u20A65M)", channel: "SMS", recipient: "+234 803 xxx 1122", sent: "09 Aug, 18:41", status: "Failed" },
  { event: "Cashback withdrawal requested", channel: "Slack", recipient: "#finance-ops", sent: "09 Aug, 11:02", status: "Delivered" },
];
const NOTIF_RULES = [
  { event: "Settlement failure", channels: ["Email", "Slack"] },
  { event: "KYC escalation", channels: ["Email"] },
  { event: "Large transaction (>\u20A65M)", channels: ["Email", "SMS"] },
  { event: "Cashback withdrawal requested", channels: ["Slack"] },
  { event: "Bank partner degraded", channels: ["Email", "SMS", "Slack"] },
];
function NotificationsSection() {
  const [tab, setTab] = useState("Recent");
  const [rules, setRules] = useState(() => Object.fromEntries(NOTIF_RULES.map((r) => [r.event, { Email: r.channels.includes("Email"), SMS: r.channels.includes("SMS"), Slack: r.channels.includes("Slack") }])));
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Delivery log and channel rules for platform notifications." />
      <StatGrid items={[{ label: "Sent today", value: "142" }, { label: "Delivered", value: "98.6%", tone: "success" }, { label: "Failed", value: "1.4%", tone: "danger" }, { label: "Active rules", value: String(NOTIF_RULES.length) }]} />
      <Tabs tabs={["Recent", "Rules"]} active={tab} onChange={setTab} />
      {tab === "Recent" && (
        <Panel padding={0}>
          <DataTable columns={[
            { key: "event", label: "Event" }, { key: "channel", label: "Channel" }, { key: "recipient", label: "Recipient" },
            { key: "sent", label: "Sent" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]} rows={NOTIF_LOG} />
        </Panel>
      )}
      {tab === "Rules" && (
        <Panel>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NOTIF_RULES.map((r, i) => (
              <div key={r.event} style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 4px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}`, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, fontFamily: fontStack.body, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{r.event}</div>
                {["Email", "SMS", "Slack"].map((ch) => (
                  <div key={ch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.muted }}>{ch}</span>
                    <Switch checked={rules[r.event][ch]} onChange={(v) => setRules((s) => ({ ...s, [r.event]: { ...s[r.event], [ch]: v } }))} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
function SettingsField({ label, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", maxWidth: 380, border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px", fontFamily: fontStack.body, fontSize: 13.5, color: C.ink, background: "transparent", outline: "none" }} />
    </div>
  );
}
function SettingsSection() {
  const [tab, setTab] = useState("General");
  const [orgName, setOrgName] = useState("BemcolPay Ltd");
  const [supportEmail, setSupportEmail] = useState("support@bemcolpay.com");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [security, setSecurity] = useState({ enforce2fa: true, ipAllowlist: false, sessionTimeout: true });
  return (
    <div>
      <PageHeader title="Settings" subtitle="Organization, branding, security and API configuration." />
      <Tabs tabs={["General", "Branding", "Security", "API & Webhooks"]} active={tab} onChange={setTab} />
      {tab === "General" && (
        <Panel title="Organization">
          <SettingsField label="Organization name" value={orgName} onChange={setOrgName} />
          <SettingsField label="Support email" value={supportEmail} onChange={setSupportEmail} type="email" />
          <SettingsField label="Timezone" value={timezone} onChange={setTimezone} />
          <Btn tone="primary">Save changes</Btn>
        </Panel>
      )}
      {tab === "Branding" && (
        <Panel title="Branding">
          <InfoGrid cols={2} rows={[{ label: "Primary color", value: "#B7F23A", mono: true }, { label: "Logo", value: "bemcolpay-logo.svg" }, { label: "Support portal domain", value: "help.bemcolpay.com", mono: true }, { label: "Email sender name", value: "BemcolPay" }]} />
        </Panel>
      )}
      {tab === "Security" && (
        <Panel title="Security policies">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { key: "enforce2fa", name: "Enforce 2FA for all admins", desc: "Require two-factor authentication on every admin login." },
              { key: "ipAllowlist", name: "IP allowlisting", desc: "Restrict console access to approved office and VPN IP ranges." },
              { key: "sessionTimeout", name: "Auto session timeout", desc: "Sign admins out automatically after 30 minutes of inactivity." },
            ].map((f, i) => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 4px", borderTop: i === 0 ? "none" : `1px solid ${C.lineSoft}`, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: fontStack.body, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{f.name}</div>
                  <div style={{ fontFamily: fontStack.body, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{f.desc}</div>
                </div>
                <Switch checked={security[f.key]} onChange={(v) => setSecurity((s) => ({ ...s, [f.key]: v }))} />
              </div>
            ))}
          </div>
        </Panel>
      )}
      {tab === "API & Webhooks" && (
        <Panel title="Platform API settings">
          <InfoGrid cols={2} rows={[{ label: "Default webhook URL", value: "https://api.bemcolpay.com/webhooks", mono: true }, { label: "Webhook retry policy", value: "3 attempts, exponential backoff" }, { label: "Rate limit", value: "600 requests / min", mono: true }, { label: "API version", value: "v1 (current)", mono: true }]} />
        </Panel>
      )}
    </div>
  );
}

// PRD operational-page pattern. These pages intentionally open in a read-only
// state: a change is proposed with rationale and impact, then routed to the
// shared maker-checker queue rather than applied directly in the interface.
const PRD_PAGES = {
  chargebacks: { title: "Chargebacks", group: "Operations", subtitle: "Manage card-network cases, evidence, exposure and outcomes.", metric: "Open exposure", value: "₦4.8M", fields: ["Case", "Merchant", "Amount", "Evidence deadline", "Outcome"], rows: [["CB-2208", "BrightPay", "₦420,000", "14 Aug", "Evidence needed"], ["CB-2201", "Nova Stores", "₦185,000", "18 Aug", "Won"]], action: "Submit evidence decision" },
  limits: { title: "Limits & Controls", group: "Business Rules", subtitle: "Role, category and merchant risk controls. Changes require approval.", metric: "Controls active", value: "28", fields: ["Control", "Scope", "Current value", "Risk owner", "Status"], rows: [["Daily card limit", "Tier 2 merchants", "₦5,000,000", "Risk", "Active"], ["Refund threshold", "All merchants", "₦250,000", "Finance", "Active"]], action: "Propose limit change" },
  virtualcards: { title: "Virtual Cards", group: "Products", subtitle: "Product controls and card-program health. Read-only until approved.", metric: "Active cards", value: "1,248", fields: ["Program", "Currency", "Spend", "Status", "Last activity"], rows: [["Merchant expense", "NGN", "₦8.4M", "Active", "2 mins ago"], ["Partner payout", "USD", "$14,200", "Held", "18 mins ago"]], action: "Propose product change" },
  paymentmethods: { title: "Payment Methods", group: "Products", subtitle: "Enablement, routing order, uptime and bank failover controls.", metric: "Methods live", value: "6", fields: ["Method", "Uptime", "Routing", "Failover", "Status"], rows: [["Bank transfer", "99.98%", "Primary", "Enabled", "Live"], ["Card", "99.91%", "Secondary", "Enabled", "Live"]], action: "Propose routing change" },
  corridors: { title: "Multi-Currency", group: "Products", subtitle: "Enabled currencies, risk policy and settlement configuration.", metric: "Live corridors", value: "4", fields: ["Currency", "Settlement", "Risk tier", "Limit", "Status"], rows: [["NGN", "Daily", "Standard", "₦50M", "Live"], ["USD", "T+1", "Enhanced", "$25K", "Review"]], action: "Propose corridor change" },
  fraudrules: { title: "Fraud Rules", group: "Risk & Compliance", subtitle: "Rule builder, test results and approval-protected deployment.", metric: "Rules live", value: "37", fields: ["Rule", "Signal", "Action", "Owner", "Status"], rows: [["Velocity threshold", "5 payments / min", "Hold", "Risk", "Live"], ["New-device high value", "₦500K+", "Review", "Risk", "Live"]], action: "Submit rule for approval" },
  bankstatements: { title: "Bank Statements", group: "Finance", subtitle: "Imported and pulled bank statements with matching status.", metric: "Unmatched items", value: "12", fields: ["Statement", "Bank", "Period", "Match status", "Owner"], rows: [["STM-8891", "GTBank", "10 Aug", "Matched", "Finance"], ["STM-8892", "Wema Bank", "10 Aug", "Exception", "Finance"]], action: "Propose statement adjustment" },
  taxfeereports: { title: "Tax & Fee Reports", group: "Finance", subtitle: "Controlled fee and tax exports with filters and audit evidence.", metric: "Reports ready", value: "8", fields: ["Report", "Period", "Owner", "Export", "Status"], rows: [["Processing fees", "Jul 2026", "Finance", "CSV / PDF", "Ready"], ["VAT summary", "Jul 2026", "Finance", "CSV / PDF", "Ready"]], action: "Request report change" },
  devsupport: { title: "Developer Support", group: "Support", subtitle: "Developer tickets with request IDs, masked logs and escalation controls.", metric: "Open tickets", value: "14", fields: ["Ticket", "Developer", "Request ID", "SLA", "Status"], rows: [["DEV-814", "PayFlow", "req_92f…", "2h", "Open"], ["DEV-809", "Kudi API", "req_77b…", "6h", "Waiting"]], action: "Escalate ticket" },
  internaltickets: { title: "Internal Tickets", group: "Support", subtitle: "Cross-team operational work with assignment, ownership and SLA.", metric: "At risk", value: "3", fields: ["Ticket", "Team", "Owner", "SLA", "Status"], rows: [["INT-334", "Finance", "Ada N.", "1h", "Escalated"], ["INT-330", "Risk", "Chidi E.", "5h", "Open"]], action: "Assign work item" },
  knowledgebase: { title: "Knowledge Base", group: "Support", subtitle: "Internal scripts, controlled procedures and approval-aware macros.", metric: "Published guides", value: "86", fields: ["Article", "Owner", "Last reviewed", "Access", "Status"], rows: [["Settlement exception playbook", "Finance", "01 Aug", "Internal", "Published"], ["Fraud escalation script", "Risk", "29 Jul", "Restricted", "Published"]], action: "Propose article update" },
  audittrail: { title: "Audit Logs", group: "System", subtitle: "Immutable record of sensitive operations, access and approvals.", metric: "Events today", value: "2,481", fields: ["Actor", "Action", "Reason", "IP / device", "Time"], rows: [["Ada Nwosu", "Proposed settlement bank change", "Merchant request", "102.89.xxx · Chrome", "10:42"], ["Chidi Eze", "Placed risk hold", "Velocity breach", "102.89.xxx · Edge", "09:16"]], action: "Export audit evidence" },
};

function PRDOperationalPage({ pageKey }) {
  const config = PRD_PAGES[pageKey];
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [date, setDate] = useState("2026-08-12");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const { addProposal } = useApprovals();
  const statusIndex = config.fields.findIndex((field) => /status|outcome/i.test(field));
  const statuses = ["All statuses", ...Array.from(new Set(config.rows.map((row) => row[statusIndex])))];
  const columns = [...config.fields, "Date"].map((label, index) => ({ key: `c${index}`, label, render: (row) => index === statusIndex ? <Badge status={row[`c${index}`]} /> : row[`c${index}`] }));
  const allRows = config.rows.map((values, rowIndex) => Object.fromEntries([...values, rowIndex === 0 ? "2026-08-12" : "2026-08-11"].map((value, index) => [`c${index}`, value])));
  const rows = allRows.filter((row) => {
    const matchesQuery = Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All statuses" || row[`c${statusIndex}`] === status;
    const matchesDate = !date || row[`c${config.fields.length}`] === date;
    return matchesQuery && matchesStatus && matchesDate;
  });
  const resetFilters = () => { setQuery(""); setStatus("All statuses"); setDate(""); };
  const submitAction = () => {
    setNotice(`${config.action} prepared${selected ? ` for ${selected.c0}` : ""}. Provide a reason and impact assessment to submit it.`);
    setPanelOpen(true);
  };
  return (
    <div>
      <PageHeader title={config.title} subtitle={config.subtitle} actions={<><Btn onClick={() => setNotice(`Export prepared for ${date || "all available dates"}.`)}>Export</Btn><Btn tone="primary" onClick={submitAction}>{config.action}</Btn></>} />
      <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 8, borderLeft: `3px solid ${C.blue}`, background: C.blueSoft, fontFamily: fontStack.body, fontSize: 12.5, color: C.ink }}>Read-only by default. Sensitive changes require a reason, impact assessment, second-admin approval and audit evidence.</div>
      {notice && <div role="status" style={{ marginBottom: 18, padding: "10px 14px", borderRadius: 8, background: C.greenSoft, color: C.greenDeep, fontFamily: fontStack.body, fontSize: 12.5 }}>{notice}</div>}
      <StatGrid items={[{ label: config.metric, value: config.value }, { label: "Pending approvals", value: "2", tone: "warn" }, { label: "Risk items", value: "1", tone: "danger" }, { label: "Last sync", value: "2 mins" }]} />
      <Panel title="Controlled records" right={<span style={{ fontFamily: fontStack.body, fontSize: 12, color: C.muted }}>{rows.length} of {allRows.length} records</span>} padding={0}>
        <div style={{ padding: "16px 18px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 220px", minWidth: 200, border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px" }}><Search size={14} color={C.mutedSoft} /><input aria-label={`Search ${config.title}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}`} style={{ minWidth: 0, width: "100%", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: fontStack.body, fontSize: 13 }} /></div>
          <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 10px", background: C.raised, color: C.ink, fontFamily: fontStack.body, fontSize: 12.5 }}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <input aria-label="Filter by date" type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", background: C.raised, color: C.ink, fontFamily: fontStack.body, fontSize: 12.5 }} />
          <Btn small onClick={resetFilters}>Clear filters</Btn>
        </div>
        {rows.length ? <DataTable columns={columns} rows={rows} onRowClick={setSelected} /> : <EmptyNote label="matching records" />}
      </Panel>
      <SidePanel open={!!selected} onClose={() => setSelected(null)} title={selected ? selected.c0 : ""} subtitle={`${config.title} record · ${selected ? selected[`c${config.fields.length}`] : ""}`}>
        {selected && <><InfoGrid cols={1} rows={columns.map((column) => ({ label: column.label, value: selected[column.key] }))} /><Btn tone="primary" onClick={() => { setSelected(null); submitAction(); }}>{config.action}</Btn></>}
      </SidePanel>
      <ProposeChangePanel open={panelOpen} onClose={() => setPanelOpen(false)} field={selected ? `${config.title} — ${selected.c0}` : config.title} currentValue={selected ? Object.values(selected).slice(0, 2).join(" · ") : "Current controlled configuration"} onSubmit={(values) => { addProposal({ id: `apr-${Date.now()}`, group: config.group, field: selected ? `${config.title} — ${selected.c0}` : config.title, currentValue: selected ? Object.values(selected).slice(0, 2).join(" · ") : "Current controlled configuration", proposedValue: values.proposedValue || "Requested operational change", reason: values.reason || "Reason required before review", effectiveDate: values.effectiveDate || "After approval", impact: values.impact || "Impact to be assessed by Finance and Risk" }); setNotice("Change submitted to the Approval Center for second-admin review."); setSelected(null); }} />
    </div>
  );
}

function SecureAccessNotice() {
  return (
    <Panel title="Secure access controls">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {["MFA is required for every administrative session.", "Device trust, IP risk and session controls are evaluated before sensitive actions.", "Production enforcement requires the connected identity and audit services; this prototype demonstrates the governed flow."].map((text, index) => (
          <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: index < 2 ? 12 : 0, borderBottom: index < 2 ? `1px solid ${C.lineSoft}` : "none" }}>
            <ShieldCheck size={17} color={C.lime} style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontFamily: fontStack.body, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NavButton({ icon: Icon, label, active, onClick, indent }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      textAlign: "left", background: active ? C.blueSoft : "transparent",
      border: "none", cursor: "pointer", borderRadius: 12,
      padding: indent ? "7px 10px 7px 14px" : "7px 10px",
      color: active ? C.blue : C.muted,
      fontFamily: fontStack.body, fontSize: 13.5, fontWeight: active ? 600 : 500,
    }}>
      {Icon && <Icon size={17} color={active ? C.blue : C.mutedSoft} strokeWidth={2} />}
      <span>{label}</span>
    </button>
  );
}

function Sidebar({ page, onNavigate, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && <div className="app-sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`} style={{ width: 240, flexShrink: 0, background: C.raised, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", padding: "18px 12px", height: "100%", overflowY: "auto" }}>
        <div style={{ fontFamily: fontStack.display, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", padding: "6px 10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", color: C.ink }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontFamily: fontStack.display, fontSize: 13, fontWeight: 700 }}>B</span>
            bemcolpay
          </div>
          <button onClick={onCloseMobile} className="topbar-mobile-btn" style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedSoft, padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          {NAV.map((section) => (
            <div key={section.label}>
              {section.items ? (
                <div style={{ fontFamily: fontStack.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mutedSoft, padding: "0 10px", marginBottom: 4 }}>{section.label}</div>
              ) : (
                <NavButton icon={section.icon} label={section.label} active={page === section.key} onClick={() => { onNavigate(section.key); onCloseMobile && onCloseMobile(); }} />
              )}
              {section.items && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
                  {section.items.map((it) => (
                    <NavButton key={it.key} icon={it.icon} label={it.label} active={page === it.key} onClick={() => { onNavigate(it.key); onCloseMobile && onCloseMobile(); }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 10px 4px", borderTop: `1px solid ${C.lineSoft}`, marginTop: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blueSoft, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack.display, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>JO</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: fontStack.body, fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Jeremiah Omonefe</div>
            <div style={{ fontFamily: fontStack.body, fontSize: 11.5, color: C.mutedSoft }}>BemcolPay Ltd</div>
          </div>
          <MoreHorizontal size={16} color={C.mutedSoft} />
        </div>
      </aside>
    </>
  );
}

function Topbar({ onToggleMobileMenu, live, setLive, onNavigate }) {
  return (
    <header className="app-topbar" style={{ height: 64, flexShrink: 0, background: C.raised, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onToggleMobileMenu} className="topbar-mobile-btn" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: "6px 8px", borderRadius: 6, display: "none", alignItems: "center", justifyContent: "center" }} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <div className="topbar-mobile-logo" style={{ fontFamily: fontStack.display, fontWeight: 700, fontSize: 17, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontFamily: fontStack.display, fontSize: 12, fontWeight: 700 }}>B</span>
          bemcolpay
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => setLive((v) => !v)} style={{
          display: "flex", alignItems: "center", gap: 6, cursor: "pointer", borderRadius: 999, padding: "5px 12px",
          fontFamily: fontStack.body, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.03em",
          background: live ? C.limeSoft : C.raised, color: live ? C.lime : C.muted, border: `1px solid ${live ? "rgba(183,242,58,0.4)" : C.line}`,
          whiteSpace: "nowrap",
        }}>
          <Circle size={7} fill={live ? C.lime : C.mutedSoft} color={live ? C.lime : C.mutedSoft} />
          {live ? "LIVE" : "TEST MODE"}
        </button>
        <Search size={19} color={C.muted} style={{ cursor: "pointer" }} />
        <HelpCircle size={19} color={C.muted} style={{ cursor: "pointer" }} />
        <button onClick={() => onNavigate("notifications")} aria-label="Open notifications" style={{ border: "none", background: "transparent", padding: 2, color: C.muted, cursor: "pointer" }}><Bell size={19} /></button>
      </div>
    </header>
  );
}

const PAGES = {
  overview: OverviewPage,
  merchants: MerchantsSection,
  applications: ApplicationsSection,
  kyc: KycSection,
  transactions: TransactionsSection,
  ledger: LedgerSection,
  settlements: SettlementsSection,
  reconciliation: ReconciliationSection,
  treasury: TreasurySection,
  screening: ScreeningSection,
  cases: CaseManagementSection,
  regreporting: RegulatoryReportingSection,
  licenses: LicensesSection,
  fees: FeeConfigSection,
  close: CloseSection,
  fx: FXSection,
  adjustments: AdjustmentsSection,
  risk: RiskSection,
  disputes: DisputesSection,
  incidents: IncidentsSection,
  customers: CustomersSection,
  partners: PartnersSection,
  insights: InsightsSection,
  infrastructure: InfraSection,
  reports: ReportsSection,
  developers: DevelopersSection,
  devaccounts: DeveloperAccountsSection,
  bankpartners: BankPartnersSection,
  cashbackengine: CashbackEngineSection,
  commissionengine: CommissionEngineSection,
  splitaccounts: SplitAccountsSection,
  chargeengine: ChargeEngineSection,
  refunds: RefundsSection,
  restrictedbiz: RestrictedBusinessesSection,
  notifications: NotificationsSection,
  settings: SettingsSection,
  access: AccessSection,
  opsqueue: OpsQueueSection,
  support: SupportSection,
  runbooks: RunbooksSection,
  bulkops: BulkOperationsSection,
  featureflags: FeatureFlagsSection,

  chargebacks: () => <PRDOperationalPage pageKey="chargebacks" />,
  limits: () => <PRDOperationalPage pageKey="limits" />,
  virtualcards: () => <PRDOperationalPage pageKey="virtualcards" />,
  paymentmethods: () => <PRDOperationalPage pageKey="paymentmethods" />,
  corridors: () => <PRDOperationalPage pageKey="corridors" />,
  fraudrules: () => <PRDOperationalPage pageKey="fraudrules" />,
  bankstatements: () => <PRDOperationalPage pageKey="bankstatements" />,
  taxfeereports: () => <PRDOperationalPage pageKey="taxfeereports" />,
  devsupport: () => <PRDOperationalPage pageKey="devsupport" />,
  internaltickets: () => <PRDOperationalPage pageKey="internaltickets" />,
  knowledgebase: () => <PRDOperationalPage pageKey="knowledgebase" />,
  audittrail: () => <PRDOperationalPage pageKey="audittrail" />,
  approvalcenter: ApprovalCenterPage,
  status: StatusSection,
};

export default function App() {
  return (
    <InteractionProvider><ApprovalProvider><AppShell /></ApprovalProvider></InteractionProvider>
  );
}

function AppShell() {
  const [page, setPage] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [live, setLive] = useState(true);

  const Page = PAGES[page] || OverviewPage;
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: C.paper, fontFamily: fontStack.body, color: C.ink, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible, a:focus-visible, textarea:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid ${C.lime}; outline-offset: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-family: ${fontStack.body}; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: ${C.mutedSoft}; padding: 12px 16px; border-bottom: 1px solid ${C.line}; white-space: nowrap; }
        td { padding: 13px 16px; font-family: ${fontStack.body}; font-size: 13px; color: ${C.ink}; border-bottom: 1px solid ${C.lineSoft}; }
        tbody tr:hover { background: rgba(217,222,210,0.05); }
        tbody tr:last-child td { border-bottom: none; }

        /* Responsive Grid Classes */
        .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .grid-split-main { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; align-items: start; }
        .grid-split-equal { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-split-position { display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px; }
        .grid-split-kyc { display: grid; grid-template-columns: 0.9fr 1.4fr; gap: 20px; }
        .grid-split-support { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
        .grid-split-treasury { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }

        /*
          Breakpoint scale (7 tiers): 320 / 480 / 600 / 905 / 1200 / 1440 / 1920
          320  – small phone floor
          480  – phone
          600  – large phone / small tablet portrait
          905  – tablet — sidebar switches from a static column to a mobile drawer here
          1200 – small desktop / laptop
          1440 – desktop
          1920 – large desktop / wide monitor
        */

        /* ≥1920 — wide monitor: give side-by-side panels more breathing room */
        @media (min-width: 1920px) {
          .app-main {
            max-width: 1800px;
            margin: 0 auto;
          }
        }

        /* <1440 — laptop: no layout change yet, tokens stay as authored */

        /* <1200 — small desktop: collapse the widest split layouts to a single column */
        @media (max-width: 1199px) {
          .grid-split-main,
          .grid-split-position,
          .grid-split-treasury {
            grid-template-columns: 1fr;
          }
          .stat-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* <905 — tablet: collapse remaining split layouts, switch nav to a drawer */
        @media (max-width: 904px) {
          .grid-2col,
          .grid-3col,
          .grid-split-equal,
          .grid-split-kyc,
          .grid-split-support {
            grid-template-columns: 1fr;
          }

          .app-sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(17, 22, 29, 0.5);
            z-index: 99;
            backdrop-filter: blur(2px);
          }
          .app-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 8px 0 24px rgba(0,0,0,0.15);
          }
          .app-sidebar.mobile-open {
            transform: translateX(0);
          }
          .app-topbar {
            padding: 0 16px !important;
          }
          .app-main {
            padding: 16px 16px 40px !important;
          }
          .topbar-mobile-btn {
            display: flex !important;
          }
          .topbar-mobile-logo {
            display: flex !important;
          }
        }

        @media (min-width: 905px) {
          .topbar-mobile-btn {
            display: none !important;
          }
          .topbar-mobile-logo {
            display: none !important;
          }
        }

        /* <600 — small tablet / large phone: tighten stat cards */
        @media (max-width: 599px) {
          .stat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* <480 — phone */
        @media (max-width: 479px) {
          .app-side-panel {
            width: 100vw !important;
          }
          .stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .admin-mobile-limited { display: block !important; }
        }

        .admin-mobile-limited { display: none; }

        /* <320 — small phone floor: never drop below single-column stats */
        @media (max-width: 319px) {
          .stat-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Sidebar page={page} onNavigate={setPage} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
        <Topbar onToggleMobileMenu={() => setMobileOpen(true)} live={live} setLive={setLive} onNavigate={setPage} />
        <main className="app-main" style={{ flex: 1, overflowY: "auto", padding: "28px 32px 48px" }}>
          <div className="admin-mobile-limited" style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 8, background: C.amberSoft, borderLeft: `3px solid ${C.amber}`, fontFamily: fontStack.body, fontSize: 12.5, color: C.ink }}>Mobile admin is limited to approvals, alerts and urgent review. Use desktop for configuration changes.</div>
          <Page />
        </main>
      </div>
    </div>
  );
}
