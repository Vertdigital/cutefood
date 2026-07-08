import { AlertTriangle, Inbox, Clock3, Loader2, PackageCheck } from "lucide-react";
import { PageHeader, MetricCard, EmptyState, Skeleton } from "../components/ui";
import BriefingsTable from "../components/BriefingsTable";

export default function DashboardPage({ briefings, loading, error, onSelect, onSeeAll }) {
  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Não foi possível conectar ao Firestore"
        description="Confira as variáveis em .env (veja .env.example) e as regras do Firestore. Detalhes no console do navegador."
      />
    );
  }

  const counts = {
    hoje: briefings.length,
    aguardando: briefings.filter((b) => b.status === "Orçamento").length,
    emAtendimento: briefings.filter((b) => ["Briefing", "Aprovado", "Produção"].includes(b.status)).length,
    fechados: briefings.filter((b) => b.status === "Finalizado").length,
  };

  const semDados = !loading && briefings.length === 0;

  return (
    <div>
      <div className="mb-6">
        <PageHeader title="Bom dia 👋" subtitle="Aqui está o resumo dos atendimentos de hoje, direto do Firestore." />
      </div>

      {semDados ? (
        <div className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <EmptyState
            icon={Inbox}
            title="Nenhum briefing encontrado."
            description="Assim que novos atendimentos chegarem pelo WhatsApp, eles aparecerão aqui."
          />
        </div>
      ) : (
        <>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={Inbox} label="Briefings hoje" value={counts.hoje} tint="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" />
              <MetricCard icon={Clock3} label="Aguardando orçamento" value={counts.aguardando} tint="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" />
              <MetricCard icon={Loader2} label="Em atendimento" value={counts.emAtendimento} tint="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400" />
              <MetricCard icon={PackageCheck} label="Pedidos fechados" value={counts.fechados} tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" />
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
              <div>
                <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Briefings recentes</h2>
                <p className="text-xs text-stone-400 dark:text-stone-500">Últimos atendimentos recebidos</p>
              </div>
              <button onClick={onSeeAll} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
                Ver todos
              </button>
            </div>
            <BriefingsTable items={briefings.slice(0, 4)} onSelect={onSelect} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}
