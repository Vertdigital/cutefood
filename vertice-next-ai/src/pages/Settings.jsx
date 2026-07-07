import { useState } from "react";
import { Smile, Check, CheckCircle2 } from "lucide-react";
import { PageHeader, FieldCard, EditableList, Toggle } from "../components/ui";

export default function SettingsPage() {
  const [nome, setNome] = useState("Assistente CuteFood");
  const [boasVindas, setBoasVindas] = useState("Oii! Seja muito bem-vinda 💛 Eu sou a assistente virtual da CuteFood, vou te ajudar a organizar tudo sobre a sua encomenda.");
  const [horarioInicio, setHorarioInicio] = useState("09:00");
  const [horarioFim, setHorarioFim] = useState("19:00");
  const [obrigatorias, setObrigatorias] = useState(["Data do evento", "Quantidade de pessoas", "Tema da decoração", "Sabor de preferência", "Entrega ou retirada"]);
  const [opcionais, setOpcionais] = useState(["Orçamento aproximado", "Referências visuais (imagens)"]);
  const [msgNaoSei, setMsgNaoSei] = useState("Essa parte é sempre confirmada diretamente pela confeiteira, ela vai te passar essa resposta em breve.");
  const [msgEncaminhamento, setMsgEncaminhamento] = useState("Perfeito! Já vou organizar tudo isso e encaminhar para a confeiteira. Ela retorna em breve com a proposta 💛");
  const [emojisAtivos, setEmojisAtivos] = useState(true);
  const [tom, setTom] = useState("Equilibrado");
  const [salvo, setSalvo] = useState(false);

  const handleSalvar = () => {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  return (
    <div>
      <PageHeader title="Configurações da assistente" subtitle="Ajuste como a assistente se comunica com as suas clientes." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-50">Identidade</h2>
            <p className="mb-2 text-xs text-stone-400 dark:text-stone-500">Como a assistente se apresenta às clientes</p>
            <FieldCard label="Nome da assistente">
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-rose-600" />
            </FieldCard>
            <FieldCard label="Mensagem de boas-vindas" description="Enviada assim que a cliente inicia a conversa">
              <textarea
                value={boasVindas}
                onChange={(e) => setBoasVindas(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-rose-600"
              />
            </FieldCard>
            <FieldCard label="Horário de atendimento" description="Janela em que a assistente conduz novos atendimentos">
              <div className="flex items-center gap-3">
                <input type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-rose-600" />
                <span className="text-sm text-stone-400 dark:text-stone-500">até</span>
                <input type="time" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-rose-600" />
              </div>
            </FieldCard>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-50">Perguntas do briefing</h2>
            <p className="mb-2 text-xs text-stone-400 dark:text-stone-500">O que a assistente deve perguntar durante o atendimento</p>
            <FieldCard label="Perguntas obrigatórias" description="Sempre coletadas antes de encerrar o briefing">
              <EditableList items={obrigatorias} onChange={setObrigatorias} placeholder="Adicionar pergunta obrigatória" />
            </FieldCard>
            <FieldCard label="Perguntas opcionais" description="Coletadas quando a conversa permitir">
              <EditableList items={opcionais} onChange={setOpcionais} placeholder="Adicionar pergunta opcional" />
            </FieldCard>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-50">Mensagens de exceção</h2>
            <p className="mb-2 text-xs text-stone-400 dark:text-stone-500">Respostas padrão para situações fora do fluxo comum</p>
            <FieldCard label="Quando não souber responder">
              <textarea value={msgNaoSei} onChange={(e) => setMsgNaoSei(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-rose-600" />
            </FieldCard>
            <FieldCard label="Encaminhamento para a confeiteira" description="Enviada ao concluir o resumo do briefing">
              <textarea value={msgEncaminhamento} onChange={(e) => setMsgEncaminhamento(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-rose-600" />
            </FieldCard>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-3 text-sm font-semibold text-stone-900 dark:text-stone-50">Tom de voz</h2>
            <FieldCard label="Emojis" description="Permitir o uso pontual de emojis nas mensagens">
              <div className="flex items-center gap-3">
                <Toggle checked={emojisAtivos} onChange={setEmojisAtivos} />
                <span className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
                  <Smile className="h-3.5 w-3.5" />
                  {emojisAtivos ? "Ativados" : "Desativados"}
                </span>
              </div>
            </FieldCard>
            <FieldCard label="Tom de comunicação">
              <div className="grid grid-cols-1 gap-2">
                {["Formal", "Equilibrado", "Descontraído"].map((opcao) => (
                  <button
                    key={opcao}
                    onClick={() => setTom(opcao)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${tom === opcao ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300" : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"}`}
                  >
                    <span className="flex items-center justify-between">
                      {opcao}
                      {tom === opcao && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                ))}
              </div>
            </FieldCard>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">Estas configurações ainda não são persistidas no Firestore — apenas o cadastro de briefings foi migrado nesta etapa.</p>
            <button onClick={handleSalvar} className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700">
              Salvar configuração
            </button>
            {salvo && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Configuração salva com sucesso
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
