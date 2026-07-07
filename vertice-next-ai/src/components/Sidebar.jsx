import { LayoutGrid, Layers, CalendarDays, ClipboardList, Users, BarChart3, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Tooltip } from "./ui";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "pipeline", label: "Pipeline", icon: Layers },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "briefings", label: "Briefings", icon: ClipboardList },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "settings", label: "Configurações", icon: SettingsIcon },
];

export default function Sidebar({ page, onNavigate }) {
  return (
    <aside className="flex w-16 flex-none flex-col border-r border-stone-200 bg-white transition-all lg:w-64 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-2.5 px-4 py-5 lg:px-5">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-rose-600 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Vértice Next AI</p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">Piloto: CuteFood CWB</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 lg:px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <Tooltip key={item.key} text={item.label}>
              <button
                onClick={() => onNavigate(item.key)}
                className={`flex w-full items-center justify-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors lg:justify-start lg:px-3 ${
                  active ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800"
                }`}
              >
                <Icon className="h-4 w-4 flex-none" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
