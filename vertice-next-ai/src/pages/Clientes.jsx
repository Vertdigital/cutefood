import { useState } from "react";
import { Search, UserRound, ArrowLeft, PackageCheck, Clock3 } from "lucide-react";
import { initials, clienteStatusStyles } from "../lib/derive";
import { PageHeader, EmptyState, TableSkeleton, MetricCard } from "../components/ui";
import BriefingsTable from "../components/BriefingsTable";

export function ClientesPage({ clientes, loading, onVisualizar }) {
  const [query, setQuery] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const statusOptions = ["Todos", "Ativo", "Novo", "Em negociação", "Fiel"];
  const filtered = clientes.filter((c) => {
    const matchQuery = c.nome.toLowerCase().includes(query.toLowerCase());
    const matchFiltro = filtro === "Todos" || c.status === filtro;
    return matchQuery && matchFiltro;
  });

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Derivado automaticamente dos briefings salvos no Firestore." />
      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-400">{loading ? "Carregando…" : `${filtered.length} clientes`}</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-stone-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente" className="w-36 text-sm text-stone-700 placeholder-stone-400 outline-none sm:w-48" />
            </div>
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 outline-none">
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={UserRound} title="Nenhuma cliente encontrada" description="Tente ajustar a busca/filtro, ou aguarde novos atendimentos no Firestore." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-stone-400">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Pedidos</th>
                  <th className="px-5 py-3 font-medium">Último atendimento</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.nome} className="border-t border-stone-100 transition-colors hover:bg-stone-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">{initials(c.nome)}</span>
                        <div>
                          <p className="font-medium text-stone-800">{c.nome}</p>
                          <p className="text-xs text-stone-400">{c.telefone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">{c.pedidos}</td>
                    <td className="px-5 py-3.5 text-stone-600">{c.ultimo}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${clienteStatusStyles[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => onVisualizar(c.nome)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50">
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function ClienteDetailPage({ cliente, briefings, onBack, onSelectBriefing }) {
  const briefingsDoCliente = briefings.filter((b) => b.cliente === cliente.nome);
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600">{initials(cliente.nome)}</span>
          <div>
            <p className="text-sm font-semibold text-stone-900">{cliente.nome}</p>
            <p className="text-xs text-stone-400">{cliente.telefone}</p>
          </div>
        </div>
        <span className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${clienteStatusStyles[cliente.status]}`}>{cliente.status}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard icon={PackageCheck} label="Pedidos realizados" value={cliente.pedidos} tint="bg-stone-100 text-stone-600" />
        <MetricCard icon={Clock3} label="Último atendimento" value={cliente.ultimo} tint="bg-amber-50 text-amber-600" />
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-stone-900">Briefings desta cliente</h2>
        </div>
        <BriefingsTable items={briefingsDoCliente} onSelect={onSelectBriefing} loading={false} />
      </div>
    </div>
  );
}
