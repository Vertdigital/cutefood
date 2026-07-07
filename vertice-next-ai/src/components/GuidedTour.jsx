import { X, Compass } from "lucide-react";

export const tourSteps = [
  { page: "dashboard", titulo: "Dashboard", texto: "Aqui a confeiteira enxerga, em um só lugar, tudo o que está acontecendo hoje — lendo direto do Firestore." },
  { page: "briefings", titulo: "Briefings", texto: "Cada atendimento conduzido pela assistente vira um briefing organizado, salvo como um documento na coleção `briefings`." },
  { page: "detail", titulo: "Timeline da conversa", texto: "Ao abrir um briefing, a confeiteira também vê a conversa completa que deu origem àquele pedido." },
  { page: "settings", titulo: "Configurações", texto: "A confeiteira controla como a assistente se comunica: tom de voz, perguntas obrigatórias e mensagens-padrão." },
  { page: "pipeline", titulo: "Pipeline", texto: "Cada pedido percorre um funil visual — arrastar um card já atualiza o campo `status` do documento no Firestore." },
  { page: "analytics", titulo: "Analytics", texto: "E aqui está o resultado de tudo isso: indicadores calculados ao vivo a partir dos briefings salvos." },
];

export default function GuidedTourCard({ step, total, titulo, texto, onNext, onPrev, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700">
            <Compass className="h-3 w-3" />
            Tour guiado · {step + 1} de {total}
          </span>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="text-sm font-semibold text-stone-900">{titulo}</h3>
        <p className="mt-1 text-sm text-stone-500">{texto}</p>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onPrev} disabled={step === 0} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-40">
            Anterior
          </button>
          <button onClick={onNext} className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700">
            {step === total - 1 ? "Encerrar tour" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
