import { useState } from "react";
import { Search, SlidersHorizontal, DatabaseZap } from "lucide-react";
import { PageHeader, EmptyState, SeedButton, Tooltip } from "../components/ui";
import BriefingsTable from "../components/BriefingsTable";

export default function BriefingsPage({ briefings, loading, onSelect, onSeed, seeding }) {
  const [query, setQuery] = useState("");
  const filtered = briefings.filter((b) => `${b.cliente} ${b.evento}`.toLowerCase().includes(query.toLowerCase()));
  const semDados = !loading && briefings.length === 0;

  return (
    <div>
      <PageHeader title="Briefings" subtitle="Todos os atendimentos conduzidos pela assistente, lidos em tempo real do Firestore." />
      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-400">{loading ? "Carregando…" : `${filtered.length} atendimentos`}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cliente ou evento"
                className="w-40 text-sm text-stone-700 placeholder-stone-400 outline-none sm:w-56"
              />
            </div>
            <Tooltip text="Filtrar por status ou complexidade">
              <button className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtros
              </button>
            </Tooltip>
          </div>
        </div>
        {semDados ? (
          <EmptyState
            icon={DatabaseZap}
            title="Nenhum briefing no Firestore ainda"
            description={onSeed ? "Popule com dados de exemplo para começar." : "Aguarde novos atendimentos chegarem."}
            action={onSeed && <SeedButton onSeed={onSeed} seeding={seeding} />}
          />
        ) : (
          <BriefingsTable items={filtered} onSelect={onSelect} loading={loading} />
        )}
      </div>
    </div>
  );
}
