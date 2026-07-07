import { useState } from "react";
import { Play, Plus, Bell, ChevronDown } from "lucide-react";
import { initials } from "../lib/derive";
import { Tooltip } from "./ui";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  briefings: "Briefings",
  settings: "Configurações",
  detail: "Detalhe do briefing",
  clientes: "Clientes",
  clienteDetail: "Detalhe da cliente",
  agenda: "Agenda",
  pipeline: "Pipeline",
  analytics: "Analytics",
};

export default function Header({ page, confeiteira, onNovoAtendimento, onIniciarTour, onDemoNotFound, onDemoMaintenance }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Notas informativas fixas de UI — não representam dados de negócio (não são
  // lidas de nenhuma coleção), por isso não fazem parte do escopo de migração
  // para o Firestore.
  const notificacoes = [
    { texto: "Fique de olho em novos briefings recebidos hoje", tempo: "atualizado agora" },
    { texto: "Pedidos aguardando orçamento aparecem no Dashboard", tempo: "atualizado agora" },
  ];

  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 sm:px-8">
      <p className="text-sm font-medium text-stone-400">{PAGE_TITLES[page] || "Vértice Next AI"}</p>

      <div className="flex items-center gap-2 sm:gap-3">
        <Tooltip text="Iniciar tour guiado">
          <button onClick={onIniciarTour} className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50">
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tour guiado</span>
          </button>
        </Tooltip>

        <button onClick={onNovoAtendimento} className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-700 sm:px-3.5">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Novo atendimento</span>
        </button>

        <div className="relative">
          <Tooltip text="Notificações">
            <button onClick={() => setNotifOpen((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-600" />
            </button>
          </Tooltip>
          {notifOpen && (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
              <p className="px-2 py-1.5 text-xs font-semibold text-stone-500">Notificações</p>
              {notificacoes.map((n, i) => (
                <div key={i} className="rounded-lg px-2 py-2 hover:bg-stone-50">
                  <p className="text-xs text-stone-700">{n.texto}</p>
                  <p className="text-[11px] text-stone-400">{n.tempo}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-lg border border-stone-200 py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-stone-50">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600">{initials(confeiteira)}</span>
            <span className="hidden text-xs font-medium text-stone-700 sm:inline">{confeiteira}</span>
            <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
              <button className="w-full rounded-lg px-3 py-2 text-left text-xs text-stone-600 hover:bg-stone-50">Meu perfil</button>
              <button className="w-full rounded-lg px-3 py-2 text-left text-xs text-stone-600 hover:bg-stone-50">Sair</button>
              <div className="my-1 border-t border-stone-100" />
              <button onClick={onDemoNotFound} className="w-full rounded-lg px-3 py-2 text-left text-xs text-stone-500 hover:bg-stone-50">
                Ver página 404 (demo)
              </button>
              <button onClick={onDemoMaintenance} className="w-full rounded-lg px-3 py-2 text-left text-xs text-stone-500 hover:bg-stone-50">
                Ver modo manutenção (demo)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
