// Constantes visuais e funções puras derivadas exclusivamente de `briefings`
// (o array vindo do Firestore). Nenhum dado de exemplo/mock vive aqui —
// apenas estilos de UI e transformações de dados reais.

import { Inbox, Loader2, Clock3, CheckCircle2, PackageCheck } from "lucide-react";
import { formatDataCompleta } from "../utils/date";

export const statusStyles = {
  "Novo": { icon: Inbox, badge: "bg-stone-100 text-stone-600" },
  "Briefing": { icon: Loader2, badge: "bg-sky-50 text-sky-700" },
  "Orçamento": { icon: Clock3, badge: "bg-amber-50 text-amber-700" },
  "Aprovado": { icon: CheckCircle2, badge: "bg-violet-50 text-violet-700" },
  "Produção": { icon: Loader2, badge: "bg-indigo-50 text-indigo-700" },
  "Finalizado": { icon: PackageCheck, badge: "bg-emerald-50 text-emerald-700" },
};

export const pipelineColumns = [
  { key: "Novo", dot: "bg-stone-400" },
  { key: "Briefing", dot: "bg-sky-500" },
  { key: "Orçamento", dot: "bg-amber-500" },
  { key: "Aprovado", dot: "bg-violet-500" },
  { key: "Produção", dot: "bg-indigo-500" },
  { key: "Finalizado", dot: "bg-emerald-500" },
];

export const complexidadeDot = { "Simples": "bg-emerald-500", "Média": "bg-amber-500", "Alta": "bg-rose-500" };

export const avatarPalette = [
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
];

export const clienteStatusStyles = {
  "Ativo": "bg-emerald-50 text-emerald-700",
  "Novo": "bg-sky-50 text-sky-700",
  "Em negociação": "bg-amber-50 text-amber-700",
  "Fiel": "bg-violet-50 text-violet-700",
  "Inativo": "bg-stone-100 text-stone-500",
};

export function initials(name) {
  return (name || "?").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

/** Agrupa os briefings reais por cliente. Não adiciona nenhum registro fictício. */
export function deriveClientes(briefings) {
  const grupos = {};
  briefings.forEach((b) => {
    if (!grupos[b.cliente]) grupos[b.cliente] = { nome: b.cliente, telefone: b.telefone, itens: [] };
    grupos[b.cliente].itens.push(b);
  });

  return Object.values(grupos).map((g) => {
    const pedidos = g.itens.length;
    const ultimo = formatDataCompleta(g.itens[g.itens.length - 1].data);
    const temFinalizado = g.itens.some((i) => i.status === "Finalizado");
    const temNovo = g.itens.some((i) => i.status === "Novo");
    let status = "Ativo";
    if (temNovo) status = "Novo";
    else if (pedidos >= 2 && temFinalizado) status = "Fiel";
    return { nome: g.nome, telefone: g.telefone, pedidos, ultimo, status };
  });
}

export function derivePipeline(briefings) {
  return briefings.map((b) => ({
    id: b.id,
    cliente: b.cliente,
    evento: b.evento,
    valor: b.orcamento,
    status: b.status,
    avatarBg: b.avatarBg || "bg-stone-100",
    avatarText: b.avatarText || "text-stone-600",
  }));
}

export function deriveAnalytics(briefings) {
  const total = briefings.length;
  const fechados = briefings.filter((b) => b.status === "Finalizado").length;
  const emNegociacao = briefings.filter((b) => ["Orçamento", "Aprovado", "Produção", "Finalizado"].includes(b.status)).length;
  const conversao = total > 0 ? Math.round((fechados / total) * 100) : 0;

  const valores = briefings
    .map((b) => b.orcamento)
    .filter((v) => v && v.startsWith("R$"))
    .map((v) => Number(v.replace(/[^\d]/g, "")))
    .filter((n) => !Number.isNaN(n));
  const ticketMedio = valores.length > 0 ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : 0;

  return {
    // Ainda não há timestamps de início/fim de conversa persistidos no Firestore
    // para calcular este indicador de verdade — por isso ele fica em branco em
    // vez de exibir um número que não viria dos dados reais.
    tempoMedio: "—",
    orcamentosEnviados: emNegociacao,
    conversao: `${conversao}%`,
    pedidosFechados: fechados,
    ticketMedio: valores.length > 0 ? `R$ ${ticketMedio}` : "—",
  };
}
