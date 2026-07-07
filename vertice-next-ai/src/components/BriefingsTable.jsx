import { Inbox } from "lucide-react";
import { initials } from "../lib/derive";
import { formatDataCurta } from "../utils/date";
import { EmptyState, StatusPill, ComplexidadeTag, TableSkeleton } from "./ui";

export default function BriefingsTable({ items, onSelect, loading }) {
  if (loading) return <TableSkeleton />;
  if (items.length === 0) {
    return <EmptyState icon={Inbox} title="Nenhum briefing encontrado" description="Ajuste a busca ou aguarde novos atendimentos chegarem." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-stone-400 dark:text-stone-500">
            <th className="px-5 py-3 font-medium">Cliente</th>
            <th className="px-5 py-3 font-medium">Evento</th>
            <th className="px-5 py-3 font-medium">Data</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Complexidade</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id} className="border-t border-stone-100 transition-colors hover:bg-stone-50/60 dark:border-stone-800 dark:hover:bg-stone-800/40">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${b.avatarBg || "bg-stone-100 dark:bg-stone-800"} ${b.avatarText || "text-stone-600 dark:text-stone-300"}`}>
                    {initials(b.cliente)}
                  </span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">{b.cliente}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-stone-600 dark:text-stone-400">{b.evento}</td>
              <td className="px-5 py-3.5 text-stone-600 dark:text-stone-400">{formatDataCurta(b.data)}</td>
              <td className="px-5 py-3.5">
                <StatusPill status={b.status} />
              </td>
              <td className="px-5 py-3.5">
                <ComplexidadeTag nivel={b.complexidade} />
              </td>
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => onSelect(b.id)}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-800"
                >
                  Visualizar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
