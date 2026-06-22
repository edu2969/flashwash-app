"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaCarSide, FaClock } from "react-icons/fa";

//
// ======================================================
// TIPOS
// ======================================================
//

interface OrdenPendiente {
  id: string;
  patente: string;
  vehiculoId: string;
  total: number;
  duracionMins: number;
  createdAt: number;
  endAt: number;
}

// Cuántas filas caben en la pantalla antes de resumir el resto.
const MAX_VISIBLE = 7;

const VEHICULO_LABEL: Record<string, string> = {
  auto: "Auto",
  suv: "Grande",
  grande: "Extra",
};

export const ORDERS_QUERY_KEY = ["orders", "pending"] as const;

async function fetchPendientes(): Promise<OrdenPendiente[]> {
  const res = await fetch("/api/orders", { cache: "no-store" });

  if (!res.ok) {
    throw new Error("No se pudieron cargar las órdenes");
  }

  const data = await res.json();
  return Array.isArray(data.orders) ? data.orders : [];
}

function formatHora(ts: number) {
  return new Date(ts).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

//
// ======================================================
// COMPONENT
// ======================================================
//

export default function CarList({ active }: { active: boolean }) {
  const queryClient = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: fetchPendientes,
    // Refresca por intervalo: cada 20s vuelve a invalidar el listado.
    refetchInterval: 20_000,
  });

  // Reloj local para ir descartando las órdenes que ya terminaron
  // sin esperar al próximo refetch del servidor.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  // Cada vez que el listado vuelve a quedar visible, invalida la consulta.
  useEffect(() => {
    if (active) {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    }
  }, [active, queryClient]);

  const pendientes = useMemo(
    () =>
      data
        .filter((o) => o.endAt > now)
        .sort((a, b) => a.endAt - b.endAt),
    [data, now]
  );

  const visibles = pendientes.slice(0, MAX_VISIBLE);
  const restantes = pendientes.slice(MAX_VISIBLE);

  // Término estimado de todos los pendientes (el último en salir).
  const terminoTodos = pendientes.length
    ? Math.max(...pendientes.map((o) => o.endAt))
    : 0;

  return (
    <div className="h-full w-full flex flex-col bg-[#FCFCFC] text-neutral-950 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-[#1F2C4D] text-white px-6 py-4 rounded-xl">
        <div className="bebas text-3xl font-bold tracking-widest text-[#F6AA0A]">
          EN PROCESO
        </div>
        <div className="flex items-center gap-2 text-neutral-200">
          <FaCarSide />
          <span className="text-xl font-bold">{pendientes.length}</span>
        </div>
      </div>

      {/* LISTA */}
      <div className="flex-1 mt-3 space-y-2 overflow-hidden">
        {visibles.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400">
            <FaCarSide size={48} />
            <p className="mt-3 text-xl">Sin vehículos en proceso</p>
          </div>
        )}

        {visibles.map((o, i) => (
          <div
            key={o.id}
            className="fw-fade-up flex items-center justify-between bg-white border border-neutral-200 shadow-sm rounded-xl px-5 py-3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-4">
              <FaCarSide
                size={26}
                className="text-[#1F2C4D]"
              />
              <div>
                <div className="bebas text-2xl font-bold leading-none tracking-wide">
                  {o.patente || "—"}
                </div>
                <div className="text-sm text-neutral-500">
                  {VEHICULO_LABEL[o.vehiculoId] ?? "Vehículo"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#1F2C4D]">
              <FaClock className="text-[#F6AA0A]" />
              <div className="text-right leading-tight">
                <div className="bebas text-2xl font-bold">
                  {formatHora(o.endAt)}
                </div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider">
                  Término
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RESTANTES */}
      {restantes.length > 0 && (
        <div className="mt-3 flex items-center justify-between bg-[#1F2C4D] text-white px-6 py-4 rounded-xl">
          <div className="text-lg">
            <span className="bebas text-3xl font-bold text-[#F6AA0A] mr-2">
              +{restantes.length}
            </span>
            vehículos en espera
          </div>
          <div className="text-right leading-tight">
            <div className="bebas text-2xl font-bold text-[#F6AA0A]">
              {formatHora(terminoTodos)}
            </div>
            <div className="text-xs text-neutral-300 uppercase tracking-wider">
              Término de todos
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
