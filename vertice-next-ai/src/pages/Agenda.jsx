import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { statusStyles, complexidadeDot } from "../lib/derive";
import { getDiaMes } from "../utils/date";
import { PageHeader, Skeleton, Tooltip } from "../components/ui";

const ORDEM_MESES = ["ago", "set", "out", "nov"];
const MESES_INFO = {
  ago: { label: "Agosto de 2026", weekdayOffset: 6, dias: 31 },
  set: { label: "Setembro de 2026", weekdayOffset: 2, dias: 30 },
  out: { label: "Outubro de 2026", weekdayOffset: 4, dias: 31 },
  nov: { label: "Novembro de 2026", weekdayOffset: 0, dias: 30 },
};

export default function AgendaPage({ briefings, loading, onSelect }) {
  const [visao, setVisao] = useState("mensal");
  const [mesIndex, setMesIndex] = useState(1);
  const mesAtual = ORDEM_MESES[mesIndex];
  const info = MESES_INFO[mesAtual];

  const porDia = {};
  briefings.forEach((b) => {
    const { dia, mes } = getDiaMes(b.data);
    if (mes === mesAtual) {
      porDia[dia] = porDia[dia] || [];
      porDia[dia].push(b);
    }
  });

  const celulas = [];
  for (let i = 0; i < info.weekdayOffset; i++) celulas.push(null);
  for (let d = 1; d <= info.dias; d++) celulas.push(d);

  const trocarMes = (delta) => setMesIndex((i) => (i + delta + ORDEM_MESES.length) % ORDEM_MESES.length);
  const semana = [15, 16, 17, 18, 19, 20, 21].filter((d) => d <= info.dias);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Agenda" subtitle="Pedidos organizados por data, lidos do Firestore." />
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-1">
          {["mensal", "semanal"].map((v) => (
            <button
              key={v}
              onClick={() => setVisao(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${visao === v ? "bg-rose-600 text-white" : "text-stone-500 hover:bg-stone-50"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        {loading ? (
          <Skeleton className="h-80" />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => trocarMes(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold text-stone-900">{info.label}</p>
              <button onClick={() => trocarMes(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {visao === "mensal" ? (
              <div>
                <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-stone-400">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {celulas.map((d, i) => (
                    <div key={i} className={`min-h-[72px] rounded-lg border p-1.5 text-xs ${d ? "border-stone-100 hover:border-stone-200" : "border-transparent"}`}>
                      {d && (
                        <>
                          <p className="mb-1 text-stone-400">{d}</p>
                          <div className="space-y-1">
                            {(porDia[d] || []).map((b) => (
                              <Tooltip key={b.id} text={`${b.cliente} — ${b.status}`}>
                                <button
                                  onClick={() => onSelect(b.id)}
                                  className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium transition-colors ${statusStyles[b.status].badge} hover:opacity-80`}
                                >
                                  <span className={`h-1.5 w-1.5 flex-none rounded-full ${complexidadeDot[b.complexidade]}`} />
                                  <span className="truncate">{b.cliente.split(" ")[0]}</span>
                                </button>
                              </Tooltip>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
                {semana.map((d) => (
                  <div key={d} className="rounded-lg border border-stone-100 p-2">
                    <p className="mb-2 text-xs font-medium text-stone-400">
                      {d} de {mesAtual}
                    </p>
                    <div className="space-y-1.5">
                      {(porDia[d] || []).length === 0 && <p className="text-[11px] text-stone-300">Sem pedidos</p>}
                      {(porDia[d] || []).map((b) => (
                        <button
                          key={b.id}
                          onClick={() => onSelect(b.id)}
                          className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-medium transition-colors ${statusStyles[b.status].badge} hover:opacity-80`}
                        >
                          <span className={`h-1.5 w-1.5 flex-none rounded-full ${complexidadeDot[b.complexidade]}`} />
                          {b.cliente}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
