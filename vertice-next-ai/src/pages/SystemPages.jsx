import { Sparkles, ArrowRight, Loader2, Compass, Wrench } from "lucide-react";

export function LandingPage({ onEntrar }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white">
          <Sparkles className="h-7 w-7" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Vértice Next AI</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">A plataforma de atendimento inteligente da Vértice, conectada ao Firestore em tempo real.</p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Painel CuteFood CWB</span>

        <button
          onClick={onEntrar}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          Entrar no sistema
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-4 text-[11px] text-stone-400 dark:text-stone-500">Os dados exibidos vêm do Firestore configurado em .env.</p>
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-stone-950">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-rose-600 text-white">
        <Sparkles className="h-6 w-6" />
      </span>
      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Conectando ao Firestore…
      </div>
    </div>
  );
}

export function NotFoundPage({ onVoltar }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center dark:bg-stone-950">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        <Compass className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-semibold text-stone-400 dark:text-stone-500">Erro 404</p>
        <h1 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-50">Essa página não existe</h1>
        <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">O endereço que você tentou acessar não foi encontrado neste ambiente.</p>
      </div>
      <button onClick={onVoltar} className="mt-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700">
        Voltar para o painel
      </button>
    </div>
  );
}

export function MaintenancePage({ onVoltar }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center dark:bg-stone-950">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
        <Wrench className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-semibold text-stone-400 dark:text-stone-500">Manutenção programada</p>
        <h1 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-50">Voltamos em instantes</h1>
        <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">Estamos realizando uma atualização rápida na Vértice Next AI. O atendimento das suas clientes não é afetado.</p>
      </div>
      <button onClick={onVoltar} className="mt-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700">
        Voltar para o painel
      </button>
    </div>
  );
}
