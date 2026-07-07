import { useState } from "react";
import { GripVertical } from "lucide-react";
import { pipelineColumns, derivePipeline, initials } from "../lib/derive";
import { PageHeader, Skeleton, Tooltip } from "../components/ui";

function PipelineCard({ card, onDragStart, onDragEnd, dragging }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      className={`mb-2 cursor-grab rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-opacity active:cursor-grabbing ${dragging ? "opacity-40" : "opacity-100"}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${card.avatarBg} ${card.avatarText}`}>{initials(card.cliente)}</span>
          <div>
            <p className="text-xs font-medium text-stone-800">{card.cliente}</p>
            <p className="text-[11px] text-stone-400">{card.evento}</p>
          </div>
        </div>
        <Tooltip text="Arraste para mover">
          <GripVertical className="h-3.5 w-3.5 flex-none text-stone-300" />
        </Tooltip>
      </div>
      <p className="text-xs font-medium text-stone-600">{card.valor}</p>
    </div>
  );
}

export default function PipelinePage({ briefings, loading, onMoveStatus }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColuna, setOverColuna] = useState(null);

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-2 h-7 w-32" />
        <Skeleton className="mb-6 h-4 w-72" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {pipelineColumns.map((c) => (
            <Skeleton key={c.key} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const cards = derivePipeline(briefings);

  const handleDrop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    onMoveStatus(id, status);
    setDraggingId(null);
    setOverColuna(null);
  };

  return (
    <div>
      <PageHeader title="Pipeline" subtitle="Arraste um card para mudar a fase — grava direto no Firestore." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {pipelineColumns.map((col) => {
          const itens = cards.filter((c) => c.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOverColuna(col.key);
              }}
              onDragLeave={() => setOverColuna(null)}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`min-h-[16rem] rounded-2xl border p-2.5 transition-colors ${overColuna === col.key ? "border-rose-300 bg-rose-50/40" : "border-stone-200 bg-stone-50/60"}`}
            >
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <p className="text-xs font-semibold text-stone-700">{col.key}</p>
                <span className="ml-auto text-[11px] text-stone-400">{itens.length}</span>
              </div>

              {itens.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-stone-200 text-center text-[11px] text-stone-300">Arraste um card para cá</div>
              ) : (
                itens.map((card) => (
                  <PipelineCard
                    key={card.id}
                    card={card}
                    dragging={draggingId === card.id}
                    onDragStart={(e, id) => {
                      e.dataTransfer.setData("text/plain", String(id));
                      setDraggingId(id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
