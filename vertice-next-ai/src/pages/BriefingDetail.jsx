import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Pencil, X, Save, Phone, Sparkles, Calendar, Users, StickyNote, Wallet, Truck, Image as ImageIcon, MessageCircle } from "lucide-react";
import { initials } from "../lib/derive";
import { formatDataCompleta } from "../utils/date";
import { InfoRow, StatusPill, ComplexidadeTag, Tooltip } from "../components/ui";
import { subscribeMessages } from "../services/conversations";

const CAMPOS_EDITAVEIS = [
  { key: "cliente", label: "Cliente", type: "text" },
  { key: "telefone", label: "Telefone", type: "text" },
  { key: "evento", label: "Evento", type: "text" },
  { key: "tema", label: "Tema", type: "text" },
  { key: "data", label: "Data do evento", type: "date" },
  { key: "quantidade", label: "Quantidade", type: "text" },
  { key: "sabores", label: "Sabores", type: "text" },
  { key: "orcamento", label: "Orçamento", type: "text" },
  { key: "entrega", label: "Entrega", type: "text" },
  { key: "complexidade", label: "Complexidade", type: "select", options: ["Simples", "Média", "Alta"] },
  { key: "observacoes", label: "Observações", type: "textarea" },
];

function EditForm({ briefing, onSalvar, onCancelar, salvando }) {
  const [form, setForm] = useState(() => {
    const inicial = {};
    CAMPOS_EDITAVEIS.forEach((c) => (inicial[c.key] = briefing[c.key] ?? ""));
    return inicial;
  });

  const setCampo = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-900">Editando briefing</h2>
        <div className="flex items-center gap-2">
          <button onClick={onCancelar} className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
          <button
            onClick={() => onSalvar(form)}
            disabled={salvando}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {salvando ? "Salvando…" : "Salvar no Firestore"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CAMPOS_EDITAVEIS.map((campo) => (
          <div key={campo.key} className={campo.type === "textarea" ? "sm:col-span-2" : ""}>
            <label className="mb-1 block text-xs font-medium text-stone-500">{campo.label}</label>
            {campo.type === "select" ? (
              <select
                value={form[campo.key]}
                onChange={(e) => setCampo(campo.key, e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300"
              >
                {campo.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : campo.type === "textarea" ? (
              <textarea
                value={form[campo.key]}
                onChange={(e) => setCampo(campo.key, e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300"
              />
            ) : (
              <input
                type={campo.type}
                value={form[campo.key]}
                onChange={(e) => setCampo(campo.key, e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ autor, texto, hora }) {
  return (
    <div className={`flex ${autor === "cliente" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${autor === "cliente" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-700"}`}>
        <p>{texto}</p>
        {hora && <p className={`mt-1 text-[10px] ${autor === "cliente" ? "text-rose-100" : "text-stone-400"}`}>{hora}</p>}
      </div>
    </div>
  );
}

/**
 * Exibe a timeline da conversa. Se o briefing tiver `conversationId` (ou seja,
 * foi originado por uma conversa real do WhatsApp processada pelo workflow
 * "Atendimento IA"), ouve a coleção `messages` do Firestore em tempo real.
 * Caso contrário (briefings criados pela simulação de atendimento em
 * desenvolvimento), usa o array `mensagens` embutido no próprio documento.
 * Em ambos os casos, o frontend só LÊ — nunca grava mensagens.
 */
function TimelinePanel({ briefing }) {
  const [mensagensFirestore, setMensagensFirestore] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!briefing.conversationId) {
      setMensagensFirestore(null);
      return undefined;
    }
    const unsubscribe = subscribeMessages(briefing.conversationId, setMensagensFirestore, setErro);
    return () => unsubscribe();
  }, [briefing.conversationId]);

  const mensagens = briefing.conversationId ? mensagensFirestore : briefing.mensagens;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white">
      <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-4">
        <MessageCircle className="h-4 w-4 text-stone-400" />
        <h2 className="text-sm font-semibold text-stone-900">Timeline da conversa</h2>
        {briefing.conversationId && <span className="ml-auto text-[10px] font-medium text-stone-400">ao vivo · Firestore</span>}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {erro && <p className="text-xs text-rose-600">Não foi possível carregar as mensagens desta conversa.</p>}
        {mensagens === null && !erro && <p className="text-xs text-stone-400">Carregando mensagens…</p>}
        {mensagens && mensagens.length === 0 && <p className="text-xs text-stone-400">Nenhuma mensagem registrada para este briefing.</p>}
        {mensagens && mensagens.map((m, i) => <MessageBubble key={m.id || i} autor={m.autor} texto={m.texto} hora={m.hora} />)}
      </div>
    </div>
  );
}

export default function BriefingDetailPage({ briefing, onBack, onDelete, onUpdate }) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleExcluir = async () => {
    setExcluindo(true);
    await onDelete(briefing.id);
  };

  const handleSalvar = async (form) => {
    setSalvando(true);
    await onUpdate(briefing.id, form);
    setSalvando(false);
    setEditando(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${briefing.avatarBg || "bg-stone-100"} ${briefing.avatarText || "text-stone-600"}`}>
            {initials(briefing.cliente)}
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-900">{briefing.cliente}</p>
            <p className="text-xs text-stone-400">{briefing.telefone}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusPill status={briefing.status} />
          {!editando && (
            <Tooltip text="Editar este briefing">
              <button onClick={() => setEditando(true)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-400 transition-colors hover:border-stone-300 hover:text-stone-600">
                <Pencil className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
          {!confirmandoExclusao ? (
            <Tooltip text="Excluir este briefing no Firestore">
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-400 transition-colors hover:border-rose-200 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5">
              <span className="text-xs text-rose-700">Excluir de vez?</span>
              <button onClick={handleExcluir} disabled={excluindo} className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700">
                {excluindo ? "…" : "Sim"}
              </button>
              <button onClick={() => setConfirmandoExclusao(false)} className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700">
                Não
              </button>
            </div>
          )}
        </div>
      </div>

      {editando ? (
        <EditForm briefing={briefing} onSalvar={handleSalvar} onCancelar={() => setEditando(false)} salvando={salvando} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-900">Resumo do briefing</h2>
                <ComplexidadeTag nivel={briefing.complexidade} />
              </div>
              <p className="mb-2 text-xs text-stone-400">Documento da coleção `briefings` no Firestore</p>

              <div className="divide-y divide-stone-100">
                <InfoRow icon={Phone} label="Telefone" value={briefing.telefone} />
                <InfoRow icon={Sparkles} label="Evento" value={briefing.evento} />
                <InfoRow icon={Sparkles} label="Tema" value={briefing.tema} />
                <InfoRow icon={Calendar} label="Data" value={formatDataCompleta(briefing.data)} />
                <InfoRow icon={Users} label="Quantidade" value={briefing.quantidade} />
                <InfoRow icon={StickyNote} label="Sabores" value={briefing.sabores} />
                <InfoRow icon={Wallet} label="Orçamento" value={briefing.orcamento} />
                <InfoRow icon={Truck} label="Entrega" value={briefing.entrega} />
                <InfoRow
                  icon={ImageIcon}
                  label="Referências"
                  value={briefing.referencias > 0 ? `${briefing.referencias} imagem(ns) recebida(s)` : "Nenhuma referência enviada"}
                />
                <InfoRow icon={StickyNote} label="Observações" value={briefing.observacoes} />
              </div>
            </div>
          </section>

          <section className="lg:col-span-2">
            <TimelinePanel briefing={briefing} />
          </section>
        </div>
      )}
    </div>
  );
}
