import { useState } from "react";
import { Loader2, DatabaseZap, Plus, X } from "lucide-react";
import { statusStyles, complexidadeDot } from "../lib/derive";

export function Tooltip({ text, children }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

export function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />;
}

export function TableSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-stone-700">{title}</p>
      {description && <p className="max-w-xs text-xs text-stone-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }) {
  const s = statusStyles[status] || statusStyles["Novo"];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.badge}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export function ComplexidadeTag({ nivel }) {
  return (
    <Tooltip text={`Complexidade ${(nivel || "").toLowerCase()} da solicitação`}>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600">
        <span className={`h-1.5 w-1.5 rounded-full ${complexidadeDot[nivel]}`} />
        {nivel}
      </span>
    </Tooltip>
  );
}

export function MetricCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tint}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{value}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
    </div>
  );
}

export function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`flex items-start gap-3 rounded-lg px-2 py-3 transition-colors ${highlight ? "bg-rose-50/60" : ""}`}>
      <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-stone-100 text-stone-500">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium text-stone-400">{label}</p>
        <p className="text-sm text-stone-800">{value || "—"}</p>
      </div>
    </div>
  );
}

/**
 * Botão de popular dados de exemplo — o próprio App.jsx só passa a prop
 * `onSeed` para as páginas quando `import.meta.env.DEV` é verdadeiro, então
 * este componente nunca é renderizado numa build de produção.
 */
export function SeedButton({ onSeed, seeding }) {
  return (
    <button
      onClick={onSeed}
      disabled={seeding}
      className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
    >
      {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
      {seeding ? "Populando Firestore…" : "Popular com dados de exemplo (dev)"}
    </button>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative h-6 w-11 flex-none rounded-full transition-colors ${checked ? "bg-rose-600" : "bg-stone-200"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export function FieldCard({ label, description, children }) {
  return (
    <div className="border-b border-stone-100 py-5 first:pt-0 last:border-0">
      <p className="text-sm font-medium text-stone-800">{label}</p>
      {description && <p className="mb-3 mt-0.5 text-xs text-stone-400">{description}</p>}
      {!description && <div className="mt-3" />}
      {children}
    </div>
  );
}

export function EditableList({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const addItem = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  };
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx, value) => onChange(items.map((it, i) => (i === idx ? value : it)));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input value={item} onChange={(e) => updateItem(idx, e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300" />
          <button onClick={() => removeItem(idx)} className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-stone-200 text-stone-400 transition-colors hover:bg-stone-50 hover:text-rose-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder={placeholder}
          className="w-full rounded-lg border border-dashed border-stone-300 px-3 py-2 text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-rose-300"
        />
        <button onClick={addItem} className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50 hover:text-rose-600">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
