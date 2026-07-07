import { useState } from "react";
import { X, MessageCircle, Send, CheckCircle2, Loader2, Sparkles, Calendar, Users, StickyNote, Truck, Image as ImageIcon, Wallet } from "lucide-react";
import { InfoRow } from "./ui";
import { avatarPalette } from "../lib/derive";
import { formatDataCompleta } from "../utils/date";

// Roteiro de uma simulação de atendimento via WhatsApp. Isso NÃO é dado do
// sistema — é o texto fixo usado para conduzir a simulação guiada. O único
// dado real que sai daqui é o objeto gravado no Firestore quando a
// confeiteira clica em "Concluir e criar briefing".
const simulationScript = [
  { autor: "cliente", texto: "Oi, boa tarde!" },
  { autor: "ia", texto: "Boa tarde! Seja bem-vinda 💛 Pra qual ocasião seria o bolo?" },
  { autor: "cliente", texto: "é pro aniversário do meu filho", campos: { evento: "Aniversário infantil" } },
  { autor: "ia", texto: "Que demais! Vocês já têm uma data definida?" },
  { autor: "cliente", texto: "dia 14 de novembro", campos: { data: "2026-11-14" } },
  { autor: "ia", texto: "Perfeito, já anotei! E quantas pessoas mais ou menos?" },
  { autor: "cliente", texto: "umas 25 pessoas", campos: { quantidade: "25 pessoas" } },
  { autor: "ia", texto: "Já pensaram em algum tema para a decoração?" },
  { autor: "cliente", texto: "ele ama animais, queria tema safári", campos: { tema: "Safári — verde e amarelo" } },
  { autor: "ia", texto: "Amei a ideia! E sobre sabor, já tem alguma preferência?" },
  { autor: "cliente", texto: "chocolate com ninho", campos: { sabores: "Chocolate com ninho" } },
  { autor: "ia", texto: "Ótima escolha! Vai ser entrega ou retirada?" },
  { autor: "cliente", texto: "entrega, por favor", campos: { entrega: "Entrega no local do evento" } },
  { autor: "ia", texto: "Combinado. Tem alguma referência visual que queira compartilhar?" },
  { autor: "cliente", texto: "[imagem enviada — bolo tema safári]", campos: { referencias: 1 } },
  { autor: "ia", texto: "Recebi sua imagem, ficou registrada como referência 🦁" },
  { autor: "cliente", texto: "dá pra saber o valor já?" },
  { autor: "ia", texto: "Essa parte é confirmada diretamente pela confeiteira, ela te retorna em breve 💛 Mas tem algum orçamento em mente?" },
  { autor: "cliente", texto: "pensei em uns R$280", campos: { orcamento: "R$ 280" } },
  { autor: "ia", texto: "Perfeito, já registrei essa referência. Vou organizar tudo e encaminhar para a confeiteira!" },
];

function addMinutes(base, mins) {
  const [h, m] = base.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function SimulationModal({ onClose, onConcluir }) {
  const [step, setStep] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const visiveis = simulationScript.slice(0, step + 1);
  const finalizado = step >= simulationScript.length - 1;

  const liveBriefing = visiveis.reduce(
    (acc, m) => (m.campos ? { ...acc, ...m.campos } : acc),
    { evento: "", data: "", quantidade: "", tema: "", sabores: "", entrega: "", referencias: 0, orcamento: "" }
  );

  const avancar = () => {
    if (!finalizado) setStep((s) => s + 1);
  };

  const concluir = async () => {
    setSalvando(true);
    setErro(null);
    const cor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];
    const mensagens = simulationScript.map((m, i) => ({ autor: m.autor, texto: m.texto, hora: addMinutes("13:00", i * 2) }));

    try {
      await onConcluir({
        cliente: "Ana Beatriz Souza",
        telefone: "(41) 99000-1122",
        evento: liveBriefing.evento || "Não informado",
        tema: liveBriefing.tema || "Não informado",
        data: liveBriefing.data || "2026-11-14",
        quantidade: liveBriefing.quantidade || "Não informado",
        sabores: liveBriefing.sabores || "Não informado",
        orcamento: liveBriefing.orcamento || "Não informado",
        entrega: liveBriefing.entrega || "Não informado",
        referencias: liveBriefing.referencias || 0,
        observacoes: "Briefing criado a partir de uma simulação de atendimento via WhatsApp.",
        status: "Novo",
        complexidade: "Simples",
        avatarBg: cor.bg,
        avatarText: cor.text,
        mensagens,
      });
    } catch (e) {
      setErro(e.message || "Não foi possível criar o briefing.");
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-stone-900/40 px-4 dark:bg-black/60">
      <div className="flex h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-stone-900">
        <div className="flex w-full flex-col border-r border-stone-200 sm:w-1/2 dark:border-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Simulação de atendimento</p>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {visiveis.map((m, i) => (
              <div key={i} className={`flex ${m.autor === "cliente" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.autor === "cliente" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"}`}>{m.texto}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 p-4 dark:border-stone-800">
            {erro && (
              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {erro}
              </div>
            )}
            {!finalizado ? (
              <button onClick={avancar} className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700">
                <Send className="h-3.5 w-3.5" />
                Avançar conversa
              </button>
            ) : (
              <button
                onClick={concluir}
                disabled={salvando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {salvando ? "Enviando ao workflow do n8n…" : erro ? "Tentar novamente" : "Concluir e criar briefing"}
              </button>
            )}
          </div>
        </div>

        <div className="hidden w-1/2 flex-col bg-stone-50 sm:flex dark:bg-stone-950/60">
          <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Briefing sendo preenchido</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">Ao concluir, este objeto é enviado ao Webhook do n8n, que valida e grava no Firestore</p>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
            <InfoRow icon={Sparkles} label="Evento" value={liveBriefing.evento} highlight={!!liveBriefing.evento} />
            <InfoRow icon={Calendar} label="Data" value={liveBriefing.data ? formatDataCompleta(liveBriefing.data) : ""} highlight={!!liveBriefing.data} />
            <InfoRow icon={Users} label="Quantidade" value={liveBriefing.quantidade} highlight={!!liveBriefing.quantidade} />
            <InfoRow icon={Sparkles} label="Tema" value={liveBriefing.tema} highlight={!!liveBriefing.tema} />
            <InfoRow icon={StickyNote} label="Sabores" value={liveBriefing.sabores} highlight={!!liveBriefing.sabores} />
            <InfoRow icon={Truck} label="Entrega" value={liveBriefing.entrega} highlight={!!liveBriefing.entrega} />
            <InfoRow icon={ImageIcon} label="Referências" value={liveBriefing.referencias > 0 ? `${liveBriefing.referencias} imagem(ns) recebida(s)` : ""} highlight={liveBriefing.referencias > 0} />
            <InfoRow icon={Wallet} label="Orçamento" value={liveBriefing.orcamento} highlight={!!liveBriefing.orcamento} />
          </div>
        </div>
      </div>
    </div>
  );
}
