import { useState, useEffect, useMemo, useCallback } from "react";
import { updateBriefing, deleteBriefing, subscribeBriefings } from "./services/briefings";
import { createBriefingFromWebhook } from "./services/n8n";
import { deriveClientes } from "./lib/derive";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import SimulationModal from "./components/SimulationModal";
import GuidedTourCard, { tourSteps } from "./components/GuidedTour";
import { LandingPage, LoadingScreen, NotFoundPage, MaintenancePage } from "./pages/SystemPages";
import DashboardPage from "./pages/Dashboard";
import BriefingsPage from "./pages/Briefings";
import BriefingDetailPage from "./pages/BriefingDetail";
import { ClientesPage, ClienteDetailPage } from "./pages/Clientes";
import AgendaPage from "./pages/Agenda";
import PipelinePage from "./pages/Pipeline";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";

// O botão "Popular com dados de teste" e os dados que ele grava só existem
// em ambiente de desenvolvimento (`npm run dev`). Numa build de produção
// (`npm run build`), `import.meta.env.DEV` é `false` e este import nem é
// incluído no bundle final graças ao tree-shaking do Vite.
const IS_DEV = import.meta.env.DEV;

export default function VerticeNextAI() {
  const [fase, setFase] = useState("landing"); // landing | loading | app
  const [page, setPage] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedClienteNome, setSelectedClienteNome] = useState(null);
  const [detailOrigin, setDetailOrigin] = useState("briefings");
  const [briefings, setBriefings] = useState([]);
  const [loadingBriefings, setLoadingBriefings] = useState(true);
  const [errorBriefings, setErrorBriefings] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [tourStep, setTourStep] = useState(null);

  // Assina a coleção `briefings` do Firestore assim que o usuário entra no app,
  // e cancela a assinatura ao sair/desmontar — única fonte de dados do sistema.
  useEffect(() => {
    if (fase !== "app") return undefined;
    setLoadingBriefings(true);
    const unsubscribe = subscribeBriefings(
      (data) => {
        setBriefings(data);
        setLoadingBriefings(false);
        setErrorBriefings(null);
      },
      (error) => {
        setLoadingBriefings(false);
        setErrorBriefings(error);
      }
    );
    return () => unsubscribe();
  }, [fase]);

  // Derivações memorizadas: só recalculam quando `briefings` muda de fato,
  // não a cada navegação entre telas ou abertura de modais.
  const clientes = useMemo(() => deriveClientes(briefings), [briefings]);
  const selected = useMemo(() => briefings.find((b) => b.id === selectedId), [briefings, selectedId]);
  const selectedCliente = useMemo(() => clientes.find((c) => c.nome === selectedClienteNome), [clientes, selectedClienteNome]);

  const entrarNoSistema = useCallback(() => {
    setFase("loading");
    setTimeout(() => setFase("app"), 900);
  }, []);

  const handleSelect = useCallback((id, origin = "briefings") => {
    setSelectedId(id);
    setDetailOrigin(origin);
    setPage("detail");
  }, []);

  const handleNavigate = useCallback((key) => {
    setSelectedId(null);
    setSelectedClienteNome(null);
    setPage(key);
  }, []);

  const handleVisualizarCliente = useCallback((nome) => {
    setSelectedClienteNome(nome);
    setPage("clienteDetail");
  }, []);

  const handleConcluirSimulacao = useCallback(async (payload) => {
    // A criação passa pelo n8n: Frontend -> Webhook -> valida -> Firestore -> JSON.
    // O onSnapshot já ativo (useEffect acima) traz o novo documento em tempo real;
    // usamos o `id` retornado apenas para já abrir a tela de detalhe dele.
    const resultado = await createBriefingFromWebhook(payload);
    setSimulationOpen(false);
    setSelectedId(resultado.id);
    setDetailOrigin("briefings");
    setPage("detail");
  }, []);

  const handleMoveStatus = useCallback((id, novoStatus) => {
    setBriefings((prev) => prev.map((b) => (b.id === id ? { ...b, status: novoStatus } : b)));
    updateBriefing(id, { status: novoStatus });
  }, []);

  const handleUpdateBriefing = useCallback(async (id, dados) => {
    await updateBriefing(id, dados);
  }, []);

  const handleDeleteBriefing = useCallback(
    async (id) => {
      await deleteBriefing(id);
      handleNavigate(detailOrigin);
    },
    [detailOrigin, handleNavigate]
  );

  const handleSeed = useCallback(async () => {
    if (!IS_DEV) return;
    setSeeding(true);
    try {
      const { seedBriefings } = await import("./data/seedBriefings");
      // Sequencial (não Promise.all) para não sobrecarregar o Webhook do n8n
      // com chamadas simultâneas — é só uma conveniência de desenvolvimento.
      for (const briefing of seedBriefings) {
        await createBriefingFromWebhook(briefing);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[Vértice Next AI] Falha ao popular dados de teste via n8n:", error);
      setErrorBriefings(error);
    } finally {
      setSeeding(false);
    }
  }, []);

  const iniciarTour = useCallback(() => {
    setTourStep(0);
    const primeiro = tourSteps[0];
    if (primeiro.page === "detail" && briefings[0]) handleSelect(briefings[0].id, "briefings");
    else handleNavigate(primeiro.page);
  }, [briefings, handleSelect, handleNavigate]);

  const avancarTour = useCallback(() => {
    if (tourStep === tourSteps.length - 1) {
      setTourStep(null);
      return;
    }
    const proximo = tourStep + 1;
    setTourStep(proximo);
    const alvo = tourSteps[proximo];
    if (alvo.page === "detail" && briefings[0]) handleSelect(briefings[0].id, "briefings");
    else handleNavigate(alvo.page);
  }, [tourStep, briefings, handleSelect, handleNavigate]);

  const voltarTour = useCallback(() => {
    if (tourStep === 0) return;
    const anterior = tourStep - 1;
    setTourStep(anterior);
    const alvo = tourSteps[anterior];
    if (alvo.page === "detail" && briefings[0]) handleSelect(briefings[0].id, "briefings");
    else handleNavigate(alvo.page);
  }, [tourStep, briefings, handleSelect, handleNavigate]);

  if (fase === "landing") return <LandingPage onEntrar={entrarNoSistema} />;
  if (fase === "loading") return <LoadingScreen />;
  if (page === "notfound") return <NotFoundPage onVoltar={() => handleNavigate("dashboard")} />;
  if (page === "maintenance") return <MaintenancePage onVoltar={() => handleNavigate("dashboard")} />;

  let content;
  if (page === "detail" && selected) {
    content = <BriefingDetailPage briefing={selected} onBack={() => handleNavigate(detailOrigin)} onDelete={handleDeleteBriefing} onUpdate={handleUpdateBriefing} />;
  } else if (page === "briefings") {
    content = (
      <BriefingsPage
        briefings={briefings}
        loading={loadingBriefings}
        onSelect={(id) => handleSelect(id, "briefings")}
        onSeed={IS_DEV ? handleSeed : null}
        seeding={seeding}
      />
    );
  } else if (page === "settings") {
    content = <SettingsPage />;
  } else if (page === "clientes") {
    content = <ClientesPage clientes={clientes} loading={loadingBriefings} onVisualizar={handleVisualizarCliente} />;
  } else if (page === "clienteDetail" && selectedCliente) {
    content = <ClienteDetailPage cliente={selectedCliente} briefings={briefings} onBack={() => handleNavigate("clientes")} onSelectBriefing={(id) => handleSelect(id, "clienteDetail")} />;
  } else if (page === "agenda") {
    content = <AgendaPage briefings={briefings} loading={loadingBriefings} onSelect={(id) => handleSelect(id, "agenda")} />;
  } else if (page === "pipeline") {
    content = <PipelinePage briefings={briefings} loading={loadingBriefings} onMoveStatus={handleMoveStatus} />;
  } else if (page === "analytics") {
    content = <AnalyticsPage briefings={briefings} loading={loadingBriefings} />;
  } else {
    content = (
      <DashboardPage
        briefings={briefings}
        loading={loadingBriefings}
        error={errorBriefings}
        onSelect={(id) => handleSelect(id, "briefings")}
        onSeeAll={() => handleNavigate("briefings")}
        onSimular={() => setSimulationOpen(true)}
        onSeed={IS_DEV ? handleSeed : null}
        seeding={seeding}
      />
    );
  }

  const sidebarPage = page === "detail" ? detailOrigin : page === "clienteDetail" ? "clientes" : page;

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <Sidebar page={sidebarPage} onNavigate={handleNavigate} />
      <div className="flex flex-1 flex-col">
        <Header
          page={page}
          confeiteira="Confeiteira CuteFood"
          onNovoAtendimento={() => setSimulationOpen(true)}
          onIniciarTour={iniciarTour}
          onVerPagina404={() => setPage("notfound")}
          onVerModoManutencao={() => setPage("maintenance")}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-28 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">{content}</div>
        </main>
      </div>

      {simulationOpen && <SimulationModal onClose={() => setSimulationOpen(false)} onConcluir={handleConcluirSimulacao} />}

      {tourStep !== null && (
        <GuidedTourCard
          step={tourStep}
          total={tourSteps.length}
          titulo={tourSteps[tourStep].titulo}
          texto={tourSteps[tourStep].texto}
          onNext={avancarTour}
          onPrev={voltarTour}
          onClose={() => setTourStep(null)}
        />
      )}
    </div>
  );
}
