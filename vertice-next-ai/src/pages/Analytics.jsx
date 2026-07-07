import { Clock3, Send, CheckCircle2, PackageCheck, Wallet, DatabaseZap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { deriveAnalytics } from "../lib/derive";
import { PageHeader, MetricCard, Skeleton, EmptyState } from "../components/ui";
import { useTheme } from "../context/ThemeProvider";

// Histórico anterior à existência da coleção no Firestore — mantido apenas
// como referência de contexto no gráfico (claramente rotulado como tal).
// O último ponto do gráfico ("Atual") é sempre o total real de `briefings`.
const HISTORICO_ANTERIOR = [
  { mes: "Abr", pedidos: 5 },
  { mes: "Mai", pedidos: 7 },
  { mes: "Jun", pedidos: 6 },
  { mes: "Jul", pedidos: 9 },
  { mes: "Ago", pedidos: 8 },
];

export default function AnalyticsPage({ briefings, loading }) {
  const { isDark } = useTheme();
  const corGrade = isDark ? "#292524" : "#e7e5e4";
  const corTexto = isDark ? "#a8a29e" : "#78716c";
  const corFundoTooltip = isDark ? "#1c1917" : "#ffffff";
  const corCursor = isDark ? "#292524" : "#fafaf9";

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-2 h-7 w-40" />
        <Skeleton className="mb-6 h-4 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="mt-8 h-72" />
      </div>
    );
  }

  if (briefings.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Indicadores calculados ao vivo a partir dos briefings no Firestore." />
        <div className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <EmptyState icon={DatabaseZap} title="Ainda não há briefings para calcular indicadores" description="Assim que a coleção 'briefings' tiver dados, os indicadores aparecem aqui automaticamente." />
        </div>
      </div>
    );
  }

  const metrics = deriveAnalytics(briefings);
  const evolucao = [...HISTORICO_ANTERIOR, { mes: "Atual", pedidos: briefings.length }];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Indicadores calculados ao vivo a partir dos briefings no Firestore." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={Clock3} label="Tempo médio de atendimento" value={metrics.tempoMedio} tint="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400" />
        <MetricCard icon={Send} label="Orçamentos enviados" value={metrics.orcamentosEnviados} tint="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" />
        <MetricCard icon={CheckCircle2} label="Conversões" value={metrics.conversao} tint="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" />
        <MetricCard icon={PackageCheck} label="Pedidos fechados" value={metrics.pedidosFechados} tint="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" />
        <MetricCard icon={Wallet} label="Ticket médio" value={metrics.ticketMedio} tint="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400" />
      </div>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-50">Evolução de pedidos</h2>
        <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">Histórico de referência + total atual de briefings no Firestore</p>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: corTexto }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: corTexto }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${corGrade}`, fontSize: 12, backgroundColor: corFundoTooltip, color: corTexto }} cursor={{ fill: corCursor }} />
              <Bar dataKey="pedidos" fill="#e11d48" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
