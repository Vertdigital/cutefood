import { AlertTriangle, MessageCircle, Inbox, Clock3, Loader2, PackageCheck, DatabaseZap } from "lucide-react";
import { PageHeader, MetricCard, EmptyState, Skeleton, SeedButton } from "../components/ui";
import BriefingsTable from "../components/BriefingsTable";

export default function DashboardPage({ briefings, loading, error, onSelect, onSeeAll, onSimular, onSeed, seeding }) {
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
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader title="Bom dia 👋" subtitle="Aqui está o resumo dos atendimentos de hoje, direto do Firestore." />
        <button onClick={onSimular} className="flex flex-none items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700">
          <MessageCircle className="h-4 w-4" />
          Simular novo atendimento
        </button>
      </div>

      {semDados ? (
        <div className="rounded-2xl border border-stone-200 bg-white">
          <EmptyState
            icon={DatabaseZap}
            title="Sua coleção 'briefings' está vazia"
            description={
              onSeed
                ? "Popule com dados de exemplo para ver o Dashboard, o Pipeline e o Analytics funcionando com dados reais do Firestore."
                : "Aguarde a chegada de novos atendimentos — nenhum dado de exemplo é usado em produção."
            }
            action={onSeed && <SeedButton onSeed={onSeed} seeding={seeding} />}
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
              <MetricCard icon={Inbox} label="Briefings hoje" value={counts.hoje} tint="bg-stone-100 text-stone-600" />
              <MetricCard icon={Clock3} label="Aguardando orçamento" value={counts.aguardando} tint="bg-amber-50 text-amber-600" />
              <MetricCard icon={Loader2} label="Em atendimento" value={counts.emAtendimento} tint="bg-sky-50 text-sky-600" />
              <MetricCard icon={PackageCheck} label="Pedidos fechados" value={counts.fechados} tint="bg-emerald-50 text-emerald-600" />
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">Briefings recentes</h2>
                <p className="text-xs text-stone-400">Últimos atendimentos recebidos</p>
              </div>
              <button onClick={onSeeAll} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50">
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
